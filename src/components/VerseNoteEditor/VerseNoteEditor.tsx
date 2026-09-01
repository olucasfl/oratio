import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Loader2, Trash2, X } from "lucide-react"

import { useLockBodyScroll } from "../../hooks/useLockBodyScroll"

import styles from "./VerseNoteEditor.module.css"

const MAX = 5000

interface Props {
  open: boolean
  reference: string
  initialNote: string
  saving: boolean
  onClose: () => void
  onSave: (note: string) => void
  onDelete: () => void
}

export default function VerseNoteEditor({
  open,
  reference,
  initialNote,
  saving,
  onClose,
  onSave,
  onDelete,
}: Props) {

  const [value, setValue] = useState(initialNote)

  useLockBodyScroll(open)

  useEffect(() => {
    if (open) setValue(initialNote)
  }, [open, initialNote])

  if (!open) return null

  const trimmed = value.trim()
  const dirty = trimmed !== initialNote.trim()

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Anotação de ${reference}`}
      >
        <div className={styles.handle} />

        <div className={styles.header}>
          <div>
            <span className={styles.label}>Anotação</span>
            <span className={styles.ref}>{reference}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <textarea
          className={styles.textarea}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX))}
          placeholder="Escreva o que este versículo te diz, uma dúvida, uma referência de estudo..."
          rows={6}
          autoFocus
        />

        <div className={styles.count}>{value.length}/{MAX}</div>

        <div className={styles.footer}>
          {initialNote.trim() && (
            <button
              className={styles.deleteBtn}
              onClick={onDelete}
              disabled={saving}
            >
              <Trash2 size={16} />
              Excluir
            </button>
          )}
          <button
            className={styles.saveBtn}
            onClick={() => onSave(trimmed)}
            disabled={saving || !dirty}
          >
            {saving ? <Loader2 size={16} className={styles.spin} /> : null}
            Salvar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
