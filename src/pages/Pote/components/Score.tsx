import type { ReactNode } from "react"
import Icon from "../../../components/Icon/Icon"
import AnimatedNumber from "./AnimatedNumber"
import styles from "../Pote.module.css"

type Kind = "fun" | "life" | "plain"

/* Uma coluna do placar: ícone do Google + rótulo + valor (número animado). */
export function ScoreItem({
  kind,
  label,
  value,
  children,
}: {
  kind: Kind
  label: string
  value?: number
  children?: ReactNode
}) {
  return (
    <div className={styles.scoreItem}>
      <span className={styles.scoreLabel}>
        {kind === "fun" && <Icon name="bolt" size={16} filled className={styles.icoFun} />}
        {kind === "life" && <Icon name="favorite" size={16} filled className={styles.icoLife} />}
        {label}
      </span>
      <strong className={styles.scoreValue}>
        {value !== undefined ? <AnimatedNumber value={value} /> : children}
      </strong>
    </div>
  )
}

export function ScoreBar({ children }: { children: ReactNode }) {
  return <div className={styles.scoreBar}>{children}</div>
}
