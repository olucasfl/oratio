import { createPortal } from "react-dom"
import { Heart, Highlighter, NotebookPen, X, FolderPlus, Sparkles } from "lucide-react"

import { useLockBodyScroll } from "../../hooks/useLockBodyScroll"
import type { BibleMark } from "../../services/bibleMarksService"

import styles from "./VerseActionSheet.module.css"

interface Props {
  open: boolean
  onClose: () => void
  reference: string
  text: string
  mark: BibleMark | undefined
  onToggleHighlight: () => void
  onToggleFavorite: () => void
  onEditNote: () => void
  onAskVox?: () => void
  onAddToCollection?: () => void
}

export default function VerseActionSheet({
  open,
  onClose,
  reference,
  text,
  mark,
  onToggleHighlight,
  onToggleFavorite,
  onEditNote,
  onAskVox,
  onAddToCollection,
}: Props) {

  useLockBodyScroll(open)

  if (!open) return null

  const highlighted = !!mark?.highlighted
  const favorite = !!mark?.favorite
  const hasNote = !!mark?.note

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Ações para ${reference}`}
      >
        <div className={styles.handle} />

        <div className={styles.header}>
          <span className={styles.ref}>{reference}</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <p className={styles.preview}>{text}</p>

        <div className={styles.actions}>

          <button
            className={`${styles.action} ${highlighted ? styles.actionOn : ""}`}
            onClick={onToggleHighlight}
          >
            <Highlighter size={19} />
            {highlighted ? "Remover grifo" : "Grifar"}
          </button>

          <button
            className={`${styles.action} ${favorite ? styles.actionOn : ""}`}
            onClick={onToggleFavorite}
          >
            <Heart size={19} fill={favorite ? "currentColor" : "none"} />
            {favorite ? "Desfavoritar" : "Favoritar"}
          </button>

          <button className={styles.action} onClick={onEditNote}>
            <NotebookPen size={19} />
            {hasNote ? "Editar anotação" : "Anotar"}
          </button>

          {onAddToCollection && (
            <button className={styles.action} onClick={onAddToCollection}>
              <FolderPlus size={19} />
              Adicionar à coleção
            </button>
          )}

          {onAskVox && (
            <button className={styles.action} onClick={onAskVox}>
              <Sparkles size={19} />
              Perguntar ao Vox
            </button>
          )}

        </div>
      </div>
    </div>,
    document.body,
  )
}
