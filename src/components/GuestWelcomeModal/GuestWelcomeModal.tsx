import { useNavigate } from "react-router-dom"
import { createPortal } from "react-dom"
import { useEffect, useState } from "react"
import {
  Sparkles,
  BrainCircuit,
  Share2,
  SquarePlus,
  MoreVertical,
  Smartphone
} from "lucide-react"
import styles from "./GuestWelcomeModal.module.css"
import { isPWA } from "../../utils/isPwa"
import { isIOSDevice, isAndroidDevice } from "../../utils/deviceDetect"
import { canInstallDirectly, promptInstall } from "../../utils/installPrompt"

interface Props {
  open: boolean
  onClose: () => void
}

const BENEFICIOS = [
  "Pegar sua frase do dia, todos os dias",
  "Salvar seu progresso nas orações e terços",
  "Acompanhar sua sequência de dias em oração",
  "Fazer a Consagração de 33 dias",
  "Ver os detalhes do Santo do Dia",
  "Pesquisar qualquer palavra ou tema na Bíblia",
  "Acompanhar sua caminhada espiritual"
]

/*
O tutorial de instalação só existe pra quem está no navegador (fora do
app instalado) — combinado com o mesmo modal do passo 1, em vez de um
segundo popup separado, pra não empilhar avisos nem soar repetitivo.
*/
export default function GuestWelcomeModal({ open, onClose }: Props) {

  const navigate = useNavigate()

  const showInstallStep = !isPWA()

  const [step, setStep] = useState<1 | 2>(1)

  useEffect(() => {
    if (open) setStep(1)
  }, [open])

  if (!open) return null

  function goToStep2() {
    if (showInstallStep) {
      setStep(2)
    } else {
      onClose()
    }
  }

  async function handleInstallNow() {
    const accepted = await promptInstall()
    if (accepted) onClose()
  }

  if (step === 2) {

    const ios = isIOSDevice()
    const android = isAndroidDevice()
    const canInstall = canInstallDirectly()

    return createPortal(
      <div className={styles.overlay}>

        <div className={styles.modal}>

          <div className={styles.stepDots}>
            <span className={styles.stepDot} />
            <span className={`${styles.stepDot} ${styles.stepDotActive}`} />
          </div>

          <div className={styles.icon}>
            <Smartphone size={26} />
          </div>

          <h2 className={styles.title}>Leve o Oratio com você</h2>

          <p className={styles.subtitle}>
            Adicione o Oratio à tela de início do seu celular e abra
            como um aplicativo de verdade — sem precisar do navegador.
          </p>

          <div className={styles.tutorialSteps}>

            {ios && (
              <>
                <div className={styles.tutorialStep}>
                  <div className={styles.tutorialStepIcon}>
                    <Share2 size={19} />
                  </div>
                  <p>
                    Toque no ícone de <strong>compartilhar</strong> na
                    barra do navegador
                  </p>
                </div>

                <div className={styles.tutorialStep}>
                  <div className={styles.tutorialStepIcon}>
                    <SquarePlus size={19} />
                  </div>
                  <p>
                    Escolha <strong>"Adicionar à Tela de Início"</strong>
                  </p>
                </div>
              </>
            )}

            {!ios && android && !canInstall && (
              <>
                <div className={styles.tutorialStep}>
                  <div className={styles.tutorialStepIcon}>
                    <MoreVertical size={19} />
                  </div>
                  <p>
                    Toque no menu <strong>⋮</strong> do navegador
                  </p>
                </div>

                <div className={styles.tutorialStep}>
                  <div className={styles.tutorialStepIcon}>
                    <SquarePlus size={19} />
                  </div>
                  <p>
                    Escolha <strong>"Instalar aplicativo"</strong> ou
                    <strong> "Adicionar à tela inicial"</strong>
                  </p>
                </div>
              </>
            )}

            {!ios && !android && (
              <div className={styles.tutorialStep}>
                <div className={styles.tutorialStepIcon}>
                  <SquarePlus size={19} />
                </div>
                <p>
                  Procure o ícone de <strong>instalar</strong> na barra
                  de endereço do navegador
                </p>
              </div>
            )}

          </div>

          <div className={styles.actions}>

            <button className={styles.secondaryButton} onClick={onClose}>
              Agora não
            </button>

            {canInstall ? (
              <button className={styles.primaryButton} onClick={handleInstallNow}>
                Instalar agora
              </button>
            ) : (
              <button className={styles.primaryButton} onClick={onClose}>
                Entendi
              </button>
            )}

          </div>

        </div>

      </div>,

      document.body
    )

  }

  return createPortal(
    <div className={styles.overlay}>

      <div className={styles.modal}>

        {showInstallStep && (
          <div className={styles.stepDots}>
            <span className={`${styles.stepDot} ${styles.stepDotActive}`} />
            <span className={styles.stepDot} />
          </div>
        )}

        <div className={styles.icon}>
          <Sparkles size={26} />
        </div>

        <h2 className={styles.title}>Bem-vindo ao Oratio</h2>

        <p className={styles.subtitle}>
          Você pode explorar a liturgia, orações, terços e a Bíblia
          livremente, sem conta. Criando uma conta, você também pode:
        </p>

        <div className={styles.voxHighlight}>

          <span className={styles.voxBadge}>EXCLUSIVO DE QUEM TEM CONTA</span>

          <div className={styles.voxRow}>

            <div className={styles.voxIcon}>
              <BrainCircuit size={22} />
            </div>

            <div>
              <strong>VoxAI</strong>
              <p>
                A primeira Inteligência Artificial Católica do Oratio —
                tire dúvidas sobre fé, moral e liturgia com respostas
                fundamentadas na doutrina da Igreja.
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

          <button className={styles.secondaryButton} onClick={goToStep2}>
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
