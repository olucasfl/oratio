import { useNavigate, useLocation } from "react-router-dom"
import type { ComponentType } from "react"

import {
 BookOpen,
 User,
 MessageCircleHeart,
 Home,
 Book
} from "lucide-react"

import styles from "./BottomNavbar.module.css"

import { isPWA } from "../../utils/isPwa"

type NavItem = {
 label:string
 path:string
 icon:ComponentType<{ size?: number }>
}

export default function BottomNavbar(){

 const navigate = useNavigate()
 const location = useLocation()

 if(!isPWA()){
  return null
 }

 function isActive(path:string){
  return location.pathname.startsWith(path)
 }

 const leftItems:NavItem[] = [
  { label:"Bíblia", path:"/oratio/biblia", icon:BookOpen },
  { label:"Catecismo", path:"/oratio/catecismo", icon:Book }
 ]

 const rightItems:NavItem[] = [
  { label:"VoxAI", path:"/oratio/vox", icon:MessageCircleHeart },
  { label:"Perfil", path:"/oratio/profile", icon:User }
 ]

 function renderItem(item:NavItem){
  const Icon = item.icon
  const active = isActive(item.path)

  return (
   <button
    key={item.path}
    className={`${styles.item} ${active ? styles.active : ""}`}
    onClick={()=>navigate(item.path)}
    aria-label={`Abrir ${item.label}`}
   >
    <Icon size={21}/>
    <span>{item.label}</span>
   </button>
  )
 }

 return(
  <nav className={styles.navbar} aria-label="Navegação inferior">
    <div className={styles.side}>
      {leftItems.map(renderItem)}
    </div>

    <button
        className={`${styles.centerButton} ${isActive("/oratio/home") ? styles.centerActive : ""}`}
        onClick={()=>navigate("/oratio/home")}
        aria-label="Abrir início"
    >
        <Home size={26}/>
    </button>

    <div className={styles.side}>
      {rightItems.map(renderItem)}
    </div>

   </nav>

 )
}