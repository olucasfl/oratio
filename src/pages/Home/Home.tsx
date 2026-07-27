import styles from "./Home.module.css"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useEffect, useMemo, useCallback, useState } from "react"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

import GuestWelcomeModal
from "../../components/GuestWelcomeModal/GuestWelcomeModal"

import GuestGateModal
from "../../components/GuestGateModal/GuestGateModal"

import {
 LogOut,
 User,
 LogIn,
 UserPlus
} from "lucide-react"

import { isPWA } from "../../utils/isPwa"

import { isLoggedIn } from "../../utils/auth"

import { clearSession } from "../../services/api"

import {
 preloadConsecration
} from "../../services/consecrationService"

import { FraseDiaria } from "../../components/FraseDiaria/FraseDiaria"

import LiturgyCard from "../../components/LiturgyCard/LiturgyCard"

import { useLiturgy } from "../../hooks/useLiturgy"

import { usePullToRefresh } from "../../hooks/usePullToRefresh"

/* =========================
TIPAGENS
========================= */

type FeatureItem = {
 title:string
 description:string
 actionLabel:string
 path:string
 badge?:string
 locked?:boolean
 gateMessage?:string
}

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

 function handleFeatureClick(item:FeatureItem){

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
 // (?leitura=tipo&offset=N) — ajusta o dia da liturgia antes de tudo,
 // pra LiturgyReadingButtons abrir a leitura certa quando carregar.
 useEffect(()=>{
  const offsetParam = searchParams.get("offset")
  if(offsetParam){
   const parsed = Number(offsetParam)
   if(!Number.isNaN(parsed)) setDateOffset(parsed)
  }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[])

 /* =========================
 FEATURES
 ========================= */

 const features = useMemo<FeatureItem[]>(()=>[

  {
   title:"Orações",

   description:
`Reze as principais orações da tradição católica.
-Contém Terços
-Orações de Santos
-Orações tradicionais
-Ladainhas`,

   actionLabel:
   "Abrir Orações",

   path:
   "/oratio/prayers"
  },

  {
   title:"Guia para a Confissão",

   description:
   "Exame de consciência completo pelos 10 Mandamentos e Preceitos da Igreja, como se confessar corretamente e Ato de Contrição.",

   actionLabel:
   "Abrir Guia",

   path:
   "/oratio/confissao",

   badge:"SACRAMENTO",

   locked:true,
   gateMessage:"Crie uma conta para acessar o Guia de Confissão."
  },

  {
   title:
   "Consagração à Nossa Senhora",

   description:
   "Um caminho espiritual de 33 dias segundo o método de São Luís Maria Grignion de Montfort.",

   actionLabel:
   "Iniciar Consagração",

   path:
   "/oratio/consecration",

   badge:"33 DIAS",

   locked:true,
   gateMessage:"Crie uma conta para iniciar a Consagração de 33 dias e acompanhar seu progresso."
  },

  {
   title:"Bíblia Sagrada",

   description:
   "Leia a Palavra de Deus completa na tradução Ave-Maria.",

   actionLabel:
   "Abrir Bíblia",

   path:
   "/oratio/biblia"
  },

  {
   title:"Catecismo da Igreja",

   description:
   "Leia o Catecismo oficial com navegação rápida por artigo.",

   actionLabel:
   "Abrir Catecismo",

   path:
   "/oratio/catecismo",

   locked:true,
   gateMessage:"Crie uma conta para acessar o Catecismo completo."
  },

  {
   title:
   "VoxAI - Inteligência Artificial Católica",

   description:
   "Assistente espiritual católico. Tire dúvidas sobre fé, moral e liturgia.",

   actionLabel:
   "Perguntar ao VoxAI",

   path:
   "/oratio/vox",

   badge:"IA",

   locked:true,
   gateMessage:"Crie uma conta para conversar com o VoxAI, seu assistente espiritual católico."
  }

 ],[])

 /* =========================
 INIT
 ========================= */

 useEffect(()=>{
  if(!guest){
   preloadConsecration()
  }
 },[guest])

 useEffect(()=>{

  if(!guest) return

  if(!localStorage.getItem("guest_welcome_seen")){
   setShowWelcome(true)
   localStorage.setItem("guest_welcome_seen", "1")
  }

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

 const handleLogout = useCallback(()=>{

  clearSession("/oratio/home")

 },[])

 /* =========================
 JSX
 ========================= */

 return(

  <div className={`${styles.container} page-enter`}>

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
        onClick={()=>
         navigate("/oratio/profile")
        }
        aria-label="Abrir perfil"
       >

        <User size={18}/>

       </button>

       <button
        className={styles.logoutButton}
        onClick={handleLogout}
        aria-label="Sair da conta"
       >

        <LogOut size={18}/>

       </button>

      </>

     )}

    </div>

   )}

   {guest && (

    <button
     className={styles.guestBanner}
     onClick={()=>navigate("/register")}
    >

     Crie sua conta para salvar seu progresso

    </button>

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

   {/* HERO */}

   <section className={styles.hero}>

    <div className={styles.logoWrapper}>

     <span className={styles.logoLeft}>
      ORA
     </span>

     <div className={styles.cross}></div>

     <span className={styles.logoRight}>
      IO
     </span>

    </div>

    <p className={styles.subtitle}>
     Aplicativo de espiritualidade católica
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

   {/* FEATURES */}

   <div className={styles.featuresGrid}>

    {features.map((item)=>(

     <section
      key={item.path}
      className={styles.featureCard}
     >

      {item.badge && (

       <span className={styles.cardBadge}>
        {item.badge}
       </span>

      )}

      <div>

       <h2>{item.title}</h2>

       <p>
        {item.description}
       </p>

      </div>

      <button
       className={styles.primaryButton}
       onClick={()=>
        handleFeatureClick(item)
       }
      >

       {item.actionLabel}

      </button>

     </section>

    ))}

   </div>

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )

}
