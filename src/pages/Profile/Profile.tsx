import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

import styles from "./Profile.module.css"

import { getProfile } from "../../services/profileService"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

import { ArrowLeft } from "lucide-react"

export default function Profile(){

 const navigate = useNavigate()
 const location = useLocation()

 const [profile,setProfile] = useState<any>(null)
 const [loading,setLoading] = useState(true)

 useEffect(()=>{
  loadProfile()
 },[location])

 async function loadProfile(){

  try{

   const token = localStorage.getItem("access_token")

   if(!token){
    navigate("/login")
    return
   }

   const data = await getProfile()

   setProfile(data)

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
  return null
 }

 const days = profile.spiritualProgress?.daysCompleted || 0
 const prayers = profile.spiritualProgress?.prayersPrayed || 0
 const rosaries = profile.spiritualProgress?.rosariesPrayed || 0
 const lastPrayer = profile.spiritualProgress?.lastPrayerDate

 const progress = Math.min((days / 33) * 100,100)

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


   {/* CONTEÚDO */}

   <div className={styles.container}>


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


    {/* VIDA ESPIRITUAL */}

    <div className={styles.card}>

     <h3>Vida Espiritual</h3>


     {/* CONSAGRAÇÃO */}

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


      {lastPrayer && (

       <div className={styles.stat}>

        <span className={styles.statLabel}>
         Última oração
        </span>

        <span className={styles.statValueSmall}>
         {new Date(lastPrayer).toLocaleDateString("pt-BR")}
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


   {/* NAVBAR */}

   <BottomNavbar/>

  </div>

 )

}