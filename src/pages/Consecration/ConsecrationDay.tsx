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

 useEffect(()=>{
  load()
 },[day])

 async function load(){

  try{

   setLoading(true)

   const [dayData,progressData] = await Promise.all([
    getDay(Number(day)),
    getProgress()
   ])

   setData(dayData)
   setProgress(progressData)

  }catch{

   console.log("Erro ao carregar dia")

  }finally{

   setLoading(false)

  }

 }

 if(loading){
  return(
   <div className={styles.loading}>
    Carregando orações...
   </div>
  )
 }

 if(!data || !progress) return null

 const completed =
  progress.completedDays >= data.dayNumber

 const canComplete =

  progress.startedToday &&
  progress.currentDay >= data.dayNumber &&
  progress.completedDays === data.dayNumber - 1

 async function handleComplete(){

  await completeDay(data.dayNumber)

  load()

 }

 async function handleUndo(){

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

   <div className={styles.header}>

    <h1>
     Dia {data.dayNumber}
    </h1>

    <span className={styles.stage}>
     {data.stage.title}
    </span>

   </div>

   {data.title && (

    <h2 className={styles.dayTitle}>
     {data.title}
    </h2>

   )}

   <div className={styles.prayers}>

    {data.prayers.map((p:any)=>(

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
     disabled={!canComplete}
     className={
      canComplete
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
     onClick={handleUndo}
    >

     Desmarcar conclusão

    </button>

   )}

  </div>

 )
}