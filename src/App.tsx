import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect, lazy, Suspense } from "react"
import ScrollToTop from "./components/ScrollToTop"

/* Sempre carregados (boot + guard) */
import Splash from "./components/Splash/Splash"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import OfflineBanner from "./components/OfflineBanner/OfflineBanner"
import PullToRefresh from "./components/PullToRefresh/PullToRefresh"
import InstallAppNudge from "./components/InstallAppNudge/InstallAppNudge"
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary"
import { preloadConsecration, getProgress } from "./services/consecrationService"
import { sendActivityPing } from "./services/activityService"
import { syncPushTimezone } from "./services/pushService"
import { useVisualViewportOffset } from "./hooks/useVisualViewportOffset"

/* Páginas carregadas sob demanda */
const Login            = lazy(() => import("./pages/Login/Login"))
const Register         = lazy(() => import("./pages/Register/Register"))
const VerifyEmail      = lazy(() => import("./pages/VerifyEmail/VerifyEmail"))
const ConfirmEmailChange = lazy(() => import("./pages/ConfirmEmailChange/ConfirmEmailChange"))
const Home             = lazy(() => import("./pages/Home/Home"))
const ConsecrationHome = lazy(() => import("./pages/Consecration/ConsecrationHome"))
const ConsecrationDay  = lazy(() => import("./pages/Consecration/ConsecrationDay"))
const ConsecrationFinal= lazy(() => import("./pages/Consecration/ConsecrationFinal"))
const ConsecrationCarta= lazy(() => import("./components/ConsecrationCarta/ConsecrationCarta"))
const Tratado          = lazy(() => import("./pages/Consecration/Tratado"))
const BibliaHome       = lazy(() => import("./pages/Biblia/BibliaHome"))
const BibliaBook       = lazy(() => import("./pages/Biblia/BibliaBook"))
const BibliaChapter    = lazy(() => import("./pages/Biblia/BibliaChapter"))
const MinhaBiblia      = lazy(() => import("./pages/Biblia/MinhaBiblia"))
const CollectionDetail = lazy(() => import("./pages/Biblia/CollectionDetail"))
const Vox              = lazy(() => import("./pages/Vox/Vox"))
const Profile          = lazy(() => import("./pages/Profile/Profile"))
const AccountSettings  = lazy(() => import("./pages/Profile/AccountSettings"))
const AdminPanel       = lazy(() => import("./pages/Profile/AdminPanel"))
const PrayersCategories= lazy(() => import("./pages/Prayers/PrayersCategories"))
const CategoryPrayers  = lazy(() => import("./pages/Prayers/CategoryPrayers"))
const Prayers          = lazy(() => import("./pages/Prayers/Prayers"))
const RosaryHome       = lazy(() => import("./pages/Prayers/RosaryHome"))
const RosaryPage       = lazy(() => import("./pages/Prayers/RosaryPage"))
const Catecismo        = lazy(() => import("./pages/Catecismo/Catecismo"))
const LiturgiaFull     = lazy(() => import("./pages/Liturgia/LiturgiaFull"))
const SantoDoDia       = lazy(() => import("./pages/SantoDoDia/SantoDoDia"))
const Confissao        = lazy(() => import("./pages/Confissao/Confissao"))
const Quaresma         = lazy(() => import("./pages/Quaresma/Quaresma"))
const QuaresmaDia      = lazy(() => import("./pages/Quaresma/QuaresmaDia"))

/*
Decide de forma declarativa (na hora do match da rota, sem efeito nem
navigate() imperativo — ver o comentário longo em startApp()) se /login
deve mostrar o formulário ou mandar quem já tem sessão de volta pra Home.
Um ?resetToken= na URL precisa continuar levando ao formulário mesmo com
um access_token velho/expirado salvo no aparelho.
*/
function LoginGate(){
  const hasToken = !!localStorage.getItem("access_token")
  const hasResetToken = new URLSearchParams(window.location.search).has("resetToken")

  if(hasToken && !hasResetToken){
    return <Navigate to="/oratio/home" replace />
  }

  return <Login />
}

function App(){

const [loading,setLoading] = useState(true)
const location = useLocation()
const navigate = useNavigate()

useVisualViewportOffset()

useEffect(()=>{

  /* ============================= */
  /* 🔥 VERSIONAMENTO DE CACHE */
  /* ============================= */

  const APP_VERSION = "v10"

  const savedVersion = localStorage.getItem("app_version")

  if (savedVersion !== APP_VERSION) {
    console.log(`Atualizando app para versão ${APP_VERSION}`)

    /* 🔥 LIMPA CACHE CRÍTICO */
    Object.keys(localStorage).forEach(key => {

      // Flags de "já vi isso uma vez" (ex.: aviso de estreia da Quaresma
      // de São Miguel) são permanentes por natureza, não cache de dados —
      // se entrassem nessa limpeza, o aviso voltaria a aparecer a cada
      // nova versão do app, mesmo pra quem já fechou ele há semanas.
      if (key.startsWith("oratio_quaresma_nudge_")) return

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
  /* APP BOOT LOADER */
  /* ============================= */

  const bootLoader = async () => {

    try{

      const token = localStorage.getItem("access_token")

      /* SE LOGADO */
      if(token){

        /* PRELOAD CONSAGRAÇÃO (recurso de conta) */
        await preloadConsecration().catch(()=>{})

        await getProgress().catch(()=>{})

        const lastPing = localStorage.getItem("last_ping")
        const now = Date.now()

        if (!lastPing || now - Number(lastPing) > 1000 * 60 * 10) {
          sendActivityPing().catch(()=>{})
          localStorage.setItem("last_ping", now.toString())
        }

        /* mantém o fuso da inscrição de push em dia (no-op se push desligado) */
        syncPushTimezone().catch(()=>{})

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

    /*
    A correção de "pra onde essa URL deveria ir" costumava morar aqui,
    feita com window.history.replaceState cru. Isso nunca funcionou de
    verdade: o <BrowserRouter> (main.tsx) só re-renderiza <Routes> quando
    o PRÓPRIO history interno do react-router muda — um replaceState
    direto no window.history troca a barra de endereço, mas o router
    nunca fica sabendo, então <Routes> continua casando contra a URL de
    ANTES da correção. Na prática isso fazia até a Home pública (path
    "/") cair no /login, porque a única rota que "/" de fato casava era
    o <Navigate to="/login"> do próprio catálogo de rotas — a correção
    daqui nunca chegava a valer.

    Tentar consertar isso com navigate() aqui dentro do efeito também não
    é confiável: a atualização do history do react-router passa por
    startTransition internamente (baixa prioridade) e pode perder a
    corrida contra o setLoading(false) da própria linha de baixo, então
    <Routes> ainda pode montar pela primeira vez com a localização velha.

    A correção de verdade é declarativa, não imperativa — ver as rotas
    "/" e "/login" logo abaixo, e ProtectedRoute (que já faz exatamente
    isso, de forma síncrona, pra qualquer rota que exige conta).
    */

    setLoading(false)
  }

  /* ============================= */
  /* INICIAR (sem atraso artificial — o splash some assim que o boot
     de verdade termina, não depois de um tempo mínimo fixo) */
  /* ============================= */

  startApp()

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
  // Bíblia (BibliaHome/BibliaBook) fica de fora de propósito: puxa
  // bibliaService, que carrega o texto bíblico inteiro (~5MB) — é o maior
  // chunk do build inteiro. Pré-carregar isso pra todo mundo, mesmo quem
  // nunca abre a Bíblia, gastava banda/bateria à toa. Continua lazy() nas
  // rotas normalmente, só não é mais forçado a baixar durante o boot.
  void import("./pages/Consecration/ConsecrationHome")
  void import("./pages/Consecration/ConsecrationDay")
  void import("./pages/Vox/Vox")
  void import("./pages/Catecismo/Catecismo")
  void import("./pages/Liturgia/LiturgiaFull")
  void import("./pages/Profile/Profile")
  void import("./pages/Quaresma/Quaresma")
  void import("./pages/Quaresma/QuaresmaDia")
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

<OfflineBanner />

<ScrollToTop />

<InstallAppNudge />

{/*
  Boundary por rota (key={location.pathname}): se uma página quebrar no
  render, só ela mostra o fallback — reiniciar a mesma boundary da raiz
  (main.tsx) derrubaria PullToRefresh/OfflineBanner/InstallAppNudge junto,
  mesmo eles não tendo nada a ver com o erro. Trocar de rota (o próprio
  botão "Voltar ao início" já faz isso via onReset) remonta a boundary
  automaticamente, então não fica presa depois que o usuário navega pra
  longe da página que quebrou.
*/}
<ErrorBoundary key={location.pathname} onReset={()=>navigate("/oratio/home")}>

<PullToRefresh>

<Routes>

<Route path="/" element={<Navigate to="/oratio/home" replace />} />

<Route path="/login" element={<LoginGate />} />

<Route path="/register" element={<Register />} />

<Route path="/verificar-email" element={<VerifyEmail />} />

<Route path="/confirmar-troca-email" element={<ConfirmEmailChange />} />

<Route
path="/oratio/home"
element={<Home />}
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
path="/oratio/consecration/day/:day"
element={
<ProtectedRoute>
<ConsecrationDay />
</ProtectedRoute>
}
/>

<Route
  path="/oratio/consecration/finalizacao"
  element={
    <ProtectedRoute>
      <ConsecrationFinal />
    </ProtectedRoute>
  }
/>

<Route
  path="/oratio/consecration/carta"
  element={
    <ProtectedRoute>
      <ConsecrationCarta />
    </ProtectedRoute>
  }
/>

<Route path="/oratio/prayers" element={<PrayersCategories/>}/>

<Route path="/oratio/prayers/:slug" element={<CategoryPrayers/>}/>

<Route
 path="/oratio/prayer/:id"
 element={<Prayers/>}
/>

<Route
 path="/oratio/rosary"
 element={<RosaryHome/>}
/>

<Route
 path="/oratio/rosary/:type"
 element={<RosaryPage/>}
/>

<Route path="/oratio/biblia" element={<BibliaHome/>}/>
<Route path="/oratio/biblia/minha" element={<MinhaBiblia/>}/>
<Route path="/oratio/biblia/colecao/:id" element={<CollectionDetail/>}/>
<Route path="/oratio/biblia/:book" element={<BibliaBook/>}/>
<Route path="/oratio/biblia/:book/:chapter" element={<BibliaChapter/>}/>

<Route
 path="/oratio/catecismo"
 element={
  <ProtectedRoute>
   <Catecismo />
  </ProtectedRoute>
 }
/>

<Route path="/oratio/tratado" element={<Tratado />} />

<Route path="/oratio/liturgia-completa" element={<LiturgiaFull />} />

<Route
 path="/oratio/santo-do-dia"
 element={
  <ProtectedRoute>
   <SantoDoDia />
  </ProtectedRoute>
 }
/>

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
 path="/oratio/profile/settings"
 element={
  <ProtectedRoute>
   <AccountSettings/>
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

<Route
 path="/oratio/quaresma"
 element={
  <ProtectedRoute>
   <Quaresma/>
  </ProtectedRoute>
 }
/>

<Route
 path="/oratio/quaresma/dia/:day"
 element={
  <ProtectedRoute>
   <QuaresmaDia/>
  </ProtectedRoute>
 }
/>

<Route path="*" element={<Navigate to="/login" replace />} />

</Routes>

</PullToRefresh>

</ErrorBoundary>

</Suspense>

)

}

export default App