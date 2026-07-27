import { useNavigate } from "react-router-dom"
import { createPortal } from "react-dom"
import { useEffect } from "react"
import { Sparkles, BrainCircuit } from "lucide-react"
import styles from "./GuestWelcomeModal.module.css"
import { markOverlayOpen, markOverlayClosed } from "../../utils/overlayCoordinator"

interface Props {
  open: boolean
  onClose: () => void
}

const OVERLAY_ID = "guest-welcome"

const BENEFICIOS = [
  "Frase do dia e detalhes do Santo do Dia",
  "Salvar progresso em orações, terços e na Consagração",
  "Acompanhar sua sequência de dias em oração",
  "Pesquisar qualquer palavra ou tema na Bíblia"
]

export default function GuestWelcomeModal({ open, onClose }: Props) {

  const navigate = useNavigate()

  useEffect(() => {
    if (open) markOverlayOpen(OVERLAY_ID)
    else markOverlayClosed(OVERLAY_ID)

    return () => markOverlayClosed(OVERLAY_ID)
  }, [open])

  if (!open) return null

  return createPortal(
    <div className={styles.overlay}>

      <div className={styles.modal}>

        <div className={styles.icon}>
          <Sparkles size={20} />
        </div>

        <h2 className={styles.title}>Bem-vindo ao Oratio</h2>

        <p className={styles.subtitle}>
          Explore liturgia, orações, terços e Bíblia sem conta.
          Criando uma, você também pode:
        </p>

        <div className={styles.voxHighlight}>

          <span className={styles.voxBadge}>EXCLUSIVO DE QUEM TEM CONTA</span>

          <div className={styles.voxRow}>

            <div className={styles.voxIcon}>
              <BrainCircuit size={16} />
            </div>

            <div>
              <strong>VoxAI</strong>
              <p>
                Tire dúvidas de fé com a IA católica mais confiável
                e embasada.
              </p>
            </div>

          </div>

        </div>

        <ul className={styles.list}>
          {BENEFICIOS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className={styles.actions}>

          <button className={styles.secondaryButton} onClick={onClose}>
            Continuar explorando
          </button>

          <button
            className={styles.primaryButton}
            onClick={() => navigate("/register")}
          >
            Criar conta
          </button>

        </div>

      </div>

    </div>,

    document.body
  )

}
