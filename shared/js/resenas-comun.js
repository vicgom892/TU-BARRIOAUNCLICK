// shared/js/resenas-comun.js

class SistemaResenasComun {
    constructor() {
        this.db = null;
        this.initFirebase();
    }

    // En resenas-comun.js, modifica initFirebase:
initFirebase() {
    console.log('🔧 Inicializando Firebase para reseñas...');
    
    if (typeof firebase === 'undefined') {
        console.error('❌ CRÍTICO: Firebase no está cargado');
        return;
    }
    
    try {
        // 🆕 EVITAR INICIALIZACIÓN DUPLICADA
        if (!firebase.apps.length) {
            console.log('🚀 Inicializando nueva app de Firebase...');
            firebase.initializeApp(window.firebaseConfig);
        } else {
            console.log('✅ Firebase ya está inicializado, usando instancia existente');
        }
        
        this.db = firebase.firestore();
        console.log('✅ Firebase Firestore inicializado correctamente');
        
    } catch (error) {
        console.error('💥 ERROR inicializando Firebase:', error);
    }
}

    // 🆕 GENERAR HTML DE ESTRELLAS (común para ambos sistemas)
    generarEstrellas(promedio, totalResenas = 0, tamaño = 'sm') {
        const estrellasLlenas = Math.floor(promedio);
        const tieneMedia = promedio % 1 >= 0.5;
        const estrellasVacias = 5 - estrellasLlenas - (tieneMedia ? 1 : 0);
        
        let html = '<div class="estrellas-calificacion">';
        
        // Estrellas llenas
        for (let i = 0; i < estrellasLlenas; i++) {
            html += '<i class="fas fa-star text-warning"></i>';
        }
        
        // Media estrella si aplica
        if (tieneMedia) {
            html += '<i class="fas fa-star-half-alt text-warning"></i>';
        }
        
        // Estrellas vacías
        for (let i = 0; i < estrellasVacias; i++) {
            html += '<i class="far fa-star text-warning"></i>';
        }
        
        // Contador de reseñas si existe
        if (totalResenas > 0) {
            html += `<small class="text-muted ms-2">(${totalResenas})</small>`;
        }
        
        html += '</div>';
        return html;
    }

    // 🆕 OBTENER RESEÑAS (común)
    async obtenerResenas(collection, docId) {
        if (!this.db) return [];

        try {
            const doc = await this.db.collection(collection).doc(docId).get();
            if (doc.exists) {
                return doc.data().resenas || [];
            }
            return [];
        } catch (error) {
            console.error('Error obteniendo reseñas:', error);
            return [];
        }
    }

    // 🆕 AGREGAR RESEÑA (común)
    async agregarResena(collection, docId, resena) {
        if (!this.db) return { success: false, message: 'Firebase no disponible' };

        try {
            const ref = this.db.collection(collection).doc(docId);
            
            await this.db.runTransaction(async (t) => {
                const doc = await t.get(ref);
                const timestamp = new Date().toISOString();
                
                const nuevaResena = {
                    id: Date.now().toString(),
                    usuario: resena.usuario || 'Anónimo',
                    calificacion: resena.calificacion,
                    comentario: resena.comentario || '',
                    fecha: timestamp,
                    verificada: false
                };

                if (doc.exists) {
                    const datos = doc.data();
                    const resenas = datos.resenas || [];
                    resenas.push(nuevaResena);
                    
                    // Calcular nuevo promedio
                    const promedio = this.calcularPromedio(resenas);
                    
                    t.update(ref, { 
                        resenas, 
                        promedio,
                        totalResenas: resenas.length,
                        ultimaActualizacion: timestamp 
                    });
                } else {
                    t.set(ref, { 
                        resenas: [nuevaResena],
                        promedio: resena.calificacion,
                        totalResenas: 1,
                        ultimaActualizacion: timestamp
                    });
                }
            });

            return { success: true, message: 'Reseña agregada exitosamente' };
        } catch (error) {
            console.error('Error agregando reseña:', error);
            return { success: false, message: 'Error al agregar reseña' };
        }
    }

    // 🆕 CALCULAR PROMEDIO (común)
    calcularPromedio(resenas) {
        if (!resenas.length) return 0;
        const suma = resenas.reduce((total, resena) => total + resena.calificacion, 0);
        return Math.round((suma / resenas.length) * 10) / 10;
    }

    // 🆕 GENERAR HTML DE RESEÑAS (común)
    generarHTMLResenas(resenas) {
        if (!resenas.length) {
            return `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-comment-slash fa-2x mb-3"></i>
                    <p>No hay reseñas aún. ¡Sé el primero en opinar!</p>
                </div>
            `;
        }

        return resenas.map(resena => `
            <div class="resena-item border-bottom pb-3 mb-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <strong class="d-block">${resena.usuario}</strong>
                        <div class="estrellas-pequenas">
                            ${this.generarEstrellas(resena.calificacion)}
                        </div>
                    </div>
                    <small class="text-muted">${new Date(resena.fecha).toLocaleDateString()}</small>
                </div>
                <p class="mb-0 text-dark">${resena.comentario}</p>
            </div>
        `).join('');
    }
}

// 🆕 SISTEMA ESPECÍFICO PARA NEGOCIOS (index.html)
class SistemaResenasNegocios extends SistemaResenasComun {
    constructor() {
        super();
    }

    // Obtener ID único para negocio
    getIdNegocio(rubro, index) {
        const localidad = this.detectarLocalidad();
        return `${localidad}_${rubro}_${index}`.toLowerCase();
    }

    detectarLocalidad() {
        const path = window.location.pathname;
        const match = path.match(/\/([^\/]+)\/index\.html/);
        return match ? match[1] : 'desconocida';
    }

    // Obtener reseñas de negocio
    async obtenerResenasNegocio(rubro, index) {
        return await this.obtenerResenas('resenas_negocios', this.getIdNegocio(rubro, index));
    }

    // Agregar reseña a negocio
    async agregarResenaNegocio(rubro, index, resena) {
        return await this.agregarResena('resenas_negocios', this.getIdNegocio(rubro, index), resena);
    }

    // Obtener estadísticas de negocio
    async obtenerEstadisticasNegocio(rubro, index) {
        const resenas = await this.obtenerResenasNegocio(rubro, index);
        const promedio = this.calcularPromedio(resenas);
        
        return {
            promedio,
            totalResenas: resenas.length,
            resenas
        };
    }
}

// Inicializar sistema global para negocios
window.resenasNegocios = new SistemaResenasNegocios();