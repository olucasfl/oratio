import {
  BookOpen,
  BookMarked,
  Flower2,
  Flame,
  HeartHandshake,
  Church,
  Sparkles,
  MoonStar,
  Megaphone,
  Bell,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { InboxItem } from "../../services/notificationsService"

export interface NotifCategory {
  /** rótulo curto que aparece acima do título */
  label: string
  Icon: LucideIcon
  /** cor sólida — texto do rótulo, ponto de não-lida, barra lateral */
  accent: string
}

// Um visual por regra do backend. Campanha (sem ruleKey) e regra desconhecida
// caem nos fallbacks do fim.
const BY_RULE: Record<string, NotifCategory> = {
  BIBLE_RESUME: { label: "Leitura", Icon: BookOpen, accent: "#4f46e5" },
  CATECHISM_RESUME: { label: "Catecismo", Icon: BookMarked, accent: "#0d9488" },
  ROSARY_UNFINISHED: { label: "Terço", Icon: Flower2, accent: "#be185d" },
  ROSARY_LAPSE: { label: "Terço", Icon: Flower2, accent: "#be185d" },
  STREAK_AT_RISK: { label: "Sequência", Icon: Flame, accent: "#d97706" },
  COMEBACK: { label: "Sentimos sua falta", Icon: HeartHandshake, accent: "#b0181a" },
  SUNDAY_MASS: { label: "Missa", Icon: Church, accent: "#6d28d9" },
  VOX_INTRO: { label: "VoxAI", Icon: Sparkles, accent: "#a21caf" },
  EXAMEN_NIGHT: { label: "Exame do dia", Icon: MoonStar, accent: "#475569" },
}

const CAMPAIGN: NotifCategory = { label: "Novidade", Icon: Megaphone, accent: "#a16207" }
const FALLBACK: NotifCategory = { label: "Aviso", Icon: Bell, accent: "#78716c" }

export function resolveNotifCategory(item: Pick<InboxItem, "source" | "ruleKey">): NotifCategory {
  if (item.ruleKey && BY_RULE[item.ruleKey]) return BY_RULE[item.ruleKey]
  if (item.source === "CAMPAIGN") return CAMPAIGN
  return FALLBACK
}

/** hex (#rrggbb) + alpha 0..1 → #rrggbbaa */
export function hexAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0")
  return hex + a
}
