import { useEffect,useState } from "react"

import { useNavigate }
from "react-router-dom"

import {
  ChevronLeft,
  History,
  Sparkles
} from "lucide-react"

import styles from "./RosaryHistory.module.css"

import { getPrayerHistory }
from "../../services/prayersService"

import { usePullToRefresh }
from "../../hooks/usePullToRefresh"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

/* =========================
FORMATAR DATA/HORA
========================= */

function formatDateTime(iso:string){

  const date = new Date(iso)

  const dateLabel = date.toLocaleDateString(
    "pt-BR",
    {
      day:"2-digit",
      month:"long",
      year:"numeric"
    }
  )

  const timeLabel = date.toLocaleTimeString(
    "pt-BR",
    {
      hour:"2-digit",
      minute:"2-digit"
    }
  )

  return `${dateLabel} · ${timeLabel}`

}

/*
Ações antigas gravadas antes de guardarmos o nome da oração vêm como
"Oração rezada" (genérico). As mais novas vêm como "Rezou: <título>" —
aqui só troca o prefixo por um rótulo mais limpo pro card.
*/
function formatLabel(action:string){

  if(action.startsWith("Rezou: ")){
    return action.slice("Rezou: ".length)
  }

  return "Oração"

}

export default function PrayerHistory(){

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
        await getPrayerHistory()

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
            As orações que você
            já rezou.
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
                registrou nenhuma oração.
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
                  {formatLabel(h.action)}
                </strong>

                <span>
                  {formatDateTime(h.createdAt)}
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
