// CARRUSEL PROYECTO

(function () {
  // La "ventana" es tu .img-portada tal cual ya la tienes en el HTML —
  // no hace falta añadir ids ni tocar el markup.
  const viewport = document.querySelector('.img-portada');
  if (!viewport) return;
 
  // --- 1) Envolvemos tus .col en un track interno (lo crea el JS solo) ---
  // El gap (gap-2, gap-3... o el que tengas en CSS) estaba puesto en .img-portada,
  // pero ahora quien necesita separación entre items es el track: lo copiamos.
  const viewportGap = getComputedStyle(viewport).gap;
 
  const track = document.createElement('div');
  track.className = 'carousel-track';
  track.style.gap = viewportGap;
  while (viewport.firstChild) {
    track.appendChild(viewport.firstChild);
  }
  viewport.appendChild(track);
 
  // --- 2) Clonamos el set de items 2 veces más, para tener 3 copias seguidas ---
  // Así, cuando el bucle "salta" de vuelta, siempre hay contenido idéntico
  // delante y detrás: no se ve ningún hueco.
  const originalItems = Array.from(track.children);
  for (let copy = 0; copy < 2; copy++) {
    originalItems.forEach(item => {
      track.appendChild(item.cloneNode(true));
    });
  }
 
  // --- 3) Medimos el ancho de UN set (con su gap incluido) ---
  // El ancho de cada imagen es fijo por CSS, así que esto no depende de que
  // las imágenes hayan cargado.
  let setWidth = 0;
  function measureWidth() {
    setWidth = track.scrollWidth / 3;
  }
  measureWidth();
  window.addEventListener('resize', measureWidth);
 
  // --- 4) Bloqueamos la altura de .img-portada a su altura "en reposo" ---
  // Así, cuando una imagen crezca en hover, la caja nunca cambia de tamaño
  // (overflow-y: visible en el CSS deja que se vea por encima del texto)
  // y el carrusel jamás empuja el layout hacia abajo.
  function lockHeight() {
    viewport.style.height = 'auto';
    const naturalHeight = viewport.getBoundingClientRect().height;
    viewport.style.height = naturalHeight + 'px';
  }
 
  const allImgs = Array.from(track.querySelectorAll('img'));
  const pending = allImgs.filter(img => !img.complete);
  if (pending.length === 0) {
    lockHeight();
  } else {
    let remaining = pending.length;
    pending.forEach(img => {
      const done = () => {
        remaining--;
        if (remaining === 0) lockHeight();
      };
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }
  window.addEventListener('resize', lockHeight);
 
  // --- 5) Estado del movimiento ---
  let current = -setWidth;   // arrancamos centrados en el 2º set
  let target = -setWidth;
 
  const FRICTION = 0.94;   // cuánto se frena la inercia extra tras soltar / rueda,
                            // volviendo hacia AUTOPLAY_SPEED (no hacia 0)
  const EASE = 0.12;       // cuánto suaviza la entrada/salida del movimiento
  const WHEEL_SENSITIVITY = 1;
  const AUTOPLAY_SPEED = -0.6; // velocidad de "solo" (px/frame). Negativo = hacia la izquierda.
                                // Súbelo/bájalo (en valor absoluto) para más o menos velocidad.
 
  let velocity = AUTOPLAY_SPEED;
  let lastFrameTime = null;
 
  function wrap() {
    while (current <= -setWidth * 2) {
      current += setWidth;
      target += setWidth;
    }
    while (current > 0) {
      current -= setWidth;
      target -= setWidth;
    }
  }
 
  function animate(now) {
    if (lastFrameTime === null) {
      lastFrameTime = now;
      requestAnimationFrame(animate);
      return;
    }
    // dt normalizado respecto a un frame "de referencia" de 60Hz (16.6ms).
    // Así el movimiento es igual de rápido en una pantalla de 60Hz, 120Hz o
    // si el navegador ha saltado algún frame — antes, al asumir siempre
    // 16.6ms por frame, cualquier variación real se notaba como un tirón.
    let dt = now - lastFrameTime;
    lastFrameTime = now;
    dt = Math.min(dt, 50); // evita saltos grandes si la pestaña estuvo en background
    const steps = dt / 16.6667;
 
    if (!isDragging) {
      // la velocidad "extra" (por encima/debajo de la de autoplay) se va
      // frenando con fricción, así que siempre acaba volviendo sola a
      // AUTOPLAY_SPEED — el carrusel nunca se para del todo
      const extra = (velocity - AUTOPLAY_SPEED) * Math.pow(FRICTION, steps);
      velocity = AUTOPLAY_SPEED + extra;
      target += velocity * steps;
    }
 
    const easeStep = 1 - Math.pow(1 - EASE, steps);
    current += (target - current) * easeStep;
 
    wrap();
 
    track.style.transform = `translate3d(${current}px, 0, 0)`;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
 
  // --- 6) Rueda del ratón / trackpad -> movimiento horizontal ---
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY);
    velocity += delta * WHEEL_SENSITIVITY * 0.6;
  }, { passive: false });
 
  // --- 7) Arrastre con ratón / dedo ---
  let isDragging = false;
  let startX = 0;
  let startTarget = 0;
  let lastX = 0;
  let lastTime = 0;
 
  function pointerDown(x) {
    isDragging = true;
    startX = x;
    lastX = x;
    startTarget = target;
    lastTime = performance.now();
    viewport.classList.add('dragging');
  }
 
  function pointerMove(x) {
    if (!isDragging) return;
    const dx = x - startX;
    target = startTarget + dx;
 
    const now = performance.now();
    const dt = Math.max(now - lastTime, 1);
    velocity = ((x - lastX) / dt) * 16;
    lastX = x;
    lastTime = now;
  }
 
  function pointerUp() {
    isDragging = false;
    viewport.classList.remove('dragging');
  }
 
  // Mouse
  viewport.addEventListener('mousedown', (e) => pointerDown(e.clientX));
  window.addEventListener('mousemove', (e) => pointerMove(e.clientX));
  window.addEventListener('mouseup', pointerUp);
 
  // Touch
  viewport.addEventListener('touchstart', (e) => pointerDown(e.touches[0].clientX), { passive: true });
  viewport.addEventListener('touchmove', (e) => pointerMove(e.touches[0].clientX), { passive: true });
  viewport.addEventListener('touchend', pointerUp);
})();