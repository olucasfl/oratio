import { asApiError } from "../utils/authErrors"
import api from "./api"
import { saveLocal, getLocal } from "../utils/localCache"

const PROGRESS_KEY = "oratio_quaresma_progress"

export type QuaresmaProgress = {
  year: number
  today: string
  totalDays: number
  startDate: string
  endDate: string
  feastDate: string
  currentDay: number
  isRestDay: boolean
  completedDays: number[]
  lateDays: number
  remainingDays: number
  penance: string | null
  penanceUpdatedAt: string | null
}

/**
 * Progresso da edição atual. Cai no cache local quando a rede falha —
 * as orações são estáticas, então a tela do dia continua funcionando
 * offline mesmo sem conseguir buscar o progresso.
 */
export async function getProgress(): Promise<QuaresmaProgress | null> {

  try {
    const res = await api.get("/oratio/quaresma/progress")
    saveLocal(PROGRESS_KEY, res.data, 60 * 24)
    return res.data
  } catch {
    return getLocal(PROGRESS_KEY)
  }

}

/** Progresso salvo no aparelho, sem tocar na rede. */
export function getCachedProgress(): QuaresmaProgress | null {
  return getLocal(PROGRESS_KEY)
}

/**
 * Marca o dia como rezado. O backend valida a ordem e a data — deixamos
 * o erro subir pra tela mostrar a mensagem dele, que é específica
 * ("Conclua os dias anteriores primeiro", "Este dia ainda não está
 * disponível") e ajuda mais do que um texto genérico.
 */
export async function completeDay(day: number) {
  await api.post(`/oratio/quaresma/complete/${day}`)
}

export async function uncompleteDay(day: number) {
  await api.delete(`/oratio/quaresma/complete/${day}`)
}

export async function savePenance(content: string) {
  const res = await api.put("/oratio/quaresma/penance", { content })
  return res.data as { content: string; updatedAt: string }
}

/** Mensagem de erro que o backend mandou, se houver. */
export function apiErrorMessage(err: unknown, fallback: string) {
  const message = asApiError(err).response?.data?.message
  if (Array.isArray(message)) return message[0] ?? fallback
  if (typeof message === "string") return message
  return fallback
}
