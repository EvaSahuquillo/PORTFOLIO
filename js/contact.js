

// ====== CONTACTO: un bloque por pantalla + líneas que se apartan una a una ======
// Pégalo en js/contact.js (o en un archivo nuevo cargado en contact.html).
// No toca tu HTML: clona la segunda .row por JS.
 
(() => {
  const wrap = document.querySelector('.texto-contacto');
  if (!wrap) return;
 
  const titleRow = wrap.querySelector(':scope > .row:first-child');
  const base = wrap.querySelector(':scope > .row:nth-child(2)');
  if (!titleRow || !base) return;
  const titleEl = titleRow.querySelector('h5') || titleRow;
 
  // ---- AJUSTES (cámbialos a tu gusto) ----
  const MIN_GAP = 40;      // px mínimos entre un bloque y el siguiente (solo en pantallas muy bajas)
  const RAMP = 90;         // px de "suavizado": menos = cada línea se aparta más de golpe, una a una
  const SIDE_GAP = 14;     // px de aire entre cada línea y el borde del título
  const SPREAD = 1;        // 1 = se apartan justo hasta librar el título · menos de 1 = más juntitas (pero pisan el título)
  const WHEEL_SPEED = 1;   // sensibilidad de la rueda / trackpad
  const SMOOTH = 0.07;     // 0.04 = muy suave · 0.3 = más directo
  const START = 0.72;      // dónde aparece el bloque al cargar (0 = arriba · 1 = justo abajo del todo)
 
  let rows = [];           // [{ el, lines: [{ l, r, c }] }]
  let rowH = 0, step = 0, total = 0, vh = 0, titleH = 0, titleW = 0;
  let target = 0, pos = 0, last = performance.now();
 
  const smooth = (t) => t * t * (3 - 2 * t);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
 
  // guarda, por cada fila de texto, la línea izquierda (<p>), la derecha (<a>) y su centro vertical
  function readLines(row) {
    const L = [...row.children[0].children];
    const R = [...row.children[1].children];
    return L.map((l, i) => {
      const r = R[i];
      const c = (l.offsetTop + l.offsetHeight / 2 + (r ? r.offsetTop + r.offsetHeight / 2 : l.offsetTop + l.offsetHeight / 2)) / 2;
      return { l, r, c, h: l.offsetHeight };
    });
  }
 
  function build() {
    wrap.querySelectorAll('.contact-clone').forEach((n) => n.remove());
 
    vh = wrap.clientHeight;
    rowH = base.offsetHeight;
 
    // UN bloque por pantalla: la distancia entre bloques = la altura de la pantalla,
    // así siempre hay uno visible y nunca se ve vacío
    step = Math.max(vh, rowH + MIN_GAP);
    total = step * 2;                       // 2 copias bastan
 
    const titleRect = titleEl.getBoundingClientRect();
    titleH = titleRect.height;
    titleW = titleRect.width;
 
    const clone = base.cloneNode(true);
    clone.classList.add('contact-clone');
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', '-1'));
    wrap.appendChild(clone);
 
    rows = [base, clone].map((el) => ({ el, lines: readLines(el) }));
  }
 
  function render(now) {
    // suavizado independiente de los fps (igual de fluido en pantallas de 60 y 120 Hz)
    const dt = Math.min((now - last) / 16.667, 3);
    last = now;
    pos += (target - pos) * (1 - Math.pow(1 - SMOOTH, dt));
    const maxOffset = (titleW / 2) * SPREAD + SIDE_GAP;
 
    rows.forEach((row, i) => {
      // posición vertical envuelta: sale por arriba y vuelve a entrar por abajo (infinito)
      let y = i * step - pos;
      y = ((((y + step) % total) + total) % total) - step;
      row.el.style.transform = `translate3d(0, ${y}px, 0)`;
 
      // cada línea decide por su cuenta cuánto se aparta, según lo cerca que esté del título
      row.lines.forEach((ln) => {
        const d = Math.abs(y + ln.c - vh / 2);
        const hard = (ln.h + titleH) / 2;                       // la línea toca el título
        const t = smooth(clamp(1 - (d - hard) / RAMP, 0, 1));   // 0 = junta · 1 = apartada
        const off = t * maxOffset;
        ln.l.style.transform = `translate3d(${-off}px, 0, 0)`;
        if (ln.r) ln.r.style.transform = `translate3d(${off}px, 0, 0)`;
      });
    });
 
    requestAnimationFrame(render);
  }
 
  // ---- ENTRADAS: rueda, táctil y teclado ----
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    const k = e.deltaMode === 1 ? 32 : 1;
    target += e.deltaY * k * WHEEL_SPEED;
  }, { passive: false });
 
  let lastY = null;
  window.addEventListener('touchstart', (e) => { lastY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (lastY === null) return;
    const y = e.touches[0].clientY;
    target += (lastY - y) * 1.4;
    lastY = y;
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchend', () => { lastY = null; });
 
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') target += 120;
    if (e.key === 'ArrowUp' || e.key === 'PageUp') target -= 120;
  });
 
  window.addEventListener('resize', build);
 
  (document.fonts?.ready || Promise.resolve()).then(() => {
    build();
    // arranca con el bloque fuera de pantalla (abajo) y entra deslizándose hasta START
    pos = -vh;
    target = -vh * START;
    requestAnimationFrame((t) => { last = t; render(t); });
  });
})();
// console.clear();
// gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// let ctx;

// function createTimeline() {
//   ctx && ctx.revert();

//   ctx = gsap.context(() => {
//     const box = document.querySelector(".box");
//     const boxStartRect = box.getBoundingClientRect();

//     // All containers except the first
//     const containers = gsap.utils.toArray(".container:not(.initial)");

//     // grab the points to animate between
//     const points = containers.map((container) => {
//       const marker = container.querySelector(".marker") || container;
//       const r = marker.getBoundingClientRect();

//       return {
//         x: r.left + r.width / 2 - (boxStartRect.left + boxStartRect.width / 2),
//         y: r.top + r.height / 2 - (boxStartRect.top + boxStartRect.height / 2)
//       };
//     });

//     const tl = gsap.timeline({
//       scrollTrigger: {
//         trigger: ".container.initial",
//         start: "clamp(top center)",
//         endTrigger: ".final",
//         end: "clamp(top center)",
//         scrub: 1
//       }
//     });

//     tl.to(".box", {
//       duration: 1,
//       ease: "none",
//       motionPath: {
//         path: points, // array like - [{x:100, y:50}, {x:200, y:0}, {x:300, y:100}]
//         curviness: 1.5 // adjust how curvy the path is, default is 1, 2 is more curvy
//       }
//     });
//   });
// }

// createTimeline();
// window.addEventListener("resize", createTimeline);



// // CONTACT 2 
// gsap.registerPlugin(ScrollTrigger);

// const splitTl = gsap.timeline({
//   scrollTrigger: {
//     trigger: ".split-contact",
//     start: "top top",
//     end: "+=100%", // cuánto scroll dura la separación
//     scrub: 1,
//     pin: true // fija la sección mientras se separan
//   }
// });

// splitTl
//   .to(".split-left", { xPercent: -100, ease: "none" }, 0)
//   .to(".split-right", { xPercent: 100, ease: "none" }, 0);
