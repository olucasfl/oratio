const STORAGE_KEY = "oratio_font_scale"

export const FONT_SCALE_OPTIONS = [
  { value: 0.9,  label: "Pequena" },
  { value: 1,    label: "Normal" },
  { value: 1.15, label: "Grande" },
] as const

const MAX_FONT_SCALE = FONT_SCALE_OPTIONS[FONT_SCALE_OPTIONS.length - 1].value

export function getStoredFontScale(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? parseFloat(raw) : 1
    if (!Number.isFinite(parsed) || parsed <= 0) return 1
    // clamp valores antigos salvos antes da opção "Muito grande" ser removida
    return Math.min(parsed, MAX_FONT_SCALE)
  } catch {
    return 1
  }
}

export function applyFontScale(scale: number) {
  document.documentElement.style.setProperty("--oratio-font-scale", String(scale))
}

export function setFontScale(scale: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(scale))
  } catch {
    // localStorage indisponível (modo privado etc.) — aplica só na sessão atual
  }
  applyFontScale(scale)
}

// Chamado uma vez, antes do primeiro paint (em main.tsx) — evita o
// "flash" de fonte no tamanho padrão antes da preferência salva ser lida.
export function applyStoredFontScale() {
  applyFontScale(getStoredFontScale())
}
