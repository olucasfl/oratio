import { useParams,useNavigate } from "react-router-dom"
import { useEffect,useState } from "react"

import styles from "./ConsecrationStage.module.css"

import {
 getStageDays,
 getProgress
} from "../../services/consecrationService"

export default function ConsecrationStage(){

 const { stageId } = useParams()
 const navigate = useNavigate()

 const [days,setDays] = useState<any[]>([])
 const [progress,setProgress] = useState<any>(null)

 useEffect(()=>{
  load()
 },[stageId])

 async function load(){

  if(!stageId) return

  const [daysData,progressData] = await Promise.all([
   getStageDays(stageId),
   getProgress()
  ])

  setDays(daysData)
  setProgress(progressData)

 }

 if(!progress) return null

 const stage = progress.stages?.find(
  (s:any)=>s.id === stageId
 )

 return(

  <div className={styles.container}>

   <button
    className={styles.back}
    onClick={()=>navigate("/oratio/consecration")}
   >
    ← Voltar
   </button>

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

     const unlocked =
      progress.currentDay >= day.dayNumber

     return(

      <button
       key={day.dayNumber}
       className={`
        ${styles.day}
        ${completed ? styles.dayDone : ""}
        ${current ? styles.dayCurrent : ""}
        ${!unlocked ? styles.dayLocked : ""}
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

  </div>

 )
}