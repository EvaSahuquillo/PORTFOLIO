/* ------------------------------------------------------------------
   IRIS DESDE EL CLIC — transición entre páginas (JS puro, sin librerías)

   USO — en TODAS tus páginas:

   1) En el <head>, lo primero de todo (tapa la página nueva desde el primer
      fotograma, así no hay parpadeo):

      <script>
        try { if (sessionStorage.getItem('iris') || window.name.indexOf('iris:') === 0) document.documentElement.classList.add('iris-cover'); } catch (e) {}
      </script>
      <style>
        html.iris-cover::before { content:""; position:fixed; inset:0; background:#141414; z-index:2147483647; }
      </style>

   2) Al final del <body>:

      <script src="iris.js"></script>

   Navegación por JS (rueda de proyectos, overlay de la galería 3D):
      irisNavigate(url, event.clientX, event.clientY);

   Enlaces sin transición: data-no-iris

   Prueba con un servidor local (Live Server) o la web publicada, no con file://
------------------------------------------------------------------- */

(() => {
  const IRIS_COLOR = '#141414'; // = --bg-dark (el mismo que en el <style> del head)
  const DURATION = 750; // ms
  const EASING = 'cubic-bezier(0.76, 0, 0.24, 1)';
  const KEY = 'iris';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  // Radio necesario para cubrir toda la pantalla desde (x, y)
  const coverRadius = (x, y) =>
    Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  const circle = (r, x, y) => `circle(${r}px at ${x}px ${y}px)`;

  // Espera a que la página y sus imágenes estén cargadas Y decodificadas (máx. 3 s).
  // Sin esto, las imágenes "aparecen de golpe" justo cuando el iris se abre y se ve un parpadeo.
  const pageReady = () => {
    const loaded =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((res) => window.addEventListener('load', res, { once: true }));
    const decoded = loaded.then(() =>
      Promise.all(
        [...document.images]
          .filter((img) => img.loading !== 'lazy')
          .map((img) => (img.decode ? img.decode().catch(() => {}) : null))
      )
    );
    return Promise.race([decoded, new Promise((res) => setTimeout(res, 3000))]);
  };

  // ---- Leer si venimos de un clic ----
  let saved = null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) saved = JSON.parse(raw);
    sessionStorage.removeItem(KEY);
  } catch (e) {}

  if (!saved && window.name.indexOf('iris:') === 0) {
    try {
      saved = JSON.parse(window.name.slice(5));
    } catch (e) {}
  }
  if (window.name.indexOf('iris:') === 0) window.name = '';

  // Descarta datos viejos (por ejemplo de una navegación que se canceló)
  if (saved && (typeof saved.t !== 'number' || Date.now() - saved.t > 8000)) saved = null;

  const arriving = !!saved && !reduceMotion;

  // ---- Capa del iris ----
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: IRIS_COLOR,
    zIndex: '2147483647',
    pointerEvents: 'none',
    clipPath: arriving
      ? circle(coverRadius(saved.x, saved.y), saved.x, saved.y)
      : 'circle(0px at 50% 50%)',
  });
  root.appendChild(overlay);

  // La capa ya tapa la página: quitamos la cubierta provisional del <head> sin hueco entre medias
  root.classList.remove('iris-cover');

  function animate(from, to, x, y) {
    return overlay.animate(
      [{ clipPath: circle(from, x, y) }, { clipPath: circle(to, x, y) }],
      { duration: DURATION, easing: EASING, fill: 'forwards' }
    );
  }

  // ---- ENTRADA: la página nueva empieza tapada y el iris se cierra hacia el clic ----
  if (arriving) {
    const { x, y } = saved;
    const r = coverRadius(x, y);

    pageReady().then(() =>
      requestAnimationFrame(() => requestAnimationFrame(() => animate(r, 0, x, y)))
    );
  }

  // ---- SALIDA: el iris crece desde el clic y luego navega ----
  let leaving = false;

  window.irisNavigate = (href, x = innerWidth / 2, y = innerHeight / 2) => {
    if (leaving) return;
    leaving = true;

    if (reduceMotion) {
      window.location.href = href;
      return;
    }

    const payload = JSON.stringify({ x, y, t: Date.now() });
    try {
      sessionStorage.setItem(KEY, payload);
    } catch (e) {}
    window.name = 'iris:' + payload; // respaldo por si sessionStorage falla

    animate(0, coverRadius(x, y), x, y).onfinish = () => {
      window.location.href = href;
    };
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.hasAttribute('data-no-iris')) return;

    // Ignora lo que no sea una navegación normal a otra página de tu web
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;

    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (!/^https?:$/.test(url.protocol)) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // anclas (#)

    e.preventDefault();

    // Si se activa con teclado, clientX/Y vale 0: usamos el centro del enlace
    let x = e.clientX;
    let y = e.clientY;
    if (e.detail === 0 || (x === 0 && y === 0)) {
      const b = a.getBoundingClientRect();
      x = b.left + b.width / 2;
      y = b.top + b.height / 2;
    }

    irisNavigate(url.href, x, y);
  });

  // Al volver con el botón "atrás", el navegador puede restaurar la página con el iris tapando
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    leaving = false;
    overlay.getAnimations().forEach((an) => an.cancel());
    overlay.style.clipPath = 'circle(0px at 50% 50%)';
    root.classList.remove('iris-cover');
  });
})();