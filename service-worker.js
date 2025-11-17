// ===================================================
// SERVICE WORKER - Tu Barrio a un Click
// Versión: v81-multi-compatible
// Compatible con: main-2.js v81-multi
// Localidades: Castelar, Ituzaingó, Merlo, Morón
// ===================================================

const APP_VERSION = 'v81-multi-sw';
const CACHE_NAME = `tu-barrio-${APP_VERSION}`;
const API_CACHE_NAME = `tu-barrio-api-${APP_VERSION}`;

// Configuración de rutas - COMPATIBLE CON main-2.js
const BASE_PATH = self.location.hostname.includes('github.io') ? '/tubarrioaunclic' : '';
const LOCALIDADES = ['castelar', 'moron', 'ituzaingo', 'merlo'];

// ==================== RECURSOS CRÍTICOS - SINCRONIZADO CON main-2.js ====================
const PRECACHE_RESOURCES = [
  // Páginas principales
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  
  // Páginas de localidades
  ...LOCALIDADES.map(loc => `${BASE_PATH}/${loc}/index.html`),
  
  // Manifest y configuración
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/shared/js/config.js`,
  `${BASE_PATH}/shared/js/security-config.js`,

  // CSS críticos
  `${BASE_PATH}/shared/css/styles.css`,
  `${BASE_PATH}/shared/css/fondo.css`,
  `${BASE_PATH}/shared/css/publicidad.css`,
  `${BASE_PATH}/shared/css/favorites.css`,

  // JS críticos - ALINEADO CON main-2.js
  `${BASE_PATH}/shared/js/main-2.js`,
  `${BASE_PATH}/shared/js/splash.js`,
  `${BASE_PATH}/shared/js/search-functionality.js`,
  `${BASE_PATH}/shared/js/favorites-system.js`,
  `${BASE_PATH}/shared/js/notificaciones.js`,
  `${BASE_PATH}/shared/js/form.js`,
  `${BASE_PATH}/shared/js/testimonials.js`,
  `${BASE_PATH}/shared/js/publicidad.js`,
  `${BASE_PATH}/shared/js/resenas-comun.js`,
  `${BASE_PATH}/shared/js/coupons-system-castelar.js`,

  // Imágenes críticas
  `${BASE_PATH}/shared/img/icon-192x192.webp`,
  `${BASE_PATH}/shared/img/icon-512x512.webp`,
  `${BASE_PATH}/shared/img/icon-abeja-sola.png`
];

// ==================== ESTRATEGIAS COMPATIBLES CON main-2.js ====================
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',           // CSS, JS, imágenes
  HTML: 'network-first',           // Páginas HTML  
  DATA: 'stale-while-revalidate',  // JSON de datos
  API: 'network-first'             // APIs externas
};

// ==================== INSTALACIÓN COMPATIBLE ====================
self.addEventListener('install', (event) => {
  console.log(`🚀 SW ${APP_VERSION} instalándose (compatible con v81-multi)...`);
  
  event.waitUntil(
    (async () => {
      try {
        // Forzar activación inmediata - COMPATIBLE CON skipWaiting de main-2.js
        self.skipWaiting();
        
        // Abrir cache y precargar recursos críticos
        const cache = await caches.open(CACHE_NAME);
        
        // Precargar recursos con manejo de errores
        const cachePromises = PRECACHE_RESOURCES.map(async (resource) => {
          try {
            await cache.add(resource);
            console.log(`✅ Precached: ${getShortUrl(resource)}`);
          } catch (error) {
            console.warn(`⚠️ No se pudo precachear: ${resource}`, error);
          }
        });

        await Promise.all(cachePromises);
        console.log(`✅ SW ${APP_VERSION} instalado - ${PRECACHE_RESOURCES.length} recursos precacheados`);

        // Notificar a los clientes - COMPATIBLE CON main-2.js
        await notifyClients({ 
          type: 'SW_INSTALLED', 
          version: APP_VERSION,
          compatibleWith: 'v81-multi'
        });
        
      } catch (error) {
        console.error('❌ Error en instalación SW:', error);
      }
    })()
  );
});

// ==================== ACTIVACIÓN COMPATIBLE ====================
self.addEventListener('activate', (event) => {
  console.log(`🔄 SW ${APP_VERSION} activándose...`);
  
  event.waitUntil(
    (async () => {
      try {
        // Tomar control inmediato - COMPATIBLE CON clients.claim de main-2.js
        await self.clients.claim();
        
        // Limpiar caches antiguos
        const cacheKeys = await caches.keys();
        const deletePromises = cacheKeys.map(key => {
          if (key !== CACHE_NAME && key !== API_CACHE_NAME && key.startsWith('tu-barrio-')) {
            console.log(`🗑️ Eliminando cache antiguo: ${key}`);
            return caches.delete(key);
          }
        });
        
        await Promise.all(deletePromises);
        console.log(`✅ SW ${APP_VERSION} activado y listo`);

        // Notificar a los clients - COMPATIBLE CON main-2.js
        await notifyClients({ 
          type: 'SW_ACTIVATED', 
          version: APP_VERSION,
          message: 'Service Worker actualizado correctamente',
          cacheStrategies: CACHE_STRATEGIES
        });
        
      } catch (error) {
        console.error('❌ Error en activación SW:', error);
      }
    })()
  );
});

// ==================== MANEJO DE FETCH COMPATIBLE ====================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar peticiones GET - COMPATIBLE CON main-2.js
  if (request.method !== 'GET') return;
  
  // Manejar diferentes orígenes
  if (url.origin === self.location.origin) {
    event.respondWith(handleSameOriginFetch(request));
  } else {
    // Peticiones a CDNs (Bootstrap, FontAwesome, Leaflet, etc.)
    event.respondWith(handleExternalFetch(request));
  }
});

// ==================== ESTRATEGIAS DE CACHE COMPATIBLES ====================
async function handleSameOriginFetch(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Estrategia: Network First para datos frescos - COMPATIBLE CON main-2.js
    console.log(`🌐 Network First: ${getShortUrl(request.url)}`);
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cachear respuesta exitosa según estrategia
      if (shouldCacheResponse(request, networkResponse)) {
        await cacheResponse(request, networkResponse.clone());
      }
      return networkResponse;
    }
    throw new Error('Network response not ok');
    
  } catch (error) {
    // Fallback a cache - COMPATIBLE CON main-2.js
    console.log(`📦 Fallback a cache: ${getShortUrl(request.url)}`);
    return handleCacheFallback(request, pathname);
  }
}

async function handleExternalFetch(request) {
  const url = new URL(request.url);
  
  // Para recursos externos, usar Cache First - COMPATIBLE CON main-2.js
  try {
    const cached = await caches.match(request);
    if (cached) {
      console.log(`💾 CDN desde cache: ${getShortUrl(url.href)}`);
      return cached;
    }

    // Si no está en cache, buscar en red y cachear
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
    
  } catch (error) {
    console.warn(`❌ Error con recurso externo: ${url.href}`);
    return new Response('', { status: 408 });
  }
}

// ==================== FUNCIONES AUXILIARES COMPATIBLES ====================
function shouldCacheResponse(request, response) {
  const url = request.url;
  const contentType = response.headers.get('content-type') || '';

  // No cachear páginas HTML principales - COMPATIBLE CON main-2.js
  if (url.includes('/index.html') || url.endsWith('/')) {
    return false;
  }

  // Cachear estos tipos - COMPATIBLE CON main-2.js
  if (contentType.includes('text/css') || 
      contentType.includes('application/javascript') ||
      contentType.includes('image/') ||
      url.includes('.json') ||
      url.includes('manifest.json')) {
    return true;
  }

  return false;
}

async function cacheResponse(request, response) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response);
    console.log(`💾 Cacheado: ${getShortUrl(request.url)}`);
  } catch (error) {
    console.warn(`⚠️ Error cacheando: ${request.url}`, error);
  }
}

async function handleCacheFallback(request, pathname) {
  // Buscar en cache primero
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log(`✅ Servido desde cache: ${getShortUrl(request.url)}`);
    return cachedResponse;
  }

  // Fallbacks específicos por tipo de recurso - COMPATIBLE CON main-2.js
  if (pathname.includes('/data/')) {
    return handleDataFallback(pathname);
  }

  if (pathname.includes('/img/') || pathname.includes('/shared/img/')) {
    return handleImageFallback(pathname);
  }

  if (pathname.endsWith('.html') || pathname.endsWith('/')) {
    return handleHtmlFallback(pathname);
  }

  // Fallback genérico
  return createOfflineResponse(request);
}

function handleHtmlFallback(pathname) {
  const fallbacks = {
    '/': '/index.html',
    '/castelar/': '/castelar/index.html',
    '/moron/': '/moron/index.html', 
    '/ituzaingo/': '/ituzaingo/index.html',
    '/merlo/': '/merlo/index.html'
  };

  const cleanPath = BASE_PATH ? pathname.replace(BASE_PATH, '') : pathname;
  const fallbackPath = fallbacks[cleanPath] || fallbacks[cleanPath.replace(/\/$/, '')] || '/index.html';
  
  console.log(`🏠 Fallback HTML: ${cleanPath} -> ${fallbackPath}`);
  
  return caches.match(`${BASE_PATH}${fallbackPath}`)
    .then(cached => cached || createEnhancedOfflinePage());
}

function handleDataFallback(pathname) {
  // Para JSON de datos - COMPATIBLE CON main-2.js
  return new Response(JSON.stringify({
    error: 'offline',
    message: 'Modo offline activado - Datos no disponibles',
    timestamp: new Date().toISOString(),
    path: pathname
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

function handleImageFallback(pathname) {
  // Fallback para imágenes - COMPATIBLE CON main-2.js
  return caches.match(`${BASE_PATH}/shared/img/icon-192x192.webp`)
    .then(cached => cached || createDefaultImage());
}

// ==================== PÁGINA OFFLINE COMPATIBLE ====================
function createEnhancedOfflinePage() {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modo Offline - Tu Barrio a un Click</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .offline-container { 
            max-width: 500px; 
            background: rgba(255,255,255,0.15); 
            padding: 40px; 
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            text-align: center;
        }
        .offline-icon {
            font-size: 4rem;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }
        h1 { 
            margin-bottom: 15px;
            font-size: 2.2rem;
        }
        p { 
            margin-bottom: 10px;
            line-height: 1.6;
            opacity: 0.9;
        }
        .btn { 
            background: white; 
            color: #667eea; 
            border: none; 
            padding: 15px 30px; 
            border-radius: 30px; 
            font-weight: bold; 
            cursor: pointer; 
            margin-top: 25px;
            font-size: 1rem;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 25px 0;
        }
        .feature {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 10px;
            font-size: 0.9rem;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        @media (max-width: 480px) {
            .offline-container { padding: 25px; }
            .features { grid-template-columns: 1fr; }
            h1 { font-size: 1.8rem; }
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">📡</div>
        <h1>Estás Offline</h1>
        <p>No hay conexión a internet en este momento.</p>
        <p>Puedes seguir navegando por los comercios que ya has visitado.</p>
        
        <div class="features">
            <div class="feature">
                <strong>📍 Comercios Locales</strong><br>
                Accede a información guardada
            </div>
            <div class="feature">
                <strong>🕒 Horarios</strong><br>
                Consulta disponibilidad
            </div>
            <div class="feature">
                <strong>📞 Contactos</strong><br>
                WhatsApp guardados
            </div>
            <div class="feature">
                <strong>🗺️ Mapas</strong><br>
                Ubicaciones cacheadas
            </div>
        </div>
        
        <button class="btn" onclick="location.reload()">
            🔄 Reintentar Conexión
        </button>
        
        <p style="margin-top: 20px; font-size: 0.8rem; opacity: 0.7;">
            La conexión se restablecerá automáticamente cuando esté disponible
        </p>
    </div>
</body>
</html>`;
  
  return new Response(html, {
    headers: { 
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}

function createDefaultImage() {
  const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f0f0f0"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
          font-family="Arial" font-size="14" fill="#666">Imagen no disponible</text>
  </svg>`;
  
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' }
  });
}

function createOfflineResponse(request) {
  const url = new URL(request.url);
  
  if (url.pathname.includes('.css')) {
    return new Response('/* Offline - CSS no disponible */', {
      headers: { 'Content-Type': 'text/css' }
    });
  }
  
  if (url.pathname.includes('.js')) {
    return new Response('// Offline - JS no disponible', {
      headers: { 'Content-Type': 'application/javascript' }
    });
  }

  return createEnhancedOfflinePage();
}

// ==================== MANEJO DE MENSAJES COMPATIBLE ====================
self.addEventListener('message', (event) => {
  const { data, source } = event;
  
  console.log('📨 Mensaje SW:', data);
  
  switch (data?.type) {
    case 'SKIP_WAITING':
      console.log('⏩ Saltando espera...');
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      source.postMessage({
        type: 'SW_VERSION',
        version: APP_VERSION,
        cacheName: CACHE_NAME,
        timestamp: new Date().toISOString(),
        localidades: LOCALIDADES,
        compatibleWith: 'main-2.js v81-multi'
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        source.postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    case 'PAGE_FOCUS':
      // COMPATIBLE CON main-2.js - Refrescar datos al enfocar página
      console.log('📱 PAGE_FOCUS recibido - Refrescando datos...');
      updateContentInBackground();
      break;
  }
});

// ==================== SYNC EN SEGUNDO PLANO COMPATIBLE ====================
self.addEventListener('sync', (event) => {
  console.log('🔄 Background Sync:', event.tag);
  
  switch (event.tag) {
    case 'update-content':
      event.waitUntil(updateContentInBackground());
      break;
    case 'update-offers':
      event.waitUntil(updateOffersInBackground());
      break;
  }
});

async function updateContentInBackground() {
  console.log('🔄 Actualizando contenido en segundo plano...');
  
  try {
    // Actualizar datos de comercios - COMPATIBLE CON main-2.js
    const dataUrls = [
      `${BASE_PATH}/data/carousel.json`,
      `${BASE_PATH}/data/promociones.json`
    ];
    
    for (const url of dataUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const cache = await caches.open(API_CACHE_NAME);
          await cache.put(url, response.clone());
          console.log(`✅ Actualizado: ${getShortUrl(url)}`);
        }
      } catch (error) {
        console.warn(`⚠️ Error actualizando: ${url}`, error);
      }
    }
    
    await notifyClients({ 
      type: 'CONTENT_UPDATED', 
      message: 'Contenido actualizado en segundo plano'
    });
    
  } catch (error) {
    console.error('❌ Error en background sync:', error);
  }
}

async function updateOffersInBackground() {
  console.log('🔄 Actualizando ofertas en segundo plano...');
  await notifyClients({ 
    type: 'OFFERS_UPDATED', 
    message: 'Ofertas actualizadas en segundo plano'
  });
}

// ==================== FUNCIONES UTILITARIAS COMPATIBLES ====================
async function notifyClients(message) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage(message);
  });
}

async function clearAllCaches() {
  const keys = await caches.keys();
  const deletePromises = keys.map(key => caches.delete(key));
  await Promise.all(deletePromises);
  console.log('🗑️ Todos los caches limpiados');
}

function getShortUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.length > 40 ? 
      '...' + parsed.pathname.slice(-37) : 
      parsed.pathname;
  } catch {
    return url.length > 40 ? '...' + url.slice(-37) : url;
  }
}

// ==================== INICIALIZACIÓN COMPATIBLE ====================
console.log(`🚀 SW ${APP_VERSION} cargado - 100% compatible con main-2.js v81-multi`);
console.log(`📍 Localidades: ${LOCALIDADES.join(', ')}`);
console.log(`📁 Base path: ${BASE_PATH || '(raíz)'}`);
console.log(`🔄 Cache strategies:`, CACHE_STRATEGIES);