import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Check, Loader2, Plus, X } from "lucide-react"

import { useLockBodyScroll } from "../../hooks/useLockBodyScroll"
import {
  listCollections,
  createCollection,
  addCollectionItem,
  removeCollectionItem,
  type BibleCollection,
  type AddCollectionItemInput,
} from "../../services/bibleCollectionsService"

import styles from "./AddToCollectionSheet.module.css"

interface Props {
  open: boolean
  onClose: () => void
  reference: string
  item: AddCollectionItemInput | null
  onDone: (message: string) => void
}

export default function AddToCollectionSheet({
  open,
  onClose,
  reference,
  item,
  onDone,
}: Props) {

  const [collections, setCollections] = useState<BibleCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  // itemId quando o versículo está na coleção, null quando não está
  const [membership, setMembership] = useState<Record<string, string | null>>({})
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open || !item) return
    setNewName("")
    setLoading(true)
    listCollections({ book: item.book, chapter: item.chapter, verse: item.verse }).then((c) => {
      setCollections(c)
      const m: Record<string, string | null> = {}
      for (const col of c) m[col.id] = col.containsItemId ?? null
      setMembership(m)
      setLoading(false)
    })
  }, [open, item])

  if (!open) return null

  async function toggle(collection: BibleCollection) {
    if (!item || busyId) return
    const existingItemId = membership[collection.id]
    setBusyId(collection.id)
    try {
      if (existingItemId) {
        await removeCollectionItem(collection.id, existingItemId)
        setMembership((m) => ({ ...m, [collection.id]: null }))
        onDone(`Removido de "${collection.name}"`)
      } else {
        const created = await addCollectionItem(collection.id, item)
        setMembership((m) => ({ ...m, [collection.id]: created.id }))
        onDone(`Adicionado a "${collection.name}"`)
      }
    } catch {
      onDone("Não foi possível salvar. Tente de novo.")
    } finally {
      setBusyId(null)
    }
  }

  async function handleCreate() {
    const name = newName.trim()
    if (!name || !item || creating) return
    setCreating(true)
    try {
      const created = await createCollection(name)
      const addedItem = await addCollectionItem(created.id, item)
      setCollections((c) => [{ ...created, _count: { items: 1 } }, ...c])
      setMembership((m) => ({ ...m, [created.id]: addedItem.id }))
      setNewName("")
      onDone(`Adicionado a "${name}"`)
    } catch {
      onDone("Não foi possível criar a coleção.")
    } finally {
      setCreating(false)
    }
  }

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Coleções de ${reference}`}
      >
        <div className={styles.handle} />

        <div className={styles.header}>
          <div>
            <span className={styles.label}>Coleções</span>
            <span className={styles.ref}>{reference}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className={styles.newRow}>
          <input
            className={styles.newInput}
            placeholder="Nova coleção…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }}
          />
          <button
            className={styles.newBtn}
            onClick={handleCreate}
            disabled={!newName.trim() || creating}
          >
            {creating ? <Loader2 size={15} className={styles.spin} /> : <Plus size={15} />}
          </button>
        </div>

        <div className={styles.list}>
          {loading ? (
            <div className={styles.state}>
              <Loader2 size={22} className={styles.spin} />
            </div>
          ) : collections.length === 0 ? (
            <div className={styles.state}>
              Você ainda não tem coleções. Crie uma acima.
            </div>
          ) : (
            collections.map((c) => {
              const inCollection = !!membership[c.id]
              return (
                <button
                  key={c.id}
                  className={`${styles.row} ${inCollection ? styles.rowAdded : ""}`}
                  onClick={() => toggle(c)}
                  disabled={busyId === c.id}
                  aria-pressed={inCollection}
                >
                  <span className={styles.rowName}>{c.name}</span>
                  {busyId === c.id ? (
                    <Loader2 size={16} className={styles.spin} />
                  ) : inCollection ? (
                    <Check size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                </button>
              )
            })
          )}
        </div>

        <p className={styles.hint}>
          Toque para adicionar; toque de novo para tirar desta coleção.
        </p>
      </div>
    </div>,
    document.body,
  )
}
