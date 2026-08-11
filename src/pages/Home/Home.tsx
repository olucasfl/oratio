import styles from "./Home.module.css"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useEffect, useMemo, useCallback, useState } from "react"
import { createPortal } from "react-dom"
import type { ComponentType } from "react"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

import MenuDrawer
from "../../components/MenuDrawer/MenuDrawer"

import GuestWelcomeModal
from "../../components/GuestWelcomeModal/GuestWelcomeModal"

import GuestGateModal
from "../../components/GuestGateModal/GuestGateModal"

import {
 LogOut,
 Loader2,
 User,
 LogIn,
 UserPlus,
 Sparkles,
 ChevronRight,
 Calendar,
 Flame,
 Circle,
 HandHeart,
 Bell,
 Heart,
 Cross,
 BookOpen,
 Book,
 MessageCircleHeart,
 Sun,
 Moon
} from "lucide-react"

import { isPWA } from "../../utils/isPwa"

import { isLoggedIn } from "../../utils/auth"

import { logout as authLogout } from "../../services/authService"

import {
 preloadConsecration,
 getProgress
} from "../../services/consecrationService"

import { getProfile } from "../../services/profileService"

import { getHomeFeed } from "../../services/homeService"
import type { HomeSuggestion } from "../../services/homeService"

import {
 getSaudacao,
 getDataLonga,
 getMomento,
 getMomentoConvite,
 getFraseDoMomento
} from "../../utils/greeting"

import { FraseDiaria } from "../../components/FraseDiaria/FraseDiaria"

import LiturgyCard from "../../components/LiturgyCard/LiturgyCard"

import { useLiturgy } from "../../hooks/useLiturgy"

import { usePullToRefresh } from "../../hooks/usePullToRefresh"

/* =========================
TIPAGENS
========================= */

type Shortcut = {
 label:string
 path:string
 icon:ComponentType<{ size?: number }>
 locked?:boolean
 gateMessage?:string
}

/* =========================
ATALHOS (todos os recursos)
========================= */

const SHORTCUTS:Shortcut[] = [
 { label:"Liturgia", path:"/oratio/liturgia-completa", icon:Calendar },
 { label:"Santo do dia", path:"/oratio/santo-do-dia", icon:Flame, locked:true,
   gateMessage:"Crie uma conta para ver os detalhes do Santo do Dia." },
 { label:"Terço", path:"/oratio/rosary", icon:Circle },
 { label:"Orações", path:"/oratio/prayers", icon:HandHeart },
 { label:"Consagração", path:"/oratio/consecration", icon:Heart, locked:true,
   gateMessage:"Crie uma conta para iniciar a Consagração de 33 dias e acompanhar seu progresso." },
 { label:"Confissão", path:"/oratio/confissao", icon:Cross, locked:true,
   gateMessage:"Crie uma conta para acessar o Guia de Confissão." },
 { label:"Bíblia", path:"/oratio/biblia", icon:BookOpen },
 { label:"Catecismo", path:"/oratio/catecismo", icon:Book, locked:true,
   gateMessage:"Crie uma conta para acessar o Catecismo completo." },
 { label:"VoxAI", path:"/oratio/vox", icon:MessageCircleHeart, locked:true,
   gateMessage:"Crie uma conta para conversar com o VoxAI, seu assistente espiritual católico." }
]

/* =========================
COMPONENTE
========================= */

export default function Home(){

 const navigate = useNavigate()

 const [searchParams] = useSearchParams()

 const pwa = isPWA()

 const guest = !isLoggedIn()

 const [showWelcome, setShowWelcome] = useState(false)

 const [gateMessage, setGateMessage] = useState<string | null>(null)

 const [userName, setUserName] = useState<string | null>(null)

 const [progress, setProgress] = useState<any>(null)

 const [suggestions, setSuggestions] = useState<HomeSuggestion[]>([])

 /* saudação / momento do dia — recalculada na montagem */
 const saudacao = useMemo(()=>getSaudacao(userName),[userName])
 const dataLonga = useMemo(()=>getDataLonga(),[])
 const frasePeriodo = useMemo(()=>getFraseDoMomento(),[])
 const momento = useMemo(()=>getMomento(),[])
 const convite = useMemo(()=>getMomentoConvite(),[])

 function handleShortcut(item:{ path:string; locked?:boolean; gateMessage?:string }){

  if(item.locked && guest){
   setGateMessage(item.gateMessage || "Crie uma conta para acessar essa área.")
   return
  }

  navigate(item.path)

 }

 const {
  liturgy,
  loadingLiturgy,
  liturgyError,
  dateOffset,
  setDateOffset,
  displayDateLabel,
  reloadLiturgy
 } = useLiturgy()

 // Abrindo a partir de um link compartilhado de uma leitura específica
 // (?leitura=tipo&offset=N) — ajusta o dia da liturgia antes de tudo.
 useEffect(()=>{
  const offsetParam = searchParams.get("offset")
  if(offsetParam){
   const parsed = Number(offsetParam)
   if(!Number.isNaN(parsed)) setDateOffset(parsed)
  }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[])

 /* =========================
 INIT (usuário logado)
 ========================= */

 useEffect(()=>{

  if(guest) return

  preloadConsecration()

  getProgress()
   .then((p)=>{ if(p) setProgress(p) })
   .catch(()=>{})

  getProfile()
   .then((u)=>{ setUserName(u?.name ?? u?.nome ?? u?.firstName ?? null) })
   .catch(()=>{})

  getHomeFeed()
   .then((f)=>{ setSuggestions(f?.suggestions ?? []) })
   .catch(()=>{ setSuggestions([]) })

 },[guest])

 // Aparece toda vez que a pessoa entra na Home sem conta.
 useEffect(()=>{

  if(guest) setShowWelcome(true)

 },[guest])

 const handleRefresh = useCallback(async ()=>{
  await Promise.all([
   reloadLiturgy(),
   guest ? Promise.resolve() : preloadConsecration()
  ])
 },[reloadLiturgy, guest])

 usePullToRefresh(handleRefresh)

 /* =========================
 LOGOUT
 ========================= */

 const [loggingOut,setLoggingOut] = useState(false)

 const handleLogout = useCallback(async ()=>{

  if(loggingOut) return

  navigator.vibrate?.(15)

  setLoggingOut(true)

  await authLogout("/oratio/home")

 },[loggingOut])

 /* =========================
 CONTINUAR (consagração em andamento)
 ========================= */

 const hasConsecration =
  !guest &&
  progress &&
  typeof progress.currentDay === "number" &&
  progress.currentDay >= 1

 const consecrationDone = Number(progress?.completedDays ?? 0)
 const consecrationPct = Math.min((consecrationDone / 33) * 100, 100)
 const ringOffset = 157 - (157 * consecrationPct) / 100

 const MomentoIcon =
  momento === "manha" ? Sun :
  momento === "tarde" ? Bell :
  Moon

 /* =========================
 PARA VOCÊ HOJE
 (sugestões do backend + evangelho do dia, da liturgia)
 ========================= */

 const SUG_ICON:Record<string, ComponentType<{ size?: number }>> = {
  rosary: Circle,
  bible: BookOpen,
  catechism: Book,
  gospel: BookOpen
 }

 const forYou = useMemo<HomeSuggestion[]>(()=>{

  const list = [...suggestions]

  const gospelRef =
   (liturgy as any)?.leituras?.evangelho?.[0]?.referencia as string | undefined

  if(gospelRef){

   const gospel:HomeSuggestion = {
    id:"gospel-today",
    kind:"gospel",
    title:"Leia o Evangelho de hoje",
    subtitle:gospelRef,
    why:"Liturgia",
    icon:"gospel",
    path:"/oratio/liturgia-completa"
   }

   // O evangelho entra logo após o terço (se houver), como no layout.
   const rosaryIdx = list.findIndex((s)=> s.kind === "rosary")
   list.splice(rosaryIdx + 1, 0, gospel)

  }

  return list.slice(0, 4)

 },[suggestions, liturgy])

 /* =========================
 JSX
 ========================= */

 return(

  <div className={`${styles.container} page-enter`}>

   <MenuDrawer/>

   {!pwa && (

    <div className={styles.topButtons}>

     {guest ? (

      <>

       <button
        className={styles.profileButton}
        onClick={()=>navigate("/login")}
        aria-label="Entrar"
       >
        <LogIn size={18}/>
       </button>

       <button
        className={styles.logoutButton}
        onClick={()=>navigate("/register")}
        aria-label="Criar conta"
       >
        <UserPlus size={18}/>
       </button>

      </>

     ) : (

      <>

       <button
        className={styles.profileButton}
        onClick={()=>navigate("/oratio/profile")}
        aria-label="Abrir perfil"
       >
        <User size={18}/>
       </button>

       <button
        className={styles.logoutButton}
        onClick={handleLogout}
        disabled={loggingOut}
        aria-label="Sair da conta"
       >
        {loggingOut ? (
         <Loader2 size={18} className={styles.spinIcon}/>
        ) : (
         <LogOut size={18}/>
        )}
       </button>

      </>

     )}

    </div>

   )}

   {guest && (

    <>

     {createPortal(

      <button
       className={styles.guestBanner}
       style={!pwa ? { top:"calc(72px + env(safe-area-inset-top))" } : undefined}
       onClick={()=>navigate("/register")}
      >

       <span className={styles.guestBannerIcon}>
        <Sparkles size={16}/>
       </span>

       <span className={styles.guestBannerText}>
        <strong>Você está navegando sem conta</strong>
        <span>Crie a sua para salvar seu progresso</span>
       </span>

       <ChevronRight size={18}/>

      </button>,

      document.body

     )}

     <div
      className={styles.guestBannerSpacer}
      style={!pwa ? { height:"142px" } : undefined}
     />

    </>

   )}

   <GuestWelcomeModal
    open={showWelcome}
    onClose={()=>setShowWelcome(false)}
   />

   <GuestGateModal
    open={gateMessage !== null}
    message={gateMessage || ""}
    onClose={()=>setGateMessage(null)}
   />

   {/* SAUDAÇÃO */}

   <div className={styles.greeting}>
    <span className={styles.greetingHi}>{saudacao}</span>
    <span className={styles.greetingDate}>{dataLonga}</span>
   </div>

   {/* HERO */}

   <section className={styles.hero}>

    <div className={styles.logoWrapper}>
     <span className={styles.logoLeft}>ORA</span>
     <div className={styles.cross}></div>
     <span className={styles.logoRight}>IO</span>
    </div>

    <p className={styles.subtitle}>
     {frasePeriodo}
    </p>

    <FraseDiaria />

   </section>

   {/* LITURGIA (inclui Santo do Dia) */}

   <LiturgyCard
    liturgy={liturgy}
    loadingLiturgy={loadingLiturgy}
    liturgyError={liturgyError}
    dateOffset={dateOffset}
    setDateOffset={setDateOffset}
    displayDateLabel={displayDateLabel}
   />

   {/* NESTE MOMENTO */}

   <div className={styles.momentWrap}>

    <div className={styles.momentHead}>
     <h3>Neste momento</h3>
    </div>

    <button
     className={styles.moment}
     onClick={()=>handleShortcut({ path:convite.path })}
    >
     <span className={styles.momentIcon}>
      <MomentoIcon size={20}/>
     </span>
     <span className={styles.momentText}>
      <strong>{convite.titulo}</strong>
      <span>{convite.sub}</span>
     </span>
     <span className={styles.momentGo}>
      {convite.acaoLabel}
      <ChevronRight size={16}/>
     </span>
    </button>

   </div>

   {/* CONTINUAR DE ONDE PAROU */}

   {hasConsecration && (

    <button
     className={styles.continueCard}
     onClick={()=>navigate(`/oratio/consecration/day/${progress.currentDay}`)}
    >

     <span className={styles.continueRing}>
      <svg width="58" height="58" viewBox="0 0 58 58">
       <circle cx="29" cy="29" r="25" fill="none" stroke="rgba(176,24,26,.15)" strokeWidth="6"/>
       <circle
        cx="29" cy="29" r="25" fill="none"
        stroke="var(--oratio-primary)" strokeWidth="6" strokeLinecap="round"
        strokeDasharray="157" strokeDashoffset={ringOffset}
        transform="rotate(-90 29 29)"
       />
      </svg>
      <span className={styles.continueNum}>{progress.currentDay}</span>
     </span>

     <span className={styles.continueInfo}>
      <span className={styles.continueKicker}>Continue de onde parou</span>
      <strong>Consagração · Dia {progress.currentDay}</strong>
      <span className={styles.continueSub}>
       {consecrationDone} de 33 dias concluídos
      </span>
     </span>

     <ChevronRight size={20} className={styles.continueChevron}/>

    </button>

   )}

   {/* PARA VOCÊ HOJE */}

   {!guest && forYou.length > 0 && (

    <div className={styles.forYouWrap}>

     <div className={styles.forYouHead}>
      <h3>Para você hoje</h3>
     </div>

     <div className={styles.suggestions}>

      {forYou.map((s)=>{
       const Icon = SUG_ICON[s.icon] ?? Circle
       return(
        <button
         key={s.id}
         className={styles.suggestion}
         onClick={()=>navigate(s.path)}
        >
         <span className={styles.suggestionIcon}>
          <Icon size={19}/>
         </span>
         <span className={styles.suggestionBody}>
          <span className={styles.suggestionTitle}>{s.title}</span>
          <span className={styles.suggestionSub}>{s.subtitle}</span>
         </span>
         <span className={styles.suggestionWhy}>{s.why}</span>
        </button>
       )
      })}

     </div>

    </div>

   )}

   {/* ATALHOS (tudo) */}

   <div className={styles.shortcutsWrap}>

    <div className={styles.shortcutsHead}>
     <h3>Atalhos</h3>
    </div>

    <div className={styles.shortcutsGrid}>

     {SHORTCUTS.map((item)=>{
      const Icon = item.icon
      return(
       <button
        key={item.label}
        className={styles.shortcut}
        onClick={()=>handleShortcut(item)}
       >
        <span className={styles.shortcutIcon}>
         <Icon size={20}/>
        </span>
        <span className={styles.shortcutLabel}>{item.label}</span>
       </button>
      )
     })}

    </div>

   </div>

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )

}
