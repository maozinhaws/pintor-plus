// Pintor Plus — Service Worker
// Estratégia: Cache First para assets estáticos, Network First para dados externos

const CACHE_NAME = 'pintorplus-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/icon.svg',
  '/favicon.svg',
  '/manifest.json',
  '/termos.html',
  '/privacidade.html',
];

// Instalar e pré-cachear assets estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Ativar e limpar caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Deixa passar: Google APIs, OAuth, CDNs externos
  if (
    url.hostname.includes('google') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('accounts.google') ||
    url.hostname.includes('rss2json') ||
    url.hostname.includes('viacep') ||
    url.hostname.includes('opencep') ||
    url.hostname.includes('lh3.googleusercontent')
  ) {
    return; // Não interceptar — deixa o browser lidar
  }

  // Para assets estáticos: Cache First (offline-ready)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Cacheia apenas respostas válidas de mesma origem
        if (
          response.ok &&
          event.request.method === 'GET' &&
          url.origin === self.location.origin
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback: serve o index.html para navegação
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
