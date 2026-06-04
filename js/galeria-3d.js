// ============================================
// GALERÍA 3D INMERSIVA - 3 FILAS ELÍPTICAS
// Hover proporcional + Verticales/Horizontales
// ============================================

import * as THREE from 'three';

// TUS PROYECTOS - Con orientación específica
// orientation: 'vertical' (retrato) o 'horizontal' (paisaje)
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
        imagen: 'img/proyectos/MORPHO1.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 1,
        orientation: 'vertical'
    },
    { 
        imagen: 'img/proyectos/cata.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 1,
        orientation: 'horizontal'
    },
    { 
        imagen: 'img/proyectos/cargo sardinas.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 1,
        orientation: 'vertical'
    },
    { 
        imagen: 'img/proyectos/MORPHO1.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 1,
        orientation: 'vertical'
    },
    { 
        imagen: 'img/proyectos/cata.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 1,
        orientation: 'horizontal'
    },
    { 
        imagen: 'img/proyectos/cargo sardinas.png',
        url: 'https://tupagina.com/proyecto5',
        titulo: 'Loop Visual',
        fila: 1,
        orientation: 'vertical'
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
        imagen: 'img/proyectos/portada2026.png',
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
];

// Configuración de las 3 filas
const configFilas = {
    // Fila superior (arriba) - imágenes más pequeñas
    fila0: {
        radioX: 25.0,
        radioZ: 3.0,
        tamanoHorizontal: 4,    // Tamaño base para horizontales
        tamanoVertical: 4,      // Tamaño base para verticales (más pequeñas)
        altura: 10,
        velocidadRotacion: 0.002,
        factorHover: 1.2          // Las pequeñas crecen solo un 20%
    },
    // Fila media (principal) - imágenes más grandes
    fila1: {
        radioX: 12.0,
        radioZ: 12.0,
        tamanoHorizontal: 4.5,
        tamanoVertical: 4,
        altura: 0,
        velocidadRotacion: 0.003,
        factorHover: 1.15         // Crecen un 15%
    },
    // Fila inferior (abajo)
    fila2: {
        radioX: 25.0,
        radioZ: 3.0,
        tamanoHorizontal: 4,
        tamanoVertical: 4,
        altura: -5,
        velocidadRotacion: 0.002,
        factorHover: 1.2
    }
};

// Configuración general
const config = {
    sensibilidadMouse: 0.005,
    sensibilidadScroll: 0.01,
    velocidadTransicion: 0.15
};

let rotacionActual = 0;
let rotacionObjetivo = 0;

document.addEventListener('DOMContentLoaded', () => {
    iniciarGaleria3D();
});

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
    
    // ============================================
    // CREAR 3 FILAS CON ORIENTACIÓN VARIABLE
    // ============================================
    
    const proyectosPorFila = [[], [], []];
    proyectos.forEach(proyecto => {
        const fila = proyecto.fila !== undefined ? proyecto.fila : 1;
        proyectosPorFila[fila].push(proyecto);
    });
    
    [0, 1, 2].forEach(filaIndex => {
        const proyectosFila = proyectosPorFila[filaIndex];
        if (proyectosFila.length === 0) return;
        
        const configFila = configFilas[`fila${filaIndex}`];
        const grupoFila = new THREE.Group();
        grupoFila.position.y = configFila.altura;
        
        proyectosFila.forEach((proyecto, idx) => {
            const textura = new THREE.TextureLoader().load(proyecto.imagen);
            const material = new THREE.MeshBasicMaterial({
                map: textura,
                side: THREE.DoubleSide
            });
            
            // Determinar tamaño según orientación
            const isVertical = proyecto.orientation === 'vertical';
            const tamanoBase = isVertical ? configFila.tamanoVertical : configFila.tamanoHorizontal;
            
            // Proporción de aspecto: vertical (2:3), horizontal (3:2)
            let ancho, alto;
            if (isVertical) {
                ancho = tamanoBase;
                alto = tamanoBase * 1.4;  // 2:3 ratio
            } else {
                ancho = tamanoBase;
                alto = tamanoBase * 0.75; // 3:2 ratio
            }
            
            const geometria = new THREE.PlaneGeometry(ancho, alto);
            const imagenPlano = new THREE.Mesh(geometria, material);
            
            // Posición en elipse
            const angulo = (idx / proyectosFila.length) * Math.PI * 2;
            const radioX = configFila.radioX;
            const radioZ = configFila.radioZ;
            
            imagenPlano.position.x = Math.cos(angulo) * radioX;
            imagenPlano.position.z = Math.sin(angulo) * radioZ;
            imagenPlano.lookAt(0, grupoFila.position.y, 0);
            
            // Calcular tamaño hover (proporcional al tamaño original)
            const tamanoHover = tamanoBase * configFila.factorHover;
            let anchoHover, altoHover;
            if (isVertical) {
                anchoHover = tamanoHover;
                altoHover = tamanoHover * 1.4;
            } else {
                anchoHover = tamanoHover;
                altoHover = tamanoHover * 0.75;
            }
            
            // Guardar datos
            imagenPlano.userData = {
                url: proyecto.url,
                titulo: proyecto.titulo,
                fila: filaIndex,
                escalaOriginal: { ancho: ancho, alto: alto },
                escalaHover: { ancho: anchoHover, alto: altoHover },
                escalaActual: { ancho: ancho, alto: alto },
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
    
    animar();
    
    window.addEventListener('resize', () => {
        const width = contenedor.clientWidth;
        const height = contenedor.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
    
    console.log(`✨ Galería 3D con orientaciones variable`);
}