import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import styles from "./Profile.module.css"

import { getProfile } from "../../services/profileService"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

import { ArrowLeft } from "lucide-react"

export default function Profile(){

 const navigate = useNavigate()

 const [profile,setProfile] = useState<any>(null)
 const [loading,setLoading] = useState(true)

 const [isOffline,setIsOffline] = useState(!navigator.onLine)

 useEffect(()=>{

  function handleOnline(){
   setIsOffline(false)
   loadProfile()
  }

  function handleOffline(){
   setIsOffline(true)
  }

  window.addEventListener("online",handleOnline)
  window.addEventListener("offline",handleOffline)

  loadProfile()

  return ()=>{

   window.removeEventListener("online",handleOnline)
   window.removeEventListener("offline",handleOffline)

  }

 },[])

 async function loadProfile(){

  try{

   const token = localStorage.getItem("access_token")

   if(!token){
    navigate("/login")
    return
   }

   /* ============================= */
   /* CACHE LOCAL */
   /* ============================= */

   const cached = localStorage.getItem("oratio-profile")

   if(cached && !navigator.onLine){
    setProfile(JSON.parse(cached))
  }

   /* ============================= */
   /* API SE ONLINE */
   /* ============================= */

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

  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("oratio-profile")

  navigate("/login")

 }

 /* ============================= */
 /* LOADING */
 /* ============================= */

 if(loading){

  return(

   <div className={styles.loading}>

    <p>Carregando perfil...</p>

    <button
     className={styles.back}
     onClick={()=>navigate("/oratio/home")}
    >
     ← Voltar
    </button>

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

 const days = profile.spiritualProgress?.daysCompleted || 0
 const prayers = profile.spiritualProgress?.prayersPrayed || 0
 const rosaries = profile.spiritualProgress?.rosariesPrayed || 0
 const lastPrayer = profile.spiritualProgress?.lastPrayerDate

 const progress = Math.min((days / 33) * 100,100)

 const lastPrayerFormatted = lastPrayer
  ? new Date(lastPrayer).toLocaleString("pt-BR",{
      dateStyle:"short",
      timeStyle:"short"
    })
  : null

  const streak = profile.spiritualProgress?.prayerStreak || 0

function getStreakInfo(streak:number){

  if(streak === 0){
    return { emoji: "❄️", color: "#999", label: "Comece hoje" }
  }

  if(streak >= 1 && streak <= 3){
    return { emoji: "🔥", color: "#ff6b6b", label: "Discípulo" }
  }

  if(streak >= 4 && streak <= 7){
    return { emoji: "🔥", color: "#ff922b", label: "Servo de Deus" }
  }

  if(streak >= 8 && streak <= 15){
    return { emoji: "🔥", color: "#fcc419", label: "Fiel Perseverante" }
  }

  if(streak >= 16 && streak <= 30){
    return { emoji: "🔥", color: "#51cf66", label: "Intercessor" }
  }

  if(streak >= 31 && streak <= 90){
    return { emoji: "🔥🔥", color: "#339af0", label: "Consagrado" }
  }

  if(streak >= 91 && streak <= 180){
    return { emoji: "🔥🔥🔥", color: "#845ef7", label: "Consagrado" }
  }

  if(streak >= 181 && streak <= 365){
    return { emoji: "🔥🔥🔥🔥", color: "#f783ac", label: "Lendário" }
  }

  return { emoji: "🔥🔥🔥🔥", color: "#ff0000", label: "Testemunha de Cristo" }
}

const streakInfo = getStreakInfo(streak)

 return(

  <div className={styles.page}>

   {/* HEADER */}

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

     <div style={{
      background:"#fff3cd",
      padding:"10px",
      borderRadius:"8px",
      marginBottom:"16px",
      fontSize:"14px"
     }}>
      Você está offline. Os dados exibidos podem estar desatualizados.
     </div>

    )}

    {/* CARD USUÁRIO */}

    <div className={styles.profileCard}>

     <div className={styles.avatar}>
      {profile.name?.charAt(0)}
     </div>

     <div className={styles.userInfo}>

      <h2>{profile.name}</h2>

      <p className={styles.email}>
       {profile.email}
      </p>

      <span className={styles.memberSince}>
       Membro desde {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
      </span>

     </div>

    </div>

    {profile.isAdmin && (
      <div className={styles.adminCard}>
        <h3>painel administrador</h3>
        <p>Você é administrador. Acesse o painel para gerenciar usuários e estatísticas.</p>
        <button
          className={styles.adminButton}
          onClick={()=>navigate("/oratio/admin")}
        >
          Ir para painel admin
        </button>
      </div>
    )}

    {/* VIDA ESPIRITUAL */}

    <div className={styles.card}>

      <h3>Vida Espiritual</h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
          padding: "12px",
          borderRadius: "12px",
          background: "#fff5e6",
          border: "1px solid #ffe0b2"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          
          <span style={{ fontSize: "22px" }}>
            {streakInfo.emoji}
          </span>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "14px", fontWeight: 600 }}>
              Sequência
            </span>
            <span style={{ fontSize: "12px", color: "#666" }}>
              {streakInfo.label}
            </span>
          </div>

        </div>

        <span
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: streakInfo.color
          }}
        >
          {streak} {streak === 1 ? "dia" : "dias"}
        </span>
      </div>

      <div className={styles.progressBox}>

        <div className={styles.progressInfo}>

          <span>Consagração</span>

          <span>
            {days} / 33 dias
          </span>

        </div>

        <div className={styles.progressBar}>

          <div
            className={styles.progressFill}
            style={{width:`${progress}%`}}
          />

        </div>

      </div>

      <p className={styles.consecrationStatus}>

        {profile.spiritualProgress?.consecrationStarted
         ? "Consagração em andamento"
         : "Consagração ainda não iniciada"}

      </p>

      {/* STATS */}

      <div className={styles.statsBox}>

        <div className={styles.stat}>

          <span className={styles.statLabel}>
            Orações rezadas
          </span>

          <span className={styles.statValue}>
            {prayers}
          </span>

        </div>

        <div className={styles.stat}>

          <span className={styles.statLabel}>
            Terços rezados
          </span>

          <span className={styles.statValue}>
            {rosaries}
          </span>

        </div>

        {lastPrayerFormatted && (

        <div className={styles.stat}>

          <span className={styles.statLabel}>
            Última oração
          </span>

          <span className={styles.statValueSmall}>
            {lastPrayerFormatted}
          </span>

        </div>

        )}

      </div>

    </div>


    {/* CONTA */}

    <div className={styles.card}>

     <h3>Conta</h3>

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