import { useEffect,useState } from "react"
import { useNavigate } from "react-router-dom"
import { useOffline } from "../../hooks/useOffline"
import { usePullToRefresh } from "../../hooks/usePullToRefresh"

import styles from "./Profile.module.css"

import { getProfile, cancelEmailChange } from "../../services/profileService"
import { logout as authLogout } from "../../services/authService"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"
import ChangePasswordModal from "../../components/ChangePasswordModal/ChangePasswordModal"
import ChangeEmailModal from "../../components/ChangeEmailModal/ChangeEmailModal"
import DeleteAccountModal from "../../components/DeleteAccountModal/DeleteAccountModal"

import {
 ChevronLeft,
 Crown,
 Sparkles,
 ShieldCheck,
 User,
 Footprints,
 HeartHandshake,
 Hand,
 Compass,
 Gem,
 Award,
 KeyRound,
 Mail
} from "lucide-react"

export default function Profile(){

 const navigate = useNavigate()

 const [profile,setProfile] = useState<any>(null)
 const [loading,setLoading] = useState(true)

 const [changePasswordOpen,setChangePasswordOpen] = useState(false)
 const [changeEmailOpen,setChangeEmailOpen] = useState(false)
 const [deleteAccountOpen,setDeleteAccountOpen] = useState(false)

 const isOffline = useOffline()

 useEffect(()=>{

  loadProfile()

 },[])

 useEffect(()=>{

  if(!isOffline) loadProfile()

 },[isOffline])

 usePullToRefresh(loadProfile, !isOffline)

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

  authLogout()

 }

 function handleEmailChangeRequested(pendingEmail:string){

  setChangeEmailOpen(false)
  setProfile((prev:any)=> prev ? { ...prev, pendingEmail } : prev)

 }

 async function handleCancelEmailChange(){

  try{

   await cancelEmailChange()
   setProfile((prev:any)=> prev ? { ...prev, pendingEmail:null } : prev)

  }catch{

   console.log("Erro ao cancelar troca de email")

  }

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

 /*
 Faixas de sequência de oração.
 Cada faixa tem rótulo, cor e ícone
 próprios (sem repetição), numa
 progressão de tom que lembra
 metais e pedras — do neutro ao
 dourado — para dar sensação real
 de patente conforme o usuário
 avança.
 */

 function getStreakInfo(streak:number){

  if(streak === 0){

   return {
    Icon:Sparkles,
    color:"#9a8f80",
    label:"Comece hoje"
   }

  }

  if(streak <= 3){

   return {
    Icon:Footprints,
    color:"#c17a4f",
    label:"Discípulo"
   }

  }

  if(streak <= 7){

   return {
    Icon:HeartHandshake,
    color:"#b8860b",
    label:"Servo de Deus"
   }

  }

  if(streak <= 15){

   return {
    Icon:ShieldCheck,
    color:"#7c828d",
    label:"Fiel Perseverante"
   }

  }

  if(streak <= 30){

   return {
    Icon:Hand,
    color:"#4c8577",
    label:"Intercessor"
   }

  }

  if(streak <= 90){

   return {
    Icon:Crown,
    color:"#3a6ea5",
    label:"Consagrado"
   }

  }

  if(streak <= 180){

   return {
    Icon:Compass,
    color:"#6a4c93",
    label:"Peregrino Fiel"
   }

  }

  if(streak <= 365){

   return {
    Icon:Gem,
    color:"#9a2846",
    label:"Coluna de Fé"
   }

  }

  return {

   Icon:Award,
   color:"#b8952f",
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

     <ChevronLeft size={22}/>

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

     <div
      className={styles.streakCard}
      style={{ borderColor: `${streakInfo.color}40` }}
     >

      <div className={styles.streakLeft}>

       <div
        className={styles.streakIcon}
        style={{
         background:
          `linear-gradient(135deg, ${streakInfo.color}, ${streakInfo.color}cc)`,
         boxShadow:
          `0 8px 20px ${streakInfo.color}48`
        }}
       >

        <streakInfo.Icon size={22}/>

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

      <button
       className={`${styles.statCard} ${styles.statCardButton}`}
       onClick={()=>
        navigate("/oratio/prayers/history")
       }
      >

       <span className={styles.statLabel}>
        Orações
       </span>

       <strong className={styles.statValue}>
        {prayers}
       </strong>

      </button>

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

     {profile.pendingEmail && (

      <div className={styles.pendingEmailBanner}>

       <span>
        Confirmação pendente para <strong>{profile.pendingEmail}</strong>.
        Verifique a caixa de entrada desse email.
       </span>

       <button
        className={styles.pendingEmailCancel}
        onClick={handleCancelEmailChange}
       >
        Cancelar
       </button>

      </div>

     )}

     <div className={styles.accountActions}>

      <button
       className={styles.accountButton}
       onClick={()=>setChangePasswordOpen(true)}
      >
       <KeyRound size={16}/> Trocar senha
      </button>

      <button
       className={styles.accountButton}
       onClick={()=>setChangeEmailOpen(true)}
      >
       <Mail size={16}/> Trocar email
      </button>

     </div>

     <div className={styles.dangerZone}>

      <button
       className={styles.dangerButton}
       onClick={()=>setDeleteAccountOpen(true)}
      >
       Excluir minha conta
      </button>

     </div>

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

   <ChangePasswordModal
    open={changePasswordOpen}
    onClose={()=>setChangePasswordOpen(false)}
   />

   <ChangeEmailModal
    open={changeEmailOpen}
    onClose={()=>setChangeEmailOpen(false)}
    onRequested={handleEmailChangeRequested}
   />

   <DeleteAccountModal
    open={deleteAccountOpen}
    userEmail={profile.email}
    onClose={()=>setDeleteAccountOpen(false)}
   />

  </div>

 )

}


