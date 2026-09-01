import { useCallback, useState } from "react"

/*
 Preferências do painel de leitura da Bíblia (tamanho de fonte,
 espaçamento, fonte, tema de fundo, largura da coluna).

 Fica só em localStorage — é preferência de aparelho, igual ao
 utils/fontScale.ts. A chave NÃO contém "oratio"/"stage_"/"consecration"
 de propósito, pra sobreviver ao cleanup do bump de APP_VERSION
 (App.tsx §3); e está em KEEP_ON_LOGOUT (api.ts) pra sobreviver ao logout.
*/

export type ReadingTheme = "claro" | "sepia" | "escuro"
export type ReadingFont = "serif" | "sans"
export type ReadingSpacing = "compacto" | "normal" | "solto"
export type ReadingWidth = "normal" | "largo"

export interface ReadingPrefs {
  fontSize: number
  spacing: ReadingSpacing
  font: ReadingFont
  theme: ReadingTheme
  width: ReadingWidth
}

const KEY = "bibliaLeituraPrefs"

export const FONT_MIN = 15
export const FONT_MAX = 30
export const FONT_STEP = 2

const DEFAULTS: ReadingPrefs = {
  fontSize: 19,
  spacing: "normal",
  font: "serif",
  theme: "claro",
  width: "normal",
}

const SPACING_VALUES: Record<ReadingSpacing, number> = {
  compacto: 1.7,
  normal: 2.0,
  solto: 2.45,
}

const SPACINGS: ReadingSpacing[] = ["compacto", "normal", "solto"]
const FONTS: ReadingFont[] = ["serif", "sans"]
const THEMES: ReadingTheme[] = ["claro", "sepia", "escuro"]
const WIDTHS: ReadingWidth[] = ["normal", "largo"]

function clampFont(n: number): number {
  if (!Number.isFinite(n)) return DEFAULTS.fontSize
  return Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(n)))
}

function pick<T>(value: unknown, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

function load(): ReadingPrefs {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    const p = JSON.parse(raw) as Partial<ReadingPrefs>
    return {
      fontSize: clampFont(Number(p.fontSize ?? DEFAULTS.fontSize)),
      spacing: pick(p.spacing, SPACINGS, DEFAULTS.spacing),
      font: pick(p.font, FONTS, DEFAULTS.font),
      theme: pick(p.theme, THEMES, DEFAULTS.theme),
      width: pick(p.width, WIDTHS, DEFAULTS.width),
    }
  } catch {
    return DEFAULTS
  }
}

export function useReadingPrefs() {
  const [prefs, setPrefs] = useState<ReadingPrefs>(load)

  const update = useCallback((patch: Partial<ReadingPrefs>) => {
    setPrefs((prev) => {
      const next: ReadingPrefs = { ...prev, ...patch }
      if (patch.fontSize !== undefined) next.fontSize = clampFont(next.fontSize)
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        /* localStorage indisponível (modo privado) — aplica só na sessão */
      }
      return next
    })
  }, [])

  const lineHeight = SPACING_VALUES[prefs.spacing]

  const fontFamily =
    prefs.font === "serif"
      ? "var(--oratio-font-text)"
      : "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"

  return { prefs, update, lineHeight, fontFamily }
}
