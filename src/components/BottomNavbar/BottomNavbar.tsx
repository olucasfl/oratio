import { useNavigate, useLocation } from "react-router-dom"
import { createPortal } from "react-dom"
import { useState, useEffect } from "react"
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
import { isLoggedIn } from "../../utils/auth"
import GuestGateModal from "../GuestGateModal/GuestGateModal"

type NavItem = {
 label:string
 path:string
 icon:ComponentType<{ size?: number }>
 locked?:boolean
 gateMessage?:string
}

export default function BottomNavbar(){

 const navigate = useNavigate()
 const location = useLocation()

 const [gateMessage,setGateMessage] = useState<string | null>(null)
 const [bottomOffset,setBottomOffset] = useState(0)

 /*
 position:fixed;bottom:0 é relativo ao layout viewport, não ao que
 está realmente visível. Em PWA standalone, depois que a folha nativa
 de compartilhamento (navigator.share) fecha, o Android/iOS às vezes
 restaura o visual viewport com atraso — daí a navbar aparece
 "descolada" do rodapé real assim que a tela rola. Recalcula o offset
 pelo visualViewport e resincroniza ao voltar de background (share
 sheet, troca de app, etc.), em vez de confiar cegamente no fixed.
 */
 useEffect(()=>{

  const vv = window.visualViewport
  if(!vv) return

  function syncOffset(){
   const offset = window.innerHeight - (vv!.height + vv!.offsetTop)
   setBottomOffset(Math.max(0, Math.round(offset)))
  }

  syncOffset()

  vv.addEventListener("resize", syncOffset)
  vv.addEventListener("scroll", syncOffset)
  document.addEventListener("visibilitychange", syncOffset)
  window.addEventListener("pageshow", syncOffset)
  window.addEventListener("focus", syncOffset)

  return ()=>{
   vv.removeEventListener("resize", syncOffset)
   vv.removeEventListener("scroll", syncOffset)
   document.removeEventListener("visibilitychange", syncOffset)
   window.removeEventListener("pageshow", syncOffset)
   window.removeEventListener("focus", syncOffset)
  }

 },[])

 if(!isPWA()){
  return null
 }

 function isActive(path:string){
  return location.pathname.startsWith(path)
 }

 const leftItems:NavItem[] = [
  { label:"Bíblia", path:"/oratio/biblia", icon:BookOpen },
  {
   label:"Catecismo",
   path:"/oratio/catecismo",
   icon:Book,
   locked:true,
   gateMessage:"Crie uma conta para acessar o Catecismo completo."
  }
 ]

 const rightItems:NavItem[] = [
  {
   label:"VoxAI",
   path:"/oratio/vox",
   icon:MessageCircleHeart,
   locked:true,
   gateMessage:"Crie uma conta para conversar com o VoxAI, seu assistente espiritual católico."
  },
  {
   label:"Perfil",
   path:"/oratio/profile",
   icon:User,
   locked:true,
   gateMessage:"Crie uma conta para acessar seu perfil, salvar suas configurações e acompanhar seu progresso espiritual."
  }
 ]

 function handleItemClick(item:NavItem){

  if(item.locked && !isLoggedIn()){
   setGateMessage(item.gateMessage || "Crie uma conta para acessar essa área.")
   return
  }

  navigate(item.path)

 }

 function renderItem(item:NavItem){
  const Icon = item.icon
  const active = isActive(item.path)

  return (
   <button
    key={item.path}
    className={`${styles.item} ${active ? styles.active : ""}`}
    onClick={()=>handleItemClick(item)}
    aria-label={`Abrir ${item.label}`}
   >
    <Icon size={21}/>
    <span>{item.label}</span>
   </button>
  )
 }

 return createPortal(
  <>

  <nav
   className={styles.navbar}
   style={bottomOffset ? { bottom:bottomOffset } : undefined}
   aria-label="Navegação inferior"
  >
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

   <GuestGateModal
    open={gateMessage !== null}
    message={gateMessage || ""}
    onClose={()=>setGateMessage(null)}
   />

  </>,

  document.body

 )
}