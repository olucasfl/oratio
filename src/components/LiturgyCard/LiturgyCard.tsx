import type { Dispatch, SetStateAction } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import LiturgyReadingButtons from "../LiturgyReadingButtons/LiturgyReadingButtons"
import type { LiturgyData } from "../../hooks/useLiturgy"

import styles from "../../pages/Home/Home.module.css"

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

    {dateOffset !== 0 && (
     <button
      className={styles.liturgyTodayBtn}
      onClick={()=>setDateOffset(0)}
     >
      Voltar para hoje
     </button>
    )}

   </div>

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
