import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X, Loader2, AlertTriangle } from "lucide-react"

import type { VoxProfileMeta } from "../../services/voxService"
import VoxProfileList from "../VoxProfileList/VoxProfileList"
import VoxProfileDetailsModal from "../VoxProfileDetailsModal/VoxProfileDetailsModal"

import styles from "./VoxSettingsPanel.module.css"

interface Props {
  open: boolean
  onClose: () => void
  profiles: VoxProfileMeta[]
  loadingProfiles: boolean
  /** perfil ativo (chave); `null` conta como "DEFAULT" para a marcação */
  selected: string | null
  /** troca de perfil — deve resolver `true` em sucesso, `false` em falha */
  onSelectProfile: (key: string) => Promise<boolean>
}

/*
Bottom sheet "Configurações do Vox". Hoje só troca de perfil de resposta; a
seção está montada de forma a receber outras configurações depois. A troca é
otimista: marca na hora e reverte se a API falhar.
*/
export default function VoxSettingsPanel({
  open,
  onClose,
  profiles,
  loadingProfiles,
  selected,
  onSelectProfile,
}: Props) {
  const [detailsKey, setDetailsKey] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  const current = selected ?? "DEFAULT"

  async function handleSelect(key: string) {
    if (saving || key === current) return
    setError(false)
    setSaving(true)
    const ok = await onSelectProfile(key)
    setSaving(false)
    if (!ok) setError(true)
  }

  const detailsProfile = profiles.find((p) => p.key === detailsKey) ?? null

  return createPortal(
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-label="Configurações do Vox"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>Configurações do Vox</h2>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </button>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionTitle}>Estilo de resposta</p>
            <p className={styles.sectionHint}>
              Escolha como o Vox responde. A identidade e a fidelidade à doutrina não mudam —
              muda o jeito de explicar.
            </p>

            {error && (
              <div className={styles.error} role="alert">
                <AlertTriangle size={15} />
                Não foi possível trocar o perfil agora. Tente de novo.
              </div>
            )}

            {loadingProfiles ? (
              <p className={styles.loading}>
                <Loader2 size={16} className={styles.spin} /> Carregando perfis...
              </p>
            ) : (
              <VoxProfileList
                profiles={profiles}
                selected={current}
                onSelect={handleSelect}
                onOpenDetails={setDetailsKey}
                disabled={saving}
              />
            )}
          </div>
        </div>
      </div>

      <VoxProfileDetailsModal profile={detailsProfile} onClose={() => setDetailsKey(null)} />
    </>,
    document.body,
  )
}
