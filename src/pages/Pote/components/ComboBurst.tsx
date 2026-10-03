import Icon from "../../../components/Icon/Icon"
import styles from "../Pote.module.css"

/* Celebração curta quando um combo ativa: ícone que "estoura" com anéis. */
export default function ComboBurst({ icon, name }: { icon: string; name: string }) {
  return (
    <div className={styles.burst} role="status" data-testid="combo-burst">
      <div className={styles.burstCard}>
        <span className={styles.burstRing} aria-hidden />
        <span className={`${styles.burstRing} ${styles.burstRing2}`} aria-hidden />
        <Icon name={icon} size={44} filled className={styles.burstIcon} />
        <strong>{name}</strong>
        <span className={styles.small}>Combo ativado</span>
      </div>
    </div>
  )
}
