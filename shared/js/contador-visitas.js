// shared/js/contador-visitas.js

class ContadorVisitas {
  constructor() {
    this.db = null;
    this.localidad = this.detectarLocalidad();
    this.init();
  }

  init() {
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase no está cargado');
        return;
    }
    
    try {
        if (!firebase.apps.length) {
            console.log('🚀 Inicializando Firebase...');
            firebase.initializeApp(window.firebaseConfig);
        }
        this.db = firebase.firestore();
        console.log('✅ Firebase inicializado correctamente');
    } catch (error) {
        console.error('💥 Error inicializando Firebase:', error);
    }
}

  init() {
    if (typeof firebase === 'undefined') return;
    if (!firebase.apps.length) {
      firebase.initializeApp(window.firebaseConfig);
    }
    this.db = firebase.firestore();
  }

  // Detectar localidad desde la URL
  detectarLocalidad() {
    const path = window.location.pathname;
    const match = path.match(/\/([^\/]+)\/index\.html/);
    return match ? match[1] : 'desconocida';
  }

  getId(rubro, index) {
    return `${this.localidad}_${rubro}_${index}`.toLowerCase();
  }

  async registrar(rubro, index, nombre) {
    if (!this.db) return;
    const docId = this.getId(rubro, index);
    const ref = this.db.collection('contadores_visitas').doc(docId);

    try {
      await this.db.runTransaction(async (t) => {
        const doc = await t.get(ref);
        if (doc.exists) {
          t.update(ref, { visitas: firebase.firestore.FieldValue.increment(1) });
        } else {
          t.set(ref, { visitas: 1, nombre, rubro, index, localidad: this.localidad });
        }
      });
    } catch (e) {
      console.error('Error contando visita:', e);
    }
  }

  async obtener(rubro, index) {
    console.log(`🔍 Obteniendo visitas para: ${rubro}-${index}`);
    const cacheKey = `visitas_${this.getId(rubro, index)}`;
    const cached = localStorage.getItem(cacheKey);
    const now = Date.now();

    // 🆕 REDUCIR CACHE A 1 MINUTO (60000 ms) en lugar de 1 hora
    if (cached) {
        const { v, t } = JSON.parse(cached);
        if (now - t < 60000) { // 1 minuto en lugar de 3600000 (1 hora)
            console.log(`📊 Visitas desde cache: ${v} para ${rubro}-${index}`);
            return v;
        }
    }

    if (!this.db) {
        console.warn('❌ Firebase no disponible, retornando 0');
        return 0;
    }

    try {
        const doc = await this.db.collection('contadores_visitas').doc(this.getId(rubro, index)).get();
        const visitas = doc.exists ? doc.data().visitas || 0 : 0;
        localStorage.setItem(cacheKey, JSON.stringify({ v: visitas, t: now }));
        console.log(`📊 Visitas desde Firebase: ${visitas} para ${rubro}-${index}`);
        return visitas;
    } catch (e) {
        console.error('💥 Error obteniendo visitas:', e);
        return 0;
    }
}
}

window.contador = new ContadorVisitas();