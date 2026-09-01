import api from "./api"
import { isLoggedIn } from "../utils/auth"

/*
 Grifos, favoritos e anotações de versículo — sincronizados na conta.
 Backend: oratio-api, módulo bible-marks (PUT/GET /oratio/bible/marks).

 Uma linha por versículo marcado; o backend apaga a linha quando não
 sobra grifo, favorito nem nota. `reference`/`text` são snapshots que o
 cliente manda (o backend não tem o texto bíblico).
*/

export const HIGHLIGHT_COLORS = [
  "amber",
  "green",
  "blue",
  "pink",
  "purple",
] as const

export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number]

export interface BibleMark {
  id: string
  book: string
  chapter: number
  verse: number
  reference: string
  text: string
  highlighted: boolean
  highlightColor: HighlightColor | null
  favorite: boolean
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface UpsertMarkInput {
  book: string
  chapter: number
  verse: number
  reference: string
  text: string
  highlighted?: boolean
  highlightColor?: HighlightColor
  favorite?: boolean
  note?: string
}

export type UpsertMarkResult = BibleMark | { deleted: true }

export function isDeleted(r: UpsertMarkResult): r is { deleted: true } {
  return (r as { deleted?: boolean }).deleted === true
}

/* Leitura — silenciosa: se falhar, a leitura segue sem marcações. */

export async function getChapterMarks(
  book: string,
  chapter: number,
): Promise<BibleMark[]> {
  if (!isLoggedIn()) return []
  try {
    const res = await api.get("/oratio/bible/marks", { params: { book, chapter } })
    return Array.isArray(res.data) ? res.data : []
  } catch {
    return []
  }
}

export async function getAllMarks(): Promise<BibleMark[]> {
  if (!isLoggedIn()) return []
  try {
    const res = await api.get("/oratio/bible/marks")
    return Array.isArray(res.data) ? res.data : []
  } catch {
    return []
  }
}

/*
 Escrita — LANÇA em erro de propósito: quem chama aplica o estado de
 forma otimista e, se isto rejeitar, desfaz e mostra um aviso.
*/
export async function upsertMark(
  input: UpsertMarkInput,
): Promise<UpsertMarkResult> {
  const res = await api.put("/oratio/bible/marks", input)
  return res.data
}
