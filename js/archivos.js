let isOpen = false;
let exitSpeed = 1.5;
const erToggle = document.querySelector("#erToggle");
const exitSlider = document.querySelector("#exitSlider");
const exitValEl = document.querySelector("#exitVal");
let tl;
let enterEndTime = 0;

exitSlider.addEventListener("input", () => {
  exitSpeed = parseFloat(exitSlider.value);
  exitValEl.textContent = exitSpeed + "×";
});

function er(val) {
  return erToggle.checked ? val || true : false;
}

function init() {
  tl && tl.revert();

  gsap.set("#nav", { visibility: "hidden" });
  gsap.set(".nav-bg", { opacity: 0 });
  gsap.set(".nav-login", { opacity: 0, y: 8 });

  tl = gsap
    .timeline({ paused: true })

    .set("#nav", { visibility: "visible", pointerEvents: "auto" })
    // ═══ ENTER ═══

    .to(
      ".nav-bg",
      {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        easeReverse: er("power4.out")
      },
      0
    )

    .fromTo(
      ".nav-panel",
      { x: "110%", y: 0, rotation: 0 },
      {
        x: "0%",
        y: 0,
        duration: 0.6,
        ease: "back.out",
        easeReverse: er("power3.in"),
        stagger: 0.1,
      },
      0
    )

    .fromTo(
      ".nav-item",
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: "expo.out",
        easeReverse: er("power3.in"),
        stagger: 0.03
      },
      0.1
    )

    .fromTo(
      ".bar-top",
      {
        stroke: "var(--white)",
        attr: { x1: 3, y1: 7, x2: 17, y2: 7 }
      },
      {
        stroke: "#0e100f",
        attr: { x1: 5, y1: 5, x2: 15, y2: 15 },
        duration: 0.35,
        ease: "back.out(1.4)",
        easeReverse: er("power3.out")
      },
      0.06
    )
    .fromTo(
      ".bar-bot",
      {
        stroke: "var(--white)",
        attr: { x1: 3, y1: 13, x2: 17, y2: 13 }
      },
      {
        stroke: "#0e100f",
        attr: { x1: 15, y1: 5, x2: 5, y2: 15 },
        duration: 0.35,
        ease: "back.out(1.4)",
        easeReverse: er("power3.out")
      },
      0.06
    )
    .to(
      ".nav-login",
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power3.out",
        easeReverse: er("power4.out")
      },
      0.4
    )

    // ═══ PAUSE ═══
    .addPause();

  enterEndTime = tl.duration();

  // ═══ EXIT — panels fall down with stagger, bottom first ═══

  tl
    // X → hamburger
    .to(".bar", {
      stroke: "var(--white)",
      duration: 0.2
    })
    .to(
      ".bar-top",
      {
        attr: { x1: 3, y1: 7, x2: 17, y2: 7 },
        duration: 0.2,
        ease: "power3.in"
      },
      "<"
    )
    .to(
      ".bar-bot",
      {
        attr: { x1: 3, y1: 13, x2: 17, y2: 13 },
        duration: 0.2,
        ease: "power3.in"
      },
      "<"
    )

    // panels fall
    .to(
      ".nav-panel",
      {
        y: "110vh",
        rotation: "random(-25, 25)",
        duration: 1,
        ease: "power3.in",
        stagger: {
          from: "end",
          each: 0.02
        }
      },
      "<"
    )

    // bg fades
    .to(
      ".nav-bg",
      {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      },
      "<0.1"
    )

    .set("#nav", { visibility: "hidden", pointerEvents: "none" });
}
init();

erToggle.addEventListener("change", () => {
  if (isOpen) {
    isOpen = false;
    document.getElementById("menuToggle").setAttribute("aria-expanded", false);
  }
  init();
});

function toggle() {
  isOpen = !isOpen;
  const btn = document.getElementById("menuToggle");
  btn.setAttribute("aria-expanded", isOpen);
  btn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");

  if (isOpen) {
    if (tl.time() >= enterEndTime) {
      tl.timeScale(1).restart();
    } else {
      tl.timeScale(1).play();
    }
  } else {
    if (tl.time() < enterEndTime) {
      tl.timeScale(exitSpeed).reverse();
    } else {
      tl.timeScale(1).play();
    }
  }
}

document.getElementById("menuToggle").addEventListener("click", toggle);
document.querySelector(".nav-bg").addEventListener("click", () => {
  if (isOpen) toggle();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isOpen) {
    toggle();
    document.getElementById("menuToggle").focus();
  }
});