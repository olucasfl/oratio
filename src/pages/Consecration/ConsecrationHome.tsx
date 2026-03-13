import { useEffect,useState } from "react"
import styles from "./ConsecrationHome.module.css"
import { useNavigate } from "react-router-dom"

import {
 getProgress,
 startConsecration,
 updateStartDate,
 resetConsecration,
 preloadConsecration
} from "../../services/consecrationService"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

export default function ConsecrationHome(){

 const navigate = useNavigate()

 const [progress,setProgress] = useState<any>(null)
 const [startDate,setStartDate] = useState("")
 const [loading,setLoading] = useState(true)
 const [actionLoading,setActionLoading] = useState(false)

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

  /* baixar consagração completa */
  preloadConsecration()

  return ()=>{

   window.removeEventListener("online",handleOnline)
   window.removeEventListener("offline",handleOffline)

  }

 },[])

 async function load(){

  try{

   setLoading(true)

   /* ============================= */
   /* CACHE LOCAL */
   /* ============================= */

   const cached =
    localStorage.getItem("oratio-consecration-progress")

   if(cached){

    const parsed = JSON.parse(cached)

    setProgress(parsed)

    if(parsed?.startDate){
     setStartDate(parsed.startDate.slice(0,10))
    }

   }

   /* ============================= */
   /* API SE ONLINE */
   /* ============================= */

   if(!navigator.onLine){
    return
   }

   const data = await getProgress()

   setProgress(data)

   localStorage.setItem(
    "oratio-consecration-progress",
    JSON.stringify(data)
   )

   if(data?.startDate){
    setStartDate(data.startDate.slice(0,10))
   }

  }catch{

   console.log("Erro ao carregar progresso")

  }finally{

   setLoading(false)

  }

 }

 function offlineWarning(){

  alert(
   "Você está offline. Para alterar a consagração é necessário conexão com a internet."
  )

 }

 async function handleStart(){

  if(isOffline){
   offlineWarning()
   return
  }

  if(!startDate) return

  setActionLoading(true)

  try{

   await startConsecration(startDate)

   await load()

  }finally{

   setActionLoading(false)

  }

 }

 async function handleUpdate(){

  if(isOffline){
   offlineWarning()
   return
  }

  if(!startDate) return

  setActionLoading(true)

  try{

   await updateStartDate(startDate)

   await load()

  }finally{

   setActionLoading(false)

  }

 }

 async function handleReset(){

  if(isOffline){
   offlineWarning()
   return
  }

  const confirmReset = window.confirm(
   "Deseja cancelar sua consagração? Todo o progresso realizado será apagado."
  )

  if(!confirmReset) return

  await resetConsecration()

  await load()

 }

 const progressPercent =
  progress?.completedDays
  ? (progress.completedDays / 33) * 100
  : 0

 /* ============================= */
 /* LOADING SCREEN */
 /* ============================= */

 if(loading){

  return(

   <div className={styles.loading}>

    <p>Carregando consagração...</p>

    <button
     className={styles.back}
     onClick={()=>navigate("/oratio/home")}
    >
     ← Voltar
    </button>

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

    <div style={{
     background:"#fff3cd",
     padding:"10px",
     borderRadius:"8px",
     marginBottom:"16px",
     fontSize:"14px"
    }}>
     Você está offline. Algumas ações estão desativadas.
    </div>

   )}

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
      disabled={actionLoading || isOffline}
     >
      {actionLoading ? "Iniciando..." : "Iniciar Consagração"}
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
      disabled={actionLoading || isOffline}
     >
      {actionLoading ? "Atualizando..." : "Atualizar Data"}
     </button>

     <button
      className={styles.danger}
      onClick={handleReset}
      disabled={isOffline}
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

    {progress?.stages?.map((stage:any,index:number)=>{

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

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )
}