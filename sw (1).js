// Cada vez que subas cambios importantes al juego, subí también este archivo
// con CACHE_NAME incrementado (v2, v3, ...) para forzar a los navegadores/apps
// instaladas a descartar el caché viejo.
const CACHE_NAME = 'arena-circulo-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // No cachear llamadas a Supabase: siempre deben ir a la red
  if (event.request.url.includes('supabase.co')) return;

  // Network-first: siempre intenta traer la versión más nueva del servidor.
  // Si no hay internet (offline), recién ahí usa lo que tenga guardado.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
