import { createPortal } from "react-dom"
import { Heart, NotebookPen, X, FolderPlus, Sparkles } from "lucide-react"

import { useLockBodyScroll } from "../../hooks/useLockBodyScroll"
import {
  HIGHLIGHT_COLORS,
  type BibleMark,
  type HighlightColor,
} from "../../services/bibleMarksService"

import styles from "./VerseActionSheet.module.css"

interface Props {
  open: boolean
  onClose: () => void
  reference: string
  text: string
  mark: BibleMark | undefined
  onSetHighlight: (color: HighlightColor | null) => void
  onToggleFavorite: () => void
  onEditNote: () => void
  onAskVox?: () => void
  onAddToCollection?: () => void
}

const COLOR_LABEL: Record<HighlightColor, string> = {
  amber: "amarelo",
  green: "verde",
  blue: "azul",
  pink: "rosa",
  purple: "roxo",
}

export default function VerseActionSheet({
  open,
  onClose,
  reference,
  text,
  mark,
  onSetHighlight,
  onToggleFavorite,
  onEditNote,
  onAskVox,
  onAddToCollection,
}: Props) {

  useLockBodyScroll(open)

  if (!open) return null

  const favorite = !!mark?.favorite
  const hasNote = !!mark?.note
  const activeColor = mark?.highlightColor ?? null

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

        <div className={styles.hlRow}>
          <span className={styles.hlLabel}>Grifar</span>
          <div className={styles.swatches}>
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c}
                className={`${styles.swatch} ${styles["sw_" + c]} ${activeColor === c ? styles.swatchOn : ""}`}
                onClick={() => onSetHighlight(activeColor === c ? null : c)}
                aria-label={`Grifar de ${COLOR_LABEL[c]}`}
              />
            ))}
          </div>
          {activeColor && (
            <button className={styles.removeHl} onClick={() => onSetHighlight(null)}>
              Remover
            </button>
          )}
        </div>

        <div className={styles.actions}>

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
