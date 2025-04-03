const CACHE_NAME = "work-schedule-pwa-v1";
const urlsToCache = [
  "/index.html",
  "/styles.css",
  "/script.js",
  "/icon-192.png",
  "/icon-512.png"
];

// Instalando o Service Worker e salvando os arquivos no cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Interceptando requisições para servir do cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Página de fallback quando estiver offline
        return caches.match("/offline.html");
      });
    })
  );
});

// Atualizar o cache quando novos arquivos forem adicionados
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
