import { useParams,useNavigate } from "react-router-dom"
import { useEffect,useState } from "react"

import styles from "./ConsecrationStage.module.css"

import {
 getStageDays,
 getProgress
} from "../../services/consecrationService"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

export default function ConsecrationStage(){

 const { stageId } = useParams()
 const navigate = useNavigate()

 const [days,setDays] = useState<any[]>([])
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

 },[stageId])

 async function load(){

  if(!stageId) return

  try{

   setLoading(true)

   const cachedDays =
    localStorage.getItem(`oratio-stage-days-${stageId}`)

   const cachedProgress =
    localStorage.getItem("oratio-consecration-progress")

   if(cachedDays){
    setDays(JSON.parse(cachedDays))
   }

   if(cachedProgress){
    setProgress(JSON.parse(cachedProgress))
   }

   if(!navigator.onLine){
    return
   }

   const [daysData,progressData] = await Promise.all([
    getStageDays(stageId),
    getProgress()
   ])

   setDays(daysData)
   setProgress(progressData)

   localStorage.setItem(
    `oratio-stage-days-${stageId}`,
    JSON.stringify(daysData)
   )

   localStorage.setItem(
    "oratio-consecration-progress",
    JSON.stringify(progressData)
   )

  }catch{

   console.log("Erro ao carregar estágio")

  }finally{

   setLoading(false)

  }

 }

 if(loading){

  return(

   <div className={styles.loading}>

    <p>Carregando estágio...</p>

    <button
     className={styles.back}
     onClick={()=>navigate("/oratio/consecration")}
    >
     ← Voltar
    </button>

   </div>

  )

 }

 if(!progress || days.length === 0){

  return(

   <div className={styles.loading}>

    <p>
     {isOffline
      ? "Você está offline e este estágio ainda não foi carregado."
      : "Não foi possível carregar este estágio."}
    </p>

    <button
     className={styles.back}
     onClick={()=>navigate("/oratio/consecration")}
    >
     ← Voltar
    </button>

   </div>

  )

 }

 const stage = progress.stages?.find(
  (s:any)=>String(s.id) === String(stageId)
 )

 return(

  <div className={styles.container}>

   <button
    className={styles.back}
    onClick={()=>navigate("/oratio/consecration")}
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
     Você está offline. Os dados podem estar desatualizados.
    </div>

   )}

   {stage && (

    <div className={styles.stageHeader}>

     <h1 className={styles.stageTitle}>
      {stage.title}
     </h1>

     {stage.description && (

      <p className={styles.stageDescription}>
       {stage.description}
      </p>

     )}

    </div>

   )}

   <div className={styles.daySelector}>

    {days.map(day=>{

     const completed =
      progress.completedDays >= day.dayNumber

     const current =
      progress.currentDay === day.dayNumber

     const late =
      day.dayNumber < progress.currentDay && !completed

     const future =
      day.dayNumber > progress.currentDay

     return(

      <button
       key={day.dayNumber}
       className={`
        ${styles.day}
        ${completed ? styles.dayDone : ""}
        ${current ? styles.dayCurrent : ""}
        ${late ? styles.dayLate : ""}
        ${future ? styles.dayFuture : ""}
       `}
       onClick={()=>
        navigate(`/oratio/consecration/day/${day.dayNumber}`)
       }
      >

       {completed ? "✓" : day.dayNumber}

      </button>

     )

    })}

   </div>

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )
}