import { useParams } from "react-router-dom"
import { useEffect,useState } from "react"
import styles from "./ConsecrationDay.module.css"
import {
 getDay,
 getProgress,
 completeDay
} from "../../services/consecrationService"

export default function ConsecrationDay(){

 const { day } = useParams()

 const [data,setData] = useState<any>(null)
 const [progress,setProgress] = useState<any>(null)

 useEffect(()=>{
  load()
 },[])

 async function load(){

  const res = await getDay(Number(day))
  const p = await getProgress()

  setData(res)
  setProgress(p)

 }

 if(!data) return null

 const canComplete =

  progress?.startedToday &&
  progress?.currentDay >= data.dayNumber &&
  progress?.completedDays === data.dayNumber - 1

 async function handleComplete(){

  await completeDay(data.dayNumber)

  load()

 }

 return(

  <div className={styles.dayContainer}>

   <h2>Dia {data.dayNumber}</h2>

   <p className={styles.intro}>
    {data.description}
   </p>

   {data.prayers.map((p:any)=>(

    <div key={p.id} className={styles.prayer}>

     <h3>{p.prayer.title}</h3>

     <p>{p.prayer.content}</p>

    </div>

   ))}

   <button
    disabled={!canComplete}
    className={
     canComplete
     ? styles.completeButton
     : styles.completeDisabled
    }
    onClick={handleComplete}
   >

    Marcar como concluído

   </button>

  </div>

 )

}