import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

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

   <Route path="*" element={<Navigate to="/login" replace />} />

  </Routes>

 )

}

export default App;