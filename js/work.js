

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


// OTRA LISTA 
/* ═══════════════════════════════════════════
   RUEDA DE PROYECTOS — todo en un solo archivo
   Motor basado en OptionWheel de React Bits (sin React)
   ═══════════════════════════════════════════ */
 
/* ───────────────────────────────────────────────
   1. TUS PROYECTOS
   ─────────────────────────────────────────────── */
const ITEMS = [
  { label: "Cata la lata",      sub: "Packaging",                   img: "img/proyectos/webp/cargo sardinas.webp",    href: "catalalata.html" },
  { label: "No hay meta",       sub: "Diseño exposición/Editorial", img: "img/proyectos/webp/portada-expo.webp",      href: "nohaymeta.html" },
  { label: "This is not a box", sub: "Branding/Packaging",          img: "img/proyectos/webp/cajapossssst.webp",      href: "thisisnotabox.html" },
  { label: "CasiCasi",          sub: "Editorial",                   img: "img/proyectos/webp/pagina-casicasi1.webp",  href: "casicasi.html" },
  { label: "Archif",            sub: "Web",                         img: "img/proyectos/webp/archif1.webp",           href: "archif.html" }
];
 
/* Ajustes de la rueda */
const WHEEL_LOOP = true;                        // al llegar a la última opción vuelve a la primera
const SOUND_URL = "assets/sounds/click-soft.mp3"; // pon aquí la ruta de tu sonido ("" = sin sonido)
const SOUND_VOLUME = 0.5;                       // de 0 a 1
 
/* ───────────────────────────────────────────────
   2. MOTOR DE LA RUEDA
   ─────────────────────────────────────────────── */
function initOptionWheel(root, options = {}) {
  const cfg = {
    items: [],            // [{ label, sub, ... }]
    defaultSelected: 0,
    side: 'left',         // 'left' | 'right'
    spacing: 1.4,         // separación entre filas (× font-size)
    curve: 1,
    tilt: 6,
    blur: 2,
    fade: 0.25,
    minOpacity: 0.05,
    smoothing: 200,       // ms de suavizado
    loop: false,
    draggable: true,
    soundUrl: '',         // sonido al cambiar de opción ('' = sin sonido)
    soundVolume: 0.5,     // 0 a 1
    onChange: null,       // (index, item) => void
    ...options
  };
 
  const n = cfg.items.length;
  if (!root || !n) return null;
 
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
  root.classList.add('option-wheel');
  root.classList.toggle('option-wheel--right', cfg.side === 'right');
  root.setAttribute('role', 'listbox');
  root.setAttribute('aria-label', 'Proyectos');
  root.tabIndex = 0;
 
  /* ── Estado ── */
  let rowH = 48;
  let pos = cfg.defaultSelected;
  let target = pos;
  let selected = -1;
  let raf = null;
  let last = 0;
  let drag = null;
  let dragMoved = false;
  let wheelTimer = null;
 
  /* ── Crear opciones (label + subtítulo en superíndice) ── */
  const els = cfg.items.map((item, i) => {
    const el = document.createElement('div');
    el.className = 'option-wheel__item';
    el.setAttribute('role', 'option');
 
    const label = document.createElement('span');
    label.className = 'option-wheel__label';
    label.textContent = item.label;
    el.append(label);
 
    if (item.sub) {
      const sup = document.createElement('sup');
      sup.className = 'option-wheel__sub';
      sup.textContent = item.sub;      // los corchetes los pone el CSS
      el.append(sup);
    }
 
    el.addEventListener('click', () => handleItemClick(i));
    root.append(el);
    return el;
  });
 
  /* Altura de fila a partir del font-size real (así funciona el clamp() responsive) */
  function measure() {
    const fs = parseFloat(getComputedStyle(els[0]).fontSize) || 48;
    rowH = Math.max(fs * cfg.spacing, 1);
  }
 
  /* ── Bucle de animación ── */
  function runFrame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
 
    const tau = Math.max(reduceMotion ? 1 : cfg.smoothing, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);
 
    let next = pos + (target - pos) * k;
    const settled = Math.abs(target - next) < 0.001;
    if (settled) next = target;
    pos = next;
 
    const mirror = cfg.side === 'right' ? -1 : 1;
    const tiltRad = (cfg.tilt * Math.PI) / 180;
    const R = tiltRad > 0.0005 ? rowH / tiltRad : 0;
 
    for (let i = 0; i < n; i++) {
      const el = els[i];
      let d = i - pos;
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }
      const dist = Math.abs(d);
      let x = 0;
      let y = d * rowH;
      let rot = 0;
 
      if (R > 0) {
        const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
        y = R * Math.sin(ang);
        x = -mirror * R * (1 - Math.cos(ang)) * cfg.curve;
        rot = (mirror * ang * 180) / Math.PI;
      }
 
      el.style.transform =
        `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
      el.style.opacity = String(Math.max(cfg.minOpacity, 1 - dist * cfg.fade));
      el.style.filter = cfg.blur > 0 ? `blur(${(dist * cfg.blur).toFixed(2)}px)` : 'none';
      // 0 → 1 según la opción se acerca al centro (lo usa el CSS para color y subtítulo)
      el.style.setProperty('--ow-p', Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));
    }
 
    raf = settled ? null : requestAnimationFrame(runFrame);
  }
 
  function startLoop() {
    if (raf != null) cancelAnimationFrame(raf);
    last = performance.now();
    raf = requestAnimationFrame(runFrame);
  }
 
  /* ── Selección ── */
  function select(idx) {
    selected = idx;
    els.forEach((el, i) => {
      const on = i === idx;
      el.classList.toggle('option-wheel__item--selected', on);
      el.setAttribute('aria-selected', String(on));
    });
    if (typeof cfg.onChange === 'function') cfg.onChange(idx, cfg.items[idx]);
  }
 
  /* ── Sonido al cambiar de opción ──
     Limitado para que el scroll rápido no lo sature; si el navegador
     bloquea la reproducción (política de autoplay) se ignora sin error. */
  let audio = null;
  let lastTick = 0;
 
  function playTick() {
    if (!cfg.soundUrl) return;
    const now = performance.now();
    if (now - lastTick < 70) return;
    lastTick = now;
 
    if (!audio) {
      audio = new Audio(cfg.soundUrl);
      audio.preload = 'auto';
    }
    audio.volume = Math.min(Math.max(cfg.soundVolume, 0), 1);
    audio.currentTime = 0;
    const p = audio.play();
    if (p && p.catch) p.catch(() => {});
  }
 
  function applyTarget(value, snap) {
    let v = value;
    if (!cfg.loop) v = Math.min(Math.max(v, 0), n - 1);
    if (snap) v = Math.round(v);
    target = v;
 
    const idx = ((Math.round(v) % n) + n) % n;
    if (idx !== selected) {
      select(idx);
      playTick();
    }
    startLoop();
  }
 
  function handleItemClick(index) {
    if (dragMoved) return;   // si fue un arrastre, no es un clic
 
    // Si la opción tiene página, el clic lleva a ella
    const href = cfg.items[index].href;
    if (href) {
      window.location.href = href;
      return;
    }
 
    // Sin href: el clic solo centra la opción
    const cur = target;
    let d = index - (((cur % n) + n) % n);
    if (cfg.loop && n > 1) {
      if (d > n / 2) d -= n;
      else if (d < -n / 2) d += n;
    }
    applyTarget(cur + d, true);
  }
 
  /* ── Rueda del ratón / touchpad ── */
  root.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
    // Máximo un paso por evento: con rueda de ratón avanza una opción por "click"
    const step = Math.max(-1, Math.min(1, delta / rowH));
    applyTarget(target + step, false);
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => applyTarget(target, true), 140);
  }, { passive: false });
 
  /* ── Arrastrar (ratón y táctil) ── */
  root.addEventListener('pointerdown', e => {
    if (!cfg.draggable) return;
    drag = { y: e.clientY, start: target, id: e.pointerId };
    dragMoved = false;
    root.classList.add('option-wheel--dragging');
  });
 
  root.addEventListener('pointermove', e => {
    if (!drag) return;
    const dy = e.clientY - drag.y;
    if (!dragMoved && Math.abs(dy) > 4) {
      dragMoved = true;
      // Capturamos solo cuando es un arrastre real, así los clics normales llegan a las opciones
      root.setPointerCapture(drag.id);
    }
    if (dragMoved) applyTarget(drag.start - dy / rowH, false);
  });
 
  function endDrag() {
    if (!drag) return;
    drag = null;
    root.classList.remove('option-wheel--dragging');
    if (dragMoved) applyTarget(target, true);
  }
  root.addEventListener('pointerup', endDrag);
  root.addEventListener('pointercancel', endDrag);
 
  /* ── Teclado ── */
  root.addEventListener('keydown', e => {
    let delta = null;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') delta = -1;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') delta = 1;
    if (delta == null) return;
    e.preventDefault();
    applyTarget(Math.round(target) + delta, true);
  });
 
  /* ── Resize ── */
  window.addEventListener('resize', () => {
    measure();
    startLoop();
  });
 
  /* ── Arranque ── */
  measure();
  select(Math.min(Math.max(cfg.defaultSelected, 0), n - 1));
  startLoop();
 
  return {
    goTo: index => applyTarget(index, true)
  };
}
 
/* ───────────────────────────────────────────────
   3. ARRANQUE: rueda + imágenes de la derecha
   ─────────────────────────────────────────────── */
function startRueda() {
  const wheelEl = document.getElementById('rueda-wheel');
  const preview = document.getElementById('rueda-preview');
  if (!wheelEl || !preview) return;
 
  // Una imagen por opción, apiladas; solo la activa se ve
  const imgs = ITEMS.map(item => {
    const img = document.createElement('img');
    img.className = 'rueda__img';
    img.src = item.img;
    img.alt = '';
    preview.append(img);
    return img;
  });
 
  initOptionWheel(wheelEl, {
    items: ITEMS,
    defaultSelected: 0,
    loop: WHEEL_LOOP,
    soundUrl: SOUND_URL,
    soundVolume: SOUND_VOLUME,
    onChange: index => {
      imgs.forEach((img, i) => img.classList.toggle('is-active', i === index));
    }
  });
}
 
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startRueda);
} else {
  startRueda();
}