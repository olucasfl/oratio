import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  NotebookPen,
  Pencil,
  Trash2,
  X,
  BookOpen,
} from "lucide-react"

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
import { compareByBookOrder, testamentOf, type Testament } from "../../data/bibleBookOrder"

import styles from "./CollectionDetail.module.css"

const verseKey = (book: string, chapter: number, verse: number) =>
  `${book}|${chapter}|${verse}`

const TESTAMENT_LABEL: Record<Testament, string> = {
  AT: "Antigo Testamento",
  NT: "Novo Testamento",
}

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

  // Mesmo drill-down de 3 níveis da Minha Bíblia: livro → capítulo →
  // versículos soltos. null/null = lista de livros da coleção.
  const [selectedBook, setSelectedBook] = useState<string | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)

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

  // 1º nível: livros que têm pelo menos 1 item aqui, agrupados por
  // Antigo/Novo Testamento em ordem canônica.
  const bookGroups = useMemo(() => {
    const counts = new Map<string, number>()
    for (const it of items) counts.set(it.book, (counts.get(it.book) ?? 0) + 1)
    return [...counts.keys()]
      .sort(compareByBookOrder)
      .map((book) => ({ book, testament: testamentOf(book), count: counts.get(book)! }))
  }, [items])

  const itemsOfSelectedBook = useMemo(() => {
    if (!selectedBook) return []
    return items.filter((it) => it.book === selectedBook)
  }, [items, selectedBook])

  // 2º nível: capítulos daquele livro, em blocos.
  const chapterGroups = useMemo(() => {
    const counts = new Map<number, number>()
    for (const it of itemsOfSelectedBook) counts.set(it.chapter, (counts.get(it.chapter) ?? 0) + 1)
    return [...counts.keys()]
      .sort((a, b) => a - b)
      .map((chapter) => ({ chapter, count: counts.get(chapter)! }))
  }, [itemsOfSelectedBook])

  // 3º nível: versículos soltos daquele capítulo.
  const itemsOfSelectedChapter = useMemo(() => {
    if (selectedChapter === null) return []
    return itemsOfSelectedBook
      .filter((it) => it.chapter === selectedChapter)
      .sort((a, b) => a.verse - b.verse)
  }, [itemsOfSelectedBook, selectedChapter])

  function openBook(book: string) {
    setSelectedBook(book)
    setSelectedChapter(null)
  }

  function handleBack() {
    if (selectedChapter !== null) { setSelectedChapter(null); return }
    if (selectedBook) { setSelectedBook(null); return }
    navigate("/oratio/biblia/minha")
  }

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

      <button className={styles.backButton} onClick={handleBack}>
        <ChevronLeft size={18} />
        {selectedChapter !== null ? "Capítulos" : selectedBook ? "Livros" : "Minha Bíblia"}
      </button>

      <div className={styles.hero}>
        <h1 className={styles.title}>
          {selectedChapter !== null
            ? `${selectedBook} ${selectedChapter}`
            : selectedBook ?? collection.name}
        </h1>
        <span className={styles.count}>
          {selectedChapter !== null
            ? `${itemsOfSelectedChapter.length} versículo${itemsOfSelectedChapter.length === 1 ? "" : "s"}`
            : selectedBook
              ? `${itemsOfSelectedBook.length} versículo${itemsOfSelectedBook.length === 1 ? "" : "s"}`
              : `${items.length} versículo${items.length === 1 ? "" : "s"}`}
        </span>
        {!selectedBook && (
          <div className={styles.heroActions}>
            <button className={styles.heroBtn} onClick={() => setShowRename(true)}>
              <Pencil size={14} /> Renomear
            </button>
            <button className={styles.heroBtnDanger} onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} /> Excluir
            </button>
          </div>
        )}
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
      ) : selectedBook && selectedChapter !== null ? (
        // 3º nível: versículos soltos do capítulo
        <div className={styles.list}>
          {itemsOfSelectedChapter.map((it) => {
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
      ) : selectedBook ? (
        // 2º nível: capítulos do livro, em blocos
        <div className={styles.list}>
          {chapterGroups.map((cg) => (
            <button
              key={cg.chapter}
              className={styles.bookBlock}
              onClick={() => setSelectedChapter(cg.chapter)}
            >
              <div className={styles.bookBlockText}>
                <strong className={styles.bookBlockName}>Capítulo {cg.chapter}</strong>
                <span className={styles.bookBlockCount}>
                  {cg.count} versículo{cg.count === 1 ? "" : "s"}
                </span>
              </div>
              <ChevronRight size={18} className={styles.bookBlockArrow} />
            </button>
          ))}
        </div>
      ) : (
        // 1º nível: livros da coleção, agrupados por Antigo/Novo Testamento
        <div className={styles.list}>
          {bookGroups.map((g, i) => (
            <div key={g.book}>
              {(i === 0 || bookGroups[i - 1].testament !== g.testament) && (
                <h2 className={styles.testamentHeader}>{TESTAMENT_LABEL[g.testament]}</h2>
              )}
              <button className={styles.bookBlock} onClick={() => openBook(g.book)}>
                <div className={styles.bookBlockText}>
                  <strong className={styles.bookBlockName}>{g.book}</strong>
                  <span className={styles.bookBlockCount}>
                    {g.count} versículo{g.count === 1 ? "" : "s"}
                  </span>
                </div>
                <ChevronRight size={18} className={styles.bookBlockArrow} />
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
