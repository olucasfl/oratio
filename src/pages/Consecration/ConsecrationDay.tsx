import { useParams,useNavigate } from "react-router-dom"
import { useEffect,useState } from "react"

import styles from "./ConsecrationDay.module.css"

import {
 getDay,
 getProgress,
 completeDay,
 uncompleteDay
} from "../../services/consecrationService"

export default function ConsecrationDay(){

 const { day } = useParams()
 const navigate = useNavigate()

 const [data,setData] = useState<any>(null)
 const [progress,setProgress] = useState<any>(null)
 const [loading,setLoading] = useState(true)

 const [isOffline,setIsOffline] = useState(!navigator.onLine)

 useEffect(()=>{

  function handleOnline(){
   setIsOffline(false)
   load()
  }

  function handleOffline(){
   setIsOffline(true)
  }

  window.addEventListener("online",handleOnline)
  window.addEventListener("offline",handleOffline)

  load()

  return ()=>{

   window.removeEventListener("online",handleOnline)
   window.removeEventListener("offline",handleOffline)

  }

 },[day])

 async function load(){

  if(!day) return

  try{

   setLoading(true)

   /* ============================= */
   /* CACHE LOCAL */
   /* ============================= */

   const cachedDay =
    localStorage.getItem(`oratio-day-${day}`)

   const cachedProgress =
    localStorage.getItem("oratio-consecration-progress")

   if(cachedDay){
    setData(JSON.parse(cachedDay))
   }

   if(cachedProgress){
    setProgress(JSON.parse(cachedProgress))
   }

   /* ============================= */
   /* API SE ONLINE */
   /* ============================= */

   if(!navigator.onLine){
    return
   }

   const [dayData,progressData] = await Promise.all([

    getDay(Number(day)),
    getProgress()

   ])

   setData(dayData)
   setProgress(progressData)

   localStorage.setItem(
    `oratio-day-${day}`,
    JSON.stringify(dayData)
   )

   localStorage.setItem(
    "oratio-consecration-progress",
    JSON.stringify(progressData)
   )

  }catch{

   console.log("Erro ao carregar dia")

  }finally{

   setLoading(false)

  }

 }

 function offlineWarning(){

  alert(
   "Você está offline. Para registrar a conclusão do dia é necessário conexão com a internet."
  )

 }

 /* ============================= */
 /* LOADING SCREEN */
 /* ============================= */

 if(loading){
  return(

   <div className={styles.loading}>

    <p>Carregando orações...</p>

    <button
     className={styles.back}
     onClick={()=>navigate(-1)}
    >
     ← Voltar
    </button>

   </div>

  )
 }

 /* ============================= */
 /* ERRO / DADOS AUSENTES */
 /* ============================= */

 if(!data || !progress){
  return(

   <div className={styles.loading}>

    <p>
     {isOffline
      ? "Você está offline e este dia ainda não foi carregado."
      : "Não foi possível carregar este dia."}
    </p>

    <button
     className={styles.back}
     onClick={()=>navigate(-1)}
    >
     ← Voltar
    </button>

   </div>

  )
 }

 const completed =
  progress.completedDays >= data.dayNumber

 const canComplete =

  progress.startedToday &&
  progress.currentDay >= data.dayNumber &&
  progress.completedDays === data.dayNumber - 1

 async function handleComplete(){

  if(isOffline){
   offlineWarning()
   return
  }

  await completeDay(data.dayNumber)

  load()

 }

 async function handleUndo(){

  if(isOffline){
   offlineWarning()
   return
  }

  await uncompleteDay(data.dayNumber)

  load()

 }

 return(

  <div className={styles.container}>

   <button
    className={styles.back}
    onClick={()=>navigate(-1)}
   >
    ← Voltar
   </button>

   {isOffline && (

    <div style={{
     background:"#fff3cd",
     padding:"10px",
     borderRadius:"8px",
     marginBottom:"16px",
     fontSize:"14px"
    }}>
     Você está offline. As orações estão disponíveis, mas registrar progresso requer conexão.
    </div>

   )}

   <div className={styles.header}>

    <h1>
     Dia {data.dayNumber}
    </h1>

    <span className={styles.stage}>
     {data.stage?.title}
    </span>

   </div>

   {data.title && (

    <h2 className={styles.dayTitle}>
     {data.title}
    </h2>

   )}

   <div className={styles.prayers}>

    {data.prayers?.map((p:any)=>(

      <div
       key={p.id}
       className={styles.prayer}
      >

       <h3>
        {p.prayer.title}
       </h3>

       <pre className={styles.prayerText}>
        {p.prayer.content}
       </pre>

      </div>

    ))}

   </div>

   {!completed && (

    <button
     disabled={!canComplete || isOffline}
     className={
      canComplete && !isOffline
      ? styles.completeButton
      : styles.completeDisabled
     }
     onClick={handleComplete}
    >

     Marcar dia como concluído

    </button>

   )}

   {completed && (

    <button
     className={styles.undoButton}
     disabled={isOffline}
     onClick={handleUndo}
    >

     Desmarcar conclusão

    </button>

   )}

  </div>

 )
}