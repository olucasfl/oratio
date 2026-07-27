import { useNavigate, useLocation } from "react-router-dom"
import { createPortal } from "react-dom"
import { LockKeyhole } from "lucide-react"
import styles from "./GuestGateModal.module.css"
import { withRedirect } from "../../utils/authRedirect"

interface Props {
  open: boolean
  message: string
  onClose: () => void
}

export default function GuestGateModal({ open, message, onClose }: Props) {

  const navigate = useNavigate()
  const location = useLocation()

  if (!open) return null

  const currentPath = location.pathname + location.search

  return createPortal(
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
            onClick={() => navigate(withRedirect("/register", currentPath))}
          >
            Criar conta
          </button>

          <button
            className={styles.secondaryButton}
            onClick={() => navigate(withRedirect("/login", currentPath))}
          >
            Já tenho conta — Entrar
          </button>

          <button className={styles.dismissButton} onClick={onClose}>
            Agora não
          </button>

        </div>

      </div>

    </div>,

    document.body
  )

}
