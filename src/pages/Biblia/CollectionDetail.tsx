import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ChevronLeft, Pencil, Trash2, X, BookOpen } from "lucide-react"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"

import { isLoggedIn } from "../../utils/auth"
import {
  getCollection,
  renameCollection,
  deleteCollection,
  removeCollectionItem,
  type BibleCollection,
} from "../../services/bibleCollectionsService"

import styles from "./CollectionDetail.module.css"

export default function CollectionDetail() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [collection, setCollection] = useState<BibleCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = useCallback(() => {
    if (!id) return
    getCollection(id).then((c) => {
      setCollection(c)
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
    if (!isLoggedIn()) { navigate("/oratio/biblia"); return }
    load()
  }, [load, navigate])

  async function handleRename() {
    if (!collection || !id) return
    const name = window.prompt("Novo nome da coleção", collection.name)?.trim()
    if (!name || name === collection.name) return
    try {
      await renameCollection(id, name)
      setCollection({ ...collection, name })
    } catch {
      /* ignora */
    }
  }

  async function handleDelete() {
    if (!id) return
    try {
      await deleteCollection(id)
    } catch {
      /* ignora */
    }
    navigate("/oratio/biblia/minha")
  }

  async function handleRemoveItem(itemId: string) {
    if (!id || !collection) return
    setCollection({
      ...collection,
      items: (collection.items ?? []).filter((it) => it.id !== itemId),
    })
    try {
      await removeCollectionItem(id, itemId)
    } catch {
      load() // reconcilia se falhou
    }
  }

  if (loading) {
    return <div className={styles.stateBox}>Carregando…</div>
  }

  if (!collection) {
    return (
      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => navigate("/oratio/biblia/minha")}>
          <ChevronLeft size={18} /> Voltar
        </button>
        <div className={styles.stateBox}>Coleção não encontrada.</div>
        <BottomNavbar />
      </div>
    )
  }

  const items = collection.items ?? []

  return (
    <div className={`${styles.container} page-enter`}>

      <div className={styles.glow} />

      <button className={styles.backButton} onClick={() => navigate("/oratio/biblia/minha")}>
        <ChevronLeft size={18} /> Minha Bíblia
      </button>

      <div className={styles.hero}>
        <h1 className={styles.title}>{collection.name}</h1>
        <span className={styles.count}>
          {items.length} versículo{items.length === 1 ? "" : "s"}
        </span>
        <div className={styles.heroActions}>
          <button className={styles.heroBtn} onClick={handleRename}>
            <Pencil size={14} /> Renomear
          </button>
          <button className={styles.heroBtnDanger} onClick={() => setConfirmDelete(true)}>
            <Trash2 size={14} /> Excluir
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <BookOpen size={38} />
          <h3>Coleção vazia</h3>
          <p>
            Na leitura, toque num versículo → “Adicionar à coleção” para juntar
            versículos aqui.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((it) => (
            <div key={it.id} className={styles.card}>
              <button
                className={styles.cardMain}
                onClick={() =>
                  navigate(
                    `/oratio/biblia/${encodeURIComponent(it.book)}/${it.chapter}?verse=${it.verse}`,
                  )
                }
              >
                <strong className={styles.ref}>{it.reference}</strong>
                <p className={styles.text}>{it.text}</p>
                {it.note && <p className={styles.note}>{it.note}</p>}
              </button>
              <button
                className={styles.removeBtn}
                onClick={() => handleRemoveItem(it.id)}
                aria-label="Remover da coleção"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.pageSpacer} />

      <BottomNavbar />

      <ConfirmModal
        open={confirmDelete}
        title="Excluir coleção"
        message={`Excluir "${collection.name}"? Os versículos dentro dela serão removidos da coleção (não da Bíblia).`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
