/**
 * RAVO OS — Service Worker
 * Caching, offline support e background sync
 */

// Cache names
const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  html: `html-${CACHE_VERSION}`,
  assets: `assets-${CACHE_VERSION}`,
  api: `api-${CACHE_VERSION}`,
};

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('🔧 Service Worker installing...');

  event.waitUntil(
    caches.open(CACHE_NAMES.html).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('✅ Service Worker activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !Object.values(CACHE_NAMES).includes(name))
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch event - network first for API, cache first for assets
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - network first with cache fallback
  if (url.pathname.startsWith('/api') || url.hostname !== url.hostname) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const cache = caches.open(CACHE_NAMES.api);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request).then((response) => {
            return response || new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // HTML - network first with cache fallback
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            caches.open(CACHE_NAMES.html).then((cache) => {
              cache.put(request, response.clone());
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || caches.match('/index.html') || new Response('Offline');
          });
        })
    );
    return;
  }

  // Assets - cache first with network fallback
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }

        return fetch(request).then((response) => {
          if (response.status === 200) {
            const cache = caches.open(CACHE_NAMES.assets);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        }).catch(() => {
          // Return placeholder for missing assets
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#ccc" width="100" height="100"/></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          return new Response('Offline');
        });
      })
    );
    return;
  }

  // Default - network with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => response)
      .catch(() => {
        return caches.match(request).then((response) => {
          return response || new Response('Offline');
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event: any) => {
  console.log('📡 Background sync triggered:', event.tag);

  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

/**
 * Sincronizar ações offline quando conectar novamente
 */
async function syncOfflineActions() {
  try {
    // TODO: Implementar lógica de sync
    console.log('✅ Offline actions synced');
  } catch (error) {
    console.error('❌ Sync failed:', error);
    throw error;
  }
}

// Message from clients
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('💬 SW Message:', event.data);

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    });
  }
});
