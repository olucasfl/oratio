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

function App(){

const [loading,setLoading] = useState(true)

useEffect(()=>{

/* detectar se o app está rodando como PWA */

const isStandalone =
window.matchMedia("(display-mode: standalone)").matches ||
(window.navigator as any).standalone === true

/* mostrar splash apenas no app instalado */

if(isStandalone){

const timer = setTimeout(()=>{
setLoading(false)
},1200)

return () => clearTimeout(timer)

}else{

setLoading(false)

}

},[])

if(loading){
return <Splash/>
}

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