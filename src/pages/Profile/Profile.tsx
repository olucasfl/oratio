import { useEffect,useState } from "react"
import { useNavigate } from "react-router-dom"
import { useOffline } from "../../hooks/useOffline"

import styles from "./Profile.module.css"

import { getProfile } from "../../services/profileService"
import { clearSession } from "../../services/api"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

import {
 ArrowLeft,
 Flame,
 Crown,
 Sparkles,
 ShieldCheck,
 User
} from "lucide-react"

export default function Profile(){

 const navigate = useNavigate()

 const [profile,setProfile] = useState<any>(null)
 const [loading,setLoading] = useState(true)

 const isOffline = useOffline()

 useEffect(()=>{

  loadProfile()

 },[])

 useEffect(()=>{

  if(!isOffline) loadProfile()

 },[isOffline])

 async function loadProfile(){

  try{

   const token = localStorage.getItem("access_token")

   if(!token){

    navigate("/login")

    return

   }

   const cached =
    localStorage.getItem("oratio-profile")

   if(cached && !navigator.onLine){

    setProfile(JSON.parse(cached))

   }

   if(!navigator.onLine){

    return

   }

   const data = await getProfile()

   setProfile(data)

   localStorage.setItem(
    "oratio-profile",
    JSON.stringify(data)
   )

  }catch(err:any){

   if(err?.response?.status === 401){

    navigate("/login")

   }else{

    console.log("Erro ao carregar perfil")

   }

  }finally{

   setLoading(false)

  }

 }

 function logout(){

  clearSession()

 }

 if(loading){

  return(

   <div className={styles.loading}>

    <div className={styles.spinner}></div>

    <p>Carregando perfil...</p>

   </div>

  )

 }

 if(!profile){

  return(

   <div className={styles.loading}>

    Não foi possível carregar o perfil

   </div>

  )

 }

 const days =
  profile.spiritualProgress?.daysCompleted || 0

 const prayers =
  profile.spiritualProgress?.prayersPrayed || 0

 const rosaries =
  profile.spiritualProgress?.rosariesPrayed || 0

 const lastPrayer =
  profile.spiritualProgress?.lastPrayerDate

 const streak =
  profile.spiritualProgress?.prayerStreak || 0

 const progress =
  Math.min((days / 33) * 100,100)

 const lastPrayerFormatted = lastPrayer
  ? new Date(lastPrayer).toLocaleString(
     "pt-BR",
     {
      dateStyle:"short",
      timeStyle:"short"
     }
    )
  : null

 function getStreakInfo(streak:number){

  if(streak === 0){

   return {
    emoji:"❄️",
    color:"#999",
    label:"Comece hoje"
   }

  }

  if(streak <= 3){

   return {
    emoji:"🔥",
    color:"#ff6b6b",
    label:"Discípulo"
   }

  }

  if(streak <= 7){

   return {
    emoji:"🔥",
    color:"#ff922b",
    label:"Servo de Deus"
   }

  }

  if(streak <= 15){

   return {
    emoji:"🔥",
    color:"#fcc419",
    label:"Fiel Perseverante"
   }

  }

  if(streak <= 30){

   return {
    emoji:"🔥",
    color:"#51cf66",
    label:"Intercessor"
   }

  }

  if(streak <= 90){

   return {
    emoji:"🔥🔥",
    color:"#339af0",
    label:"Consagrado"
   }

  }

  if(streak <= 180){

   return {
    emoji:"🔥🔥🔥",
    color:"#845ef7",
    label:"Consagrado"
   }

  }

  if(streak <= 365){

   return {
    emoji:"🔥🔥🔥🔥",
    color:"#f783ac",
    label:"Lendário"
   }

  }

  return {

   emoji:"🔥🔥🔥🔥",
   color:"#ff0000",
   label:"Testemunha de Cristo"

  }

 }

 const streakInfo = getStreakInfo(streak)

 return(

  <div className={`${styles.page} page-enter`}>

   <div className={styles.backgroundGlow}></div>

   <header className={styles.header}>

    <button
     className={styles.backButton}
     onClick={()=>navigate(-1)}
    >

     <ArrowLeft size={22}/>

    </button>

    <h1>Perfil</h1>

   </header>

   <div className={styles.container}>

    {isOffline && (

     <div className={styles.offlineBanner}>

      Você está offline. Os dados podem
      estar desatualizados.

     </div>

    )}

    {/* HERO */}

    <div className={styles.profileHero}>

     <div className={styles.avatar}>

      {profile.name?.charAt(0)}

     </div>

     <div className={styles.heroInfo}>

      <h2>{profile.name}</h2>

      <p>{profile.email}</p>

      <span>

       Membro desde{" "}

       {new Date(profile.createdAt)
        .toLocaleDateString("pt-BR")}

      </span>

     </div>

    </div>

    {/* ADMIN */}

    {profile.isAdmin && (

     <div className={styles.adminCard}>

      <div className={styles.adminTop}>

       <ShieldCheck size={22}/>

       <h3>Painel Administrador</h3>

      </div>

      <p>

       Gerencie usuários, estatísticas
       e dados do aplicativo.

      </p>

      <button
       className={styles.adminButton}
       onClick={()=>navigate("/oratio/admin")}
      >

       Abrir painel admin

      </button>

     </div>

    )}

    {/* VIDA ESPIRITUAL */}

    <div className={styles.card}>

     <div className={styles.cardTitle}>

      <Sparkles size={20}/>

      <h3>Vida Espiritual</h3>

     </div>

     {/* STREAK */}

     <div className={styles.streakCard}>

      <div className={styles.streakLeft}>

       <div className={styles.streakIcon}>

        <Flame size={22}/>

       </div>

       <div>

        <span className={styles.streakLabel}>
         Sequência de oração
        </span>

        <p className={styles.streakSubtitle}>
         {streakInfo.label}
        </p>

       </div>

      </div>

      <div
       className={styles.streakDays}
       style={{ color: streakInfo.color }}
      >

       {streak}

       <span>
        {streak === 1 ? "dia" : "dias"}
       </span>

      </div>

     </div>

     {/* CONSAGRAÇÃO */}

     <div className={styles.progressCard}>

      <div className={styles.progressHeader}>

       <div className={styles.progressTitle}>

        <Crown size={18}/>

        <span>Consagração</span>

       </div>

       <strong>

        {days}/33

       </strong>

      </div>

      <div className={styles.progressBar}>

       <div
        className={styles.progressFill}
        style={{ width:`${progress}%` }}
       />

      </div>

      <p className={styles.progressText}>

       {profile.spiritualProgress
        ?.consecrationStarted

        ? "Consagração em andamento"

        : "Consagração ainda não iniciada"}

      </p>

     </div>

     {/* STATS */}

     <div className={styles.statsGrid}>

      <div className={styles.statCard}>

       <span className={styles.statLabel}>
        Orações
       </span>

       <strong className={styles.statValue}>
        {prayers}
       </strong>

      </div>

      <button
       className={`${styles.statCard} ${styles.statCardButton}`}
       onClick={()=>
        navigate("/oratio/rosary/history")
       }
      >

       <span className={styles.statLabel}>
        Terços
       </span>

       <strong className={styles.statValue}>
        {rosaries}
       </strong>

      </button>

      {lastPrayerFormatted && (

       <div
        className={`${styles.statCard} ${styles.full}`}
       >

        <span className={styles.statLabel}>
         Última oração
        </span>

        <strong
         className={styles.statValueSmall}
        >
         {lastPrayerFormatted}
        </strong>

       </div>

      )}

     </div>

    </div>

    {/* CONTA */}

    <div className={styles.card}>

     <div className={styles.cardTitle}>

      <User size={18}/>

      <h3>Conta</h3>

     </div>

     <p className={styles.userId}>

      ID: {profile.id}

     </p>

    </div>

    {/* LOGOUT */}

    <button
     className={styles.logout}
     onClick={logout}
    >

     Sair da conta

    </button>

   </div>

   <BottomNavbar/>

  </div>

 )

}


