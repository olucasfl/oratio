import { useMemo } from "react"
import { CAPACITY, ITEM_BY_ID } from "../domain/catalog"
import { jarSegments } from "./jarSegments"
import styles from "./Jar.module.css"

interface Props {
  placed: readonly string[]
  /** Pote miniatura (grade do telão): só o preenchimento, sem legenda. */
  mini?: boolean
  /** Ícone de alerta sobre os itens de Vida negativa (só depois de colocados). */
  warn?: boolean
}

export default function Jar({ placed, mini = false, warn = true }: Props) {
  const { segments, inGaps, state } = useMemo(() => jarSegments(placed), [placed])
  const used = CAPACITY - state.free

  return (
    <div className={mini ? styles.mini : styles.wrap}>
      <div
        className={styles.jar}
        role="img"
        aria-label={`Pote com ${used} de ${CAPACITY} ocupado`}
        data-testid="jar"
      >
        <div className={styles.stack}>
          {segments.map((s, i) => (
            <div
              key={`${s.id}-${i}`}
              className={`${styles.seg} ${styles[s.category]}`}
              style={{ flexBasis: `${s.height}%` }}
              title={ITEM_BY_ID[s.id]?.name}
            >
              {!mini && warn && s.negative && (
                <span className={styles.warn} role="img" aria-label="Esse item machuca a Vida" />
              )}
            </div>
          ))}
        </div>
      </div>
      {!mini && (
        <p className={styles.caption}>
          Espaço livre: <strong>{state.free}</strong>
          {state.gaps > 0 && <> · vãos: <strong>{state.gaps}</strong></>}
          {inGaps > 0 && <> · {inGaps} encaixado{inGaps > 1 ? "s" : ""} nos vãos</>}
        </p>
      )}
    </div>
  )
}

/** Pote miniatura só com o preenchimento (grade do líder/telão, sem a lista de itens). */
export function JarFill({ fill }: { fill: number }) {
  const pct = Math.max(0, Math.min(CAPACITY, fill))
  return (
    <div className={styles.mini}>
      <div className={styles.jar} role="img" aria-label={`Pote ${pct}% cheio`} data-testid="jar-fill">
        <div className={styles.stack}>
          <div className={`${styles.seg} ${styles.CASCALHO}`} style={{ flexBasis: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}
