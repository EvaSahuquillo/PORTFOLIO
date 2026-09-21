/* ───────────────────────────────────────────────
   1. TUS PROYECTOS
   Sustituye los "src" por tus imágenes (ruta o URL).
   Si src es null se genera una imagen de ejemplo.
   Si tienes menos imágenes que huecos, se repiten.
   Nota: si abres el archivo en local (file://), el navegador
   bloquea las imágenes externas en WebGL. Usa un servidor local
   (por ejemplo "npx serve") o súbelo a tu hosting.
   ─────────────────────────────────────────────── */
const PROJECTS = [
  { title:"Proyecto 01", tag:"Identidad de marca", src:"img/proyectos/cargo sardinas.png", href:"#" },
  { title:"Proyecto 02", tag:"Packaging",          src:"img/proyectos/cajapossssst.png", href:"#" },
  { title:"Proyecto 03", tag:"Motion graphics",    src:"img/proyectos/evacara.png", href:"#" },
  { title:"Proyecto 04", tag:"Animación 3D",       src:"img/proyectos/patas-min.png", href:"#" },
  { title:"Proyecto 05", tag:"Editorial",          src:"img/proyectos/cata.png", href:"#" },
  { title:"Proyecto 06", tag:"Comunicación social",src:"img/proyectos/archif1.png", href:"#" },
  { title:"Proyecto 07", tag:"Identidad de marca", src:"img/proyectos/fuego.jpeg", href:"#" },
  { title:"Proyecto 08", tag:"Packaging",          src:"img/proyectos/niiiño.png", href:"#" },
  { title:"Proyecto 09", tag:"Motion graphics",    src:"img/proyectos/CERVEZAAA22.png", href:"#" },
  { title:"Proyecto 10", tag:"Animación 3D",       src:"img/proyectos/tote.png", href:"#" },
  { title:"Proyecto 11", tag:"Editorial",          src:"img/proyectos/manual3.png", href:"#" },
  { title:"Proyecto 12", tag:"Comunicación social",src:"img/proyectos/MORPHO1.png", href:"#" }
];
 
const COUNT       = 18;    // número de imágenes en la esfera
const RADIUS      = 3.6;   // radio de la esfera
const CARD_H      = 1.35;  // altura de cada imagen
const AUTO_SPEED  = 0.0012;// giro automático (0 para desactivarlo)
const FRICTION    = 0.95;  // inercia al soltar (más cerca de 1 = más deslizamiento)
const BACK_OPACITY = 0.3; // visibilidad de las imágenes de atrás (0 = ocultas del todo)
 
/* ─────────────────────────────────────────────── */
 
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.getElementById("c");
const hint = document.getElementById("hint");
 
/* Imágenes de ejemplo generadas con canvas */
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
 
/* Renderer, escena, cámara */
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
 
/* Construcción de la esfera (distribución de Fibonacci) */
const maxAniso = renderer.capabilities.getMaxAnisotropy();
const meshes = [];
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const planeGeo = new THREE.PlaneGeometry(1, 1);
 
for (let i = 0; i < COUNT; i++){
  const data = PROJECTS[i % PROJECTS.length];
  const url  = data.src || placeholder(i, data.title);
 
  const y = 1 - ((i + .5) / COUNT) * 2;
  const r = Math.sqrt(1 - y*y);
  const t = GOLDEN * i;
  const pos = new THREE.Vector3(Math.cos(t)*r, y, Math.sin(t)*r).multiplyScalar(RADIUS);
 
  const mat = new THREE.MeshBasicMaterial({ transparent:true, side:THREE.FrontSide });
  const mesh = new THREE.Mesh(planeGeo, mat);
  mesh.position.copy(pos);
  mesh.userData = { data, url, base:new THREE.Vector3(CARD_H*.8, CARD_H, 1), s:1 };
  mesh.scale.copy(mesh.userData.base);
  group.add(mesh);
  meshes.push(mesh);
 
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const tex = new THREE.Texture(img);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = maxAniso;
    tex.needsUpdate = true;
    mat.map = tex;
    mat.needsUpdate = true;
    const aspect = img.naturalWidth / img.naturalHeight;
    mesh.userData.base.set(CARD_H * aspect, CARD_H, 1);
  };
  img.src = url;
}
 
/* Rotación con cuaterniones (sin bloqueos de ejes) */
const AX_X = new THREE.Vector3(1,0,0), AX_Y = new THREE.Vector3(0,1,0);
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
function rotate(dx, dy){
  qa.setFromAxisAngle(AX_Y, dx);
  qb.setFromAxisAngle(AX_X, dy);
  group.quaternion.premultiply(qa).premultiply(qb);
}
group.rotation.set(.35, -.4, 0);
 
/* Interacción */
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
  // solo las imágenes de la cara visible de la esfera
  const hit = hits.find(h => h.object.getWorldPosition(tmp).z > 0);
  return hit ? hit.object : null;
}
 
canvas.addEventListener("pointerdown", e => {
  if (opened) return;
  dragging = true; moved = false;
  startX = lastX = e.clientX; startY = lastY = e.clientY;
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
canvas.addEventListener("pointercancel", () => { dragging = false; canvas.classList.remove("dragging"); });
canvas.addEventListener("pointerleave", () => { if (!dragging){ hovered = null; canvas.classList.remove("hover"); } });
 
canvas.addEventListener("wheel", e => {
  if (opened) return;
  e.preventDefault();
  zoom = THREE.MathUtils.clamp(zoom + e.deltaY * .001, .6, 1.4);
}, { passive:false });
 
/* Vista ampliada */
const overlay = document.getElementById("overlay");
const ovImg = document.getElementById("ov-img");
const ovTitle = document.getElementById("ov-title");
const ovTag = document.getElementById("ov-tag");
const ovLink = document.getElementById("ov-link");
const ovClose = document.getElementById("ov-close");
 
function openItem(ud){
  opened = true;
  vx = vy = 0;
  hovered = null;
  canvas.classList.remove("hover");
  ovImg.src = ud.url;
  ovImg.alt = ud.data.title;
  ovTitle.textContent = ud.data.title;
  ovTag.textContent = ud.data.tag;
  ovLink.href = ud.data.href || "#";
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  hint.classList.add("hide");
  ovClose.focus({ preventScroll:true });
}
function closeItem(){
  opened = false;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
}
ovClose.addEventListener("click", closeItem);
overlay.addEventListener("click", e => { if (e.target === overlay) closeItem(); });
window.addEventListener("keydown", e => { if (e.key === "Escape" && opened) closeItem(); });
 
/* Bucle de animación */
function tick(){
  requestAnimationFrame(tick);
 
  if (!dragging && !opened){
    rotate(vx + (reduceMotion ? 0 : AUTO_SPEED), vy);
    vx *= FRICTION; vy *= FRICTION;
  }
 
  // zoom suave de cámara
  const targetZ = camera.userData.baseZ * zoom;
  camera.position.z += (targetZ - camera.position.z) * .08;
 
  group.updateMatrixWorld(true);
  for (const m of meshes){
    // las imágenes de la parte trasera se atenúan para dar profundidad
    m.getWorldPosition(tmp);
    const depth = THREE.MathUtils.clamp((tmp.z + RADIUS) / (RADIUS * 2), 0, 1);
    m.material.opacity = BACK_OPACITY + (1 - BACK_OPACITY) * Math.pow(depth, 1.4);
 
    // siempre de frente a la cámara y en vertical (anula la rotación del grupo)
    m.quaternion.copy(group.quaternion).invert();
 
    // realce al pasar el ratón
    const target = (m === hovered) ? 1.14 : 1;
    m.userData.s += (target - m.userData.s) * .15;
    const b = m.userData.base, s = m.userData.s;
    const k = .55 + .45 * depth; // más pequeñas hacia los bordes y el fondo
    m.scale.set(b.x * s * k, b.y * s * k, 1);
  }
 
  renderer.render(scene, camera);
}
tick();




// ============================================
// GALERÍA 3D INMERSIVA - 3 FILAS ELÍPTICAS
// Hover proporcional + Verticales/Horizontales
// Ahora respeta el aspect ratio REAL de cada imagen
// ============================================
 
import * as THREE from 'three';
 
// TUS PROYECTOS - Con orientación específica
// orientation: 'vertical' (retrato) o 'horizontal' (paisaje)
// (orientation ya no se usa para forzar un ratio fijo, solo para
//  decidir qué "caja máxima" de la fila le corresponde a cada imagen)
const proyectos = [
    // Fila superior
    { 
        imagen: 'img/proyectos/fuego.jpeg',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 0,
        orientation: 'vertical'
    },  
    { 
        imagen: 'img/proyectos/cata.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 0,
        orientation: 'horizontal'
    },
    { 
        imagen: 'img/proyectos/5.jpeg',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 0,
        orientation: 'horizontal'
    },
    { 
        imagen: 'img/proyectos/MORPHO1.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 0,
        orientation: 'vertical'
    },
    
    // Fila media (principal)
    { 
        imagen: 'img/proyectos/cajapossssst.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 1,
        orientation: 'vertical'
    },
    { 
        imagen: 'img/proyectos/evacara.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 1,
        orientation: 'vertical'
    },
   
    { 
        imagen: 'img/proyectos/archif1.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 1,
        orientation: 'horizontal'
    },
    { 
        imagen: 'img/proyectos/CERVEZAAA22.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 1,
        orientation: 'vertical'
    },
    { 
        imagen: 'img/proyectos/TRIPTIC.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 1,
        orientation: 'horizontal'
    },
    { 
        imagen: 'img/proyectos/sardi-pack.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 1,
        orientation: 'vertical'
    },
    { 
        imagen: 'img/proyectos/Billboard2_mockup.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 1,
        orientation: 'horizontal'
    },

    
    // Fila inferior
    { 
        imagen: 'img/proyectos/ILUSTRACION5.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 2,
        orientation: 'vertical'
    },
    { 
        imagen: 'img/proyectos/patas-min.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 2,
        orientation: 'vertical'
    },
    { 
        imagen: 'img/proyectos/IMG_4965.jpeg',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 2,
        orientation: 'vertical'
    },
];
 
// Configuración de las 3 filas
// tamanoHorizontal / tamanoVertical ahora actúan como la CAJA MÁXIMA
// (ancho máx. para horizontales, alto máx. para verticales) dentro de
// la cual se ajusta cada imagen sin deformarse.
const configFilas = {
    // Fila superior (arriba) - imágenes más pequeñas
    fila0: {
        radioX: 15.0,
        radioZ: 25.0,
        tamanoHorizontal: 3,    // Ancho máximo para horizontales
        tamanoVertical: 2.5,        // Alto máximo para verticales
        altura: 4,
        velocidadRotacion: 0.002,
        factorHover: 1.3          // Las pequeñas crecen solo un 20%
    },
    // Fila media (principal) - imágenes más grandes
    fila1: {
        radioX: 12.0,
        radioZ: 20.0,
        tamanoHorizontal: 5,
        tamanoVertical: 3,
        altura: 0,
        velocidadRotacion: 0.003,
        factorHover: 1.15         // Crecen un 15%
    },
    // Fila inferior (abajo)
    fila2: {
        radioX: 15.0,
        radioZ: 25.0,
        tamanoHorizontal: 3,
        tamanoVertical: 2.5,
        altura: -4,
        velocidadRotacion: 0.002,
        factorHover: 1.2
    }
};
 
// Configuración general
const config = {
    sensibilidadMouse: 0.005,
    sensibilidadScroll: 0.005,
    velocidadTransicion: 0.15,
    // 1.0 = círculo perfecto (radioZ se usa tal cual)
    // Cuanto más bajo, más plana la elipse (menos profundidad en Z)
    // Prueba valores entre 0.3 y 0.6
    achatamientoElipse: 0.45
};
 
let rotacionActual = 0;
let rotacionObjetivo = 0;
 
document.addEventListener('DOMContentLoaded', () => {
    iniciarGaleria3D();
});
 
// ============================================
// Calcula ancho/alto reales SIN deformar la imagen,
// ajustándola ("contain") dentro de una caja máxima.
// ============================================
function calcularDimensionesSinDeformar(imgWidth, imgHeight, cajaMaxAncho, cajaMaxAlto) {
    const ratioImagen = imgWidth / imgHeight;
    const ratioCaja = cajaMaxAncho / cajaMaxAlto;
 
    let ancho, alto;
    if (ratioImagen > ratioCaja) {
        // La imagen es proporcionalmente más ancha que la caja -> limita el ancho
        ancho = cajaMaxAncho;
        alto = cajaMaxAncho / ratioImagen;
    } else {
        // La imagen es proporcionalmente más alta que la caja -> limita el alto
        alto = cajaMaxAlto;
        ancho = cajaMaxAlto * ratioImagen;
    }
    return { ancho, alto };
}
 
function iniciarGaleria3D() {
    const contenedor = document.getElementById('contenedor-3d');
    if (!contenedor) {
        console.error('No se encontró #contenedor-3d');
        return;
    }
    
    const scene = new THREE.Scene();
    scene.background = null;
    
    const camera = new THREE.PerspectiveCamera(75, contenedor.clientWidth / contenedor.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(contenedor.clientWidth, contenedor.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    contenedor.appendChild(renderer.domElement);
    
    const grupoPrincipal = new THREE.Group();
    scene.add(grupoPrincipal);
    
    const objetosImagenes = [];
    const gruposFila = [];
    const loader = new THREE.TextureLoader();
    
    // ============================================
    // PRECARGAR TODAS LAS TEXTURAS ANTES DE MONTAR NADA
    // (así no hay parpadeos ni imágenes "apareciendo" sueltas)
    // ============================================
    
    function cargarTextura(ruta) {
        return new Promise((resolve, reject) => {
            loader.load(ruta, resolve, undefined, reject);
        });
    }
    
    const proyectosPorFila = [[], [], []];
    proyectos.forEach(proyecto => {
        const fila = proyecto.fila !== undefined ? proyecto.fila : 1;
        proyectosPorFila[fila].push(proyecto);
    });
    
    const todasLasCargas = proyectos.map(proyecto =>
        cargarTextura(proyecto.imagen)
            .then(textura => ({ proyecto, textura, error: null }))
            .catch(error => ({ proyecto, textura: null, error }))
    );
    
    Promise.all(todasLasCargas).then((resultados) => {
        // Índice rápido: ruta de imagen -> textura ya cargada
        const texturasPorRuta = new Map();
        resultados.forEach(({ proyecto, textura, error }) => {
            if (error) {
                console.warn(`No se pudo cargar la imagen: ${proyecto.imagen}`, error);
            } else {
                texturasPorRuta.set(proyecto.imagen, textura);
            }
        });
        
        montarGaleria(texturasPorRuta);
    });
    
    // ============================================
    // CREAR 3 FILAS CON ORIENTACIÓN VARIABLE
    // (se ejecuta solo cuando TODAS las texturas ya están listas)
    // ============================================
    
    function montarGaleria(texturasPorRuta) {
        [0, 1, 2].forEach(filaIndex => {
            const proyectosFila = proyectosPorFila[filaIndex];
            if (proyectosFila.length === 0) return;
            
            const configFila = configFilas[`fila${filaIndex}`];
            const grupoFila = new THREE.Group();
            grupoFila.position.y = configFila.altura;
            
            proyectosFila.forEach((proyecto, idx) => {
                const textura = texturasPorRuta.get(proyecto.imagen);
                if (!textura) return; // esta imagen falló al cargar, se omite
                
                const isVertical = proyecto.orientation === 'vertical';
                
                // Caja máxima que le corresponde según orientación
                const cajaAncho = isVertical ? configFila.tamanoVertical : configFila.tamanoHorizontal;
                const cajaAlto  = isVertical ? configFila.tamanoVertical * 1.4 : configFila.tamanoHorizontal * 0.75;
                
                // Dimensiones reales sin deformar, ajustadas a la caja
                const imgW = textura.image.width;
                const imgH = textura.image.height;
                const { ancho, alto } = calcularDimensionesSinDeformar(
                    imgW, imgH, cajaAncho, cajaAlto
                );
                
                const material = new THREE.MeshBasicMaterial({
                    map: textura,
                    side: THREE.DoubleSide
                });
                const geometria = new THREE.PlaneGeometry(ancho, alto);
                const imagenPlano = new THREE.Mesh(geometria, material);
                
                // Posición en elipse (radioZ se aplana con achatamientoElipse
                // para que no sea un círculo perfecto y las imágenes queden
                // más de frente a la cámara, con menos deformación de perspectiva)
                const angulo = (idx / proyectosFila.length) * Math.PI * 2;
                const radioX = configFila.radioX;
                const radioZ = configFila.radioZ * config.achatamientoElipse;
                
                imagenPlano.position.x = Math.cos(angulo) * radioX;
                imagenPlano.position.z = Math.sin(angulo) * radioZ;
                imagenPlano.lookAt(0, grupoFila.position.y, 0);
                
                // Tamaño hover proporcional al tamaño real ya calculado
                const tamanoHover = {
                    ancho: ancho * configFila.factorHover,
                    alto: alto * configFila.factorHover
                };
                
                imagenPlano.userData = {
                    url: proyecto.url,
                    titulo: proyecto.titulo,
                    fila: filaIndex,
                    escalaOriginal: { ancho, alto },
                    escalaHover: tamanoHover,
                    escalaActual: { ancho, alto },
                    hoverActivo: false,
                    isVertical: isVertical,
                    anguloOriginal: angulo
                };
                
                grupoFila.add(imagenPlano);
                objetosImagenes.push(imagenPlano);
            });
            
            grupoPrincipal.add(grupoFila);
            gruposFila.push({
                grupo: grupoFila,
                config: configFila,
                rotacionActual: 0
            });
        });
        
        animar();
        
        console.log(`✨ Galería 3D con orientaciones variable (aspect ratio real por imagen)`);
    }
    
    // ============================================
    // ACTUALIZAR ESCALAS CON TRANSICIÓN (HOVER PROPORCIONAL)
    // ============================================
    
    function actualizarEscalas() {
        objetosImagenes.forEach(objeto => {
            const escalaActual = objeto.userData.escalaActual;
            const escalaObjetivo = objeto.userData.hoverActivo 
                ? objeto.userData.escalaHover 
                : objeto.userData.escalaOriginal;
            
            if (Math.abs(escalaActual.ancho - escalaObjetivo.ancho) > 0.001) {
                const nuevoAncho = escalaActual.ancho + (escalaObjetivo.ancho - escalaActual.ancho) * config.velocidadTransicion;
                const nuevoAlto = escalaActual.alto + (escalaObjetivo.alto - escalaActual.alto) * config.velocidadTransicion;
                
                objeto.userData.escalaActual = { ancho: nuevoAncho, alto: nuevoAlto };
                
                const nuevaGeometria = new THREE.PlaneGeometry(nuevoAncho, nuevoAlto);
                objeto.geometry.dispose();
                objeto.geometry = nuevaGeometria;
            }
        });
    }
    
    // ============================================
    // EFECTO HOVER
    // ============================================
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let objetoHoverActual = null;
    
    function actualizarHover(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(objetosImagenes);
        
        if (objetoHoverActual && objetoHoverActual !== intersects[0]?.object) {
            objetoHoverActual.userData.hoverActivo = false;
        }
        
        if (intersects.length > 0) {
            const objeto = intersects[0].object;
            if (!objeto.userData.hoverActivo) {
                objeto.userData.hoverActivo = true;
                objetoHoverActual = objeto;
            }
        } else {
            objetoHoverActual = null;
        }
    }
    
    // ============================================
    // CONTROLES
    // ============================================
    
    let mousePresionado = false;
    let ultimoX = 0;
    
    renderer.domElement.addEventListener('mousedown', (e) => {
        mousePresionado = true;
        ultimoX = e.clientX;
        renderer.domElement.style.cursor = 'grabbing';
    });
    
    window.addEventListener('mouseup', () => {
        mousePresionado = false;
        renderer.domElement.style.cursor = 'grab';
    });
    
    renderer.domElement.addEventListener('mousemove', (e) => {
        if (!mousePresionado) {
            actualizarHover(e);
        }
        
        if (mousePresionado) {
            const deltaX = e.clientX - ultimoX;
            rotacionObjetivo += deltaX * config.sensibilidadMouse;
            ultimoX = e.clientX;
        }
    });
    
    renderer.domElement.style.cursor = 'grab';
    
    renderer.domElement.addEventListener('wheel', (e) => {
        rotacionObjetivo += e.deltaY * config.sensibilidadScroll;
        e.preventDefault();
    }, { passive: false });
    
    renderer.domElement.addEventListener('click', (event) => {
        if (mousePresionado) return;
        
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(objetosImagenes);
        
        if (intersects.length > 0) {
            const url = intersects[0].object.userData.url;
            if (url && url !== '#') window.open(url, '_blank');
        }
    });
    
    // ============================================
    // ANIMACIÓN
    // ============================================
    
    function animar() {
        actualizarEscalas();
        
        rotacionActual += (rotacionObjetivo - rotacionActual) * 0.1;
        
        gruposFila.forEach(fila => {
            const velocidadRelativa = fila.config.velocidadRotacion / 0.003;
            fila.grupo.rotation.y = rotacionActual * velocidadRelativa;
        });
        
        renderer.render(scene, camera);
        requestAnimationFrame(animar);
    }
    
    window.addEventListener('resize', () => {
        const width = contenedor.clientWidth;
        const height = contenedor.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}