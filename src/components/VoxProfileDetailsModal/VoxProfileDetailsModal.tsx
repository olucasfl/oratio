import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

import type { VoxProfileMeta } from "../../services/voxService"
import VoxMarkdown from "../VoxMarkdown/VoxMarkdown"

import styles from "./VoxProfileDetailsModal.module.css"

interface Props {
  profile: VoxProfileMeta | null
  onClose: () => void
}

/*
Explicação completa de UM perfil: o que muda + um exemplo (pergunta no balão
do usuário, resposta renderizada como no chat). Aberto a partir de um card da
VoxProfileList. Enquanto o conteúdo (details/examples) não foi escrito para
aquele perfil, cai no resumo curto.
*/
export default function VoxProfileDetailsModal({ profile, onClose }: Props) {
  useEffect(() => {
    if (!profile) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [profile, onClose])

  if (!profile) return null

  const example = profile.examples?.[0]

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={`Perfil ${profile.label}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{profile.label}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <p className={styles.sectionLabel}>O que muda neste perfil</p>
        {profile.details.trim() ? (
          <div className={styles.details}>
            <VoxMarkdown>{profile.details}</VoxMarkdown>
          </div>
        ) : (
          <p className={styles.detailsEmpty}>{profile.short}</p>
        )}

        {example && (
          <>
            <p className={styles.sectionLabel}>Exemplo</p>
            <div className={styles.example}>
              <span className={styles.exampleQuestion}>{example.question}</span>
              <div className={styles.exampleAnswer}>
                <VoxMarkdown>{example.answer}</VoxMarkdown>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
