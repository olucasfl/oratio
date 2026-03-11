const CACHE_NAME = "oratio-cache-v1";

/* ============================= */
/* INSTALL */
/* ============================= */

self.addEventListener("install", event => {

  console.log("Service Worker instalado");

  event.waitUntil(
    caches.open(CACHE_NAME)
  );

  self.skipWaiting();

});


/* ============================= */
/* ACTIVATE */
/* ============================= */

self.addEventListener("activate", event => {

  console.log("Service Worker ativo");

  event.waitUntil(self.clients.claim());

});


/* ============================= */
/* FETCH */
/* ============================= */

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  event.respondWith(

    caches.match(event.request)
      .then(cachedResponse => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(networkResponse => {

            const responseClone = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseClone);
              });

            return networkResponse;

          })
          .catch(() => {

            if (event.request.mode === "navigate") {
              return caches.match("/");
            }

          });

      })

  );

});