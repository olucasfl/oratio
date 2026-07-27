import styles from "./Home.module.css"
import { useNavigate } from "react-router-dom"
import { useEffect, useMemo, useCallback, useState } from "react"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

import GuestWelcomeModal
from "../../components/GuestWelcomeModal/GuestWelcomeModal"

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
}

/* =========================
COMPONENTE
========================= */

export default function Home(){

 const navigate = useNavigate()

 const pwa = isPWA()

 const guest = !isLoggedIn()

 const [showWelcome, setShowWelcome] = useState(false)

 const {
  liturgy,
  loadingLiturgy,
  liturgyError,
  dateOffset,
  setDateOffset,
  displayDateLabel,
  reloadLiturgy
 } = useLiturgy()

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

   badge:"SACRAMENTO"
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

   badge:"33 DIAS"
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
   "/oratio/catecismo"
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

   badge:"IA"
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

  clearSession()

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
        navigate(item.path)
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
