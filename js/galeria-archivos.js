// Añade aquí tus imágenes y vídeos, en el orden que quieras
const items = [
  { title:"(01)", tag:"Cuadro sin título", type: 'img',   src: 'img/proyectos/webp/IMG_4965.webp' },
  { title:"(02)", tag:"3D", type: 'img',   src: 'img/proyectos/webp/zapatilla_pospo.webp' },
  { title:"(03)", tag:"Fotografía", type: 'img',   src: 'img/proyectos/webp/patas-min.webp' },
  { title:"(04)", tag:"Cuadro sin título", type: 'img',   src: 'img/proyectos/webp/fuego.webp' },
  { title:"(05)", tag:"Fotografía", type: 'img',   src: 'img/proyectos/webp/SUJETADOR.webp' },
  { title:"(06)", tag:"3D", type: 'img',   src: 'img/proyectos/webp/ender cuadrado weno.webp' },
  { title:"(07)", tag:"Ilustración Loreal StandUp", type: 'img',   src: 'img/proyectos/loreal-ilustracion.gif' },
  { title:"(08)", tag:"Fotografía", type: 'img',   src: 'img/proyectos/webp/foto1-portfolio.webp' },
  { title:"(09)", tag:"Rostros", type: 'img',   src: 'img/proyectos/cuadro-metro.gif' },
  { title:"(10)", tag:"Fotografía", type: 'img',   src: 'img/proyectos/webp/portada definitiva.webp' },
  { title:"(11)", tag:"Fotografía", type: 'img',   src: 'img/proyectos/webp/roberto.webp' },
  { title:"(12)", tag:"Cuadro sin título", type: 'img',   src: 'img/proyectos/webp/IMG_6578.webp' },
  { title:"(13)", tag:"3D-Animación", type: 'video', src: 'img/proyectos/Sahuquillo.Eva_A3D_P1_VIDEO.mp4' },
  { title:"(14)", tag:"Ilustración Revista-Calendario ElDuende", type: 'img',   src: 'img/proyectos/webp/Ilustración_sin_título (27).webp' },
  { title:"(15)", tag:"Fotografía", type: 'img',   src: 'img/proyectos/lajulai.jpg' },
  { title:"(16)", tag:"Revista Yorokobu - 3D", type: 'img',   src: 'img/proyectos/webp/Sahuquillo.Eva_3.1_Yorokobu_Revista.webp' },
  { title:"(17)", tag:"Rostros", type: 'img',   src: 'img/proyectos/ROSTROS.gif' },
  { title:"(18)", tag:"Fotografía", type: 'img',   src: 'img/proyectos/webp/IMG_1354.webp' },
];

const grid = document.getElementById('grid');
const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightbox-content');
const ovTitle = document.getElementById('ov-title');
const ovTag = document.getElementById('ov-tag');
let currentCols = 0;
let openToken = 0;   // evita que una carga lenta pise a otra imagen

const getCols = () => innerWidth <= 600 ? 2 : innerWidth <= 973 ? 3 : 5;

// Ruta de la miniatura: img/proyectos/thumbs/<nombre>.webp
const thumbOf = src =>
  'img/proyectos/thumbs/' + src.split('/').pop().replace(/\.[^.]+$/, '.webp');

// Reproduce los vídeos solo mientras se ven en pantalla
const videoObserver = new IntersectionObserver(entries => {
  entries.forEach(en => {
    const v = en.target;
    if (en.isIntersecting) v.play().catch(() => {});
    else v.pause();
  });
}, { rootMargin: '200px' });

// Mide la proporción de cada archivo (con la miniatura, que pesa poco)
function measure() {
  return Promise.all(items.map(it => new Promise(resolve => {
    const done = ratio => { it.ratio = ratio || 1; resolve(); };

    if (it.type === 'img') {
      // Prueba la miniatura; si no existe, usa la imagen original
      const tryLoad = (url, fallback) => {
        const i = new Image();
        i.onload = () => { it.thumb = url; done(i.naturalHeight / i.naturalWidth); };
        i.onerror = () => (fallback ? tryLoad(fallback) : done(1));
        i.src = url;
      };
      tryLoad(thumbOf(it.src), it.src);
    } else {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => done(v.videoHeight / v.videoWidth);
      v.onerror = () => done(1);
      v.src = it.src;
    }
  })));
}

// Precarga la imagen completa cuando el ratón pasa por encima
function prefetch(it) {
  const pre = new Image();
  pre.decoding = 'async';
  pre.src = it.src;
}

function makeEl(it) {
  const div = document.createElement('div');
  div.className = 'item';

  if (it.type === 'img') {
    div.innerHTML =
      `<img src="${it.thumb || it.src}" alt="${it.tag || ''}" ` +
      `loading="lazy" decoding="async" style="aspect-ratio:${1 / it.ratio}">`;
    div.addEventListener('mouseenter', () => prefetch(it), { once: true });
  } else {
    div.innerHTML =
      `<video src="${it.src}" muted loop playsinline preload="metadata" ` +
      `style="aspect-ratio:${1 / it.ratio}"></video>`;
    videoObserver.observe(div.querySelector('video'));
  }

  div.addEventListener('click', () => openLightbox(it));
  return div;
}

function render() {
  const n = getCols();
  currentCols = n;
  videoObserver.disconnect();
  grid.innerHTML = '';
  const columns = Array.from({ length: n }, () => {
    const el = document.createElement('div');
    el.className = 'col';
    grid.appendChild(el);
    return { el, h: 0 };
  });
  items.forEach(it => {
    const target = columns.reduce((a, b) => (b.h < a.h ? b : a));
    target.h += it.ratio;
    target.el.appendChild(makeEl(it));
  });
}

function openLightbox(it) {
  const token = ++openToken;
  lightboxContent.innerHTML = '';

  if (it.type === 'img') {
    const img = document.createElement('img');
    img.alt = it.tag || '';
    img.src = it.thumb || it.src;          // miniatura al instante (ya está en caché)
    lightboxContent.appendChild(img);

    // Imagen completa en segundo plano
    if (it.thumb && it.thumb !== it.src) {
      img.classList.add('loading');
      const full = new Image();
      full.decoding = 'async';
      full.onload = () => {
        if (token !== openToken) return;
        img.src = full.src;
        img.classList.remove('loading');
      };
      full.onerror = () => {
        if (token === openToken) img.classList.remove('loading');
      };
      full.src = it.src;
    }
  } else {
    lightboxContent.innerHTML =
      `<video src="${it.src}" autoplay controls loop playsinline></video>`;
  }

  ovTitle.textContent = it.title || '';
  ovTag.textContent = it.tag || '';
  lightbox.classList.add('open');
}

function closeLightbox() {
  openToken++;   // cancela cualquier carga pendiente
  lightbox.classList.remove('open');
  lightboxContent.innerHTML = '';
  ovTitle.textContent = '';
  ovTag.textContent = '';
}

// Cierra al pulsar fuera de la imagen/vídeo y de los textos
lightbox.addEventListener('click', e => {
  if (!e.target.closest('img, video, #ov-title, #ov-tag')) closeLightbox();
});
addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// Solo vuelve a repartir cuando cambia el número de columnas
addEventListener('resize', () => {
  if (getCols() !== currentCols) render();
});

measure().then(render);