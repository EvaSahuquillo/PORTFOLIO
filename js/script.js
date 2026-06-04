// CURSOR
(function initCustomCursor() {

  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!isFinePointer) return;

  if (window.__customCursorInit) return;
  window.__customCursorInit = true;

  const run = () => {

    let cursor = document.getElementById("custom-cursor");
    if (!cursor) {
      cursor = document.createElement("div");
      cursor.id = "custom-cursor";
      cursor.innerHTML = `<div class="cursor-inner"></div>`;
      document.body.appendChild(cursor);
    }

    const inner = cursor.querySelector(".cursor-inner");
    if (!inner) return;

    // Mover cursor
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });

    // Crecer en hover sobre elementos clicables
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("a, button, .btn, input, textarea, select, .grid-item")) {
        inner.classList.add("link-hover");
      }
    });

    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("a, button, .btn, input, textarea, select, .grid-item")) {
        inner.classList.remove("link-hover");
      }
    });
  };

  // Por si el script se carga en <head> alguna vez
  if (document.body) run();
  else window.addEventListener("DOMContentLoaded", run);

})();

// FRASE CTA 
// gsap.registerPlugin(SplitText, ScrollTrigger);

// let wrapper = document.querySelector(".Horizontal");
// let text = document.querySelector(".Horizontal__text");
// let split = SplitText.create(".Horizontal__text", { type: "chars, words" });

// const scrollTween = gsap.to(text, {
//   xPercent: -100,
//   ease: "none",
//   scrollTrigger: {
//     trigger: wrapper,
//     pin: true,
//     end: "+=800px",
//     scrub: true
//   }
// });

// split.chars.forEach((char) => {
//   gsap.from(char, {
//     yPercent: "random(-200, 200)",
//     rotation: "random(-20, 20)",
//     ease: "back.out(1.2)",
//     scrollTrigger: {
//       trigger: char,
//       containerAnimation: scrollTween,
//       start: "left 100%",
//       end: "left 30%",
//       scrub: 1
//     }
//   });
// });


// FOOTER
gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);

const down = 'M0-0.3C0-0.3,464,156,1139,156S2278-0.3,2278-0.3V683H0V-0.3z';
const center = 'M0-0.3C0-0.3,464,0,1139,0s1139-0.3,1139-0.3V683H0V-0.3z';

ScrollTrigger.create({
  trigger: '.footer',
  start: 'top bottom',
  toggleActions: 'play pause resume reverse',
  onEnter: self => {
    const velocity = self.getVelocity();
    const variation = velocity / 10000;

    gsap.fromTo('#bouncy-path', {
      morphSVG: down
    }, {
      duration: 2, 
      morphSVG: center, 
      ease: `elastic.out(${1 + variation}, ${1 - variation})`, 
      overwrite: 'true'
    });
  }
});

// MENU DE ARRIBA
const trigger = document.getElementById("menu-trigger");
const expandedMenu = document.getElementById("expanded-menu");

let tl = gsap
  .timeline({ paused: true })
  .to("#expanded-menu", {
    duration: 1.2,
    delay: 0.1,
    height: "auto", // height auto animation 🙌
    ease: "power4.out"
  })
  .to(
    "#sub-menu img",
    {
      duration: 1,
      opacity: 1,
      ease: "power4.inOut",
      stagger: 0.05
    },
    0.3
  )
  .reverse();

trigger.addEventListener("click", (event) => {
  tl.reversed(!tl.reversed());
});

// TRANSICION 
let path = document.querySelector(".path");

const start = "M 0 100 V 50 Q 50 0 100 50 V 100 z";
const end = "M 0 100 V 0 Q 50 0 100 0 V 100 z";

let timeline = gsap.timeline()

timeline.to(path, {morphSVG: start, ease: "power2.in"})
.to(path,{morphSVG: end, ease: "power2.out"}).reverse()

document.body.addEventListener("click", (e) => {
  timeline.reversed(!timeline.reversed())
})


// TEXTO
