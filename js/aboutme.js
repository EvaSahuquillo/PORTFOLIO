// // ELEMENTO 3D


// const el = document.getElementById("draggable-model");
// const container = document.querySelector(".soap3D");

// let offsetX = 0, offsetY = 0;
// let dragging = false;

// function getBounds() {
//     return container.getBoundingClientRect();
// }

// // Quita el auto-rotate nativo de model-viewer en cuanto lo coges
// function stopAutoRotate() {
//     el.removeAttribute("auto-rotate");
// }

// el.addEventListener("mousedown", (e) => {
//     dragging = true;
//     stopAutoRotate();
//     offsetX = e.clientX - el.offsetLeft;
//     offsetY = e.clientY - el.offsetTop;
// });

// document.addEventListener("mousemove", (e) => {
//     if (!dragging) return;

//     const bounds = getBounds();

//     let x = e.clientX - offsetX;
//     let y = e.clientY - offsetY;

//     x = Math.max(0, Math.min(x, bounds.width - el.offsetWidth));
//     y = Math.max(0, Math.min(y, bounds.height - el.offsetHeight));

//     el.style.left = x + "px";
//     el.style.top = y + "px";
// });

// document.addEventListener("mouseup", () => dragging = false);

// // -----------------------------
// //      MOBILE / TOUCH
// // -----------------------------
// el.addEventListener("touchstart", (e) => {
//     dragging = true;
//     stopAutoRotate();
//     const touch = e.touches[0];
//     offsetX = touch.clientX - el.offsetLeft;
//     offsetY = touch.clientY - el.offsetTop;
// });

// document.addEventListener("touchmove", (e) => {
//     if (!dragging) return;

//     const touch = e.touches[0];
//     const bounds = getBounds();

//     let x = touch.clientX - offsetX;
//     let y = touch.clientY - offsetY;

//     x = Math.max(0, Math.min(x, bounds.width - el.offsetWidth));
//     y = Math.max(0, Math.min(y, bounds.height - el.offsetHeight));

//     el.style.left = x + "px";
//     el.style.top = y + "px";
// });

// document.addEventListener("touchend", () => dragging = false);

// // -----------------------------
// //      MOBILE / TOUCH
// // -----------------------------
// el.addEventListener("touchstart", (e) => {
//     dragging = true;
//     const touch = e.touches[0];
//     offsetX = touch.clientX - el.offsetLeft;
//     offsetY = touch.clientY - el.offsetTop;
// });

// document.addEventListener("touchmove", (e) => {
//     if (!dragging) return;

//     const touch = e.touches[0];
//     const bounds = getBounds();

//     let x = touch.clientX - offsetX;
//     let y = touch.clientY - offsetY;

//     // Limitar dentro del contenedor
//     x = Math.max(0, Math.min(x, bounds.width - el.offsetWidth));
//     y = Math.max(0, Math.min(y, bounds.height - el.offsetHeight));

//     el.style.left = x + "px";
//     el.style.top = y + "px";
// });

// document.addEventListener("touchend", () => dragging = false);

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
        'a', '.btn', 'input', 'textarea', 'select', 
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

// EFECTO GIRAR 
document.querySelectorAll('.rot').forEach((el) => {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.textContent = '';

  [...text].forEach((c, i) => {
    const letter = c === ' ' ? '\u00A0' : c;

    const ch = document.createElement('span');
    ch.className = 'char';
    ch.setAttribute('aria-hidden', 'true');
    ch.dataset.char = letter;
    ch.style.setProperty('--i', i);

    const front = document.createElement('span');
    front.textContent = letter;

    ch.appendChild(front);
    el.appendChild(ch);
  });
});