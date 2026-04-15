import { Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"

import Login from "./pages/Login/Login"
import Register from "./pages/Register/Register"
import Home from "./pages/Home/Home"

import ProtectedRoute from "./components/ProtectedRoute"

import ConsecrationHome from "./pages/Consecration/ConsecrationHome"
import ConsecrationDay from "./pages/Consecration/ConsecrationDay"
import ConsecrationStage from "./pages/Consecration/ConsecrationStage"

import BibliaHome from "./pages/Biblia/BibliaHome"
import BibliaBook from "./pages/Biblia/BibliaBook"
import BibliaChapter from "./pages/Biblia/BibliaChapter"

import Vox from "./pages/Vox/Vox"

import Splash from "./components/Splash/Splash"
import Profile from "./pages/Profile/Profile"
import AdminPanel from "./pages/Profile/AdminPanel"

/* services */

import { preloadConsecration, getProgress } from "./services/consecrationService"
import PrayersCategories from "./pages/Prayers/PrayersCategories"
import CategoryPrayers from "./pages/Prayers/CategoryPrayers"
import Prayers from "./pages/Prayers/Prayers"
import RosaryHome from "./pages/Prayers/RosaryHome"
import RosaryPage from "./pages/Prayers/RosaryPage"
import Catecismo from "./pages/Catecismo/Catecismo"
import Tratado from "./pages/Consecration/Tratado"
import { sendActivityPing } from "./services/activityService"

function App(){

const [loading,setLoading] = useState(true)

useEffect(()=>{

  /* ============================= */
  /* 🔥 VERSIONAMENTO DE CACHE */
  /* ============================= */

  const APP_VERSION = "v4"

  const savedVersion = localStorage.getItem("app_version")

  if (savedVersion !== APP_VERSION) {
  console.log(`Atualizando app para versão ${APP_VERSION}`)

  localStorage.removeItem("last_liturgy")

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
      preloadConsecration().catch(()=>{})

      /* SE LOGADO */
      if(token){

        getProgress().catch(()=>{})

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
SPLASH
================================= */

if(loading){
 return <Splash/>
}


/* =================================
ROTAS
================================= */

return(

<Routes>

<Route path="/" element={<Navigate to="/login" replace />} />

<Route path="/login" element={<Login />} />

<Route path="/register" element={<Register />} />

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
 path="/oratio/rosary/:type"
 element={<RosaryPage/>}
/>

<Route path="/oratio/biblia" element={<BibliaHome/>}/>
<Route path="/oratio/biblia/:book" element={<BibliaBook/>}/>
<Route path="/oratio/biblia/:book/:chapter" element={<BibliaChapter/>}/>

<Route path="/oratio/catecismo" element={<Catecismo />} />

<Route path="/oratio/tratado" element={<Tratado />} />

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
   <AdminPanel/>
  </ProtectedRoute>
 }
/>

<Route path="*" element={<Navigate to="/login" replace />} />

</Routes>

)

}

export default App