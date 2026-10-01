import * as THREE from "three";


/* ═══════════════════════════════════════════
   GALERÍA 3D
   ═══════════════════════════════════════════ */

/* ───────────────────────────────────────────────
   1. TUS PROYECTOS
   ─────────────────────────────────────────────── */
const PROJECTS = [
  { title:"(01)", tag:"No hay meta - Diseño exposición/Editorial",               src:"img/proyectos/NF_010.png" },
  { title:"(02)", tag:"This is not a box - Branding/Packaging",          src:"img/proyectos/cajapossssst.png" },
  { title:"(03)", tag:"CasiCasi - Editorial",    src:"img/proyectos/evacara.png" },
  { title:"(04)", tag:"No hay meta - Diseño exposición/Editorial",        src:"img/proyectos/portada-expo.png" },
  { title:"(05)", tag:"Fotografía",            src:"img/proyectos/SUJETADOR.png" },
  { title:"(06)", tag:"Archif - Web",  src:"img/proyectos/archif1.png" },
  { title:"(07)", tag:"Ilustración - Revista el Duende",        src:"img/proyectos/Ilustración_sin_título (27).png" },
  { title:"(08)", tag:"Ilustración - Stand Up Loreal",          src:"img/proyectos/1.png" },
  { title:"(09)", tag:"CasiCasi - Editorial",     src:"img/proyectos/pagina-casicasi1.png" },
  { title:"(10)", tag:"This is not a box - Branding/Packaging",        src:"img/proyectos/tote.png" },
  { title:"(11)", tag:"Ilustración - Loki",        src:"img/proyectos/IMG_6578.jpeg" },
  { title:"(12)", tag:"3d", src:"img/proyectos/zapatilla_pospo.jpg" },
  { title:"(13)", tag:"Ilustración - Cuadro sin título",       src:"img/proyectos/fuego.jpeg" },
  { title:"(14)", tag:"This is not a box - Branding/Packaging",        src:"img/proyectos/niiiño.png" },
  { title:"(15)", tag:"This is not a box - Branding/Packaging",       src:"img/proyectos/manual3.png" },
  { title:"(16)", tag:"Cata la lata - Packaging",       src:"img/proyectos/cargo sardinas.png" },
  { title:"(17)", tag:"No hay meta - Diseño exposición/Editorial",           src:"img/proyectos/poster-nhm.png" },
  { title:"(18)", tag:"3d", src:"img/proyectos/ender cuadrado weno.jpg" },
];

const COUNT        = 18;
const RADIUS       = 3.6;
const CARD_H       = 1.35;
const AUTO_SPEED   = 0.0012;
const FRICTION     = 0.95;
const BACK_OPACITY = 0.3;

/* ─────────────────────────────────────────── */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.getElementById("c");
const hint   = document.getElementById("hint");

/* Overlay */
const overlay = document.getElementById("overlay");
const ovImg   = document.getElementById("ov-img");
const ovTitle = document.getElementById("ov-title");
const ovTag   = document.getElementById("ov-tag");

/* ─── Placeholder por si falta una imagen ─── */
function placeholder(i, title){
  const w = 480, h = 600;
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const g = cv.getContext("2d");
  const hue = (i * 47) % 360;
  g.fillStyle = `hsl(${hue},26%,66%)`;
  g.fillRect(0,0,w,h);
  g.fillStyle = `hsl(${(hue+25)%360},34%,32%)`;
  const s = i % 3;
  if (s === 0){ g.beginPath(); g.arc(w*.5,h*.42,150,0,Math.PI*2); g.fill(); }
  else if (s === 1){ g.fillRect(60,90,w-120,250); }
  else { g.beginPath(); g.moveTo(w*.5,80); g.lineTo(w-70,350); g.lineTo(70,350); g.closePath(); g.fill(); }
  g.fillStyle = "rgba(255,255,255,.92)";
  g.font = "600 34px Helvetica, Arial, sans-serif";
  g.fillText(title, 44, h-64);
  return cv.toDataURL("image/jpeg", .9);
}

/* ─── Renderer, escena, cámara ─── */
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setClearColor(0x000000, 0);

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, .1, 100);
const group  = new THREE.Group();
scene.add(group);

let zoom = 1;
function resize(){
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const fitH = Math.max(RADIUS*2 + 1.6, (RADIUS*2 + 1) / camera.aspect);
  camera.userData.baseZ = fitH / (2 * Math.tan(THREE.MathUtils.degToRad(22.5)));
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();
camera.position.z = camera.userData.baseZ;

/* ─── Rotación con cuaterniones ─── */
const AX_X = new THREE.Vector3(1,0,0), AX_Y = new THREE.Vector3(0,1,0);
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
function rotate(dx, dy){
  qa.setFromAxisAngle(AX_Y, dx);
  qb.setFromAxisAngle(AX_X, dy);
  group.quaternion.premultiply(qa).premultiply(qb);
}
group.rotation.set(.35, -.4, 0);

/* ─── Interacción ─── */
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const tmp = new THREE.Vector3();
let dragging = false, moved = false, opened = false;
let startX = 0, startY = 0, lastX = 0, lastY = 0, vx = 0, vy = 0;
let hovered = null;

function pick(clientX, clientY){
  ndc.x = (clientX / window.innerWidth) * 2 - 1;
  ndc.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(meshes, false);
  const hit = hits.find(h => h.object.getWorldPosition(tmp).z > 0);
  return hit ? hit.object : null;
}

/* ─── Overlay: abrir/cerrar ─── */
function openItem(ud){
  opened = true;
  vx = vy = 0;
  hovered = null;
  canvas.classList.remove("hover");
  ovImg.src = ud.url;
  ovImg.alt = ud.data.title;
  ovTitle.textContent = ud.data.title;
  ovTag.textContent   = ud.data.tag;
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  hint.classList.add("hide");
}
function closeItem(){
  opened = false;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
}
overlay.addEventListener("click", (e) => { if (e.target === overlay) closeItem(); });
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && opened) closeItem();
});

/* ─── Eventos del canvas ─── */
canvas.addEventListener("pointerdown", e => {
  if (opened) return;
  dragging = true; moved = false;
  startX = lastX = e.clientX;
  startY = lastY = e.clientY;
  vx = vy = 0;
  canvas.setPointerCapture(e.pointerId);
  canvas.classList.add("dragging");
});

canvas.addEventListener("pointermove", e => {
  if (opened) return;
  if (dragging){
    if (Math.hypot(e.clientX - startX, e.clientY - startY) > 5){
      moved = true;
      hint.classList.add("hide");
    }
    const dx = (e.clientX - lastX) * .006;
    const dy = (e.clientY - lastY) * .006;
    rotate(dx, dy);
    vx = dx; vy = dy;
    lastX = e.clientX; lastY = e.clientY;
  } else {
    hovered = pick(e.clientX, e.clientY);
    canvas.classList.toggle("hover", !!hovered);
  }
});

function endDrag(e){
  if (!dragging) return;
  dragging = false;
  canvas.classList.remove("dragging");
  if (!moved){
    const m = pick(e.clientX, e.clientY);
    if (m) openItem(m.userData);
  }
}
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", () => {
  dragging = false;
  canvas.classList.remove("dragging");
});
canvas.addEventListener("pointerleave", () => {
  if (!dragging){
    hovered = null;
    canvas.classList.remove("hover");
  }
});

canvas.addEventListener("wheel", e => {
  if (opened) return;
  e.preventDefault();
  zoom = THREE.MathUtils.clamp(zoom + e.deltaY * .001, .6, 1.4);
}, { passive:false });

/* ─── Construcción de la esfera (con precarga) ─── */
const maxAniso = renderer.capabilities.getMaxAnisotropy();
const meshes = [];
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const planeGeo = new THREE.PlaneGeometry(1, 1);

const imagePromises = [];
const loadedImages  = [];

for (let i = 0; i < COUNT; i++){
  const data = PROJECTS[i % PROJECTS.length];
  const url  = data.src || placeholder(i, data.title);

  const promise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload  = () => { loadedImages[i] = img; resolve(); };
    img.onerror = () => {
      const ph = new Image();
      ph.onload  = () => { loadedImages[i] = ph; resolve(); };
      ph.onerror = () => { loadedImages[i] = null; resolve(); };
      ph.src = placeholder(i, data.title);
    };
    img.src = url;
  });

  imagePromises.push(promise);
}

Promise.all(imagePromises).then(() => {
  // montar la esfera
  loadedImages.forEach((img, i) => {
    if (!img) return;

    const data = PROJECTS[i % PROJECTS.length];

    const y = 1 - ((i + .5) / COUNT) * 2;
    const r = Math.sqrt(1 - y*y);
    const t = GOLDEN * i;
    const pos = new THREE.Vector3(Math.cos(t)*r, y, Math.sin(t)*r).multiplyScalar(RADIUS);

    const mat = new THREE.MeshBasicMaterial({ transparent:true, side:THREE.FrontSide });
    const mesh = new THREE.Mesh(planeGeo, mat);
    mesh.position.copy(pos);
    mesh.userData = { data, url: img.src, base:new THREE.Vector3(CARD_H*.8, CARD_H, 1), s:1 };
    mesh.scale.copy(mesh.userData.base);

    const tex = new THREE.Texture(img);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = maxAniso;
    tex.needsUpdate = true;
    mat.map = tex;
    mat.needsUpdate = true;

    const aspect = img.naturalWidth / img.naturalHeight;
    mesh.userData.base.set(CARD_H * aspect, CARD_H, 1);

    group.add(mesh);
    meshes.push(mesh);
  });

  
    if (window.__preloader) window.__preloader.markImagesReady();
});

/* ─── Bucle de animación ─── */
function tick(){
  requestAnimationFrame(tick);

  if (!dragging && !opened){
    rotate(vx + (reduceMotion ? 0 : AUTO_SPEED), vy);
    vx *= FRICTION;
    vy *= FRICTION;
  }

  const targetZ = camera.userData.baseZ * zoom;
  camera.position.z += (targetZ - camera.position.z) * .08;

  group.updateMatrixWorld(true);
  for (const m of meshes){
    m.getWorldPosition(tmp);
    const depth = THREE.MathUtils.clamp((tmp.z + RADIUS) / (RADIUS * 2), 0, 1);
    m.material.opacity = BACK_OPACITY + (1 - BACK_OPACITY) * Math.pow(depth, 1.4);

    m.quaternion.copy(group.quaternion).invert();

    const target = (m === hovered) ? 1.14 : 1;
    m.userData.s += (target - m.userData.s) * .15;
    const b = m.userData.base, s = m.userData.s;
    const k = .55 + .45 * depth;
    m.scale.set(b.x * s * k, b.y * s * k, 1);
  }

  renderer.render(scene, camera);
}
tick();
