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

  const saved = localStorage.getItem('mode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Aplicar modo inicial SIEMPRE
  if (saved === 'dark' || (!saved && prefersDark)) {
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
    toggle.textContent = '☼';
  } else {
    body.classList.add('light-mode');
    body.classList.remove('dark-mode');
    toggle.textContent = '☾';
  }

  toggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');
    const mode = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('mode', mode);
    toggle.textContent = mode === 'dark' ? '☼' : '☾';
  });
});


// ============================================
// SPLIT TEXT CON SCROLLTRIGGER
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Verificar que SplitText está disponible
  if (typeof SplitText === 'undefined') {
    console.warn('SplitText no está cargado');
    return;
  }

  const titulo = document.querySelector('.split');
  if (!titulo) return;

  // Crear SplitText
  const split = new SplitText(titulo, {
    type: "lines",
    linesClass: "line"
  });

  // Configurar las líneas como ocultas inicialmente
  gsap.set(split.lines, {
    y: 100,
    opacity: 0
  });

  // Animación con ScrollTrigger
  ScrollTrigger.create({
    trigger: titulo,           // El elemento que activa la animación
    start: "top 80%",          // Cuando el top del título llegue al 80% de la ventana
    onEnter: () => {
      gsap.to(split.lines, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        overwrite: true
      });
    },
    once: true                 // Solo se ejecuta una vez
  });
})



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

