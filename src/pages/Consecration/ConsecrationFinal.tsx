import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import styles from "./ConsecrationFinal.module.css"

import {
  getProgress,
  resetConsecration
} from "../../services/consecrationService"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

export default function ConsecrationFinal(){

  const navigate = useNavigate()

  const [progress,setProgress] = useState<any>(null)
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

    return ()=>{
      window.removeEventListener("online",handleOnline)
      window.removeEventListener("offline",handleOffline)
    }

  },[])

  async function load(){

    try{

      setLoading(true)

      if(!navigator.onLine){

        const cached =
          localStorage.getItem("oratio_consecration_progress")

        if(cached){
          setProgress(JSON.parse(cached))
        }

        return
      }

      const data = await getProgress()

      setProgress(data)

    }catch{
      setError("Erro ao carregar dados.")
    }finally{
      setLoading(false)
    }

  }

  async function handleFinish(){

    if(isOffline){
      setError("Você precisa de internet para concluir.")
      return
    }

    const confirm = window.confirm(
      "Você realmente concluiu sua consagração?"
    )

    if(!confirm) return

    try{

      setActionLoading(true)

      await resetConsecration()

      localStorage.removeItem("oratio_consecration_progress")

      navigate("/oratio/consecration")

    }catch{
      setError("Erro ao concluir.")
    }finally{
      setActionLoading(false)
    }

  }

  if(loading){

    return(
      <div className={styles.loading}>
        <p>Carregando finalização...</p>
      </div>
    )

  }

  const canFinish =
    progress?.completedDays === 33

  return(

    <div className={`${styles.container} page-enter`}>

      <button
        className={styles.back}
        onClick={()=>navigate(-1)}
      >
        ← Voltar
      </button>

      <h1 className={styles.header}>
        Finalização
      </h1>

      {isOffline && (
        <div className={styles.offlineWarning}>
          Você está offline
        </div>
      )}

      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}

      {/* CARD PRINCIPAL */}
      <div className={styles.card}>

        <h3>Chegou o grande dia 🙏</h3>

        <p className={styles.text}>
          Agora é o momento de escrever sua carta de consagração a Nossa Senhora.
        </p>

        <p className={styles.text}>
          Reze com fé, escreva com o coração e entregue-se totalmente.
        </p>

        <button
          className={styles.primary}
          onClick={()=>navigate("/oratio/consecration/carta")}
        >
          Ver modelo da carta
        </button>

      </div>

      {/* CONCLUSÃO */}
      <div className={styles.card}>

        <h3>Conclusão</h3>

        <p className={styles.text}>
          Após escrever sua carta e realizar a consagração,
          finalize aqui no aplicativo.
        </p>

        <button
          disabled={!canFinish || actionLoading}
          className={styles.danger}
          onClick={handleFinish}
        >
          {actionLoading
            ? "Concluindo..."
            : "Concluir Consagração"}
        </button>

        {!canFinish && (
          <span className={styles.warning}>
            Complete os 33 dias para liberar a conclusão.
          </span>
        )}

      </div>

      <div className={styles.pageSpacer}></div>

      <BottomNavbar/>

    </div>

  )
}