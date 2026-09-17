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