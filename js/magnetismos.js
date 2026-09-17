// BOTONCINES 
gsap.registerPlugin(CustomEase, CustomWiggle);
 
/* ── magnetic buttons ── */
var zones = document.querySelectorAll(".mag-zone");
var strength = 0.4;
var labelStrength = 0.24;
 
zones.forEach(function (zone) {
  var btn = zone.querySelector(".mag-btn");
  var label = btn.querySelector(".label");
  var hasWiggle = zone.getAttribute("data-wiggle") === "true";
 
  // wiggle de atención (opcional, activable con data-wiggle="true")
  if (hasWiggle) {
    gsap.to(btn, {
      rotation: 12,
      duration: 1.5,
      repeat: -1,
      ease: "wiggle({wiggles:8,type:easeOut})"
    });
  }
 
  zone.addEventListener("mousemove", function (e) {
    var rect = zone.getBoundingClientRect();
    var mapX = gsap.utils.mapRange(rect.left, rect.right, -rect.width / 2, rect.width / 2, e.clientX);
    var mapY = gsap.utils.mapRange(rect.top, rect.bottom, -rect.height / 2, rect.height / 2, e.clientY);
 
    gsap.to(btn, {
      x: mapX * strength,
      y: mapY * strength,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto"
    });
 
    gsap.to(label, {
      x: mapX * labelStrength,
      y: mapY * labelStrength,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto"
    });
  });
 
  zone.addEventListener("mouseleave", function () {
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: "elastic.out(1,0.4)",
      overwrite: "auto"
    });
 
    gsap.to(label, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: "elastic.out(1,0.4)",
      overwrite: "auto"
    });
  });
})