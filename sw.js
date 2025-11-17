// sw.js - Service Worker Actualizado v81
// Localidades: Castelar, Morón, Ituzaingó, Merlo
// Versión: v81-prod - Sync con main-2.js

const CACHE_VERSION = 'v81-multi';
const CACHE_NAME = `tu-barrio-${CACHE_VERSION}`;
const BASE_PATH = self.location.hostname === 'vicgom892.github.io' ? '/tubarrioaunclic' : '';

// 🆕 RECURSOS CRÍTICOS ACTUALIZADOS - Incluye manifest-tubarrio.json
const CORE_RESOURCES = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest-tubarrio.json`, // 🆕 CAMBIADO A manifest-tubarrio.json
  `${BASE_PATH}/shared/css/styles.css`,
  `${BASE_PATH}/shared/css/fondo.css`,
  `${BASE_PATH}/shared/css/negocios.css`,
  `${BASE_PATH}/shared/js/main-2.js`,
  `${BASE_PATH}/shared/js/install-app.js`,
  `${BASE_PATH}/shared/js/splash.js`,
  `${BASE_PATH}/shared/js/security-config.js`,
  `${BASE_PATH}/shared/img/icon-192x192.webp`,
  `${BASE_PATH}/shared/img/icon-512x512.webp`,
  `${BASE_PATH}/shared/img/icon-abeja-sola.png`
];

// 🆕 ESTRATEGIAS DE CACHE MEJORADAS
const CACHE_STRATEGIES = {
  CORE: 'cache-first',      // Recursos críticos
  STATIC: 'stale-while-revalidate', // CSS, JS, imágenes
  DATA: 'network-first',    // JSON de datos
  HTML: 'network-first'     // Páginas HTML
};

// === INSTALACIÓN MEJORADA ===
self.addEventListener('install', (event) => {
  console.log('🚀 SW v81 instalándose...');
  self.skipWaiting();
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        
        // 🆕 Cachear solo recursos críticos con manejo de errores
        const promises = CORE_RESOURCES.map(resource => 
          cache.add(resource).catch(err => 
            console.warn(`⚠️ No se pudo cachear: ${resource}`, err)
          )
        );
        
        await Promise.all(promises);
        console.log('✅ SW v81 instalado - recursos críticos cacheados');
        
        // 🆕 Notificar a la página
        self.clients.matchAll().then(clients => {
          clients.forEach(client => 
            client.postMessage({ type: 'SW_INSTALLED', version: 'v81' })
          );
        });
        
      } catch (error) {
        console.error('❌ Error en instalación SW:', error);
      }
    })()
  );
});

// === ACTIVACIÓN MEJORADA ===
self.addEventListener('activate', (event) => {
  console.log('🔄 SW v81 activándose...');
  
  event.waitUntil(
    (async () => {
      try {
        // 🆕 Tomar control inmediato
        await self.clients.claim();
        
        // 🆕 Limpiar caches antiguos MÁS AGRESIVO
        const keys = await caches.keys();
        const deletePromises = keys.map(key => {
          if (key !== CACHE_NAME && key.startsWith('tu-barrio-')) {
            console.log(`🗑️ Eliminando cache antiguo: ${key}`);
            return caches.delete(key);
          }
        });
        
        await Promise.all(deletePromises);
        console.log('✅ SW v81 activado y listo');
        
        // 🆕 Notificar a la página
        self.clients.matchAll().then(clients => {
          clients.forEach(client => 
            client.postMessage({ 
              type: 'SW_ACTIVATED', 
              version: 'v81',
              message: 'Service Worker actualizado correctamente'
            })
          );
        });
        
      } catch (error) {
        console.error('❌ Error en activación SW:', error);
      }
    })()
  );
});

// === MANEJO DE PETICIONES MEJORADO ===
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 🆕 Solo manejar peticiones GET y del mismo origen
  if (request.method !== 'GET') return;
  
  // 🆕 Manejar diferentes tipos de recursos
  if (url.origin === self.location.origin) {
    event.respondWith(handleSameOriginRequest(request));
  }
});

async function handleSameOriginRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // 🆕 DETECTAR Y EVITAR CACHE DEL MANIFEST INCORRECTO
    if (pathname.includes('manifest.json') && !pathname.includes('manifest-tubarrio')) {
      console.log('🚫 Bloqueando cache de manifest incorrecto:', pathname);
      return fetch(request);
    }

    // 🆕 ESTRATEGIA MEJORADA: Network First para datos frescos
    console.log('🌐 Intentando red:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 🆕 Cachear respuestas exitosas (excluir HTML principal)
      if (shouldCacheRequest(request)) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, networkResponse.clone());
        console.log('💾 Cacheado:', getShortUrl(request.url));
      }
      return networkResponse;
    }
    throw new Error('Network response not ok');
    
  } catch (error) {
    // 🆕 FALLBACK MEJORADO
    console.log('📦 Fallback a cache para:', getShortUrl(request.url));
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('✅ Servido desde cache:', getShortUrl(request.url));
      return cachedResponse;
    }

    // 🆕 FALLBACKS ESPECÍFICOS MEJORADOS
    return handleAdvancedFallback(request, pathname);
  }
}

// 🆕 FUNCIÓN PARA DETERMINAR QUÉ CACHEAR
function shouldCacheRequest(request) {
  const url = request.url;
  
  // NO cachear páginas HTML principales (para evitar problemas de actualización)
  if (url.includes('/index.html') || url.endsWith('/')) {
    return false;
  }
  
  // Cachear estos tipos de recursos
  const cacheableTypes = [
    '.css', '.js', '.json', '.webp', '.png', '.jpg', '.jpeg',
    'manifest-tubarrio.json'
  ];
  
  return cacheableTypes.some(type => url.includes(type));
}

// 🆕 FALLBACK AVANZADO
async function handleAdvancedFallback(request, pathname) {
  const url = new URL(request.url);
  
  // Fallback para páginas HTML
  if (pathname.endsWith('.html') || pathname.endsWith('/')) {
    return handleHtmlFallback(pathname);
  }
  
  // Fallback para JSON de datos
  if (pathname.includes('/data/')) {
    return new Response(JSON.stringify({ 
      error: 'offline', 
      message: 'Modo offline activado',
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }

  // 🆕 Fallback para imágenes
  if (pathname.includes('/img/') || pathname.includes('/shared/img/')) {
    return caches.match(`${BASE_PATH}/shared/img/icon-192x192.webp`);
  }

  // Página offline genérica
  return createOfflinePage();
}

// 🆕 MANEJO DE FALLBACK HTML MEJORADO
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
  
  console.log('🏠 Fallback HTML:', cleanPath, '->', fallbackPath);
  
  return caches.match(`${BASE_PATH}${fallbackPath}`)
    .then(cached => {
      if (cached) {
        return cached;
      }
      // 🆕 Página offline mejorada
      return createEnhancedOfflinePage();
    });
}

// 🆕 PÁGINA OFFLINE MEJORADA
function createEnhancedOfflinePage() {
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Modo Offline - Tu Barrio a un Click</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; 
                text-align: center; 
                padding: 20px;
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container { 
                max-width: 500px; 
                background: rgba(255,255,255,0.15); 
                padding: 40px; 
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }
            h1 { 
                margin-bottom: 20px;
                font-size: 2.5rem;
            }
            .icon {
                font-size: 4rem;
                margin-bottom: 20px;
                animation: pulse 2s infinite;
            }
            .btn { 
                background: white; 
                color: #667eea; 
                border: none; 
                padding: 15px 40px; 
                border-radius: 30px; 
                font-weight: bold; 
                cursor: pointer; 
                margin-top: 30px;
                font-size: 1.1rem;
                transition: transform 0.3s ease;
            }
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">📡</div>
            <h1>Estás Offline</h1>
            <p style="font-size: 1.2rem; line-height: 1.6;">
                No hay conexión a internet en este momento.
            </p>
            <p style="opacity: 0.9;">
                Puedes seguir navegando por los comercios que ya has visitado.
                La conexión se restablecerá automáticamente cuando esté disponible.
            </p>
            <button class="btn" onclick="location.reload()">
                🔄 Reintentar Conexión
            </button>
        </div>
    </body>
    </html>
  `;
  return new Response(html, {
    headers: { 
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}

// 🆕 FUNCIÓN AUXILIAR PARA URLs CORTAS
function getShortUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.length > 30 ? 
      '...' + parsed.pathname.slice(-27) : 
      parsed.pathname;
  } catch {
    return url.length > 30 ? '...' + url.slice(-27) : url;
  }
}

// 🆕 MANEJO DE MENSAJES MEJORADO
self.addEventListener('message', (event) => {
  const { data, source } = event;
  
  console.log('📨 Mensaje recibido en SW:', data);
  
  switch (data?.type) {
    case 'SKIP_WAITING':
      console.log('⏩ Saltando espera...');
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      source.postMessage({
        type: 'SW_VERSION',
        version: 'v81',
        cacheName: CACHE_NAME,
        timestamp: new Date().toISOString()
      });
      break;
      
    case 'CLEAR_CACHE':
      caches.delete(CACHE_NAME).then(() => {
        source.postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
  }
});

// 🆕 MANEJO DE SYNC EN SEGUNDO PLANO
self.addEventListener('sync', (event) => {
  console.log('🔄 Sync event:', event.tag);
  
  if (event.tag === 'update-offers') {
    event.waitUntil(
      updateOffersInBackground()
    );
  }
});

async function updateOffersInBackground() {
  // 🆕 Aquí puedes agregar lógica para actualizar ofertas en segundo plano
  console.log('🔄 Actualizando ofertas en segundo plano...');
  
  // Notificar a la página
  self.clients.matchAll().then(clients => {
    clients.forEach(client => 
      client.postMessage({ 
        type: 'BACKGROUND_SYNC',
        message: 'Ofertas actualizadas en segundo plano'
      })
    );
  });
}

console.log('🚀 SW v81 cargado - Listo para producción con manifest-tubarrio.json');