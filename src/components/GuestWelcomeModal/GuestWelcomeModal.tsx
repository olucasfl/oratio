import { useNavigate } from "react-router-dom"
import { Sparkles } from "lucide-react"
import styles from "./GuestWelcomeModal.module.css"

interface Props {
  open: boolean
  onClose: () => void
}

const BENEFICIOS = [
  "Salvar seu progresso nas orações e terços",
  "Acompanhar sua sequência de dias em oração",
  "Fazer a Consagração de 33 dias",
  "Conversar com o VoxAI, assistente espiritual",
  "Acompanhar sua caminhada espiritual"
]

export default function GuestWelcomeModal({ open, onClose }: Props) {

  const navigate = useNavigate()

  if (!open) return null

  return (
    <div className={styles.overlay}>

      <div className={styles.modal}>

        <div className={styles.icon}>
          <Sparkles size={26} />
        </div>

        <h2 className={styles.title}>Bem-vindo ao Oratio</h2>

        <p className={styles.subtitle}>
          Você pode explorar a liturgia, orações, terços e a Bíblia
          livremente, sem conta. Criando uma conta, você também pode:
        </p>

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

    </div>
  )

}
