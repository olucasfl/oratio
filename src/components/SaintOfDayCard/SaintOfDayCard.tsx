import { useNavigate } from "react-router-dom"
import { Church } from "lucide-react"

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
      onClick={()=>
        navigate("/oratio/santo-do-dia", { state:{ liturgy, dateOffset } })
      }
    >

      <div
        className={styles.icon}
        style={{
          background:
            `linear-gradient(135deg, ${info.corHex}, ${info.corHex}cc)`
        }}
      >
        <Church size={26}/>
      </div>

      <span
        className={styles.badge}
        style={{
          background:`${info.corHex}1a`,
          color:info.corHex
        }}
      >
        {info.grau}{info.cor ? ` · ${info.cor}` : ""}
      </span>

      <span className={styles.intro}>
        {intro}
      </span>

      <strong className={styles.nome}>
        {info.nome}
      </strong>

      <span className={styles.hint}>
        Toque para saber mais
      </span>

    </button>

  )

}
