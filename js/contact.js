// // CONTACT 
document.addEventListener('DOMContentLoaded', function () {
  // reloj en vivo
  var fmt = new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, timeZone: 'Europe/Madrid'
  });
  function tickClock() {
    document.querySelectorAll('.clock').forEach(function (c) {
      c.textContent = fmt.format(new Date());
    });
  }
  tickClock();
  setInterval(tickClock, 1000);

  // cada fila esquiva el icono según su distancia al centro de la pantalla
  var labelRows = [].slice.call(document.querySelectorAll('.labels .row'));
  var valueRows = [].slice.call(document.querySelectorAll('.values .row'));
  var icon = document.querySelector('.icon');
  var smooth = function (t) { return t * t * (3 - 2 * t); };
  var ticking = false;

  function update() {
    var vh = window.innerHeight;
    var iconR = icon.offsetWidth / 2;
    var range = iconR + vh * 0.12;
    var clearance = iconR + 20;

    labelRows.forEach(function (lEl, i) {
      var vEl = valueRows[i];
      var b = lEl.getBoundingClientRect();
      var d = Math.abs(b.top + b.height / 2 - vh / 2);
      var t = smooth(Math.max(0, 1 - d / range));
      lEl.style.transform = 'translateX(' + (-t * clearance) + 'px)';
      vEl.style.transform = 'translateX(' + (t * clearance) + 'px)';
    });
    ticking = false;
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
});
// console.clear();
// gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// let ctx;

// function createTimeline() {
//   ctx && ctx.revert();

//   ctx = gsap.context(() => {
//     const box = document.querySelector(".box");
//     const boxStartRect = box.getBoundingClientRect();

//     // All containers except the first
//     const containers = gsap.utils.toArray(".container:not(.initial)");

//     // grab the points to animate between
//     const points = containers.map((container) => {
//       const marker = container.querySelector(".marker") || container;
//       const r = marker.getBoundingClientRect();

//       return {
//         x: r.left + r.width / 2 - (boxStartRect.left + boxStartRect.width / 2),
//         y: r.top + r.height / 2 - (boxStartRect.top + boxStartRect.height / 2)
//       };
//     });

//     const tl = gsap.timeline({
//       scrollTrigger: {
//         trigger: ".container.initial",
//         start: "clamp(top center)",
//         endTrigger: ".final",
//         end: "clamp(top center)",
//         scrub: 1
//       }
//     });

//     tl.to(".box", {
//       duration: 1,
//       ease: "none",
//       motionPath: {
//         path: points, // array like - [{x:100, y:50}, {x:200, y:0}, {x:300, y:100}]
//         curviness: 1.5 // adjust how curvy the path is, default is 1, 2 is more curvy
//       }
//     });
//   });
// }

// createTimeline();
// window.addEventListener("resize", createTimeline);



// // CONTACT 2 
// gsap.registerPlugin(ScrollTrigger);

// const splitTl = gsap.timeline({
//   scrollTrigger: {
//     trigger: ".split-contact",
//     start: "top top",
//     end: "+=100%", // cuánto scroll dura la separación
//     scrub: 1,
//     pin: true // fija la sección mientras se separan
//   }
// });

// splitTl
//   .to(".split-left", { xPercent: -100, ease: "none" }, 0)
//   .to(".split-right", { xPercent: 100, ease: "none" }, 0);
