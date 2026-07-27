import { useNavigate } from "react-router-dom"
import { LockKeyhole } from "lucide-react"
import styles from "./GuestGateModal.module.css"

interface Props {
  open: boolean
  message: string
  onClose: () => void
}

export default function GuestGateModal({ open, message, onClose }: Props) {

  const navigate = useNavigate()

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose}>

      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div className={styles.icon}>
          <LockKeyhole size={22} />
        </div>

        <h2 className={styles.title}>Crie sua conta</h2>

        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>

          <button
            className={styles.primaryButton}
            onClick={() => navigate("/register")}
          >
            Criar conta
          </button>

          <button
            className={styles.secondaryButton}
            onClick={() => navigate("/login")}
          >
            Já tenho conta — Entrar
          </button>

          <button className={styles.dismissButton} onClick={onClose}>
            Agora não
          </button>

        </div>

      </div>

    </div>
  )

}
