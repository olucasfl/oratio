import { useEffect,useState } from "react"
import styles from "./ConsecrationHome.module.css"
import { useNavigate } from "react-router-dom"

import {
 getProgress,
 startConsecration,
 updateStartDate,
 preloadConsecration,
 resetConsecration
} from "../../services/consecrationService"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

const PROGRESS_KEY = "oratio_consecration_progress"

export default function ConsecrationHome(){

 const navigate = useNavigate()

 const [progress,setProgress] = useState<any>(null)
 const [consecrationDate,setConsecrationDate] = useState("")

 const [loading,setLoading] = useState(true)
 const [actionLoading,setActionLoading] = useState(false)

 const [error,setError] = useState<string | null>(null)
 const [info,setInfo] = useState<string | null>(null)

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

  preloadConsecration()
  load()

  return ()=>{
   window.removeEventListener("online",handleOnline)
   window.removeEventListener("offline",handleOffline)
  }

 },[])

 async function load(){

  try{

   setLoading(true)

   const cached = localStorage.getItem(PROGRESS_KEY)

   if(cached){

    const parsed = JSON.parse(cached)

    setProgress(parsed)

    if(parsed?.startDate){
     setConsecrationDate(
      calculateConsecrationDate(parsed.startDate)
     )
    }

   }

   if(!navigator.onLine){
    return
   }

   const data = await getProgress()

   setProgress(data)

   if(data?.startDate){
    setConsecrationDate(
     calculateConsecrationDate(data.startDate)
    )
   }

   localStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify(data)
   )

  }catch(err){

   console.error("Erro ao carregar progresso",err)

   setInfo("Não foi possível atualizar os dados.")

  }finally{
   setLoading(false)
  }

 }

 function parseDate(date:string){
  const [y,m,d] = date.split("-").map(Number)
  return new Date(y,m-1,d)
 }

 function calculateStartDate(date:string){
  if(!date) return null
  const d = parseDate(date)
  d.setDate(d.getDate()-33)
  return d
 }

 function calculateConsecrationDate(startDate:string){

 if(!startDate) return ""

 const datePart = startDate.split("T")[0]

 const [y,m,d] = datePart.split("-").map(Number)

 if(!y || !m || !d) return ""

 const date = new Date(y,m-1,d)

 date.setDate(date.getDate()+33)

 const year = date.getFullYear()
 const month = String(date.getMonth()+1).padStart(2,"0")
 const day = String(date.getDate()).padStart(2,"0")

 return `${year}-${month}-${day}`

}

 function formatDateBR(date:Date){

  const day = String(date.getDate()).padStart(2,"0")
  const month = String(date.getMonth()+1).padStart(2,"0")
  const year = date.getFullYear()

  return `${day}/${month}/${year}`

 }

 function daysUntilStart(startDate:Date){

  const today = new Date()
  today.setHours(0,0,0,0)

  const diff =
   Math.ceil(
    (startDate.getTime()-today.getTime()) /
    (1000*60*60*24)
   )

  return diff

 }

 function validateDate(date:string){

  const today = new Date()
  today.setHours(0,0,0,0)

  const selected = parseDate(date)

  if(selected <= today){

   setError("Escolha uma data futura para a consagração.")
   return false

  }

  setError(null)
  return true

 }

 function handleDateChange(value:string){

  setConsecrationDate(value)

  if(error){
   setError(null)
  }

 }

 async function handleStart(){

  if(isOffline){
   setError("Você está offline.")
   return
  }

  if(!consecrationDate) return

  if(!validateDate(consecrationDate)) return

  try{

   setActionLoading(true)

   await startConsecration(consecrationDate)

   await load()

  }catch{

   setError("Erro ao iniciar consagração.")

  }finally{

   setActionLoading(false)

  }

 }

 async function handleUpdate(){

    if(isOffline){
    setError("Você está offline.")
    return
    }

    if(!consecrationDate) return

    if(!validateDate(consecrationDate)) return

    const confirmUpdate = window.confirm(
    "Alterar a data irá reiniciar toda a sua preparação.\n\nDeseja continuar?"
    )

    if(!confirmUpdate) return

    try{

    setActionLoading(true)

    await updateStartDate(consecrationDate)

    await load()

    }catch{

    setError("Erro ao atualizar data.")

    }finally{

    setActionLoading(false)

    }

    }

 async function handleReset(){

  if(isOffline){
   setError("Você está offline.")
   return
  }

  const confirmReset =
   window.confirm("Deseja cancelar sua consagração?")

  if(!confirmReset) return

  try{

   await resetConsecration()

   setProgress(null)
   setConsecrationDate("")

   localStorage.removeItem(PROGRESS_KEY)

  }catch{

   setError("Erro ao cancelar consagração.")

  }

 }

 /* DATA LOCAL SEGURA PARA INPUT */
 function getTodayInputDate(){

  const today = new Date()

  const y = today.getFullYear()
  const m = String(today.getMonth()+1).padStart(2,"0")
  const d = String(today.getDate()).padStart(2,"0")

  return `${y}-${m}-${d}`

 }

 const startDateObj =
  calculateStartDate(consecrationDate)

 const startDateFormatted =
  startDateObj
  ? formatDateBR(startDateObj)
  : null

 const consecrationDateFormatted =
  consecrationDate && consecrationDate.includes("-")
  ? formatDateBR(parseDate(consecrationDate))
  : ""

 const daysRemaining =
  startDateObj
  ? daysUntilStart(startDateObj)
  : null

 const progressPercent =
  progress?.completedDays
  ? (progress.completedDays/33)*100
  : 0

 function getStageStatus(stage:any){

  if(!progress) return ""

  const ranges:any = {
   1:{start:1,end:12},
   2:{start:13,end:19},
   3:{start:20,end:26},
   4:{start:27,end:33}
  }

  const {start,end} = ranges[stage.order]

  const currentDay = progress.currentDay
  const completed = progress.completedDays

  if(completed >= end){
   return styles.stageDone
  }

  if(currentDay >= start && currentDay <= end){
   return styles.stageCurrent
  }

  if(currentDay > end && completed < end){
   return styles.stageLate
  }

  return ""

 }

 function getStageDays(stage:any){

  const map:any = {
   1:12,
   2:7,
   3:7,
   4:7
  }

  return map[stage.order]

 }

 if(loading){

  return(
   <div className={styles.loading}>
    <p>Carregando consagração...</p>
   </div>
  )

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

   {isOffline && (
    <div className={styles.offlineWarning}>
     Você está offline
    </div>
   )}

   {info && (
    <div className={styles.info}>
     {info}
    </div>
   )}

   <div className={styles.card}>

    <h3>Coloque o Dia da consagração</h3>

        {!consecrationDate && (
        <div className={styles.dateHint}>
        Toque para escolher uma data
        </div>
        )}

        <input
        className={styles.dateInput}
        type="date"
        min={getTodayInputDate()}
        value={consecrationDate}
        onChange={(e)=>handleDateChange(e.target.value)}
        placeholder="Selecione a data"
        />

    {error && (
     <p className={styles.error}>{error}</p>
    )}

    {consecrationDate && (

     <div className={styles.startInfo}>

      <p>Sua consagração será em</p>

      {consecrationDateFormatted && (
       <span className={styles.startDate}>
        {consecrationDateFormatted}
       </span>
      )}

        {daysRemaining !== null && daysRemaining > 0 && (

       <>
        <p>A preparação começa em</p>

        <span className={styles.startDate}>
         {startDateFormatted}
        </span>

        <p>Faltam {daysRemaining} dias</p>
       </>

      )}

      {daysRemaining === 0 && (
       <p>Hoje começa sua preparação</p>
      )}

     </div>

    )}

    {!progress?.started && (

     <button
      className={styles.primary}
      onClick={handleStart}
      disabled={actionLoading}
     >
      {actionLoading
       ? "Iniciando..."
       : "Iniciar Consagração"}
     </button>

    )}

    {progress?.started && (

     <div className={styles.actions}>

      <button
       className={styles.secondary}
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

   </div>

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

   {progress?.stages && (

    <div className={styles.stages}>

     {progress.stages.map((stage:any)=>{

      const stageClass = getStageStatus(stage)

      return(

       <div
        key={stage.id}
        className={`${styles.stageCard} ${stageClass}`}
        onClick={()=>navigate(`/oratio/consecration/stage/${stage.id}`)}
       >

        <h3>{stage.title}</h3>

        <span className={styles.stageStatus}>
         {getStageDays(stage)} dias
        </span>

        {stageClass === styles.stageCurrent && (
         <span className={styles.stageStatus}>
          • Atual
         </span>
        )}

        {stageClass === styles.stageLate && (
         <span className={styles.stageLateStatus}>
          • Atrasado
         </span>
        )}

       </div>

      )

     })}

    </div>

   )}

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )

}