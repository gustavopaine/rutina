const CACHE_NAME = 'rutina-veronica-v8';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './logic.js',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
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

// App shell: cache primero (funciona offline). Recursos externos (fuentes,
// Leaflet, mapa): siguen necesitando conexión, no se cachean acá.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      // Sin nada en caché: dejamos que el fetch normal falle si no hay red
      // (no devolvemos undefined a respondWith, que no es una respuesta válida).
      return fetch(event.request).then((response) => {
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

// Recordatorios push (Nivel 16): el Worker manda { title, body } como JSON.
self.addEventListener('push', (event) => {
  let data = { title: 'Rutina de Verónica', body: 'Revisá tu rutina.' };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    // payload inesperado (no era el JSON que manda nuestro Worker): usamos el default de arriba
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients){
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
