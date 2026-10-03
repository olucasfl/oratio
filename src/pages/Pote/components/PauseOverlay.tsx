import Icon from "../../../components/Icon/Icon"
import { PAUSED_MESSAGE } from "../domain/content"
import styles from "../Pote.module.css"

/* Cobre a tela de jogadores e telão quando o líder pausa. Os timers já estão
   congelados no estado do servidor; isto só avisa e bloqueia o toque. */
export default function PauseOverlay({ paused }: { paused: boolean }) {
  if (!paused) return null
  return (
    <div className={styles.pauseOverlay} role="alert" data-testid="pause-overlay">
      <div className={styles.pauseCard}>
        <Icon name="pause_circle" size={72} filled className={styles.pauseIcon} />
        <p style={{ margin: 0 }}>{PAUSED_MESSAGE}</p>
      </div>
    </div>
  )
}
