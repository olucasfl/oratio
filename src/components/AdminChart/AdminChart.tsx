import { useMemo, useState } from "react"
import styles from "./AdminChart.module.css"

export interface AdminChartPoint {
  month: string
  label: string
  count: number
}

interface Props {
  data: AdminChartPoint[]
}

/*
Gráfico de barras desenhado com CSS/flexbox (sem lib de gráfico) —
cada barra é um <button> de verdade, então "tocar pra ver o valor"
funciona nativamente por toque, sem depender de hover.
*/
export default function AdminChart({ data }: Props) {

  const [selected, setSelected] = useState(
    Math.max(0, data.length - 1)
  )

  const max = useMemo(
    () => Math.max(1, ...data.map(d => d.count)),
    [data]
  )

  if (!data.length) return null

  const point = data[selected] ?? data[data.length - 1]
  const prevPoint = selected > 0 ? data[selected - 1] : null
  const delta = prevPoint ? point.count - prevPoint.count : null

  return (
    <div className={styles.wrap}>

      <div className={styles.bars}>
        {data.map((d, i) => {
          const heightPct = Math.max(4, (d.count / max) * 100)
          const isSelected = i === selected
          return (
            <button
              key={d.month}
              type="button"
              className={`${styles.barBtn} ${isSelected ? styles.barBtnActive : ""}`}
              onClick={() => setSelected(i)}
              aria-pressed={isSelected}
              aria-label={`${d.label}: ${d.count}`}
            >
              <span className={styles.barTrack}>
                <span
                  className={styles.bar}
                  style={{ height: `${heightPct}%` }}
                />
              </span>
              <span className={styles.barLabel}>{d.label}</span>
            </button>
          )
        })}
      </div>

      <div className={styles.detail}>
        <div className={styles.detailMain}>
          <strong>{point.label}</strong>
          <span className={styles.detailValue}>{point.count}</span>
        </div>
        {delta !== null && (
          <span
            className={`${styles.detailDelta} ${
              delta > 0 ? styles.deltaUp : delta < 0 ? styles.deltaDown : ""
            }`}
          >
            {delta > 0 ? `+${delta}` : delta} vs. {prevPoint!.label}
          </span>
        )}
      </div>

    </div>
  )
}
