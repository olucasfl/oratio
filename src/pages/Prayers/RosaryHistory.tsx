import { useEffect,useState } from "react"

import { useNavigate }
from "react-router-dom"

import {
  ChevronLeft,
  History,
  Sparkles
} from "lucide-react"

import styles from "./RosaryHistory.module.css"

import { getRosaryHistory }
from "../../services/rosaryService"

import { usePullToRefresh }
from "../../hooks/usePullToRefresh"

import { getRosaryName }
from "../../utils/rosaryList"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

/* =========================
FORMATAR DATA
========================= */

function formatDate(iso:string){

  const date = new Date(iso)

  return date.toLocaleDateString(
    "pt-BR",
    {
      day:"2-digit",
      month:"long",
      year:"numeric"
    }
  )

}

/*
Prioriza elapsedSeconds (tempo realmente sincronizado enquanto a tela
ficava aberta) em vez de finishedAt-startedAt. Uma sessão retomada
depois de um tempo parada (app fechado, aparelho trocado) tem
startedAt antigo — usar a diferença de relógio ali gerava durações
absurdas tipo "182734 min". elapsedSeconds não sofre com isso porque
só cresce enquanto a pessoa está de fato na tela.
*/
function formatDuration(
  startedAt:string,
  finishedAt:string,
  elapsedSeconds?:number
){

  if(elapsedSeconds && elapsedSeconds > 0){
    const minutes = Math.max(1,Math.round(elapsedSeconds / 60))
    return `${minutes} min`
  }

  const ms =
    new Date(finishedAt).getTime() -
    new Date(startedAt).getTime()

  const minutes =
    Math.max(1,Math.round(ms / 60000))

  // Sem elapsedSeconds e com uma diferença de relógio grande demais
  // pra ser uma sessão de terço de verdade, não dá pra confiar nesse
  // número — melhor não mostrar um valor claramente errado.
  if(minutes > 180) return null

  return `${minutes} min`

}

export default function RosaryHistory(){

  const navigate = useNavigate()

  const [history,setHistory] =
    useState<any[]>([])

  const [loading,setLoading] =
    useState(true)

  useEffect(()=>{

    load()

  },[])

  usePullToRefresh(load)

  async function load(){

    try{

      const data =
        await getRosaryHistory()

      setHistory(data || [])

    }catch{

      console.log(
        "Erro ao carregar histórico"
      )

    }finally{

      setLoading(false)

    }

  }

  return(

    <main className={`${styles.page} page-enter`}>

      <section className={styles.container}>

        <button
          className={styles.backButton}
          onClick={()=>navigate(-1)}
        >

          <ChevronLeft size={18}/>

          <span>
            Voltar
          </span>

        </button>

        <div className={styles.header}>

          <div className={styles.badge}>

            <History size={17}/>

            <span>
              Espiritualidade Católica
            </span>

          </div>

          <h1>
            Histórico
          </h1>

          <p>
            Os terços que você
            já concluiu.
          </p>

        </div>

        <div className={styles.list}>

          {loading && (

            <>
              {[1,2,3].map(item=>(

                <div
                  key={item}
                  className={`skeleton ${styles.skeletonItem}`}
                />

              ))}
            </>

          )}

          {!loading &&
          history.length === 0 && (

            <div className={styles.empty}>

              <Sparkles size={34}/>

              <p>
                Você ainda não
                concluiu nenhum terço.
              </p>

            </div>

          )}

          {!loading &&
          history.map((h)=>(

            <div
              key={h.id}
              className={styles.card}
            >

              <div className={styles.cardInfo}>

                <strong>
                  {getRosaryName(h.type)}
                </strong>

                <span>
                  {formatDate(h.finishedAt)}
                  {(()=>{
                    const duration = formatDuration(
                      h.startedAt,
                      h.finishedAt,
                      h.elapsedSeconds
                    )
                    return duration ? ` · ${duration}` : ""
                  })()}
                </span>

              </div>

            </div>

          ))}

        </div>

      </section>

      <div className={styles.pageSpacer}/>

      <BottomNavbar/>

    </main>

  )

}
