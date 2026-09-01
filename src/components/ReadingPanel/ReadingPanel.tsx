import { createPortal } from "react-dom"
import { Minus, Plus, X } from "lucide-react"

import {
  FONT_MAX,
  FONT_MIN,
  FONT_STEP,
  type ReadingFont,
  type ReadingPrefs,
  type ReadingSpacing,
  type ReadingTheme,
  type ReadingWidth,
} from "../../hooks/useReadingPrefs"

import { useLockBodyScroll } from "../../hooks/useLockBodyScroll"

import styles from "./ReadingPanel.module.css"

interface Props {
  open: boolean
  onClose: () => void
  prefs: ReadingPrefs
  update: (patch: Partial<ReadingPrefs>) => void
}

const SPACING_OPTIONS: { value: ReadingSpacing; label: string }[] = [
  { value: "compacto", label: "Compacto" },
  { value: "normal", label: "Normal" },
  { value: "solto", label: "Solto" },
]

const FONT_OPTIONS: { value: ReadingFont; label: string }[] = [
  { value: "serif", label: "Serifada" },
  { value: "sans", label: "Sem serifa" },
]

const THEME_OPTIONS: { value: ReadingTheme; label: string }[] = [
  { value: "claro", label: "Claro" },
  { value: "sepia", label: "Sépia" },
  { value: "escuro", label: "Escuro" },
]

const WIDTH_OPTIONS: { value: ReadingWidth; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "largo", label: "Largo" },
]

export default function ReadingPanel({ open, onClose, prefs, update }: Props) {

  useLockBodyScroll(open)

  if (!open) return null

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Ajustes de leitura"
      >

        <div className={styles.handle} />

        <div className={styles.header}>
          <h3>Leitura</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>

          <div className={styles.group}>
            <label>Tamanho da fonte</label>
            <div className={styles.stepper}>
              <button
                className={styles.stepBtn}
                onClick={() => update({ fontSize: prefs.fontSize - FONT_STEP })}
                disabled={prefs.fontSize <= FONT_MIN}
                aria-label="Diminuir fonte"
              >
                <Minus size={16} />
              </button>
              <span className={styles.stepValue}>{prefs.fontSize}px</span>
              <button
                className={styles.stepBtn}
                onClick={() => update({ fontSize: prefs.fontSize + FONT_STEP })}
                disabled={prefs.fontSize >= FONT_MAX}
                aria-label="Aumentar fonte"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className={styles.group}>
            <label>Espaçamento</label>
            <div className={styles.row}>
              {SPACING_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  className={`${styles.chip} ${prefs.spacing === o.value ? styles.chipOn : ""}`}
                  onClick={() => update({ spacing: o.value })}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <label>Fonte</label>
            <div className={styles.row}>
              {FONT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  className={`${styles.chip} ${prefs.font === o.value ? styles.chipOn : ""}`}
                  onClick={() => update({ font: o.value })}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <label>Tema</label>
            <div className={styles.row}>
              {THEME_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  className={`${styles.themeChip} ${prefs.theme === o.value ? styles.themeChipOn : ""}`}
                  onClick={() => update({ theme: o.value })}
                >
                  <span className={styles.themeSwatch} data-theme={o.value}>Aa</span>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <label>Largura</label>
            <div className={styles.row}>
              {WIDTH_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  className={`${styles.chip} ${prefs.width === o.value ? styles.chipOn : ""}`}
                  onClick={() => update({ width: o.value })}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>,
    document.body,
  )
}
