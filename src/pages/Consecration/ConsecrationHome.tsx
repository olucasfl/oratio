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
 const [loading,setLoading] = useState(false)

 useEffect(()=>{
  load()
 },[])

 async function load(){

  const data = await getProgress()

  setProgress(data)

  if(data?.startDate){
   setStartDate(data.startDate.slice(0,10))
  }

 }

 async function handleStart(){

  if(!startDate) return

  setLoading(true)

  await startConsecration(startDate)

  await load()

  setLoading(false)

 }

 async function handleUpdate(){

  if(!startDate) return

  setLoading(true)

  await updateStartDate(startDate)

  await load()

  setLoading(false)

 }

 async function handleReset(){

  const confirmReset = window.confirm(
   "Deseja cancelar sua consagração?"
  )

  if(!confirmReset) return

  await resetConsecration()

  await load()

 }

 const progressPercent =
  progress?.completedDays
  ? (progress.completedDays / 33) * 100
  : 0

 if(!progress){
  return <div className={styles.loading}>Carregando...</div>
 }

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

   {!progress.started && (

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
      disabled={loading}
     >
      {loading ? "Iniciando..." : "Iniciar Consagração"}
     </button>

    </div>

   )}

   {progress.started && (

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
      disabled={loading}
     >
      {loading ? "Atualizando..." : "Atualizar Data"}
     </button>

     <button
      className={styles.danger}
      onClick={handleReset}
     >
      Cancelar Consagração
     </button>

    </div>

   )}

   {progress.started && (

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

    {progress?.stages?.map((stage:any, index:number)=>{

     // calcula os dias acumulados automaticamente
     let start = 1

     for(let i=0;i<index;i++){
      start += progress.stages[i].days
     }

     const end = start + stage.days - 1

     const completed =
      progress.completedDays >= end

     const current =
      progress.currentDay >= start &&
      progress.currentDay <= end

     return(

      <div
       key={stage.id}
       className={`${styles.stageCard}
       ${completed ? styles.stageDone : ""}
       ${current ? styles.stageCurrent : ""}`}
       onClick={()=>
        navigate(`/oratio/consecration/stage/${stage.id}`)
       }
      >

       <h3>{stage.title}</h3>

       <p>{stage.days} dias</p>

       {completed && (
        <span className={styles.stageStatus}>
         ✓ Concluído
        </span>
       )}

       {current && !completed && (
        <span className={styles.stageStatus}>
         ● Atual
        </span>
       )}

      </div>

     )

    })}

   </div>

  </div>

 )

}