const CACHE_NAME = "oratio-cache-v7"

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

 /* ignorar protocolos estranhos */

 if (url.protocol !== "http:" && url.protocol !== "https:") {
  return
 }

 /* ============================= */
 /* NÃO CACHEAR API */
 /* ============================= */

 if (
  url.pathname.startsWith("/auth") ||
  url.pathname.startsWith("/oratio") ||
  url.origin.includes("render.com") ||
  url.origin.includes("vercel.app")
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

 /* ============================= */
 /* STALE WHILE REVALIDATE */
 /* ============================= */

 event.respondWith(

  caches.open(CACHE_NAME).then(async (cache) => {

   const cachedResponse = await cache.match(request)

   const networkFetch = fetch(request)
    .then((networkResponse) => {

     cache.put(request, networkResponse.clone())

     return networkResponse

    })
    .catch(() => cachedResponse)

   return cachedResponse || networkFetch

  })

 )

})