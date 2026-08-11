import type { Dispatch, SetStateAction } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import LiturgyReadingButtons from "../LiturgyReadingButtons/LiturgyReadingButtons"
import SaintOfDayCard from "../SaintOfDayCard/SaintOfDayCard"
import type { LiturgyData } from "../../hooks/useLiturgy"
import { getLiturgicalColor, parseCelebration } from "../../utils/liturgicalCelebration"

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

 const lit = getLiturgicalColor(liturgy?.cor)

 const corLabel = liturgy?.cor
  ? liturgy.cor.charAt(0).toUpperCase() + liturgy.cor.slice(1)
  : null

 // "Branco" e "Dourado" são cores litúrgicas CLARAS — um hero saturado com
 // texto branco não funciona. Nesses dias o hero vira um marfim/bege com
 // texto escuro e detalhes em dourado: característico e sem se confundir
 // com o fundo de pergaminho da Home.
 const corKey = (liturgy?.cor || "").trim().toLowerCase()
 const isLight = corKey === "branco" || corKey === "dourado"

 // A API entrega a celebração no campo "liturgia" (ex.: "Sábado da 19ª
 // Semana do Tempo Comum"); parseCelebration separa nome e grau quando há.
 const celeb = parseCelebration(liturgy?.liturgia)
 const celebNome = celeb?.nome || liturgy?.liturgia || "Liturgia do dia"
 const grau = celeb?.grau || "Féria"

 return(

  <section className={styles.liturgyWrap}>

   {/* CABEÇALHO + NAVEGAÇÃO DE DIA */}

   <div className={styles.liturgyHead}>

    <span className={styles.sectionBadge}>
     Liturgia de hoje
    </span>

    <div className={styles.liturgyHeadNav}>

     <button
      className={styles.liturgyNavBtn}
      onClick={()=>setDateOffset(o=>o-1)}
      aria-label="Dia anterior"
     >
      <ChevronLeft size={18}/>
     </button>

     <span>{displayDateLabel}</span>

     <button
      className={styles.liturgyNavBtn}
      onClick={()=>setDateOffset(o=>o+1)}
      disabled={dateOffset >= 2}
      aria-label="Próximo dia"
     >
      <ChevronRight size={18}/>
     </button>

    </div>

   </div>

   {dateOffset !== 0 && (
    <div className={styles.liturgyTodayRow}>
     <button
      className={styles.liturgyTodayBtn}
      onClick={()=>setDateOffset(0)}
     >
      Voltar para hoje
     </button>
    </div>
   )}

   {/* HERO NA COR LITÚRGICA */}

   <div
    className={`${styles.liturgyHero} ${isLight ? styles.liturgyHeroLight : ""}`}
    style={{ ["--lit" as string]: lit.hex }}
   >

    <div className={styles.heroSeason}>
     <span className={styles.heroDot} aria-hidden="true"/>
     {corLabel ? `Tempo litúrgico · ${corLabel}` : "Liturgia do dia"}
    </div>

    <h2 className={styles.heroTitle}>{celebNome}</h2>

    <div className={styles.heroGrau}>{grau}</div>

    {corLabel && (
     <div className={styles.heroColorLine}>
      Cor litúrgica
      <span className={styles.heroSwatch} aria-hidden="true"/>
      {corLabel}
     </div>
    )}

    {loadingLiturgy && !liturgy && (
     <p className={styles.heroInfo}>Carregando liturgia...</p>
    )}

    {liturgyError && !liturgy && (
     <p className={styles.heroInfo}>{liturgyError}</p>
    )}

    <LiturgyReadingButtons liturgy={liturgy} dateOffset={dateOffset} />

   </div>

   {/* SANTO DO DIA (card próprio, abaixo do hero) */}

   <SaintOfDayCard liturgy={liturgy} dateOffset={dateOffset}/>

  </section>

 )

}
