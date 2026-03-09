import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";

function App(){

 return(

  <Routes>

   <Route path="/" element={<Navigate to="/login"/>} />

   <Route path="/login" element={<Login/>}/>
   <Route path="/register" element={<Register/>}/>

   <Route path="/oratio/home" element={<Home/>}/>

  </Routes>

 )

}

export default App;