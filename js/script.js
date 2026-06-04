// CURSOR
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

    // Mover cursor
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });

    // Crecer en hover sobre elementos clicables
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("a, button, .btn, input, textarea, select, .grid-item")) {
        inner.classList.add("link-hover");
      }
    });

    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("a, button, .btn, input, textarea, select, .grid-item")) {
        inner.classList.remove("link-hover");
      }
    });
  };

  // Por si el script se carga en <head> alguna vez
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

