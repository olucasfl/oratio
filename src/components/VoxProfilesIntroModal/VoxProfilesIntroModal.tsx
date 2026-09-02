import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Loader2 } from "lucide-react"

import type { VoxProfileMeta } from "../../services/voxService"
import { markOverlayOpen, markOverlayClosed } from "../../utils/overlayCoordinator"
import VoxProfileList from "../VoxProfileList/VoxProfileList"
import VoxProfileDetailsModal from "../VoxProfileDetailsModal/VoxProfileDetailsModal"

import styles from "./VoxProfilesIntroModal.module.css"

interface Props {
  open: boolean
  profiles: VoxProfileMeta[]
  loadingProfiles: boolean
  /** grava o perfil marcado — resolve `true` em sucesso */
  onChoose: (key: string) => Promise<boolean>
  /** "Depois": dispensa sem escolher (fica no Padrão) */
  onDismiss: () => void
}

/*
Card de novidade, mostrado UMA vez (backend: bootstrap.showVoxIntro). Quem
não escolher nada segue no Padrão e não vê mais isto — troca depois pela
engrenagem. Escolher qualquer perfil OU "Depois" encerra o onboarding.
*/
export default function VoxProfilesIntroModal({
  open,
  profiles,
  loadingProfiles,
  onChoose,
  onDismiss,
}: Props) {
  const [selected, setSelected] = useState("DEFAULT")
  const [detailsKey, setDetailsKey] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!open) return

    markOverlayOpen("vox-profiles-intro")

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onDismiss()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"

    return () => {
      markOverlayClosed("vox-profiles-intro")
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, busy, onDismiss])

  if (!open) return null

  async function handleChoose() {
    if (busy) return
    setError(false)
    setBusy(true)
    const ok = await onChoose(selected)
    if (!ok) {
      setBusy(false)
      setError(true)
    }
    // sucesso: o pai fecha o modal
  }

  const detailsProfile = profiles.find((p) => p.key === detailsKey) ?? null

  return createPortal(
    <>
      <div className={styles.overlay}>
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-label="Novidade: os perfis do Vox chegaram"
        >
          <span className={styles.badge}>Novidade</span>
          <h2 className={styles.title}>Escolha como o Vox responde</h2>
          <p className={styles.pitch}>
            Agora você pode dar ao Vox um estilo de resposta. A identidade e a fidelidade à
            doutrina continuam as mesmas — muda o jeito de explicar. Você troca quando quiser
            na engrenagem de configurações.
          </p>

          {loadingProfiles ? (
            <p className={styles.pitch}>
              <Loader2 size={16} className={styles.spin} /> Carregando perfis...
            </p>
          ) : (
            <VoxProfileList
              profiles={profiles}
              selected={selected}
              onSelect={setSelected}
              onOpenDetails={setDetailsKey}
              disabled={busy}
            />
          )}

          {error && (
            <p className={styles.error}>Não deu pra salvar agora. Tente de novo ou use "Depois".</p>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.later}
              onClick={onDismiss}
              disabled={busy}
            >
              Depois
            </button>
            <button
              type="button"
              className={styles.choose}
              onClick={handleChoose}
              disabled={busy || loadingProfiles}
            >
              {busy && <Loader2 size={15} className={styles.spin} />}
              Usar este perfil
            </button>
          </div>
        </div>
      </div>

      <VoxProfileDetailsModal profile={detailsProfile} onClose={() => setDetailsKey(null)} />
    </>,
    document.body,
  )
}
