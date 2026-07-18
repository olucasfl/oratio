import type { Dispatch, SetStateAction } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import LiturgyReadingButtons from "../LiturgyReadingButtons/LiturgyReadingButtons"
import SaintOfDayCard from "../SaintOfDayCard/SaintOfDayCard"
import type { LiturgyData } from "../../hooks/useLiturgy"

import styles from "../../pages/Home/Home.module.css"

const MESES_LONGOS = [
 "janeiro","fevereiro","março","abril","maio","junho",
 "julho","agosto","setembro","outubro","novembro","dezembro"
]

function fullDateLabel(data?: string, dateOffset?: number){

 if(data){
  const [diaStr, mesStr] = data.split("/")
  const dia = Number(diaStr)
  const mes = Number(mesStr)
  if(dia && mes) return `${dia} de ${MESES_LONGOS[mes - 1]}`
 }

 const d = new Date()
 d.setDate(d.getDate() + (dateOffset ?? 0))

 return `${d.getDate()} de ${MESES_LONGOS[d.getMonth()]}`

}

interface Props {
 liturgy: LiturgyData | null
 loadingLiturgy: boolean
 liturgyError: string | null
 dateOffset: number
 setDateOffset: Dispatch<SetStateAction<number>>
 displayDateLabel: string
}

export default function LiturgyCard({
 liturgy,
 loadingLiturgy,
 liturgyError,
 dateOffset,
 setDateOffset,
 displayDateLabel
}: Props){

 return(

  <section className={styles.liturgyCard}>

   <div className={styles.sectionHeader}>

    <span className={styles.sectionBadge}>
     LITURGIA DO DIA
    </span>

    <div className={styles.liturgyDateNav}>

     <button
      className={styles.liturgyNavBtn}
      onClick={()=>setDateOffset(o=>o-1)}
      aria-label="Dia anterior"
     >
      <ChevronLeft size={18}/>
     </button>

     <h2>{displayDateLabel}</h2>

     <button
      className={styles.liturgyNavBtn}
      onClick={()=>setDateOffset(o=>o+1)}
      disabled={dateOffset >= 2}
      aria-label="Próximo dia"
     >
      <ChevronRight size={18}/>
     </button>

    </div>

    <span className={styles.liturgyFullDate}>
     {fullDateLabel(liturgy?.data, dateOffset)}
    </span>

    {dateOffset !== 0 && (
     <button
      className={styles.liturgyTodayBtn}
      onClick={()=>setDateOffset(0)}
     >
      Voltar para hoje
     </button>
    )}

   </div>

   <SaintOfDayCard liturgy={liturgy} dateOffset={dateOffset}/>

   {loadingLiturgy && !liturgy && (

    <p className={styles.infoText}>
     Carregando liturgia...
    </p>

   )}

   {liturgyError && !liturgy && (

    <p className={styles.errorText}>
     {liturgyError}
    </p>

   )}

   <LiturgyReadingButtons liturgy={liturgy} />

  </section>

 )

}
