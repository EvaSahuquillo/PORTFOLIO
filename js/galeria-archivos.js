// GALERIA ARCHIVOS 
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const smoother = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 2,
  normalizeScroll: true,
  ignoreMobileResize: true,
  preventDefault: true
});

//Horizontal Scroll Galleries
if (document.getElementById("portfolio")) {
  const horizontalSections = gsap.utils.toArray(".horiz-gallery-wrapper");

  horizontalSections.forEach(function (sec, i) {
    const pinWrap = sec.querySelector(".horiz-gallery-strip");

    let pinWrapWidth;
    let horizontalScrollLength;

    function refresh() {
      pinWrapWidth = pinWrap.scrollWidth;
      horizontalScrollLength = pinWrapWidth - window.innerWidth;
    }

    refresh();
    // Pinning and horizontal scrolling
    gsap.to(pinWrap, {
      scrollTrigger: {
        scrub: true,
        trigger: sec,
        pin: sec,
        start: "center center",
        end: () => `+=${pinWrapWidth}`,
        invalidateOnRefresh: true
      },
      x: () => -horizontalScrollLength,
      ease: "none"
    });

    ScrollTrigger.addEventListener("refreshInit", refresh);
  });
}

/* Hover en las imágenes de la galería: se amplía un poco y cambia a otra imagen.
 
   Uso en el HTML: añade la segunda imagen en data-hover
   <div class="project-wrap">
     <img src="img/foto-1.jpg" data-hover="img/foto-1-b.jpg" alt="">
   </div>
 
   Las imágenes sin data-hover solo se amplían.
   Llama a initHoverSwap() una vez, después de cargar GSAP. */
 
function initHoverSwap(selector = ".project-wrap img", options = {}) {
  const { scale = 1.06, duration = 0.5, ease = "power3.out" } = options;
 
  // En pantallas táctiles no hay hover: se dejan las imágenes como están
  if (!window.matchMedia("(hover: hover)").matches) return;
 
  gsap.utils.toArray(selector).forEach((img) => {
    // Envuelve la imagen en un contenedor para poder apilar la segunda encima
    const media = document.createElement("div");
    media.className = "media";
    img.parentNode.insertBefore(media, img);
    media.append(img);
 
    const tl = gsap.timeline({ paused: true, defaults: { duration, ease } });
    tl.to(media, { scale }, 0);
 
    const hoverSrc = img.dataset.hover;
    if (hoverSrc) {
      const hoverImg = new Image(); // se empieza a cargar ya, así no hay parpadeo al primer hover
      hoverImg.src = hoverSrc;
      hoverImg.alt = "";
      hoverImg.className = "media-hover";
      media.append(hoverImg);
      gsap.set(hoverImg, { opacity: 0 });
      tl.to(hoverImg, { opacity: 1 }, 0);
    }
 
    media.addEventListener("mouseenter", () => tl.play());
    media.addEventListener("mouseleave", () => tl.reverse());
  });
}