import { useParams,useNavigate } from "react-router-dom"
import { useEffect,useState } from "react"

import styles from "./ConsecrationDay.module.css"

import {
 getDay,
 getProgress,
 completeDay,
 uncompleteDay
} from "../../services/consecrationService"

import { useOffline } from "../../hooks/useOffline"

export default function ConsecrationDay(){

 const { day } = useParams()
 const navigate = useNavigate()

 const [data,setData] = useState<any>(null)
 const [progress,setProgress] = useState<any>(null)
 const [loading,setLoading] = useState(true)
 const [actionLoading,setActionLoading] = useState(false)
 const [successMessage,setSuccessMessage] = useState<string | null>(null)
 const [errorMessage,setErrorMessage] = useState<string | null>(null)

 const isOffline = useOffline()

 function offlineWarning(){
    setErrorMessage(
      "Você está offline. Para registrar a ação é necessário conexão com a internet."
    )
  }

 useEffect(()=>{

  load()

 },[day])

 useEffect(()=>{

  if(!isOffline) load()

 },[isOffline])

  async function load(){

    if(!day) return

    try{

      setLoading(true)

      /* ============================= */
      /* OFFLINE */
      /* ============================= */

      if(!navigator.onLine){

        const cachedProgress =
          localStorage.getItem("oratio_consecration_progress")

        if(cachedProgress){
          setProgress(JSON.parse(cachedProgress))
        }

        const cachedDay =
          localStorage.getItem(`oratio_consecration_days_${day}`)

        if(cachedDay){
          setData(JSON.parse(cachedDay))
        }

        return
      }

      /* ============================= */
      /* ONLINE → SEMPRE API */
      /* ============================= */

      const [dayData, progressData] = await Promise.all([
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

 /* ============================= */
 /* LOADING SCREEN */
 /* ============================= */

 if(loading){
  return(
   <div className={`${styles.container} page-enter`}>

    <button className={styles.back} onClick={()=>navigate(-1)}>
     ← Voltar
    </button>

    <div className={styles.skeletonWrap}>

     <div className={styles.skeletonHeader}>
      <div className={`skeleton ${styles.skH1}`}/>
      <div className={`skeleton ${styles.skBadge}`}/>
     </div>

     <div className={`skeleton ${styles.skTitle}`}/>

     {[180,140,220].map((h,i)=>(
      <div key={i} className={styles.skeletonPrayer}>
       <div className={`skeleton ${styles.skPTitle}`}/>
       <div className={`skeleton ${styles.skPBody}`} style={{height:h}}/>
      </div>
     ))}

    </div>

   </div>
  )
 }

 /* ============================= */
 /* ERRO / DADOS AUSENTES */
 /* ============================= */

 if(!data || !progress){
  return(

   <div className={styles.loading}>

    <p>
     {isOffline
      ? "Você está offline e este dia ainda não foi carregado."
      : "Não foi possível carregar este dia."}
    </p>

    <button
     className={styles.back}
     onClick={()=>navigate(-1)}
    >
     ← Voltar
    </button>

   </div>

  )
 }

 const completed =
  progress.completedDays >= data.dayNumber

 const canComplete =

  progress.currentDay >= data.dayNumber &&
  progress.completedDays === data.dayNumber - 1

 async function handleComplete(){

  if(isOffline){
   offlineWarning()
   return
  }

  setErrorMessage(null)
  setActionLoading(true)

  try{
   await completeDay(data.dayNumber)

   setSuccessMessage(
    `Dia ${data.dayNumber} concluído com sucesso!`
   )

   await load()
  }catch(err){
   console.error(err)
   setErrorMessage("Erro ao registrar a conclusão. Tente novamente.")
  }finally{
   setActionLoading(false)
  }

 }

 async function handleUndo(){

  if(isOffline){
   offlineWarning()
   return
  }

  setErrorMessage(null)
  setActionLoading(true)

  try{
   await uncompleteDay(data.dayNumber)
   setSuccessMessage(
    `A conclusão do dia ${data.dayNumber} foi desfeita.`
   )
   await load()
  }catch(err){
   console.error(err)
   setErrorMessage("Erro ao desmarcar a conclusão. Tente novamente.")
  }finally{
   setActionLoading(false)
  }

 }

 return(

  <>

   {(successMessage || errorMessage) && (
    <div
     className={styles.popupOverlay}
     onClick={() => {
      setSuccessMessage(null)
      setErrorMessage(null)
     }}
    >
     <div
      className={styles.popupBox}
      onClick={(e)=>e.stopPropagation()}
     >
      <strong className={styles.popupTitle}>
       Oratio
      </strong>

      <p className={styles.popupText}>
       {successMessage || errorMessage}
      </p>

      <button
        className={styles.popupClose}
        onClick={() => {
          setSuccessMessage(null)
          setErrorMessage(null)

          if(data?.stage?.id){
            navigate(`/oratio/consecration/stage/${data.stage.id}`)
          }
        }}
      >
        Fechar
      </button>
     </div>
    </div>
   )}

   <div className={`${styles.container} page-enter`}>

    <button
     className={styles.back}
     onClick={()=>navigate(-1)}
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
      Você está offline. As orações estão disponíveis, mas registrar progresso requer conexão.
     </div>

    )}

    <div className={styles.header}>

    <h1>
     Dia {data.dayNumber}
    </h1>

    <span className={styles.stage}>
     {data.stage?.title}
    </span>

   </div>

   {data.title && (

    <h2 className={styles.dayTitle}>
     {data.title}
    </h2>

   )}

   <div className={styles.prayers}>

    {data.prayers?.map((p:any)=>(

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
     disabled={!canComplete || isOffline || actionLoading}
     className={
      canComplete && !isOffline && !actionLoading
      ? styles.completeButton
      : styles.completeDisabled
     }
     onClick={handleComplete}
    >
     {actionLoading ? "Registrando..." : "Marcar dia como concluído"}
    </button>

   )}

   {completed && (

    <button
     className={styles.undoButton}
     disabled={isOffline || actionLoading}
     onClick={handleUndo}
    >
     {actionLoading ? "Processando..." : "Desmarcar conclusão"}
    </button>

   )}

  </div>

  </>

 )
}