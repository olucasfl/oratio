import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Check, Loader2, Plus, X } from "lucide-react"

import { useLockBodyScroll } from "../../hooks/useLockBodyScroll"
import {
  listCollections,
  createCollection,
  addCollectionItem,
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
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    setAddedIds(new Set())
    setNewName("")
    setLoading(true)
    listCollections().then((c) => {
      setCollections(c)
      setLoading(false)
    })
  }, [open])

  if (!open) return null

  async function addTo(collection: BibleCollection) {
    if (!item || busyId) return
    setBusyId(collection.id)
    try {
      await addCollectionItem(collection.id, item)
      setAddedIds((s) => new Set(s).add(collection.id))
      onDone(`Adicionado a "${collection.name}"`)
    } catch {
      onDone("Não foi possível adicionar. Tente de novo.")
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
      await addCollectionItem(created.id, item)
      setCollections((c) => [{ ...created, _count: { items: 1 } }, ...c])
      setAddedIds((s) => new Set(s).add(created.id))
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
        aria-label={`Adicionar ${reference} a uma coleção`}
      >
        <div className={styles.handle} />

        <div className={styles.header}>
          <div>
            <span className={styles.label}>Adicionar à coleção</span>
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
            <div className={styles.state}>Carregando…</div>
          ) : collections.length === 0 ? (
            <div className={styles.state}>
              Você ainda não tem coleções. Crie uma acima.
            </div>
          ) : (
            collections.map((c) => {
              const added = addedIds.has(c.id)
              return (
                <button
                  key={c.id}
                  className={`${styles.row} ${added ? styles.rowAdded : ""}`}
                  onClick={() => addTo(c)}
                  disabled={busyId === c.id || added}
                >
                  <span className={styles.rowName}>{c.name}</span>
                  {busyId === c.id ? (
                    <Loader2 size={16} className={styles.spin} />
                  ) : added ? (
                    <Check size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
