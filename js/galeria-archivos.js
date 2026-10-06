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
    div.innerHTML = `<img src="${it.src}" alt="${it.tag || ''}" loading="lazy">`;
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
    ? `<img src="${it.src}" alt="${it.tag || ''}">`
    : `<video src="${it.src}" autoplay controls loop playsinline></video>`;
  lightboxContent.innerHTML = media;
  ovTitle.textContent = it.title || '';
  ovTag.textContent = it.tag || '';
  lightbox.classList.add('open');
}
 
function closeLightbox() {
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