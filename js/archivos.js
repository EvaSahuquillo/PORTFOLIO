// ============================================
// GALERÍA: aparición de imágenes al hacer scroll
// ============================================
 
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP o ScrollTrigger no están cargados');
    return;
  }
 
  gsap.registerPlugin(ScrollTrigger);
 
  document.querySelectorAll('.gallery .row').forEach((row) => {
    // Solo animamos las casillas que realmente tienen imagen o vídeo
    // (algunas .col están vacías a propósito, para dejar huecos en la fila)
    const items = Array.from(row.querySelectorAll('[data-reveal]'))
      .filter((el) => el.querySelector('img, video'));
 
    if (!items.length) return;
 
    gsap.set(items, { y: 60, opacity: 0 });
 
    // timeline en pausa: la reproducimos o rebobinamos según se entre o
    // se salga de la fila, en cualquier dirección del scroll
    const tl = gsap.timeline({ paused: true }).to(items, {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.12,      // las imágenes de la misma fila entran una detrás de otra
      ease: 'power3.out'
    });
 
    ScrollTrigger.create({
      trigger: row,
      start: 'top 85%',   // cuando el top de la fila llega al 85% de la ventana, bajando
      end: 'bottom 15%',  // cuando el bottom de la fila llega al 15% de la ventana, bajando
      onEnter: () => tl.play(),      // bajando: aparece
      onLeave: () => tl.reverse(),   // sigue bajando y la fila sale por arriba: desaparece
      onEnterBack: () => tl.play(),  // subiendo: reaparece
      onLeaveBack: () => tl.reverse() // sigue subiendo y la fila sale por abajo: desaparece
    });
  });
});