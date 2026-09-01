const CACHE_NAME = "oratio-cache-v22"

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
   Pré-cacheia TODOS os chunks JS/CSS do build atual, não só os poucos
   referenciados direto no index.html. A lista vem de
   /asset-manifest.json (gerado pelo Vite no build). Sem isso, abrir o
   app offline numa rota cujo chunk nunca foi carregado em runtime
   antes (ex: visitou o app uma vez mas nunca entrou no Terço) quebra
   com "Algo deu errado" — o import() daquele chunk falha sem rede e
   sem cache, e isso escapa como erro não tratado pro ErrorBoundary.
   Usa Promise.allSettled (não addAll) pra um chunk individual falhar
   não derrubar o precache inteiro dos outros 70+.
   */
   try {

    const res = await fetch("/asset-manifest.json")
    const manifest = await res.json()

    const urls = new Set()

    for (const entry of Object.values(manifest)) {
     if (entry.file) urls.add("/" + entry.file)
     if (Array.isArray(entry.css)) {
      entry.css.forEach((f) => urls.add("/" + f))
     }
    }

    await Promise.allSettled(
     Array.from(urls).map(async (url) => {
      try {
       const assetRes = await fetch(url)
       if (assetRes.ok) await cache.put(url, assetRes)
      } catch {
       // ignora individualmente — o cache em runtime ainda cobre depois
      }
     })
    )

   } catch {
    // se o manifest não existir/falhar, o cache em runtime dos assets
    // ainda cobre as rotas conforme forem visitadas
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
 /* SÓ RECURSOS DO PRÓPRIO APP */
 /* ============================= */

 /*
 O SW só gerencia recursos servidos do mesmo origin do app. Qualquer
 coisa de terceiros (fontes do Google, etc.) passa direto pro navegador.

 Por que: um <link rel="stylesheet"> cross-origin (ex.: fonts.googleapis.com)
 é buscado em modo "no-cors", então o SW recebe uma resposta OPACA. Servir
 essa resposta opaca de volta pra página faz o navegador NÃO aplicar o CSS
 — as fontes Cinzel / Cormorant Garamond sumiam e tudo caía pra serifa do
 sistema. Deixando o navegador buscar direto, volta a funcionar como antes.
 */
 if (url.origin !== self.location.origin) {
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


/* ============================= */
/* PUSH (notificações) */
/* ============================= */

/*
Recebe o payload JSON { title, body, url, icon } do backend e mostra
a notificação do sistema. Fora do app, é o próprio SO que exibe.
*/
self.addEventListener("push", (event) => {

 if (!event.data) return

 let title = "Oratio"
 let body = ""
 let url = "/oratio/home"
 let icon = "/icon-192.png"
 let tag = null

 try {
  const data = event.data.json()
  title = data.title || title
  body = data.body || body
  if (data.url) url = data.url
  if (data.icon) icon = data.icon
  if (data.tag) tag = data.tag
 } catch {
  body = event.data.text()
 }

 /*
 Tag ÚNICA por notificação (a menos que o backend mande uma `tag`
 explícita pra agrupar). Antes todas usavam o mesmo tag fixo, então
 uma nova SUBSTITUÍA a anterior — só dava pra ver uma por vez.
 */
 const finalTag = tag || `oratio-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

 event.waitUntil(
  self.registration.showNotification(title, {
   body,
   icon,
   badge: "/icon-192.png",
   tag: finalTag,
   renotify: true,
   data: { url }
  })
 )

})

/* Clique na notificação — foca o app aberto ou abre no destino */
self.addEventListener("notificationclick", (event) => {

 event.notification.close()

 const targetUrl =
  (event.notification.data && event.notification.data.url) || "/oratio/home"

 event.waitUntil(
  self.clients
   .matchAll({ type: "window", includeUncontrolled: true })
   .then((clientList) => {

    for (const client of clientList) {
     if ("focus" in client) {
      client.focus()
      if ("navigate" in client) {
       try { client.navigate(targetUrl) } catch (e) { /* noop */ }
      }
      return
     }
    }

    return self.clients.openWindow(targetUrl)

   })
 )

})