const CACHE_NAME = "oratio-cache-v17"

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

  (async () => {

   const cache = await caches.open(CACHE_NAME)

   await cache.addAll(APP_SHELL)

   /*
   Cacheia também os JS/CSS de verdade que o index.html atual
   referencia (com o hash do build). Sem isso, o index.html cacheado
   podia apontar pra um chunk que só seria cacheado depois, em
   runtime, se e quando alguém de fato o carregasse — se a pessoa
   fechasse o app antes disso e reabrisse offline, dava tela branca
   (index.html carregava, mas o script principal não existia no
   cache e não tinha rede pra buscar). Fazendo isso aqui, no install,
   o essencial pra abrir o app já fica garantido de primeira.
   */
   try {

    const res = await fetch("/index.html")
    const html = await res.text()

    const urls = Array.from(
     html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)
    ).map((m) => m[1])

    if (urls.length) {
     await cache.addAll(urls)
    }

   } catch {
    // se falhar aqui, o cache em runtime dos assets ainda cobre depois
   }

  })()

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

 /*
 Além do destination clássico, cobre qualquer coisa servida de
 /assets/ — module preload e outros tipos de carregamento de JS nem
 sempre batem com destination "script" em todo navegador, e isso
 fazia alguns chunks nunca serem cacheados mesmo depois de usados.
 */
 const isAsset =
  request.destination === "style" ||
  request.destination === "script" ||
  request.destination === "image" ||
  request.destination === "font" ||
  url.pathname.startsWith("/assets/")

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