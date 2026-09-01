import { createPortal } from "react-dom"
import { X } from "lucide-react"

import { useLockBodyScroll } from "../../hooks/useLockBodyScroll"

import styles from "./NoteViewerModal.module.css"

interface Props {
  open: boolean
  reference: string
  note: string
  onClose: () => void
}

/* Só leitura. Mostra uma anotação que pode ser enorme, com rolagem
   interna — nunca "estoura" a tela. Para editar, o usuário abre o
   VerseNoteEditor no capítulo. */
export default function NoteViewerModal({ open, reference, note, onClose }: Props) {

  useLockBodyScroll(open)

  if (!open) return null

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Anotação de ${reference}`}
      >
        <div className={styles.header}>
          <div>
            <span className={styles.label}>Anotação</span>
            <span className={styles.ref}>{reference}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>{note}</div>
      </div>
    </div>,
    document.body,
  )
}
