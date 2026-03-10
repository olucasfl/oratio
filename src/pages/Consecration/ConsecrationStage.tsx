import { useParams,useNavigate } from "react-router-dom"
import { useEffect,useState } from "react"
import styles from "./ConsecrationStage.module.css"
import { getStageDays,getProgress } from "../../services/consecrationService"

export default function ConsecrationStage(){

 const { stageId } = useParams()

 const navigate = useNavigate()

 const [days,setDays] = useState<any[]>([])
 const [progress,setProgress] = useState<any>(null)

 useEffect(()=>{
  load()
 },[])

 async function load(){

  if(!stageId) return

  const data = await getStageDays(stageId)
  const p = await getProgress()

  setDays(data)
  setProgress(p)

 }

 return(

  <div className={styles.container}>

   <div className={styles.daySelector}>

    {days.map(day=>{

     const unlocked =
      progress?.currentDay >= day.dayNumber

     return(

      <button
       key={day.dayNumber}
       className={
        unlocked
        ? styles.dayUnlocked
        : styles.dayLocked
       }
       onClick={()=>
        navigate(`/oratio/consecration/day/${day.dayNumber}`)
       }
      >

       {day.dayNumber}

      </button>

     )

    })}

   </div>

  </div>

 )

}