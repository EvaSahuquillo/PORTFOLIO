// Añade aquí tus imágenes y vídeos, en el orden que quieras
const items = [
  { title:"(01)", tag:"Cata la lata",  type: 'img',   src: 'img/proyectos/IMG_4965.jpeg' },
  { title:"(01)", tag:"Cata la lata",  type: 'img',   src: 'img/proyectos/zapatilla_pospo.jpg' },
  { title:"(01)", tag:"Cata la lata",  type: 'img',   src: 'img/proyectos/patas-min.png' },
  { title:"(01)", tag:"Cata la lata",  type: 'img',   src: 'img/proyectos/fuego.jpeg' },
  { title:"(01)", tag:"Cata la lata",  type: 'img',   src: 'img/proyectos/SUJETADOR.png' },
  { title:"(01)", tag:"Cata la lata",  type: 'img',   src: 'img/proyectos/ender cuadrado weno.jpg' },
  { title:"(01)", tag:"Cata la lata",  type: 'img',   src: 'img/proyectos/loreal-ilustracion.gif' },
  { title:"(01)", tag:"Cata la lata",  type: 'img',   src: 'img/proyectos/foto1-portfolio.jpg' },
  { title:"(01)", tag:"Cata la lata",  type: 'img',   src: 'img/proyectos/cuadro-metro.gif' },
  { title:"(01)", tag:"Cata la lata",  type: 'img',   src: 'img/proyectos/portada definitiva.png' },
  { title:"(01)", tag:"Cata la lata",  type: 'img',   src: 'img/proyectos/roberto.jpg' },
  { type: 'img',   src: 'img/proyectos/IMG_6578.jpeg' },
  { type: 'video', src: 'img/proyectos/Sahuquillo.Eva_A3D_P1_VIDEO.mp4' },
  { type: 'img',   src: 'img/proyectos/Ilustración_sin_título (27).png' },
  { type: 'img',   src: 'img/proyectos/lajulai.jpg' },
  { type: 'img',   src: 'img/proyectos/Sahuquillo.Eva_3.1_Yorokobu_Revista.png' },
  { type: 'img',   src: 'img/proyectos/ROSTROS.GIF' },
  { type: 'img',   src: 'img/proyectos/IMG_1354.JPG' },


];

const grid = document.getElementById('grid');
const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightbox-content');
let currentCols = 0;

const getCols = () => innerWidth <= 600 ? 2 : innerWidth <= 973 ? 3 : 5;

// Mide la proporción de cada archivo antes de repartirlo
function measure() {
  return Promise.all(items.map(it => new Promise(resolve => {
    const done = ratio => { it.ratio = ratio || 1; resolve(); };
    if (it.type === 'img') {
      const i = new Image();
      i.onload = () => done(i.naturalHeight / i.naturalWidth);
      i.onerror = () => done(1);
      i.src = it.src;
    } else {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => done(v.videoHeight / v.videoWidth);
      v.onerror = () => done(1);
      v.src = it.src;
    }
  })));
}

function makeEl(it) {
  const div = document.createElement('div');
  div.className = 'item';
  if (it.type === 'img') {
    div.innerHTML = `<img src="${it.src}" alt="${it.caption || ''}" loading="lazy">`;
  } else {
    div.innerHTML = `<video src="${it.src}" autoplay muted loop playsinline></video>`;
  }
  div.addEventListener('click', () => openLightbox(it));
  return div;
}

function render() {
  const n = getCols();
  currentCols = n;
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
  const media = it.type === 'img'
    ? `<img src="${it.src}" alt="${it.caption || ''}">`
    : `<video src="${it.src}" autoplay controls loop playsinline></video>`;
  const caption = it.caption ? `<p class="caption">${it.caption}</p>` : '';
  lightboxContent.innerHTML = media + caption;
  lightbox.classList.add('open');
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxContent.innerHTML = '';
}

// Cierra al pulsar fuera de la imagen/vídeo y del caption
lightbox.addEventListener('click', e => {
  if (!e.target.closest('img, video, .caption')) closeLightbox();
});
addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// Solo vuelve a repartir cuando cambia el número de columnas
addEventListener('resize', () => {
  if (getCols() !== currentCols) render();
});

measure().then(render);
// GALERIA ARCHIVOS 
// gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// const smoother = ScrollSmoother.create({
//   wrapper: "#smooth-wrapper",
//   content: "#smooth-content",
//   smooth: 2,
//   normalizeScroll: true,
//   ignoreMobileResize: true,
//   preventDefault: true
// });

// //Horizontal Scroll Galleries
// if (document.getElementById("portfolio")) {
//   const horizontalSections = gsap.utils.toArray(".horiz-gallery-wrapper");

//   horizontalSections.forEach(function (sec, i) {
//     const pinWrap = sec.querySelector(".horiz-gallery-strip");

//     let pinWrapWidth;
//     let horizontalScrollLength;

//     function refresh() {
//       pinWrapWidth = pinWrap.scrollWidth;
//       horizontalScrollLength = pinWrapWidth - window.innerWidth;
//     }

//     refresh();
//     // Pinning and horizontal scrolling
//     gsap.to(pinWrap, {
//       scrollTrigger: {
//         scrub: true,
//         trigger: sec,
//         pin: sec,
//         start: "center center",
//         end: () => `+=${pinWrapWidth}`,
//         invalidateOnRefresh: true
//       },
//       x: () => -horizontalScrollLength,
//       ease: "none"
//     });

//     ScrollTrigger.addEventListener("refreshInit", refresh);
//   });
// }

// /* Hover en las imágenes de la galería: se amplía un poco y cambia a otra imagen.
 
//    Uso en el HTML: añade la segunda imagen en data-hover
//    <div class="project-wrap">
//      <img src="img/foto-1.jpg" data-hover="img/foto-1-b.jpg" alt="">
//    </div>
 
//    Las imágenes sin data-hover solo se amplían.
//    Llama a initHoverSwap() una vez, después de cargar GSAP. */
 
// function initHoverSwap(selector = ".project-wrap img", options = {}) {
//   const { scale = 1.06, duration = 0.5, ease = "power3.out" } = options;
 
//   // En pantallas táctiles no hay hover: se dejan las imágenes como están
//   if (!window.matchMedia("(hover: hover)").matches) return;
 
//   gsap.utils.toArray(selector).forEach((img) => {
//     // Envuelve la imagen en un contenedor para poder apilar la segunda encima
//     const media = document.createElement("div");
//     media.className = "media";
//     img.parentNode.insertBefore(media, img);
//     media.append(img);
 
//     const tl = gsap.timeline({ paused: true, defaults: { duration, ease } });
//     tl.to(media, { scale }, 0);
 
//     const hoverSrc = img.dataset.hover;
//     if (hoverSrc) {
//       const hoverImg = new Image(); // se empieza a cargar ya, así no hay parpadeo al primer hover
//       hoverImg.src = hoverSrc;
//       hoverImg.alt = "";
//       hoverImg.className = "media-hover";
//       media.append(hoverImg);
//       gsap.set(hoverImg, { opacity: 0 });
//       tl.to(hoverImg, { opacity: 1 }, 0);
//     }
 
//     media.addEventListener("mouseenter", () => tl.play());
//     media.addEventListener("mouseleave", () => tl.reverse());
//   });
// }