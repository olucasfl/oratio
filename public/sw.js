const CACHE_NAME = "oratio-cache-v3";

/* ============================= */
/* INSTALL */
/* ============================= */

self.addEventListener("install", event => {

  console.log("Service Worker instalado");

  self.skipWaiting();

});

/* ============================= */
/* ACTIVATE */
/* ============================= */

self.addEventListener("activate", event => {

  console.log("Service Worker ativo");

  event.waitUntil(

    caches.keys().then(cacheNames => {

      return Promise.all(

        cacheNames.map(cache => {

          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }

        })

      );

    })

  );

  self.clients.claim();

});

/* ============================= */
/* MENSAGEM PARA ATUALIZAR APP */
/* ============================= */

self.addEventListener("message", event => {

  if (event.data && event.data.type === "SKIP_WAITING") {

    console.log("Atualizando service worker...");

    self.skipWaiting();

  }

});

/* ============================= */
/* FETCH */
/* ============================= */

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  event.respondWith(

    fetch(event.request)
      .then(networkResponse => {

        const responseClone = networkResponse.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseClone);
          });

        return networkResponse;

      })
      .catch(() => {

        return caches.match(event.request);

      })

  );

});