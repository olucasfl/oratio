import { useEffect,useState } from "react"
import styles from "./ConsecrationHome.module.css"
import { useNavigate } from "react-router-dom"

import {
 getProgress,
 startConsecration,
 updateStartDate,
 resetConsecration
} from "../../services/consecrationService"

export default function ConsecrationHome(){

 const navigate = useNavigate()

 const [progress,setProgress] = useState<any>(null)
 const [startDate,setStartDate] = useState("")

 useEffect(()=>{

  load()

 },[])

 async function load(){

  const data = await getProgress()

  setProgress(data)

 }

 async function handleStart(){

  if(!startDate) return

  await startConsecration(startDate)

  load()

 }

 async function handleUpdate(){

  if(!startDate) return

  await updateStartDate(startDate)

  load()

 }

 async function handleReset(){

  const confirmReset = window.confirm(
   "Deseja cancelar sua consagração?"
  )

  if(!confirmReset) return

  await resetConsecration()

  load()

 }

 const progressPercent =
  progress?.completedDays
  ? (progress.completedDays / 33) * 100
  : 0

 return(

  <div className={styles.container}>

   <button
    className={styles.back}
    onClick={()=>navigate("/oratio/home")}
   >
    ← Voltar
   </button>

   <h1 className={styles.header}>
    Consagração
   </h1>

   {!progress?.started && (

    <div className={styles.startBox}>

     <h3>Escolha a data para iniciar</h3>

     <input
      type="date"
      value={startDate}
      onChange={(e)=>setStartDate(e.target.value)}
     />

     <button
      className={styles.primary}
      onClick={handleStart}
     >
      Iniciar Consagração
     </button>

    </div>

   )}

   {progress?.started && (

    <div className={styles.controlBox}>

     <h3>Alterar data de início</h3>

     <input
      type="date"
      value={startDate}
      onChange={(e)=>setStartDate(e.target.value)}
     />

     <button
      className={styles.primary}
      onClick={handleUpdate}
     >
      Atualizar Data
     </button>

     <button
      className={styles.danger}
      onClick={handleReset}
     >
      Cancelar Consagração
     </button>

    </div>

   )}

   {progress?.started && (

    <div className={styles.progressBox}>

     <div className={styles.progressBar}>

      <div
       className={styles.progressFill}
       style={{width:`${progressPercent}%`}}
      />

     </div>

     <span>
      {progress.completedDays || 0} / 33 dias
     </span>

    </div>

   )}

   <div className={styles.stages}>

    {progress?.stages?.map((stage:any)=>(

     <div
      key={stage.id}
      className={styles.stageCard}
      onClick={()=>navigate(`/oratio/consecration/stage/${stage.id}`)}
     >

      <h3>{stage.title}</h3>

      <p>{stage.days} dias</p>

     </div>

    ))}

   </div>

  </div>

 )

}