import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"

import styles from "./SaintOfDayCard.module.css"

import type { LiturgyData } from "../../hooks/useLiturgy"
import { resolveSaintOfDay } from "../../utils/saintOfDay"
import { isLoggedIn } from "../../utils/auth"
import GuestGateModal from "../GuestGateModal/GuestGateModal"

interface Props {
  liturgy: LiturgyData | null
  dateOffset: number
}

export default function SaintOfDayCard({ liturgy, dateOffset }: Props){

  const navigate = useNavigate()

  const [showGate,setShowGate] = useState(false)

  const info = resolveSaintOfDay(liturgy)

  if(!info) return null

  const intro =
    dateOffset === 0 ? "Hoje é dia de" :
    dateOffset === -1 ? "Ontem foi dia de" :
    dateOffset === 1 ? "Amanhã é dia de" :
    "Nesse dia é celebrado"

  const corLabel =
    info.cor ? info.cor.charAt(0).toUpperCase() + info.cor.slice(1) : null

  function handleClick(){

    if(!isLoggedIn()){
      setShowGate(true)
      return
    }

    navigate("/oratio/santo-do-dia", { state:{ liturgy, dateOffset } })

  }

  return(

    <>

    <button
      className={styles.card}
      style={{ ["--accent" as string]:info.corHex }}
      onClick={handleClick}
    >

      <span className={styles.dot} aria-hidden="true"/>

      <div className={styles.body}>

        <span className={styles.eyebrow}>
          {intro}
        </span>

        <strong className={styles.nome}>
          {info.nome}
        </strong>

        <span className={styles.tag}>
          {info.grau}{corLabel ? ` · ${corLabel}` : ""}
        </span>

      </div>

      <span className={styles.hint}>
        <span className={styles.hintText}>Ver detalhes</span>
        <ChevronRight size={14} className={styles.chevron}/>
      </span>

    </button>

    <GuestGateModal
      open={showGate}
      message="Crie uma conta para ver os detalhes do Santo do Dia."
      onClose={()=>setShowGate(false)}
    />

    </>

  )

}
