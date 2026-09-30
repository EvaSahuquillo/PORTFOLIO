/* ═══════════════════════════════════════════
   PRELOADER: cortina SVG + contador
   ═══════════════════════════════════════════ */

// gsap.registerPlugin(MorphSVGPlugin);

// const loaderEl      = document.getElementById("loader");
// const loaderCounter = document.getElementById("loader-counter-num");
// const loaderPath    = document.querySelector(".loader-path");

// const MIN_PRELOADER_TIME = 2500;
// let imagesReady = false;
// let counterFinished = false;

// /* Formas para el morphing */
// const START_PATH = "M 0 100 V 50 Q 50 0 100 50 V 100 z";
// const END_PATH   = "M 0 100 V 0 Q 50 0 100 0 V 100 z";

// /* Timeline de la cortina */
// let curtainTl = null;

// function initCurtain() {
//   curtainTl = gsap.timeline();

//   curtainTl
//     .to(loaderPath, {
//       morphSVG: START_PATH,
//       ease: "power2.in",
//       duration: 1
//     })
//     .to(loaderPath, {
//       morphSVG: END_PATH,
//       ease: "power2.out",
//       duration: 1
//     });

//   curtainTl.play(0);
// }

// /* Contador 0 → 100 */
// function runCounter() {
//   const counterState = { value: 0 };

//   gsap.to(counterState, {
//     value: 100,
//     duration: MIN_PRELOADER_TIME / 1000,
//     ease: "power2.inOut",
//     onUpdate: () => {
//       if (loaderCounter) loaderCounter.textContent = Math.round(counterState.value);
//     },
//     onComplete: () => {
//       counterFinished = true;
//       tryFinishPreloader();
//     }
//   });
// }

// function tryFinishPreloader() {
//   if (!imagesReady || !counterFinished) return;
//   hidePreloader();
// }

// function hidePreloader() {
//   if (!loaderEl) return;
//   loaderEl.classList.add("hide");
//   setTimeout(() => {
//     if (loaderEl.parentNode) loaderEl.parentNode.removeChild(loaderEl);
//   }, 900);
// }

// /* Arrancar preloader */
// if (loaderEl && loaderCounter && loaderPath) {
//   initCurtain();
//   runCounter();

//   setTimeout(() => {
//     imagesReady = true;
//     counterFinished = true;
//     tryFinishPreloader();
//   }, 12000);
// }

// /* API para galeria-3d.js */
// window.__preloader = {
//   markImagesReady() {
//     imagesReady = true;
//     tryFinishPreloader();
//   }
// };