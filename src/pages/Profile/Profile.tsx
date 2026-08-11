import { useEffect,useState,useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useOffline } from "../../hooks/useOffline"
import { usePullToRefresh } from "../../hooks/usePullToRefresh"

import styles from "./Profile.module.css"

import { getProfile, cancelEmailChange } from "../../services/profileService"
import { logout as authLogout } from "../../services/authService"
import { FONT_SCALE_OPTIONS, getStoredFontScale, setFontScale } from "../../utils/fontScale"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"
import DeleteAccountModal from "../../components/DeleteAccountModal/DeleteAccountModal"
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"
import {
 isPushSupported,
 getPushStatus,
 enablePush,
 disablePush
} from "../../services/pushService"

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
 Settings,
 Type,
 Check,
 Bell
} from "lucide-react"

export default function Profile(){

 const navigate = useNavigate()

 const [profile,setProfile] = useState<any>(null)
 const [loading,setLoading] = useState(true)

 const [deleteAccountOpen,setDeleteAccountOpen] = useState(false)
 const [fontScale,setFontScaleState] = useState(getStoredFontScale())
 const [loggingOut,setLoggingOut] = useState(false)

 const [pushSupported] = useState(isPushSupported())
 const [pushEnabled,setPushEnabled] = useState(false)
 const [pushLoading,setPushLoading] = useState(false)
 const [pushConfirm,setPushConfirm] = useState<null | "enable" | "disable">(null)
 const [pushError,setPushError] = useState<string | null>(null)

 const [searchParams] = useSearchParams()
 const notifCardRef = useRef<HTMLDivElement>(null)
 const [notifHighlight,setNotifHighlight] = useState(false)

 /* chegou do popup de reengajamento (?notif=1) → destaca a opção */
 useEffect(()=>{
  if(searchParams.get("notif") === "1"){
   setNotifHighlight(true)
   const t = setTimeout(()=>setNotifHighlight(false),3200)
   return ()=>clearTimeout(t)
  }
 },[searchParams])

 // rola até o card só depois que o perfil renderizou (senão o ref é nulo)
 useEffect(()=>{
  if(notifHighlight && !loading){
   requestAnimationFrame(()=>{
    notifCardRef.current?.scrollIntoView({ behavior:"smooth", block:"center" })
   })
  }
 },[notifHighlight, loading])

 const isOffline = useOffline()

 useEffect(()=>{

  loadProfile()

 },[])

 useEffect(()=>{

  if(!isOffline) loadProfile()

 },[isOffline])

 usePullToRefresh(loadProfile, !isOffline)

 /* estado inicial do push (existe inscrição neste aparelho?) */
 useEffect(()=>{
  if(pushSupported) getPushStatus().then(setPushEnabled).catch(()=>{})
 },[pushSupported])

 function handlePushToggle(){
  setPushError(null)
  setPushConfirm(pushEnabled ? "disable" : "enable")
 }

 async function confirmEnablePush(){
  setPushConfirm(null)
  setPushLoading(true)
  try{
   await enablePush()
   setPushEnabled(true)
  }catch(err:any){
   if(err?.message === "denied")
    setPushError("Permissão negada. Ative as notificações nas configurações do aparelho.")
   else if(err?.message === "unsupported")
    setPushError("Seu aparelho não suporta notificações aqui.")
   else
    setPushError("Não foi possível ativar agora. Tente novamente.")
  }finally{
   setPushLoading(false)
  }
 }

 async function confirmDisablePush(){
  setPushConfirm(null)
  setPushLoading(true)
  try{
   await disablePush()
   setPushEnabled(false)
  }catch{
   setPushError("Não foi possível desativar agora.")
  }finally{
   setPushLoading(false)
  }
 }

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

 async function logout(){

  if(loggingOut) return

  navigator.vibrate?.(15)

  setLoggingOut(true)

  await authLogout("/oratio/home")

 }

 function handlePickFontScale(value:number){

  setFontScale(value)
  setFontScaleState(value)

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
     onClick={()=>navigate("/oratio/home")}
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

     <button
      className={styles.settingsGear}
      onClick={()=>navigate("/oratio/profile/settings")}
      aria-label="Configurações da conta"
      title="Configurações da conta"
     >
      <Settings size={19}/>
     </button>

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

      <div className={styles.statCard}>

       <span className={styles.statLabel}>
        Orações
       </span>

       <strong className={styles.statValue}>
        {prayers}
       </strong>

      </div>

      <div className={styles.statCard}>

       <span className={styles.statLabel}>
        Terços
       </span>

       <strong className={styles.statValue}>
        {rosaries}
       </strong>

      </div>

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

    {/* APARÊNCIA */}

    <div className={styles.card}>

     <div className={styles.cardTitle}>

      <Type size={18}/>

      <h3>Aparência</h3>

     </div>

     <p className={styles.cardHint}>
      Tamanho do texto no aplicativo.
     </p>

     <div className={styles.fontScaleGrid}>

      {FONT_SCALE_OPTIONS.map(opt=>{

       const active = fontScale === opt.value

       return(

        <button
         key={opt.value}
         className={`${styles.fontScaleOption} ${active ? styles.fontScaleOptionActive : ""}`}
         onClick={()=>handlePickFontScale(opt.value)}
        >

         <span
          className={styles.fontScalePreview}
          style={{ fontSize:`${16 * opt.value}px` }}
         >
          Aa
         </span>

         <span className={styles.fontScaleLabel}>
          {opt.label}
          {active && <Check size={12}/>}
         </span>

        </button>

       )

      })}

     </div>

    </div>

    {/* NOTIFICAÇÕES */}

    <div
     ref={notifCardRef}
     className={`${styles.card} ${notifHighlight ? styles.cardHighlight : ""}`}
    >

     <div className={styles.cardTitle}>

      <Bell size={18}/>

      <h3>Notificações</h3>

     </div>

     <p className={styles.cardHint}>
      Lembretes de oração, liturgia e novidades — também fora do app.
     </p>

     {!pushSupported ? (

      <p className={styles.notifUnsupported}>
       Este aparelho não suporta notificações aqui. No iPhone, adicione o
       Oratio à tela inicial primeiro.
      </p>

     ) : (

      <>

       <button
        className={`${styles.notifToggle} ${pushEnabled ? styles.notifToggleOn : ""}`}
        onClick={handlePushToggle}
        disabled={pushLoading}
        role="switch"
        aria-checked={pushEnabled}
       >

        <span className={styles.notifToggleLabel}>
         {pushEnabled ? "Notificações ativadas" : "Ativar notificações"}
        </span>

        <span className={styles.notifSwitch}>
         <span className={styles.notifKnob}/>
        </span>

       </button>

       {pushError && (
        <p className={styles.notifError}>{pushError}</p>
       )}

      </>

     )}

    </div>

    <ConfirmModal
     open={pushConfirm === "enable"}
     title="Ativar notificações"
     message="Você passará a receber lembretes de oração, liturgia e novidades também fora do app. Pode desligar quando quiser."
     confirmLabel="Ativar"
     cancelLabel="Agora não"
     onConfirm={confirmEnablePush}
     onCancel={()=>setPushConfirm(null)}
    />

    <ConfirmModal
     open={pushConfirm === "disable"}
     title="Desativar notificações"
     message="Você deixará de receber notificações fora do app. Elas continuam guardadas no sino, dentro do aplicativo."
     confirmLabel="Desativar"
     cancelLabel="Cancelar"
     danger
     onConfirm={confirmDisablePush}
     onCancel={()=>setPushConfirm(null)}
    />

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
     disabled={loggingOut}
    >

     {loggingOut ? (

      <>
       <span className={styles.logoutSpinner}/>
       Saindo...
      </>

     ) : (

      "Sair da conta"

     )}

    </button>

   </div>

   <BottomNavbar/>

   <DeleteAccountModal
    open={deleteAccountOpen}
    userEmail={profile.email}
    onClose={()=>setDeleteAccountOpen(false)}
   />

  </div>

 )

}


