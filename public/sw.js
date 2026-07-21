const CACHE_NAME = "oratio-cache-v16"

/* ============================= */
/* APP SHELL */
/* ============================= */

const APP_SHELL = [
 "/",
 "/index.html",
 "/oratio/consecration"
]

/* ============================= */
/* INSTALL */
/* ============================= */

self.addEventListener("install", (event) => {

 console.log("Service Worker instalado")

 event.waitUntil(
  caches.open(CACHE_NAME).then((cache) => {
   return cache.addAll(APP_SHELL)
  })
 )

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

        if (cache.startsWith("oratio-cache-") && cache !== CACHE_NAME) {
        return caches.delete(cache)
        }

        return Promise.resolve()

    })
    )

  })
 )

 self.clients.claim()

})

/* ============================= */
/* UPDATE */
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

 /*
 Só exclui o domínio da API (render.com) — chamadas pra /auth e
 /oratio já caem aqui por serem desse domínio. Excluir esses mesmos
 prefixos também no domínio do PRÓPRIO app (como era antes) apagava
 o fallback de navegação offline pra quase todas as rotas do SPA
 (praticamente tudo é /oratio/...), fazendo o app abrir com a tela de
 erro nativa do navegador em vez do app quando reaberto sem internet.
 */
 if (url.origin.includes("render.com")) {
    return
    }

 /* ============================= */
 /* NAVEGAÇÃO (React Router) */
 /* ============================= */

 if (
  request.mode === "navigate" ||
  request.destination === "document"
 ) {

  event.respondWith(

   (async () => {

    const cache = await caches.open(CACHE_NAME)

    try {

     /* tenta rede primeiro */
     const response = await fetch(request)

     return response

    } catch {

     /* fallback offline */
     const cachedIndex =
      await cache.match("/") ||
      await cache.match("/index.html")

     if (cachedIndex) return cachedIndex

     return Response.error()

    }

   })()

  )

  return

 }

 /* ============================= */
 /* CACHE ASSETS */
/* ============================= */

 const isAsset =
  request.destination === "style" ||
  request.destination === "script" ||
  request.destination === "image" ||
  request.destination === "font"

 if (!isAsset) return

 event.respondWith(

  caches.open(CACHE_NAME).then(async (cache) => {

   try {
    const response = await fetch(request)
    cache.put(request, response.clone())
    return response
    } catch {
    const cached = await cache.match(request)
    return cached
    }

  })

 )

})