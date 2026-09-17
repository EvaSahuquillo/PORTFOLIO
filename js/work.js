// CURSOR ACTUALIZADO - Compatible con galería 3D
(function initCustomCursor() {

  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!isFinePointer) return;

  if (window.__customCursorInit) return;
  window.__customCursorInit = true;

  const run = () => {

    let cursor = document.getElementById("custom-cursor");
    if (!cursor) {
      cursor = document.createElement("div");
      cursor.id = "custom-cursor";
      cursor.innerHTML = `<div class="cursor-inner"></div>`;
      document.body.appendChild(cursor);
    }

    const inner = cursor.querySelector(".cursor-inner");
    if (!inner) return;

    // Mover cursor - usando requestAnimationFrame para mejor rendimiento
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      cursor.style.left = cursorX + "px";
      cursor.style.top = cursorY + "px";
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Función para verificar si un elemento es clickable
    function esClickable(elemento) {
      const selectores = [
        'a', 'button', '.btn', 'input', 'textarea', 'select', 
        '.grid-item', '[href]', '[data-link]', '.project-link',
        '.proyecto-link', '[onclick]', '[role="button"]', '[id="mode-toggle"]'
      ];
      
      for (let selector of selectores) {
        if (elemento.closest(selector)) return true;
      }
      return false;
    }

    // Crecer en hover sobre elementos clicables
    document.addEventListener("mouseover", (e) => {
      if (esClickable(e.target)) {
        inner.classList.add("link-hover");
        document.body.style.cursor = "none";
      }
    });

    document.addEventListener("mouseout", (e) => {
      if (esClickable(e.target)) {
        inner.classList.remove("link-hover");
        document.body.style.cursor = "none";
      }
    });
    
    // Ocultar cursor por defecto
    document.body.style.cursor = "none";
  };

  if (document.body) run();
  else window.addEventListener("DOMContentLoaded", run);

})();

// HORA
function actualizarHora() {
    const ahora = new Date();

    let horas = ahora.getHours();
    let minutos = ahora.getMinutes();

    // poner 0 delante si es necesario
    horas = horas.toString().padStart(2, "0");
    minutos = minutos.toString().padStart(2, "0");

    document.getElementById("hora").textContent = `${horas}:${minutos}`;
}

// ejecutar al cargar
actualizarHora();

// actualizar cada segundo
setInterval(actualizarHora, 1000);

// ============================================
// DARK MODE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('mode-toggle');
  const body = document.body;

  if (!toggle) return;

  // Aplicar modo guardado al cargar
  const saved = localStorage.getItem('mode');
  if (saved === 'dark') {
    body.classList.add('dark-mode');
    toggle.textContent = '☼';
  } else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    body.classList.add('dark-mode');
    toggle.textContent = '☼';
  }

  // Toggle al hacer click
  toggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const mode = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('mode', mode);
    toggle.textContent = mode === 'dark' ? '☼' : '☾';
  });
});


/* ── posicionamiento en elipse fija, evitando el hueco real del modelo 3D ── */
(function posicionarEnElipse() {
  var contenedor = document.getElementById("demoArea");
  var modelo = document.getElementById("draggable-model");
  if (!contenedor) return;

  var vw = window.innerWidth;
  var vh = window.innerHeight;
  var centroX = vw / 2;
  var centroY = vh / 2;

  // margen extra alrededor del modelo, para que los botones no lo rocen
  var margenSeguridad = 60;

  // radio "prohibido" a partir del tamaño real del modelo 3D
  var radioProhibidoX = margenSeguridad;
  var radioProhibidoY = margenSeguridad;
  if (modelo) {
    radioProhibidoX = modelo.offsetWidth / 2 + margenSeguridad;
    radioProhibidoY = modelo.offsetHeight / 2 + margenSeguridad;
  }

  // radio de la elipse donde viven los botones — algo mayor que la zona prohibida
  var radioX = Math.max(radioProhibidoX + 120, vw * 0.4);
  var radioY = Math.max(radioProhibidoY + 90, vh * 0.32);

  var zones = document.querySelectorAll(".mag-zone");
  var n = zones.length;

  zones.forEach(function (zone, idx) {
    var w = zone.offsetWidth || 200;
    var h = zone.offsetHeight || 200;

    var angulo = (idx / n) * Math.PI * 2 - Math.PI / 2; // empieza arriba, sentido horario

    var x = centroX + Math.cos(angulo) * radioX - w / 2;
    var y = centroY + Math.sin(angulo) * radioY - h / 2;

    x = Math.max(10, Math.min(x, vw - w - 10));
    y = Math.max(10, Math.min(y, vh - h - 10));

    zone.style.left = x + "px";
    zone.style.top = y + "px";
  });
})();


// ============================================
// SPLIT TEXT CON SCROLLTRIGGER
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  if (typeof SplitText === 'undefined') {
    console.warn('SplitText no está cargado');
    return;
  }

  const titulo = document.querySelector('.split');
  if (!titulo) return;

  SplitText.create(titulo, {
    type: "lines",
    linesClass: "line",
    autoSplit: true,
    onSplit: (self) => {
      gsap.set(self.lines, { y: 100, opacity: 0 });

      return ScrollTrigger.create({
        trigger: titulo,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: () => {
          gsap.to(self.lines, {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
            overwrite: true
          });
        },
        onLeave: () => {
          gsap.set(self.lines, { y: 100, opacity: 0 });
        },
        onEnterBack: () => {
          gsap.to(self.lines, {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
            overwrite: true
          });
        },
        onLeaveBack: () => {
          gsap.set(self.lines, { y: 100, opacity: 0 });
        }
        // ya no hay "once: true"
      });
    }
  });
});

// MENU 

gsap.set(".container-fluid img.swipeimage", { yPercent: -50, xPercent: -50 });

let firstEnter;

gsap.utils.toArray(".container-fluid").forEach((el) => {
  const image = el.querySelector("img.swipeimage"),
    setX = gsap.quickTo(image, "x", { duration: 0.4, ease: "power3" }),
    setY = gsap.quickTo(image, "y", { duration: 0.4, ease: "power3" }),
    align = (e) => {
      if (firstEnter) {
        setX(e.clientX, e.clientX); //https://gsap.com/docs/v3/GSAP/gsap.quickTo()/#optionally-define-a-start-value
        setY(e.clientY, e.clientY);
        firstEnter = false;
      } else {
        setX(e.clientX);
        setY(e.clientY);
      }
    },
    startFollow = () => document.addEventListener("mousemove", align),
    stopFollow = () => document.removeEventListener("mousemove", align),
    fade = gsap.to(image, {
      autoAlpha: 1,
      ease: "none",
      paused: true,
      duration: 0.1,
      onReverseComplete: stopFollow
    });

  el.addEventListener("mouseenter", (e) => {
    firstEnter = true;
    fade.play();
    startFollow();
    align(e);
  });

  el.addEventListener("mouseleave", () => fade.reverse());
});