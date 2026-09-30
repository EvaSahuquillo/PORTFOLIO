/* MENÚ DESPLEGABLE (móvil) — basado en la demo de GSAP
   "Timeline clear() and rebuild": una sola timeline que se vacía con clear()
   y se reconstruye con la animación de entrada o la de salida.
 
   Carga este archivo DESPUÉS de gsap.min.js:
     <script src="js/menu.js"></script> */
 
(function () {
  const toggleBtn = document.getElementById("menuToggle");
  const menu = document.getElementById("menu");
  if (!toggleBtn || !menu || typeof gsap === "undefined") return;
 
  const q = gsap.utils.selector(menu);         // busca dentro de los paneles
  const tq = gsap.utils.selector(toggleBtn);   // busca dentro del botón (las barras)
  const brand = Array.from(document.querySelectorAll(".nav-brand a"));
  const recolor = [toggleBtn, ...brand];       // lo que cambia de color al abrir
 
  const mq = window.matchMedia("(max-width: 768px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 
  let isOpen = false;
  const tl = gsap.timeline();
  if (reduceMotion) tl.timeScale(5);           // casi instantáneo si el sistema pide menos movimiento
 
  /* ───────── ENTRADA (fromTo: siempre parte de un estado conocido) ───────── */
  function openMenu() {
    // color del texto del panel blanco: el logo y las barras se ponen de ese color para verse encima
    const onPanel = getComputedStyle(menu.querySelector(".menu-top")).color;
 
    tl.set(menu, { visibility: "visible", pointerEvents: "auto" })
      .fromTo(q(".menu-bg"), { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0)
 
      // los paneles entran uno tras otro
      .fromTo(
        q(".menu-panel"),
        { x: "101%", y: 0, rotation: 0 },
        { x: "0%", duration: 0.6, ease: "back.out", stagger: 0.2 },
        0
      )
 
      // las opciones aparecen escalonadas
      .fromTo(
        q(".menu-item"),
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 1.2, ease: "expo.out", stagger: 0.03 },
        0.1
      )
 
      // logo y botón cambian de color (para verse sobre el panel blanco)
      .to(recolor, { color: onPanel, duration: 0.3 }, 0.06)
 
      // hamburguesa -> X
      .fromTo(
        tq(".bar-top"),
        { attr: { x1: 3, y1: 7, x2: 17, y2: 7 } },
        { attr: { x1: 5, y1: 5, x2: 15, y2: 15 }, duration: 0.35, ease: "back.out(1.4)" },
        0.06
      )
      .fromTo(
        tq(".bar-bot"),
        { attr: { x1: 3, y1: 13, x2: 17, y2: 13 } },
        { attr: { x1: 15, y1: 5, x2: 5, y2: 15 }, duration: 0.35, ease: "back.out(1.4)" },
        0.06
      )
      .to(tq(".bar-mid"), { opacity: 0, duration: 0.2 }, 0.06)
 
      // teclado / lector de pantalla: foco en la primera opción
      .call(() => {
        const first = menu.querySelector(".menu-link");
        if (first) first.focus({ preventScroll: true });
      }, null, 0.3);
  }
 
  /* ───────── SALIDA (to: continúa desde donde estén las cosas ahora mismo) ───────── */
  function closeMenu() {
    // color normal de la página (claro u oscuro según el modo actual)
    const base = getComputedStyle(document.body).color;
 
    tl.to(recolor, { color: base, duration: 0.3, clearProps: "color" })
      .to(tq(".bar-top"), { attr: { x1: 3, y1: 7, x2: 17, y2: 7 }, duration: 0.2, ease: "power3.in" }, "<")
      .to(tq(".bar-bot"), { attr: { x1: 3, y1: 13, x2: 17, y2: 13 }, duration: 0.2, ease: "power3.in" }, "<")
      .to(tq(".bar-mid"), { opacity: 1, duration: 0.2 }, "<")
 
      // los paneles caen con un giro aleatorio
      .to(
        q(".menu-panel"),
        {
          y: "160vh",
          rotation: "random(-15, 15)",
          duration: 1,
          ease: "power3.in",
          stagger: { from: "end", each: 0.02 }
        },
        "<"
      )
 
      // el fondo se desvanece
      .to(q(".menu-bg"), { opacity: 0, duration: 0.3, ease: "power2.in" }, "<0.1")
 
      // al terminar, el menú deja de existir para los clics (si no, taparía la página)
      .set(menu, { visibility: "hidden", pointerEvents: "none" })
      .call(() => document.body.classList.remove("menu-open"));
  }
 
  function toggle() {
    isOpen = !isOpen;
    toggleBtn.setAttribute("aria-expanded", isOpen);
    toggleBtn.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
 
    tl.clear();
 
    if (isOpen) {
      document.body.classList.add("menu-open");
      openMenu();
    } else {
      closeMenu();
    }
  }
 
  toggleBtn.addEventListener("click", toggle);
  q(".menu-bg")[0].addEventListener("click", () => { if (isOpen) toggle(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      toggle();
      toggleBtn.focus();
    }
  });
 
  /* Si se agranda la ventana con el menú abierto (pasa a escritorio),
     se cierra al instante y todo vuelve a su estado inicial */
  mq.addEventListener("change", (e) => {
    if (e.matches || !isOpen) return;
    isOpen = false;
    tl.clear();
    document.body.classList.remove("menu-open");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-label", "Abrir menú");
    gsap.set(menu, { clearProps: "visibility,pointerEvents" });
    gsap.set(q(".menu-bg, .menu-panel, .menu-item"), { clearProps: "all" });
    gsap.set(recolor, { clearProps: "color" });
    gsap.set(tq(".bar-mid"), { clearProps: "opacity" });
    gsap.set(tq(".bar-top"), { attr: { x1: 3, y1: 7, x2: 17, y2: 7 } });
    gsap.set(tq(".bar-bot"), { attr: { x1: 3, y1: 13, x2: 17, y2: 13 } });
  });
})();
 



