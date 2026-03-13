const CACHE_NAME = "oratio-cache-v8"

/* ============================= */
/* APP SHELL */
/* ============================= */

const APP_SHELL = [
 "/",
 "/index.html"
]

/* ============================= */
/* INSTALL */
/* ============================= */

self.addEventListener("install",(event)=>{

 console.log("Service Worker instalado")

 event.waitUntil(

  caches.open(CACHE_NAME).then((cache)=>{

   return cache.addAll(APP_SHELL)

  })

 )

 self.skipWaiting()

})

/* ============================= */
/* ACTIVATE */
/* ============================= */

self.addEventListener("activate",(event)=>{

 console.log("Service Worker ativo")

 event.waitUntil(

  caches.keys().then((cacheNames)=>{

   return Promise.all(

    cacheNames.map((cache)=>{

     if(cache !== CACHE_NAME){

      console.log("Removendo cache antigo:",cache)

      return caches.delete(cache)

     }

    })

   )

  })

 )

 self.clients.claim()

})

/* ============================= */
/* UPDATE */
/* ============================= */

self.addEventListener("message",(event)=>{

 if(event.data && event.data.type === "SKIP_WAITING"){

  console.log("Atualizando Service Worker")

  self.skipWaiting()

 }

})

/* ============================= */
/* FETCH */
/* ============================= */

self.addEventListener("fetch",(event)=>{

 const request = event.request

 if(request.method !== "GET") return

 const url = new URL(request.url)

 /* ignorar protocolos estranhos */

 if(url.protocol !== "http:" && url.protocol !== "https:"){
  return
 }

 /* ============================= */
 /* NÃO CACHEAR API */
 /* ============================= */

 if(
  url.pathname.startsWith("/auth") ||
  url.origin.includes("render.com") ||
  url.origin.includes("vercel.app")
 ){
  return
 }

 /* ============================= */
 /* NAVEGAÇÃO (ROTAS REACT) */
 /* ============================= */

 if(request.mode === "navigate"){

  event.respondWith(

   fetch(request).catch(()=>{

    return caches.match("/index.html")

   })

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

 if(!isAsset) return

 /* ============================= */
 /* STALE WHILE REVALIDATE */
 /* ============================= */

 event.respondWith(

  caches.open(CACHE_NAME).then(async(cache)=>{

   const cached = await cache.match(request)

   const network = fetch(request)
    .then((response)=>{

     cache.put(request,response.clone())

     return response

    })
    .catch(()=>cached)

   return cached || network

  })

 )

})