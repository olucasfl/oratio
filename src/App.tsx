import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";

import ProtectedRoute from "./components/ProtectedRoute";

import ConsecrationHome from "./pages/Consecration/ConsecrationHome"
import ConsecrationDay from "./pages/Consecration/ConsecrationDay"
import ConsecrationStage from "./pages/Consecration/ConsecrationStage"

import Splash from "./components/Splash/Splash"

function App(){

const [loading,setLoading] = useState(true)

useEffect(()=>{

setTimeout(()=>{

setLoading(false)

},1200)

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

<Route path="*" element={<Navigate to="/login" replace />} />

</Routes>

)

}

export default App