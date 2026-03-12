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

/* services */

import { preloadConsecration, getProgress } from "./services/consecrationService"

function App(){

const [loading,setLoading] = useState(true)

useEffect(()=>{

const isStandalone =
window.matchMedia("(display-mode: standalone)").matches ||
(window.navigator as any).standalone === true


/* =================================
APP BOOT LOADER
================================= */

const bootLoader = async () => {

 try{

  const token = localStorage.getItem("access_token")

  /* =================================
  PRELOAD CONSAGRAÇÃO (sempre)
  ================================= */

  preloadConsecration().catch(()=>{})

  /* =================================
  SE USUÁRIO LOGADO
  CARREGA PROGRESSO
  ================================= */

  if(token){

   getProgress().catch(()=>{})

  }

 }catch{

  console.log("Erro ao iniciar aplicativo")

 }

}


/* =================================
INICIAR APP
================================= */

const startApp = async () => {

 await bootLoader()

 setLoading(false)

}


/* =================================
SPLASH APENAS NO PWA
================================= */

if(isStandalone){

 const timer = setTimeout(()=>{

  startApp()

 },1200)

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

<Route path="/oratio/biblia" element={<BibliaHome/>}/>
<Route path="/oratio/biblia/:book" element={<BibliaBook/>}/>
<Route path="/oratio/biblia/:book/:chapter" element={<BibliaChapter/>}/>

<Route path="/oratio/vox" element={<Vox/>}/>

<Route
 path="/oratio/profile"
 element={
  <ProtectedRoute>
   <Profile/>
  </ProtectedRoute>
 }
/>

<Route path="*" element={<Navigate to="/login" replace />} />

</Routes>

)

}

export default App