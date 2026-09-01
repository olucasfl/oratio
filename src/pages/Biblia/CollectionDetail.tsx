import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ChevronLeft, Loader2, NotebookPen, Pencil, Trash2, X, BookOpen } from "lucide-react"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"
import PromptModal from "../../components/PromptModal/PromptModal"
import NoteViewerModal from "../../components/NoteViewerModal/NoteViewerModal"

import { isLoggedIn } from "../../utils/auth"
import { useOffline } from "../../hooks/useOffline"
import { getAllMarks } from "../../services/bibleMarksService"
import {
  getCollection,
  renameCollection,
  deleteCollection,
  removeCollectionItem,
  type BibleCollection,
} from "../../services/bibleCollectionsService"

import styles from "./CollectionDetail.module.css"

const verseKey = (book: string, chapter: number, verse: number) =>
  `${book}|${chapter}|${verse}`

export default function CollectionDetail() {

  const { id } = useParams()
  const navigate = useNavigate()
  const isOffline = useOffline()

  const [collection, setCollection] = useState<BibleCollection | null>(null)
  const [notesByVerse, setNotesByVerse] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showRename, setShowRename] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<{ id: string; reference: string } | null>(null)
  const [noteView, setNoteView] = useState<{ reference: string; note: string } | null>(null)

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
    getAllMarks().then((marks) => {
      const map: Record<string, string> = {}
      for (const m of marks) {
        if (m.note) map[verseKey(m.book, m.chapter, m.verse)] = m.note
      }
      setNotesByVerse(map)
    })
  }, [load, navigate])

  const items = useMemo(() => collection?.items ?? [], [collection])

  async function handleRename(name: string) {
    setShowRename(false)
    if (!collection || !id || name === collection.name) return
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

  async function confirmRemoveItem() {
    const target = confirmRemove
    setConfirmRemove(null)
    if (!id || !collection || !target) return
    setCollection({
      ...collection,
      items: items.filter((it) => it.id !== target.id),
    })
    try {
      await removeCollectionItem(id, target.id)
    } catch {
      load() // reconcilia se falhou
    }
  }

  if (loading) {
    return (
      <div className={styles.stateBox}>
        <Loader2 size={26} className={styles.spinner} />
      </div>
    )
  }

  if (!collection) {
    return (
      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => navigate("/oratio/biblia/minha")}>
          <ChevronLeft size={18} /> Voltar
        </button>
        <div className={styles.stateBox}>
          {isOffline
            ? "Você está sem conexão. Reconecte para ver esta coleção."
            : "Coleção não encontrada."}
        </div>
        <BottomNavbar />
      </div>
    )
  }

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
          <button className={styles.heroBtn} onClick={() => setShowRename(true)}>
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
          {items.map((it) => {
            const note = notesByVerse[verseKey(it.book, it.chapter, it.verse)]
            return (
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
                </button>

                {note && (
                  <button
                    className={styles.noteBtn}
                    onClick={() => setNoteView({ reference: it.reference, note })}
                  >
                    <NotebookPen size={13} /> Ver anotação
                  </button>
                )}

                <button
                  className={styles.removeBtn}
                  onClick={() => setConfirmRemove({ id: it.id, reference: it.reference })}
                  aria-label="Remover da coleção"
                >
                  <X size={16} />
                </button>
              </div>
            )
          })}
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

      <ConfirmModal
        open={confirmRemove !== null}
        title="Remover da coleção"
        message={`Tirar ${confirmRemove?.reference ?? "este versículo"} desta coleção? Ele continua na Bíblia e nas suas outras marcações.`}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        danger
        onConfirm={confirmRemoveItem}
        onCancel={() => setConfirmRemove(null)}
      />

      <PromptModal
        open={showRename}
        title="Renomear coleção"
        initialValue={collection.name}
        placeholder="Nome da coleção"
        confirmLabel="Salvar"
        onConfirm={handleRename}
        onCancel={() => setShowRename(false)}
      />

      <NoteViewerModal
        open={noteView !== null}
        reference={noteView?.reference ?? ""}
        note={noteView?.note ?? ""}
        onClose={() => setNoteView(null)}
      />
    </div>
  )
}
