import { useEffect, useMemo, useState } from "react"
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
  // Um versículo (modo padrão, com toggle adicionar/remover por coleção) —
  // ou vários de uma vez (seleção múltipla na leitura). `items` manda em
  // `item` quando os dois vêm preenchidos.
  item: AddCollectionItemInput | null
  items?: AddCollectionItemInput[]
  onDone: (message: string) => void
}

export default function AddToCollectionSheet({
  open,
  onClose,
  reference,
  item,
  items,
  onDone,
}: Props) {

  const [collections, setCollections] = useState<BibleCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  // itemId quando o versículo está na coleção, null quando não está.
  // Só faz sentido no modo de 1 versículo — no modo múltiplo fica vazio
  // (não há "toggle": tocar sempre adiciona os selecionados).
  const [membership, setMembership] = useState<Record<string, string | null>>({})
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)

  const isMulti = !!items && items.length > 0
  const targets = useMemo(
    () => (isMulti ? items! : item ? [item] : []),
    [isMulti, items, item],
  )

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open || targets.length === 0) return
    setNewName("")
    setLoading(true)

    const verseRef = !isMulti
      ? { book: targets[0].book, chapter: targets[0].chapter, verse: targets[0].verse }
      : undefined

    listCollections(verseRef).then((c) => {
      setCollections(c)
      const m: Record<string, string | null> = {}
      if (!isMulti) {
        for (const col of c) m[col.id] = col.containsItemId ?? null
      }
      setMembership(m)
      setLoading(false)
    })
  }, [open, targets, isMulti])

  if (!open) return null

  async function toggle(collection: BibleCollection) {
    if (targets.length === 0 || busyId) return

    if (isMulti) {
      setBusyId(collection.id)
      try {
        await Promise.all(targets.map((it) => addCollectionItem(collection.id, it)))
        onDone(
          `${targets.length} versículo${targets.length === 1 ? "" : "s"} adicionado${targets.length === 1 ? "" : "s"} a "${collection.name}"`,
        )
      } catch {
        onDone("Não foi possível salvar. Tente de novo.")
      } finally {
        setBusyId(null)
      }
      return
    }

    const it = targets[0]
    const existingItemId = membership[collection.id]
    setBusyId(collection.id)
    try {
      if (existingItemId) {
        await removeCollectionItem(collection.id, existingItemId)
        setMembership((m) => ({ ...m, [collection.id]: null }))
        onDone(`Removido de "${collection.name}"`)
      } else {
        const created = await addCollectionItem(collection.id, it)
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
    if (!name || targets.length === 0 || creating) return
    setCreating(true)
    try {
      const created = await createCollection(name)
      if (isMulti) {
        await Promise.all(targets.map((it) => addCollectionItem(created.id, it)))
        setCollections((c) => [{ ...created, _count: { items: targets.length } }, ...c])
        setNewName("")
        onDone(
          `${targets.length} versículo${targets.length === 1 ? "" : "s"} adicionado${targets.length === 1 ? "" : "s"} a "${name}"`,
        )
      } else {
        const addedItem = await addCollectionItem(created.id, targets[0])
        setCollections((c) => [{ ...created, _count: { items: 1 } }, ...c])
        setMembership((m) => ({ ...m, [created.id]: addedItem.id }))
        setNewName("")
        onDone(`Adicionado a "${name}"`)
      }
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
              const inCollection = !isMulti && !!membership[c.id]
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
          {isMulti
            ? `Toque para adicionar os ${targets.length} versículos selecionados.`
            : "Toque para adicionar; toque de novo para tirar desta coleção."}
        </p>
      </div>
    </div>,
    document.body,
  )
}
