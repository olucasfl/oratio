const CACHE_NAME = "oratio-cache-v6"

/* ============================= */
/* INSTALL */
/* ============================= */

self.addEventListener("install", () => {

 console.log("Service Worker instalado")

 self.skipWaiting()

})

/* ============================= */
/* ACTIVATE */
/* ============================= */

self.addEventListener("activate", (event) => {

 console.log("Service Worker ativo")

 event.waitUntil(

  caches.keys().then((cacheNames) => {

   return Promise.all(

    cacheNames.map((cache) => {

     if (cache !== CACHE_NAME) {

      console.log("Removendo cache antigo:", cache)

      return caches.delete(cache)

     }

    })

   )

  })

 )

 self.clients.claim()

})

/* ============================= */
/* ATUALIZAR APP */
/* ============================= */

self.addEventListener("message", (event) => {

 if (event.data && event.data.type === "SKIP_WAITING") {

  console.log("Atualizando Service Worker")

  self.skipWaiting()

 }

})

/* ============================= */
/* FETCH */
/* ============================= */

self.addEventListener("fetch", (event) => {

 const request = event.request

 if (request.method !== "GET") return

 const url = new URL(request.url)

 /* ============================= */
 /* IGNORAR EXTENSÕES DO CHROME */
 /* ============================= */

 if (url.protocol !== "http:" && url.protocol !== "https:") {
  return
 }

 /* ============================= */
 /* IGNORAR APIs EXTERNAS */
 /* ============================= */

 if (url.origin !== location.origin) {
  return
 }

 /* ============================= */
 /* NÃO INTERCEPTAR ROTAS DO REACT */
 /* ============================= */

 if (
  url.pathname.startsWith("/oratio") ||
  url.pathname.startsWith("/login") ||
  url.pathname.startsWith("/register")
 ) {
  return
 }

 /* ============================= */
 /* CACHE APENAS ASSETS */
 /* ============================= */

 const isAsset =
  request.destination === "style" ||
  request.destination === "script" ||
  request.destination === "image" ||
  request.destination === "font"

 if (!isAsset) return

 event.respondWith(

  caches.match(request).then((cached) => {

   if (cached) return cached

   return fetch(request).then((networkResponse) => {

    const clone = networkResponse.clone()

    caches.open(CACHE_NAME).then((cache) => {
     cache.put(request, clone)
    })

    return networkResponse

   })

  })

 )

})