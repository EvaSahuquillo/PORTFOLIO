// CARRUSEL PROYECTO

(function () {
  const viewport = document.querySelector('.img-portada');
  if (!viewport) return;

  // Detección de dispositivo táctil (sin hover real).
  // Se evalúa una sola vez al cargar. Si el usuario cambia de orientación
  // o conecta un ratón, no se recalcula — suficiente para el 99% de casos.
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // --- 1) Track interno ---
  const viewportGap = getComputedStyle(viewport).gap;

  const track = document.createElement('div');
  track.className = 'carousel-track';
  track.style.gap = viewportGap;
  while (viewport.firstChild) {
    track.appendChild(viewport.firstChild);
  }
  viewport.appendChild(track);

  // --- 2) Clones ---
  const originalItems = Array.from(track.children);
  for (let copy = 0; copy < 2; copy++) {
    originalItems.forEach(item => {
      track.appendChild(item.cloneNode(true));
    });
  }

  // --- 3) Ancho de un set ---
  let setWidth = 0;
  function measureWidth() {
    setWidth = track.scrollWidth / 3;
  }
  measureWidth();
  window.addEventListener('resize', measureWidth);

  // --- 4) Bloqueo de altura ---
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
  let current = -setWidth;
  let target = -setWidth;

  const FRICTION = 0.94;
  const EASE = 0.12;
  const WHEEL_SENSITIVITY = 1;
  const AUTOPLAY_SPEED = -0.6;

  const HOVER_FACTOR = 0.25;
  let speedFactor = 1;

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
    let dt = now - lastFrameTime;
    lastFrameTime = now;
    dt = Math.min(dt, 50);
    const steps = dt / 16.6667;

    if (!isDragging) {
      const targetSpeed = AUTOPLAY_SPEED * speedFactor;
      const extra = (velocity - targetSpeed) * Math.pow(FRICTION, steps);
      velocity = targetSpeed + extra;
      target += velocity * steps;
    }

    const easeStep = 1 - Math.pow(1 - EASE, steps);
    current += (target - current) * easeStep;

    wrap();

    track.style.transform = `translate3d(${current}px, 0, 0)`;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // --- 6) Rueda ---
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY);
    velocity += delta * WHEEL_SENSITIVITY * 0.6;
  }, { passive: false });

  // --- 7) Arrastre ---
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

  viewport.addEventListener('mousedown', (e) => pointerDown(e.clientX));
  window.addEventListener('mousemove', (e) => pointerMove(e.clientX));
  window.addEventListener('mouseup', pointerUp);

  viewport.addEventListener('touchstart', (e) => pointerDown(e.touches[0].clientX), { passive: true });
  viewport.addEventListener('touchmove', (e) => pointerMove(e.touches[0].clientX), { passive: true });
  viewport.addEventListener('touchend', pointerUp);

  // --- 8) Ralentización al pasar el ratón (SOLO en dispositivos con ratón real) ---
  const images = track.querySelectorAll('img');

  if (!isTouch) {
    images.forEach((img) => {
      img.addEventListener('mouseenter', () => {
        speedFactor = HOVER_FACTOR;
      });
      img.addEventListener('mouseleave', () => {
        speedFactor = 1;
      });
    });

    viewport.addEventListener('mouseleave', () => {
      speedFactor = 1;
    });
  }

  // --- 9) Overlay al hacer clic en una imagen ---
  const overlay = document.createElement('div');
  overlay.className = 'carousel-overlay';
  overlay.innerHTML = `
    <button class="carousel-overlay__close" aria-label="Cerrar">×</button>
    <img class="carousel-overlay__img" alt="">
  `;
  document.body.appendChild(overlay);

  const overlayImg = overlay.querySelector('.carousel-overlay__img');
  const overlayClose = overlay.querySelector('.carousel-overlay__close');

  function openOverlay(src, alt) {
    overlayImg.src = src;
    overlayImg.alt = alt || '';
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeOverlay() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!overlay.classList.contains('is-open')) overlayImg.src = '';
    }, 300);
  }

  overlayClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeOverlay();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay();
  });

  // Detección clic vs drag sobre cada imagen (sirve para abrir el overlay)
  const CLICK_THRESHOLD = 8;

  images.forEach((img) => {
    let downX = 0, downY = 0, moved = false;

    img.addEventListener('pointerdown', (e) => {
      downX = e.clientX;
      downY = e.clientY;
      moved = false;
    });

    img.addEventListener('pointermove', (e) => {
      if (Math.abs(e.clientX - downX) > CLICK_THRESHOLD ||
          Math.abs(e.clientY - downY) > CLICK_THRESHOLD) {
        moved = true;
      }
    });

    img.addEventListener('click', (e) => {
      if (moved) return;
      e.preventDefault();
      e.stopPropagation();
      openOverlay(img.src, img.alt);
    });
  });

})();