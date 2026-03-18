import { useNavigate, useLocation } from "react-router-dom"

import {
 BookOpen,
 User,
 MessageCircleHeart,
 Home,
 Book
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

    {/* LADO ESQUERDO */}
    <div className={styles.side}>
        <button
        className={`${styles.item} ${isActive("/oratio/biblia") ? styles.active : ""}`}
        onClick={()=>navigate("/oratio/biblia")}
        >
        <BookOpen size={22}/>
        <span>Bíblia</span>
        </button>

        <button
        className={`${styles.item} ${isActive("/oratio/catecismo") ? styles.active : ""}`}
        onClick={()=>navigate("/oratio/catecismo")}
        >
        <Book size={22}/>
        <span>Catecismo</span>
        </button>
    </div>

    {/* LADO DIREITO */}
    <div className={styles.side}>
        <button
        className={`${styles.item} ${isActive("/oratio/vox") ? styles.active : ""}`}
        onClick={()=>navigate("/oratio/vox")}
        >
        <MessageCircleHeart size={22}/>
        <span>VoxAI</span>
        </button>

        <button
        className={`${styles.item} ${isActive("/oratio/profile") ? styles.active : ""}`}
        onClick={()=>navigate("/oratio/profile")}
        >
        <User size={22}/>
        <span>Perfil</span>
        </button>
    </div>

    {/* BOTÃO CENTRAL */}
    <button
        className={`${styles.centerButton} ${isActive("/oratio/home") ? styles.centerActive : ""}`}
        onClick={()=>navigate("/oratio/home")}
    >
        <Home size={26}/>
    </button>

   </nav>

 )
}