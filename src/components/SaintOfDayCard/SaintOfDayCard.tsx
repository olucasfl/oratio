import { useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"

import styles from "./SaintOfDayCard.module.css"

import type { LiturgyData } from "../../hooks/useLiturgy"
import { resolveSaintOfDay } from "../../utils/saintOfDay"

interface Props {
  liturgy: LiturgyData | null
  dateOffset: number
}

export default function SaintOfDayCard({ liturgy, dateOffset }: Props){

  const navigate = useNavigate()

  const info = resolveSaintOfDay(liturgy)

  if(!info) return null

  const intro =
    dateOffset === 0 ? "Hoje é dia de" :
    dateOffset === -1 ? "Ontem foi dia de" :
    dateOffset === 1 ? "Amanhã é dia de" :
    "Nesse dia é celebrado"

  return(

    <button
      className={styles.card}
      style={{
        background:
          `linear-gradient(135deg, ${info.corHexSoft}, ${info.corHexSoft}00)`,
        borderColor: `${info.corHex}40`
      }}
      onClick={()=>
        navigate("/oratio/santo-do-dia", { state:{ liturgy, dateOffset } })
      }
    >

      <div
        className={styles.stripe}
        style={{ background:info.corHex }}
      />

      <div className={styles.content}>

        <span
          className={styles.grau}
          style={{ color:info.corHex }}
        >
          {info.grau}{info.cor ? ` · ${info.cor}` : ""}
        </span>

        <span className={styles.intro}>
          {intro}
        </span>

        <strong className={styles.nome}>
          {info.nome}
        </strong>

      </div>

      <ChevronRight size={20} className={styles.arrow}/>

    </button>

  )

}
