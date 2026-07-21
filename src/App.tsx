import { Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect, lazy, Suspense } from "react"
import ScrollToTop from "./components/ScrollToTop"

/* Sempre carregados (boot + guard) */
import Splash from "./components/Splash/Splash"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import { preloadConsecration, getProgress } from "./services/consecrationService"
import { sendActivityPing } from "./services/activityService"

/* Páginas carregadas sob demanda */
const Login            = lazy(() => import("./pages/Login/Login"))
const Register         = lazy(() => import("./pages/Register/Register"))
const VerifyEmail      = lazy(() => import("./pages/VerifyEmail/VerifyEmail"))
const Home             = lazy(() => import("./pages/Home/Home"))
const ConsecrationHome = lazy(() => import("./pages/Consecration/ConsecrationHome"))
const ConsecrationDay  = lazy(() => import("./pages/Consecration/ConsecrationDay"))
const ConsecrationStage= lazy(() => import("./pages/Consecration/ConsecrationStage"))
const ConsecrationFinal= lazy(() => import("./pages/Consecration/ConsecrationFinal"))
const ConsecrationCarta= lazy(() => import("./components/ConsecrationCarta/ConsecrationCarta"))
const Tratado          = lazy(() => import("./pages/Consecration/Tratado"))
const BibliaHome       = lazy(() => import("./pages/Biblia/BibliaHome"))
const BibliaBook       = lazy(() => import("./pages/Biblia/BibliaBook"))
const BibliaChapter    = lazy(() => import("./pages/Biblia/BibliaChapter"))
const Vox              = lazy(() => import("./pages/Vox/Vox"))
const Profile          = lazy(() => import("./pages/Profile/Profile"))
const AdminPanel       = lazy(() => import("./pages/Profile/AdminPanel"))
const PrayersCategories= lazy(() => import("./pages/Prayers/PrayersCategories"))
const CategoryPrayers  = lazy(() => import("./pages/Prayers/CategoryPrayers"))
const Prayers          = lazy(() => import("./pages/Prayers/Prayers"))
const RosaryHome       = lazy(() => import("./pages/Prayers/RosaryHome"))
const RosaryPage       = lazy(() => import("./pages/Prayers/RosaryPage"))
const RosaryHistory    = lazy(() => import("./pages/Prayers/RosaryHistory"))
const Catecismo        = lazy(() => import("./pages/Catecismo/Catecismo"))
const LiturgiaFull     = lazy(() => import("./pages/Liturgia/LiturgiaFull"))
const SantoDoDia       = lazy(() => import("./pages/SantoDoDia/SantoDoDia"))
const Journey          = lazy(() => import("./pages/Journey/Journey"))
const Confissao        = lazy(() => import("./pages/Confissao/Confissao"))

function App(){

const [loading,setLoading] = useState(true)

useEffect(()=>{

  /* ============================= */
  /* 🔥 VERSIONAMENTO DE CACHE */
  /* ============================= */

  const APP_VERSION = "v7"

  const savedVersion = localStorage.getItem("app_version")

  if (savedVersion !== APP_VERSION) {
    console.log(`Atualizando app para versão ${APP_VERSION}`)

    /* 🔥 LIMPA CACHE CRÍTICO */
    Object.keys(localStorage).forEach(key => {
      if (
        key.includes("oratio") ||
        key.includes("stage_") ||
        key.includes("consecration")
      ) {
        localStorage.removeItem(key)
      }
    })

    localStorage.setItem("app_version", APP_VERSION)
  }

  /* ============================= */
  /* DETECTAR PWA */
  /* ============================= */

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true

  /* ============================= */
  /* APP BOOT LOADER */
  /* ============================= */

  const bootLoader = async () => {

    try{

      const token = localStorage.getItem("access_token")

      /* PRELOAD CONSAGRAÇÃO */
      await preloadConsecration().catch(()=>{})

      /* SE LOGADO */
      if(token){

        await getProgress().catch(()=>{})

        const lastPing = localStorage.getItem("last_ping")
        const now = Date.now()

        if (!lastPing || now - Number(lastPing) > 1000 * 60 * 10) {
          sendActivityPing().catch(()=>{})
          localStorage.setItem("last_ping", now.toString())
        }

      }

    }catch{
      console.log("Erro ao iniciar aplicativo")
    }

  }

  /* ============================= */
  /* INICIAR APP */
  /* ============================= */

  const startApp = async () => {
    await bootLoader()

    // Corrige o URL enquanto o splash ainda está cobrindo a tela,
    // evitando que as rotas pisquem na posição errada ao renderizar.
    const token = localStorage.getItem("access_token")
    const path  = window.location.pathname

    // Páginas públicas que não devem ser trocadas por /login, mesmo sem token
    const publicPaths = ["/login", "/register", "/verificar-email"]

    // Se veio de um link de reset de senha, não pode perder o ?resetToken=
    // mesmo que exista um access_token antigo/expirado salvo no aparelho
    const hasResetToken = new URLSearchParams(window.location.search).has("resetToken")

    if (!token) {
      if (!publicPaths.includes(path)) {
        window.history.replaceState(null, "", "/login")
      }
    } else {
      if ((path === "/" || path === "/login") && !hasResetToken) {
        window.history.replaceState(null, "", "/oratio/home")
      }
    }

    setLoading(false)
  }

  /* ============================= */
  /* SPLASH */
  /* ============================= */

  if(isStandalone){

    const timer = setTimeout(()=>{
      startApp()
    },2500)

    return () => clearTimeout(timer)

  }else{

    startApp()

  }

},[])


/* =================================
PRELOAD ROUTES (durante o splash)
================================= */

useEffect(()=>{
  void import("./pages/Home/Home")
  void import("./pages/Confissao/Confissao")
  void import("./pages/Prayers/PrayersCategories")
  void import("./pages/Prayers/CategoryPrayers")
  void import("./pages/Prayers/Prayers")
  void import("./pages/Prayers/RosaryHome")
  void import("./pages/Biblia/BibliaHome")
  void import("./pages/Biblia/BibliaBook")
  void import("./pages/Consecration/ConsecrationHome")
  void import("./pages/Consecration/ConsecrationDay")
  void import("./pages/Vox/Vox")
  void import("./pages/Catecismo/Catecismo")
  void import("./pages/Liturgia/LiturgiaFull")
  void import("./pages/Journey/Journey")
  void import("./pages/Profile/Profile")
},[]) // roda 1x na montagem, enquanto o splash ainda está visível

/* =================================
SPLASH
================================= */

if(loading){
 return <Splash/>
}


/* =================================
ROTAS
================================= */

return(

<Suspense fallback={<div className="oratio-loading" />}>

<ScrollToTop />

<Routes>

<Route path="/" element={<Navigate to="/login" replace />} />

<Route path="/login" element={<Login />} />

<Route path="/register" element={<Register />} />

<Route path="/verificar-email" element={<VerifyEmail />} />

<Route
path="/oratio/home"
element={
<ProtectedRoute>
<Home />
</ProtectedRoute>
}
/>

<Route
path="/oratio/consecration"
element={
<ProtectedRoute>
<ConsecrationHome />
</ProtectedRoute>
}
/>

<Route
path="/oratio/consecration/stage/:stageId"
element={
<ProtectedRoute>
<ConsecrationStage/>
</ProtectedRoute>
}
/>

<Route
path="/oratio/consecration/day/:day"
element={
<ProtectedRoute>
<ConsecrationDay />
</ProtectedRoute>
}
/>

<Route
  path="/oratio/consecration/finalizacao"
  element={<ConsecrationFinal />}
/>

<Route
  path="/oratio/consecration/carta"
  element={< ConsecrationCarta />}
/>

<Route path="/oratio/prayers" element={<PrayersCategories/>}/>

<Route path="/oratio/prayers/:slug" element={<CategoryPrayers/>}/>

<Route
 path="/oratio/prayer/:id"
 element={
  <ProtectedRoute>
   <Prayers/>
  </ProtectedRoute>
 }
/>

<Route
 path="/oratio/rosary"
 element={<RosaryHome/>}
/>

<Route
 path="/oratio/rosary/history"
 element={<RosaryHistory/>}
/>

<Route
 path="/oratio/rosary/:type"
 element={<RosaryPage/>}
/>

<Route path="/oratio/biblia" element={<BibliaHome/>}/>
<Route path="/oratio/biblia/:book" element={<BibliaBook/>}/>
<Route path="/oratio/biblia/:book/:chapter" element={<BibliaChapter/>}/>

<Route path="/oratio/catecismo" element={<Catecismo />} />

<Route path="/oratio/tratado" element={<Tratado />} />

<Route path="/oratio/liturgia-completa" element={<LiturgiaFull />} />

<Route path="/oratio/santo-do-dia" element={<SantoDoDia />} />

<Route
 path="/oratio/vox"
 element={
  <ProtectedRoute>
   <Vox/>
  </ProtectedRoute>
 }
/>

<Route
 path="/oratio/profile"
 element={
  <ProtectedRoute>
   <Profile/>
  </ProtectedRoute>
 }
/>

<Route
 path="/oratio/admin"
 element={
  <ProtectedRoute>
   <AdminRoute>
    <AdminPanel/>
   </AdminRoute>
  </ProtectedRoute>
 }
/>

<Route
 path="/oratio/confissao"
 element={
  <ProtectedRoute>
   <Confissao/>
  </ProtectedRoute>
 }
/>

<Route path="*" element={<Navigate to="/login" replace />} />

<Route
 path="/oratio/journey"
 element={
  <ProtectedRoute>
   <Journey/>
  </ProtectedRoute>
 }
/>

</Routes>

</Suspense>

)

}

export default App