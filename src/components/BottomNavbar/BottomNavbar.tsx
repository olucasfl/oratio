import { useNavigate, useLocation } from "react-router-dom"
import { createPortal } from "react-dom"
import { useState, useEffect, useRef } from "react"
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

 const navRef = useRef<HTMLElement | null>(null)

 /*
 Depois que a folha nativa de compartilhamento (navigator.share) fecha,
 alguns navegadores (principalmente Android/WebView em PWA standalone)
 não repintam a navbar position:fixed corretamente até o próximo
 evento de scroll/resize — ela fica "grudada"/oscilando numa posição
 antiga por um instante.

 Duas tentativas anteriores não resolveram:
 1) recalcular um "bottom" customizado pelo visualViewport em cada
    evento resize/scroll — mas o visualViewport dispara VÁRIOS resizes
    intermediários enquanto a sheet nativa termina de fechar, cada um
    gerando um valor diferente, e cada re-render aplicava um "bottom"
    novo → isso QUE causava a navbar "subindo e descendo".
 2) rolar a página pro mesmo lugar (scrollTo) pra forçar recálculo —
    não tem efeito nenhum em telas sem conteúdo rolável (ex: Home),
    e ainda corria o risco do mesmo problema se mais de um dos três
    eventos (visibilitychange/pageshow/focus) disparasse em sequência,
    cada um agendando sua própria correção por cima da anterior.

 A correção agora é direta na própria navbar, não na página: força um
 reflow síncrono do elemento (lendo offsetHeight entre remover e
 reaplicar o "display"), o que faz o navegador recalcular o
 position:fixed dela contra o viewport atual sem depender de haver
 conteúdo pra rolar. Um guard evita que os três listeners disparem a
 correção mais de uma vez em sequência, e uma segunda tentativa depois
 de 300ms cobre o caso da sheet ainda estar terminando de fechar na
 primeira.
 */
 useEffect(()=>{

  let pending = false

  function forceReflow(){

   const el = navRef.current
   if(!el) return

   el.style.display = "none"
   void el.offsetHeight // lê o layout — força o navegador a aplicar o "none" antes de reverter
   el.style.display = ""

  }

  function nudge(){

   if(pending) return
   pending = true

   requestAnimationFrame(()=>{
    forceReflow()
    setTimeout(()=>{
     forceReflow()
     pending = false
    }, 300)
   })

  }

  document.addEventListener("visibilitychange", nudge)
  window.addEventListener("pageshow", nudge)
  window.addEventListener("focus", nudge)

  return ()=>{
   document.removeEventListener("visibilitychange", nudge)
   window.removeEventListener("pageshow", nudge)
   window.removeEventListener("focus", nudge)
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

  <nav ref={navRef} className={styles.navbar} aria-label="Navegação inferior">
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