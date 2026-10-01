import * as THREE from "three";


/* ═══════════════════════════════════════════
   GALERÍA 3D
   ═══════════════════════════════════════════ */

/* ───────────────────────────────────────────────
   1. TUS PROYECTOS
   ─────────────────────────────────────────────── */
const PROJECTS = [
  { title: "(10)", tag: "This is not a box - Branding/Packaging", src: "img/proyectos/tote.png" },
  { title: "(11)", tag: "Ilustración - Loki", src: "img/proyectos/IMG_6578.jpeg" },
  { title: "(12)", tag: "3d", src: "img/proyectos/zapatilla_pospo.jpg" },
  { title: "(13)", tag: "Ilustración - Cuadro sin título", src: "img/proyectos/fuego.jpeg" },
  { title: "(14)", tag: "This is not a box - Branding/Packaging", src: "img/proyectos/niiiño.png" },
  { title: "(15)", tag: "This is not a box - Branding/Packaging", src: "img/proyectos/manual3.png" },
  { title: "(01)", tag: "No hay meta - Diseño exposición/Editorial", src: "img/proyectos/NF_010.png" },
  { title: "(18)", tag: "3d", src: "img/proyectos/ender cuadrado weno.jpg" },
  { title: "(17)", tag: "No hay meta - Diseño exposición/Editorial", src: "img/proyectos/poster-nhm.png" },
  { title: "(02)", tag: "This is not a box - Branding/Packaging", src: "img/proyectos/cajapossssst.png" },
  { title: "(16)", tag: "Cata la lata - Packaging", src: "img/proyectos/cargo sardinas.png" },
  { title: "(03)", tag: "CasiCasi - Editorial", src: "img/proyectos/evacara.png" },
  { title: "(04)", tag: "No hay meta - Diseño exposición/Editorial", src: "img/proyectos/portada-expo.png" },
  { title: "(05)", tag: "Fotografía", src: "img/proyectos/SUJETADOR.png" },
  { title: "(06)", tag: "Archif - Web", src: "img/proyectos/archif1.png" },
  { title: "(07)", tag: "Ilustración - Revista el Duende", src: "img/proyectos/Ilustración_sin_título (27).png" },
  { title: "(08)", tag: "Ilustración - Stand Up Loreal", src: "img/proyectos/1.png" },
  { title: "(09)", tag: "CasiCasi - Editorial", src: "img/proyectos/pagina-casicasi1.png" }
];

/* ───────────────────────────────────────────────
   2. CONFIGURACIÓN
   ─────────────────────────────────────────────── */
const COUNT = 18;
const RADIUS = 3.6;
const CARD_H = 1.35;
const AUTO_SPEED = 0.0012;
const FRICTION = 0.95;
const BACK_OPACITY = 0.3;

/* ── Aparición escalonada (más smooth) ── */
const SPAWN_INTERVAL = 130;     // ms entre tarjeta y tarjeta (más pausado)
const SPAWN_FADE_MS = 1500;     // fade-in más largo
const SPAWN_RISE = 0.5;         // rise más notorio

/* ── Arranque del giro progresivo ── */
const SPIN_RAMP_MS = 2600;      // rampa de spin más larga = más suave

/* ── Rampa del zoom de entrada ── */
const ZOOM_IN_FROM = 1.2;       // arranca más pequeña
const ZOOM_IN_TO   = 1;       // tamaño final
const ZOOM_RAMP_MS = 2600;      // dura lo mismo que el spin = coordinados

/* ───────────────────────────────────────────────
   3. ELEMENTOS
   ─────────────────────────────────────────────── */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.getElementById("c");
const hint = document.getElementById("hint");

/* Ocultamos el cursor hasta que la escena esté lista.
   La regla !important evita que cualquier CSS externo lo sobreescriba. */
const cursorStyle = document.createElement("style");
cursorStyle.textContent = `#c { cursor: none !important; }`;
document.head.appendChild(cursorStyle);

/* ───────────────────────────────────────────────
   4. OVERLAY
   ─────────────────────────────────────────────── */
const overlay = document.getElementById("overlay");
const ovImg = document.getElementById("ov-img");
const ovTitle = document.getElementById("ov-title");
const ovTag = document.getElementById("ov-tag");

/* ───────────────────────────────────────────────
   5. RENDERER
   ─────────────────────────────────────────────── */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

const isMobile = window.innerWidth < 768;
const pixelRatio = isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5);
renderer.setPixelRatio(pixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setClearColor(0x000000, 0);

/* ───────────────────────────────────────────────
   6. ESCENA
   ─────────────────────────────────────────────── */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
const group = new THREE.Group();
scene.add(group);

/* ───────────────────────────────────────────────
   7. RESIZE
   ─────────────────────────────────────────────── */
let zoom = ZOOM_IN_FROM;
let zoomTarget = ZOOM_IN_FROM;

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const fitH = Math.max(RADIUS * 2 + 1.6, (RADIUS * 2 + 1) / camera.aspect);
  camera.userData.baseZ = fitH / (2 * Math.tan(THREE.MathUtils.degToRad(22.5)));
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
resize();
camera.position.z = camera.userData.baseZ * zoom;

/* ───────────────────────────────────────────────
   8. ROTACIÓN
   ─────────────────────────────────────────────── */
const AX_X = new THREE.Vector3(1, 0, 0);
const AX_Y = new THREE.Vector3(0, 1, 0);
const qa = new THREE.Quaternion();
const qb = new THREE.Quaternion();

function rotate(dx, dy) {
  qa.setFromAxisAngle(AX_Y, dx);
  qb.setFromAxisAngle(AX_X, dy);
  group.quaternion.premultiply(qa).premultiply(qb);
}

group.rotation.set(0.35, -0.4, 0);

/* ───────────────────────────────────────────────
   9. INTERACCIÓN
   ─────────────────────────────────────────────── */
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const tmp = new THREE.Vector3();

let dragging = false;
let moved = false;
let opened = false;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;
let vx = 0;
let vy = 0;
let hovered = null;

let ready = false;
let autoSpin = 0;
let readyAt = 0;

let zoomRampActive = false;
let zoomRampStart = 0;

/* ───────────────────────────────────────────────
   10. SELECCIÓN DE TARJETAS
   ─────────────────────────────────────────────── */
function pick(clientX, clientY) {
  ndc.x = (clientX / window.innerWidth) * 2 - 1;
  ndc.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(meshes, false);
  const hit = hits.find(h => h.object.getWorldPosition(tmp).z > 0);
  return hit ? hit.object : null;
}

/* ───────────────────────────────────────────────
   11. OVERLAY
   ─────────────────────────────────────────────── */
function openItem(ud) {
  opened = true;
  vx = 0;
  vy = 0;
  hovered = null;
  canvas.classList.remove("hover");
  ovImg.src = ud.url;
  ovImg.alt = ud.data.title;
  ovTitle.textContent = ud.data.title;
  ovTag.textContent = ud.data.tag;
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  hint.classList.add("hide");
}

function closeItem() {
  opened = false;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
}

overlay.addEventListener("click", e => {
  if (e.target === overlay) {
    closeItem();
  }
});

window.addEventListener("keydown", e => {
  if (e.key === "Escape" && opened) {
    closeItem();
  }
});

/* ───────────────────────────────────────────────
   12. POINTER DOWN
   ─────────────────────────────────────────────── */
canvas.addEventListener("pointerdown", e => {
  if (opened || !ready) return;
  dragging = true;
  moved = false;
  startX = lastX = e.clientX;
  startY = lastY = e.clientY;
  vx = 0;
  vy = 0;
  canvas.setPointerCapture(e.pointerId);
  canvas.classList.add("dragging");
});

/* ───────────────────────────────────────────────
   13. POINTER MOVE
   ─────────────────────────────────────────────── */
canvas.addEventListener("pointermove", e => {
  if (opened || !ready) return;

  if (dragging) {
    if (Math.hypot(e.clientX - startX, e.clientY - startY) > 5) {
      moved = true;
      hint.classList.add("hide");
    }

    const dx = (e.clientX - lastX) * 0.006;
    const dy = (e.clientY - lastY) * 0.006;
    rotate(dx, dy);
    vx = dx;
    vy = dy;
    lastX = e.clientX;
    lastY = e.clientY;
  } else {
    hovered = pick(e.clientX, e.clientY);
    canvas.classList.toggle("hover", !!hovered);
  }
});

/* ───────────────────────────────────────────────
   14. POINTER UP
   ─────────────────────────────────────────────── */
function endDrag(e) {
  if (!dragging) return;
  dragging = false;
  canvas.classList.remove("dragging");

  if (!moved) {
    const m = pick(e.clientX, e.clientY);
    if (m) {
      openItem(m.userData);
    }
  }
}

canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", () => {
  dragging = false;
  canvas.classList.remove("dragging");
});
canvas.addEventListener("pointerleave", () => {
  if (!dragging) {
    hovered = null;
    canvas.classList.remove("hover");
  }
});

/* ───────────────────────────────────────────────
   15. ZOOM
   ─────────────────────────────────────────────── */
canvas.addEventListener(
  "wheel",
  e => {
    if (opened || !ready) return;
    e.preventDefault();
    zoomTarget = THREE.MathUtils.clamp(zoomTarget + e.deltaY * 0.001, 0.6, 1.4);
  },
  { passive: false }
);

/* ───────────────────────────────────────────────
   16. CONSTRUCCIÓN DE LA GALERÍA
   ─────────────────────────────────────────────── */
const maxAniso = isMobile ? 1 : Math.min(renderer.capabilities.getMaxAnisotropy(), 2);
const meshes = [];
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const planeGeo = new THREE.PlaneGeometry(1, 1);

/* ───────────────────────────────────────────────
   17. CREAR UNA TARJETA
   ─────────────────────────────────────────────── */
function createCard(img, i) {
  if (!img) return;

  const data = PROJECTS[i % PROJECTS.length];
  const y = 1 - ((i + 0.5) / COUNT) * 2;
  const r = Math.sqrt(1 - y * y);
  const t = GOLDEN * i;

  const pos = new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r).multiplyScalar(RADIUS);

  const mat = new THREE.MeshBasicMaterial({
    transparent: true,
    side: THREE.FrontSide,
    opacity: 0
  });
  const mesh = new THREE.Mesh(planeGeo, mat);
  mesh.position.copy(pos);

  const tex = new THREE.Texture(img);
  tex.encoding = THREE.sRGBEncoding;
  tex.anisotropy = maxAniso;
  tex.needsUpdate = true;

  mat.map = tex;
  mat.needsUpdate = true;

  const aspect = img.naturalWidth / img.naturalHeight;

  mesh.userData = {
    data,
    url: img.src,
    base: new THREE.Vector3(CARD_H * aspect, CARD_H, 1),
    s: 1,
    spawnStart: performance.now(),
    spawned: true,
    posY: pos.y
  };

  mesh.position.y = pos.y - SPAWN_RISE;

  mesh.scale.copy(mesh.userData.base);

  group.add(mesh);
  meshes.push(mesh);
}

/* ───────────────────────────────────────────────
   18. CACHÉ DE IMÁGENES (para no recargar al volver)
   ─────────────────────────────────────────────── */
/* Guardamos las imágenes ya cargadas en un Map global.
   Si el script se re-ejecuta (por ejemplo con SPA o al volver a la home)
   las imágenes estarán disponibles al instante. */
const IMG_CACHE = (() => {
  // Intentamos reutilizar una caché ya existente en window
  if (window.__GALLERY_IMG_CACHE) return window.__GALLERY_IMG_CACHE;
  const m = new Map();
  window.__GALLERY_IMG_CACHE = m;
  return m;
})();

function loadImage(i) {
  const data = PROJECTS[i % PROJECTS.length];

  // 1. Si ya la tenemos en caché, la devolvemos al instante
  if (IMG_CACHE.has(data.src)) {
    return Promise.resolve(IMG_CACHE.get(data.src));
  }

  // 2. Si no, la cargamos y guardamos
  return new Promise(resolve => {
    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";

    img.onload = () => {
      IMG_CACHE.set(data.src, img);
      resolve(img);
    };
    img.onerror = () => {
      // Marcamos como "no disponible" para no reintentar en esta sesión
      IMG_CACHE.set(data.src, null);
      resolve(null);
    };

    img.src = data.src;
  });
}

/* ───────────────────────────────────────────────
   19. CARGA + APARICIÓN ESCALONADA
   ─────────────────────────────────────────────── */
async function loadGallery() {
  // 1. Cargar TODAS las imágenes en paralelo (usa caché si existen)
  const promises = [];
  for (let i = 0; i < COUNT; i++) {
    promises.push(loadImage(i));
  }
  const images = await Promise.all(promises);

  if (window.__preloader) {
    window.__preloader.markImagesReady();
  }

  // 2. Crear tarjetas UNA A UNA
  for (let i = 0; i < COUNT; i++) {
    const img = images[i];
    if (img) createCard(img, i);

    if (i < COUNT - 1) {
      await new Promise(r => setTimeout(r, SPAWN_INTERVAL));
    }
  }

  // 3. Esperar al fade de la última tarjeta
  await new Promise(r => setTimeout(r, SPAWN_FADE_MS));

  // 4. Activar el giro y la rampa de zoom
  readyAt = performance.now();
  zoomRampActive = true;
  zoomRampStart = performance.now();
  zoomTarget = ZOOM_IN_TO;
  ready = true;

  // 5. Restaurar el cursor: quitamos la regla "none" y ponemos la adecuada
  cursorStyle.textContent = `
    #c { cursor: default !important; }
    #c.hover { cursor: pointer !important; }
    #c.dragging { cursor: grabbing !important; }
  `;
}

loadGallery();

/* ───────────────────────────────────────────────
   20. BUCLE DE ANIMACIÓN
   ─────────────────────────────────────────────── */
function tick() {
  requestAnimationFrame(tick);

  const now = performance.now();

  // Rampa del auto-spin
  if (ready) {
    autoSpin = THREE.MathUtils.clamp((now - readyAt) / SPIN_RAMP_MS, 0, 1);
    // smoothstep (más suave que antes)
    autoSpin = autoSpin * autoSpin * autoSpin * (autoSpin * (autoSpin * 6 - 15) + 10);
  }

  // Rotación automática
  if (ready && !dragging && !opened) {
    const speed = reduceMotion ? 0 : AUTO_SPEED * autoSpin;
    rotate(vx + speed, vy);
    vx *= FRICTION;
    vy *= FRICTION;
  }

  // Rampa del zoom de entrada
  if (zoomRampActive) {
    const t = THREE.MathUtils.clamp((now - zoomRampStart) / ZOOM_RAMP_MS, 0, 1);
    // smootherstep: aún más suave que smoothstep
    const e = t * t * t * (t * (t * 6 - 15) + 10);
    zoom = THREE.MathUtils.lerp(ZOOM_IN_FROM, ZOOM_IN_TO, e);

    if (t >= 1) {
      zoomRampActive = false;
      zoom = ZOOM_IN_TO;
      zoomTarget = ZOOM_IN_TO;
    }
  } else {
    zoom += (zoomTarget - zoom) * 0.08;
  }

  const targetZ = camera.userData.baseZ * zoom;
  // Suavizado de cámara más lento (0.10) para menos tirón
  camera.position.z += (targetZ - camera.position.z) * 0.10;

  group.updateMatrixWorld(true);

  for (const m of meshes) {
    m.getWorldPosition(tmp);

    const depth = THREE.MathUtils.clamp((tmp.z + RADIUS) / (RADIUS * 2), 0, 1);
    const depthOpacity = BACK_OPACITY + (1 - BACK_OPACITY) * Math.pow(depth, 1.4);

    // Fade-in con ease-out quint
    let spawnT = 1;
    if (m.userData.spawned) {
      const raw = THREE.MathUtils.clamp(
        (now - m.userData.spawnStart) / SPAWN_FADE_MS,
        0, 1
      );
      spawnT = 1 - Math.pow(1 - raw, 5);
    }

    // Rise
    m.position.y = m.userData.posY - SPAWN_RISE * (1 - spawnT);

    m.material.opacity = depthOpacity * spawnT;

    m.quaternion.copy(group.quaternion).invert();

    const target = m === hovered ? 1.14 : 1;
    m.userData.s += (target - m.userData.s) * 0.15;

    const b = m.userData.base;
    const s = m.userData.s;
    const k = 0.55 + 0.45 * depth;

    m.scale.set(b.x * s * k, b.y * s * k, 1);
  }

  renderer.render(scene, camera);
}

/* ───────────────────────────────────────────────
   21. INICIAR
   ─────────────────────────────────────────────── */
tick();