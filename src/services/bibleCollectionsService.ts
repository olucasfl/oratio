import api from "./api"
import { isLoggedIn } from "../utils/auth"

/*
 Coleções de versículos (pastas de estudo) — sincronizadas na conta.
 Backend: oratio-api, módulo bible-collections (/oratio/bible/collections).
*/

export interface BibleCollectionItem {
  id: string
  collectionId: string
  book: string
  chapter: number
  verse: number
  reference: string
  text: string
  note: string | null
  createdAt: string
}

export interface BibleCollection {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  _count?: { items: number }
  items?: BibleCollectionItem[]
}

export interface AddCollectionItemInput {
  book: string
  chapter: number
  verse: number
  reference: string
  text: string
  note?: string
}

/* Leitura — silenciosa */

export async function listCollections(): Promise<BibleCollection[]> {
  if (!isLoggedIn()) return []
  try {
    const res = await api.get("/oratio/bible/collections")
    return Array.isArray(res.data) ? res.data : []
  } catch {
    return []
  }
}

export async function getCollection(id: string): Promise<BibleCollection | null> {
  try {
    const res = await api.get(`/oratio/bible/collections/${id}`)
    return res.data ?? null
  } catch {
    return null
  }
}

/* Escrita — LANÇA em erro (o chamador trata) */

export async function createCollection(name: string): Promise<BibleCollection> {
  const res = await api.post("/oratio/bible/collections", { name })
  return res.data
}

export async function renameCollection(id: string, name: string): Promise<BibleCollection> {
  const res = await api.patch(`/oratio/bible/collections/${id}`, { name })
  return res.data
}

export async function deleteCollection(id: string): Promise<void> {
  await api.delete(`/oratio/bible/collections/${id}`)
}

export async function addCollectionItem(
  collectionId: string,
  input: AddCollectionItemInput,
): Promise<BibleCollectionItem> {
  const res = await api.post(`/oratio/bible/collections/${collectionId}/items`, input)
  return res.data
}

export async function removeCollectionItem(
  collectionId: string,
  itemId: string,
): Promise<void> {
  await api.delete(`/oratio/bible/collections/${collectionId}/items/${itemId}`)
}
