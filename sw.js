// sw.js - Service Worker Optimizado para Producción
// Localidades: Castelar, Morón, Ituzaingó
// Versión: v1-prod

const CACHE_VERSION = 'v1-prod-castelar-moron-ituzaingo-merlo';
const CACHE_NAME = `tu-barrio-${CACHE_VERSION}`;
const BASE_PATH = self.location.hostname === 'vicgom892.github.io' ? '/tubarrioaunclic' : '';

// Recursos críticos que siempre se cachean
const CORE_RESOURCES = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/shared/css/styles.css`,
  `${BASE_PATH}/shared/css/fondo.css`,
  `${BASE_PATH}/shared/css/negocios.css`,
  `${BASE_PATH}/shared/js/main-2.js`,
  `${BASE_PATH}/shared/js/install-app.js`,
  `${BASE_PATH}/shared/img/icon-192x192.png`,
  `${BASE_PATH}/shared/img/icon-512x512.png`
];

// Recursos específicos por localidad
const LOCALIDAD_RESOURCES = {
  castelar: [
    `${BASE_PATH}/castelar/index.html`,
    `${BASE_PATH}/castelar/data/comercios.json`,
    `${BASE_PATH}/castelar/data/carousel.json`,
    `${BASE_PATH}/castelar/data/panaderias.json`,
    `${BASE_PATH}/castelar/data/verdulerias.json`
  ],
  moron: [
    `${BASE_PATH}/moron/index.html`,
    `${BASE_PATH}/moron/data/comercios.json`
  ],
  ituzaingo: [
    `${BASE_PATH}/ituzaingo/index.html`,
    `${BASE_PATH}/ituzaingo/data/comercios.json`
  ],
  merlo: [
    `${BASE_PATH}/merlo/index.html`,
    `${BASE_PATH}/merlo/data/comercios.json`
  ]
};

// === INSTALACIÓN ===
self.addEventListener('install', (event) => {
  self.skipWaiting();
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cachear solo recursos críticos
      await cache.addAll(CORE_RESOURCES);
      console.log('SW instalado - recursos críticos cacheados');
    })()
  );
});

// === ACTIVACIÓN ===
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      // Limpiar caches antiguos
      const keys = await caches.keys();
      await Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      );
      console.log('SW activado y listo');
    })()
  );
});

// === MANEJO DE PETICIONES ===
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar peticiones GET del mismo origen
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Estrategia: Network First con fallback a cache
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cachear respuestas exitosas (excepto HTML para evitar problemas)
      if (!pathname.endsWith('.html') && !pathname.endsWith('/')) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    // Fallback al cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback para páginas HTML
    if (pathname.endsWith('.html') || pathname.endsWith('/')) {
      return handleHtmlFallback(pathname);
    }

    // Fallback para JSON de datos
    if (pathname.includes('/data/')) {
      return new Response(JSON.stringify({ error: 'offline' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Recurso no disponible offline', { status: 503 });
  }
}

function handleHtmlFallback(pathname) {
  // Mapeo de fallbacks para páginas
  const fallbacks = {
    '/': '/index.html',
    '/castelar': '/castelar/index.html',
    '/moron': '/moron/index.html', 
    '/ituzaingo': '/ituzaingo/index.html',
    '/merlo': '/merlo/index.html'
  };

  const cleanPath = BASE_PATH ? pathname.replace(BASE_PATH, '') : pathname;
  const fallbackPath = fallbacks[cleanPath] || fallbacks[cleanPath.replace(/\/$/, '')] || '/index.html';
  
  return caches.match(`${BASE_PATH}${fallbackPath}`)
    .then(cached => cached || createOfflinePage());
}

function createOfflinePage() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Modo Offline - Tu Barrio a un Clik</title>
        <style>
            body { font-family: sans-serif; background: #667eea; color: white; text-align: center; padding: 20px; }
            .container { max-width: 500px; margin: 50px auto; background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; }
            h1 { margin-bottom: 20px; }
            .btn { background: white; color: #667eea; border: none; padding: 12px 30px; border-radius: 30px; font-weight: bold; cursor: pointer; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Estás Offline</h1>
            <p>No hay conexión a internet.</p>
            <p>Puedes navegar por comercios ya cargados.</p>
            <button class="btn" onclick="location.reload()">Reintentar</button>
        </div>
    </body>
    </html>
  `;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// Manejo de mensajes
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('SW cargado - listo para producción');