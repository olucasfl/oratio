import { useMemo, useState } from "react"
import type { CSSProperties } from "react"
import styles from "./AdminHeatmap.module.css"

interface Props {
  matrix: number[][]   // matrix[day 0-6][hour 0-23]
  maxCount: number
}

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21]

/*
Heatmap desenhado em CSS/grid (sem lib de gráfico) — cada célula é um
<button> real, então tocar pra ver o valor exato funciona nativamente
em touch. Com 24 colunas, numa tela estreita fica cedo demais pra
espremer tudo: o grid rola de lado, sem virar ilegível.
*/
export default function AdminHeatmap({ matrix, maxCount }: Props) {

  const peak = useMemo(() => {
    let best = { day: 0, hour: 0, count: -1 }
    matrix.forEach((row, day) => {
      row.forEach((count, hour) => {
        if (count > best.count) best = { day, hour, count }
      })
    })
    return best
  }, [matrix])

  const [selected, setSelected] = useState(peak)

  // rgb de --oratio-primary (#b0181a) — usado pra misturar a
  // intensidade via rgba() direto, já que CSS var não dá pra combinar
  // com alpha calculado em JS num style inline.
  function cellStyle(count: number): CSSProperties {
    if (count === 0) return {}
    const alpha = Math.max(0.16, count / maxCount)
    return { background: `rgba(176, 24, 26, ${alpha})` }
  }

  return (
    <div className={styles.wrap}>

      <div className={styles.scrollArea}>
        <div className={styles.grid}>

          <div className={styles.cornerCell} />
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className={styles.hourTick}>
              {HOUR_TICKS.includes(hour) ? `${hour}h` : ""}
            </div>
          ))}

          {matrix.map((row, day) => (
            <div className={styles.row} key={day}>
              <div className={styles.dayLabel}>{DAY_LABELS[day]}</div>
              {row.map((count, hour) => {
                const isSelected = selected.day === day && selected.hour === hour
                return (
                  <button
                    key={hour}
                    type="button"
                    className={`${styles.cell} ${isSelected ? styles.cellActive : ""}`}
                    style={cellStyle(count)}
                    onClick={() => setSelected({ day, hour, count })}
                    aria-label={`${DAY_LABELS[day]} ${hour}h: ${count}`}
                  />
                )
              })}
            </div>
          ))}

        </div>
      </div>

      <div className={styles.detail}>
        <div className={styles.detailMain}>
          <strong>{DAY_LABELS[selected.day]} · {selected.hour}h</strong>
          <span className={styles.detailValue}>{selected.count}</span>
        </div>
        <span className={styles.detailHint}>toque numa célula pra ver o horário</span>
      </div>

    </div>
  )
}
