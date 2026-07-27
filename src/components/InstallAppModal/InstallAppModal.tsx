import { createPortal } from "react-dom"
import { useEffect } from "react"
import { Share2, SquarePlus, MoreVertical, Smartphone } from "lucide-react"
import styles from "./InstallAppModal.module.css"
import { isIOSDevice, isAndroidDevice } from "../../utils/deviceDetect"
import { canInstallDirectly, promptInstall } from "../../utils/installPrompt"
import { markOverlayOpen, markOverlayClosed } from "../../utils/overlayCoordinator"

interface Props {
  open: boolean
  onClose: () => void
}

const OVERLAY_ID = "install-app"

/*
Tutorial visual de "adicionar à tela de início" — usado tanto pelo
passo 2 do aviso de boas-vindas (convidado, na Home) quanto pelo
InstallAppNudge (lembrete ocasional, qualquer tela, convidado ou não).
*/
export default function InstallAppModal({ open, onClose }: Props) {

  useEffect(() => {
    if (open) markOverlayOpen(OVERLAY_ID)
    else markOverlayClosed(OVERLAY_ID)

    return () => markOverlayClosed(OVERLAY_ID)
  }, [open])

  if (!open) return null

  const ios = isIOSDevice()
  const android = isAndroidDevice()
  const canInstall = canInstallDirectly()

  async function handleInstallNow() {
    const accepted = await promptInstall()
    if (accepted) onClose()
  }

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>

      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

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
