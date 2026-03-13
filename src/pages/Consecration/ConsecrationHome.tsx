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

export default function ConsecrationHome(){

 const navigate = useNavigate()

 const [progress,setProgress] = useState<any>(null)
 const [consecrationDate,setConsecrationDate] = useState("")

 const [loading,setLoading] = useState(true)
 const [actionLoading,setActionLoading] = useState(false)

 const [error,setError] = useState<string | null>(null)

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
  preloadConsecration()

  return ()=>{
   window.removeEventListener("online",handleOnline)
   window.removeEventListener("offline",handleOffline)
  }

 },[])

 async function load(){

  try{

   setLoading(true)

   const cached =
    localStorage.getItem("oratio-consecration-progress")

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
    "oratio-consecration-progress",
    JSON.stringify(data)
   )

  }catch{
   console.log("Erro ao carregar progresso")
  }finally{
   setLoading(false)
  }

 }

 /* ========================= */
 /* CONVERSÃO SEGURA DE DATA */
 /* ========================= */

 function parseDate(date:string){

  const [y,m,d] = date.split("-").map(Number)

  return new Date(y,m-1,d)

 }

 /* ========================= */

 function calculateStartDate(date:string){

  if(!date) return null

  const d = parseDate(date)

  d.setDate(d.getDate()-33)

  return d

 }

 /* ========================= */

 function calculateConsecrationDate(startDate:string){

  const d = new Date(startDate)

  d.setDate(d.getDate()+33)

  const year = d.getFullYear()
  const month = String(d.getMonth()+1).padStart(2,"0")
  const day = String(d.getDate()).padStart(2,"0")

  return `${year}-${month}-${day}`

 }

 /* ========================= */

 function formatDateBR(date:Date){

  const day = String(date.getDate()).padStart(2,"0")
  const month = String(date.getMonth()+1).padStart(2,"0")
  const year = date.getFullYear()

  return `${day}/${month}/${year}`

 }

 /* ========================= */

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

 /* ========================= */

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

 /* ========================= */

 function handleDateChange(value:string){

  setConsecrationDate(value)

  if(error){
   setError(null)
  }

 }

 /* ========================= */

 async function handleStart(){

  if(isOffline){
   alert("Você está offline.")
   return
  }

  if(!consecrationDate) return

  if(!validateDate(consecrationDate)) return

  setActionLoading(true)

  try{

   await startConsecration(consecrationDate)

   await load()

  }finally{

   setActionLoading(false)

  }

 }

 /* ========================= */

 async function handleUpdate(){

  if(isOffline){
   alert("Você está offline.")
   return
  }

  if(!consecrationDate) return

  if(!validateDate(consecrationDate)) return

  setActionLoading(true)

  try{

   await updateStartDate(consecrationDate)

   await load()

  }finally{

   setActionLoading(false)

  }

 }

 /* ========================= */

 async function handleReset(){

  if(isOffline){
   alert("Você está offline.")
   return
  }

  const confirmReset =
   window.confirm("Deseja cancelar sua consagração?")

  if(!confirmReset) return

  await resetConsecration()

  await load()

 }

 /* ========================= */

 const startDateObj =
  calculateStartDate(consecrationDate)

 const startDateFormatted =
  startDateObj
  ? formatDateBR(startDateObj)
  : null

 const consecrationDateFormatted =
  consecrationDate
  ? formatDateBR(parseDate(consecrationDate))
  : null

 const daysRemaining =
  startDateObj
  ? daysUntilStart(startDateObj)
  : null

 const progressPercent =
  progress?.completedDays
  ? (progress.completedDays/33)*100
  : 0

 /* ========================= */

 if(loading){

  return(

   <div className={styles.loading}>
    <p>Carregando consagração...</p>
   </div>

  )

 }

 /* ========================= */

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

   <div className={styles.card}>

    <h3>Dia da consagração</h3>

    <input
     type="date"
     value={consecrationDate}
     onChange={(e)=>handleDateChange(e.target.value)}
    />

    {error && (
     <p className={styles.error}>{error}</p>
    )}

    {consecrationDate && (

     <div className={styles.startInfo}>

      <p>Sua consagração será em</p>

      <span className={styles.startDate}>
       {consecrationDateFormatted}
      </span>

      {daysRemaining! > 0 && (

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

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )

}