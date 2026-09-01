import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { useLockBodyScroll } from "../../hooks/useLockBodyScroll"

import styles from "./PromptModal.module.css"

interface Props {
  open: boolean
  title: string
  description?: string
  placeholder?: string
  initialValue?: string
  confirmLabel?: string
  cancelLabel?: string
  maxLength?: number
  onConfirm: (value: string) => void
  onCancel: () => void
}

export default function PromptModal({
  open,
  title,
  description,
  placeholder,
  initialValue = "",
  confirmLabel = "Salvar",
  cancelLabel = "Cancelar",
  maxLength = 60,
  onConfirm,
  onCancel,
}: Props) {

  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useLockBodyScroll(open)

  useEffect(() => {
    if (open) {
      setValue(initialValue)
      const t = setTimeout(() => inputRef.current?.focus(), 40)
      return () => clearTimeout(t)
    }
  }, [open, initialValue])

  if (!open) return null

  const trimmed = value.trim()

  function submit() {
    if (!trimmed) return
    onConfirm(trimmed)
  }

  return createPortal(
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}

        <input
          ref={inputRef}
          className={styles.input}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit()
            if (e.key === "Escape") onCancel()
          }}
        />

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={styles.confirmButton}
            onClick={submit}
            disabled={!trimmed}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
