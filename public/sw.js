const CACHE_NAME = "oratio-cache-v4";

/* ============================= */
/* INSTALL */
/* ============================= */

self.addEventListener("install", (event) => {

  console.log("Service Worker instalado");

  self.skipWaiting();

});

/* ============================= */
/* ACTIVATE */
/* ============================= */

self.addEventListener("activate", (event) => {

  console.log("Service Worker ativo");

  event.waitUntil(

    caches.keys().then((cacheNames) => {

      return Promise.all(

        cacheNames.map((cache) => {

          if (cache !== CACHE_NAME) {
            console.log("Removendo cache antigo:", cache);
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

self.addEventListener("message", (event) => {

  if (event.data && event.data.type === "SKIP_WAITING") {

    console.log("Atualizando Service Worker");

    self.skipWaiting();

  }

});

/* ============================= */
/* FETCH */
/* ============================= */

self.addEventListener("fetch", (event) => {

  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  /* ============================= */
  /* IGNORAR EXTENSÕES DO CHROME */
  /* ============================= */

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  /* ============================= */
  /* NÃO CACHEAR API */
  /* ============================= */

  if (url.origin.includes("render.com")) {
    return;
  }

  /* ============================= */
  /* NÃO CACHEAR REQUESTS EXTERNOS */
  /* ============================= */

  if (url.origin !== location.origin) {
    return;
  }

  /* ============================= */
  /* NETWORK FIRST STRATEGY */
  /* ============================= */

  event.respondWith(

    fetch(request)

      .then((networkResponse) => {

        const responseClone = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {

          cache.put(request, responseClone);

        });

        return networkResponse;

      })

      .catch(() => {

        return caches.match(request);

      })

  );

});