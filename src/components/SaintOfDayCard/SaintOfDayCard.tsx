import { useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"

import styles from "./SaintOfDayCard.module.css"

import type { LiturgyData } from "../../hooks/useLiturgy"
import { resolveSaintOfDay } from "../../utils/saintOfDay"

interface Props {
  liturgy: LiturgyData | null
  dateOffset: number
}

const MESES_ABREV = [
  "JAN","FEV","MAR","ABR","MAI","JUN",
  "JUL","AGO","SET","OUT","NOV","DEZ"
]

function parseDataInfo(data?: string){

  if(!data) return null

  const [diaStr, mesStr, anoStr] = data.split("/")

  const dia = Number(diaStr)
  const mes = Number(mesStr)
  const ano = Number(anoStr)

  if(!dia || !mes || !ano) return null

  const date = new Date(ano, mes - 1, dia)

  const diaSemana =
    date.toLocaleDateString("pt-BR", { weekday:"long" })

  return {
    dia,
    mesAbrev: MESES_ABREV[mes - 1],
    diaSemana:
      diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)
  }

}

export default function SaintOfDayCard({ liturgy, dateOffset }: Props){

  const navigate = useNavigate()

  const info = resolveSaintOfDay(liturgy)

  if(!info) return null

  const dataInfo = parseDataInfo(info.data)

  const intro =
    dateOffset === 0 ? "Hoje é dia de" :
    dateOffset === -1 ? "Ontem foi dia de" :
    dateOffset === 1 ? "Amanhã é dia de" :
    "Nesse dia é celebrado"

  const grauLabel =
    info.opcional ? "Memória Facultativa" : info.grau

  const corLabel =
    info.cor ? info.cor.charAt(0).toUpperCase() + info.cor.slice(1) : null

  return(

    <button
      className={styles.card}
      onClick={()=>
        navigate("/oratio/santo-do-dia", { state:{ liturgy, dateOffset } })
      }
    >

      <span className={styles.eyebrow}>{intro}</span>

      {/* MEDALHÃO */}

      <div className={styles.medallionWrap}>

        <span
          className={styles.medallionRing}
          style={{ borderColor:info.corHex }}
        />

        <div
          className={styles.medallion}
          style={{ background:`${info.corHex}14` }}
        >

          {dataInfo ? (

            <>
              <strong
                className={styles.medDia}
                style={{ color:info.corHex }}
              >
                {dataInfo.dia}
              </strong>

              <span
                className={styles.medMes}
                style={{ color:info.corHex }}
              >
                {dataInfo.mesAbrev}
              </span>
            </>

          ) : (

            <span
              className={styles.medCross}
              style={{ color:info.corHex }}
            >
              ✝
            </span>

          )}

        </div>

      </div>

      {dataInfo && (
        <span className={styles.diaSemana}>{dataInfo.diaSemana}</span>
      )}

      {/* FITA COM O GRAU */}

      <div
        className={styles.ribbon}
        style={{ background:info.corHex }}
      >
        {grauLabel}
      </div>

      {/* NOME */}

      <strong className={styles.nome}>
        {info.nome}
      </strong>

      {corLabel && (
        <div className={styles.colorLine}>

          <span
            className={styles.colorDot}
            style={{ background:info.corHex }}
          />

          <span>
            Cor litúrgica: <strong>{corLabel}</strong>
          </span>

        </div>
      )}

      <span className={styles.ornament} aria-hidden="true">✦</span>

      <span
        className={styles.hint}
        style={{ color:info.corHex }}
      >
        Ver detalhes
        <ChevronRight size={15}/>
      </span>

    </button>

  )

}
