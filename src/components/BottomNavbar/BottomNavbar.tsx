import { useNavigate, useLocation } from "react-router-dom"

import {
 BookOpen,
 User,
 MessageCircleHeart,
 HandHeart,
 Home
} from "lucide-react"

import styles from "./BottomNavbar.module.css"

import { isPWA } from "../../utils/isPwa"

export default function BottomNavbar(){

 const navigate = useNavigate()
 const location = useLocation()

if(!isPWA()){
    return null
}

 function isActive(path:string){
  return location.pathname.startsWith(path)
 }

 return(

  <nav className={styles.navbar}>

   {/* BÍBLIA */}
   <button
    className={`${styles.item} ${isActive("/oratio/biblia") ? styles.active : ""}`}
    onClick={()=>navigate("/oratio/biblia")}
   >
    <BookOpen size={22}/>
    <span>Bíblia</span>
   </button>


   {/* ORAÇÕES */}
   <button
    className={`${styles.item} ${isActive("/oratio/prayers") ? styles.active : ""}`}
    onClick={()=>navigate("/oratio/prayers")}
   >
    <HandHeart size={22}/>
    <span>Orações</span>
   </button>


   {/* ESPAÇO DO BOTÃO CENTRAL */}
   <div></div>


   {/* VOX */}
   <button
    className={`${styles.item} ${isActive("/oratio/vox") ? styles.active : ""}`}
    onClick={()=>navigate("/oratio/vox")}
   >
    <MessageCircleHeart size={22}/>
    <span>VoxAI</span>
   </button>


   {/* PERFIL */}
   <button
    className={`${styles.item} ${isActive("/oratio/profile") ? styles.active : ""}`}
    onClick={()=>navigate("/oratio/profile")}
   >
    <User size={22}/>
    <span>Perfil</span>
   </button>


   {/* BOTÃO CENTRAL HOME */}
   <button
    className={`${styles.centerButton} ${isActive("/oratio/home") ? styles.centerActive : ""}`}
    onClick={()=>navigate("/oratio/home")}
   >
    <Home size={26}/>
   </button>

  </nav>

 )
}