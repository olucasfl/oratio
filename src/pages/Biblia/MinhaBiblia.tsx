import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  Highlighter,
  Heart,
  NotebookPen,
  FolderClosed,
  Plus,
  Search,
  BookOpen,
  Loader2,
} from "lucide-react"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"
import GuestGateModal from "../../components/GuestGateModal/GuestGateModal"
import PromptModal from "../../components/PromptModal/PromptModal"
import NoteViewerModal from "../../components/NoteViewerModal/NoteViewerModal"

import { isLoggedIn } from "../../utils/auth"
import { getAllMarks, type BibleMark } from "../../services/bibleMarksService"
import {
  listCollections,
  createCollection,
  type BibleCollection,
} from "../../services/bibleCollectionsService"
import { compareByBookOrder, testamentOf, type Testament } from "../../data/bibleBookOrder"

import styles from "./MinhaBiblia.module.css"

type Tab = "grifados" | "favoritos" | "anotacoes" | "colecoes"

const TABS: { id: Tab; label: string; icon: typeof Highlighter }[] = [
  { id: "grifados", label: "Grifados", icon: Highlighter },
  { id: "favoritos", label: "Favoritos", icon: Heart },
  { id: "anotacoes", label: "Anotações", icon: NotebookPen },
  { id: "colecoes", label: "Coleções", icon: FolderClosed },
]

const TAB_IDS = TABS.map((t) => t.id)

const TESTAMENT_LABEL: Record<Testament, string> = {
  AT: "Antigo Testamento",
  NT: "Novo Testamento",
}

function norm(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

const NOTE_PREVIEW_MAX = 200

function notePreview(note: string) {
  if (note.length <= NOTE_PREVIEW_MAX) return { text: note, clipped: false }
  return { text: note.slice(0, NOTE_PREVIEW_MAX).trimEnd() + "…", clipped: true }
}

// Livros que têm pelo menos 1 mark nesta aba, agrupados por Antigo/Novo
// Testamento em ordem canônica — é a tela de entrada de cada aba
// (grifados/favoritos/anotações) antes de escolher um livro.
function groupBooks(marksOfTab: BibleMark[]) {
  const counts = new Map<string, number>()
  for (const m of marksOfTab) counts.set(m.book, (counts.get(m.book) ?? 0) + 1)
  return [...counts.keys()]
    .sort(compareByBookOrder)
    .map((book) => ({ book, testament: testamentOf(book), count: counts.get(book)! }))
}

export default function MinhaBiblia() {

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialTabParam = searchParams.get("tab")
  const initialTab: Tab = TAB_IDS.includes(initialTabParam as Tab) ? (initialTabParam as Tab) : "grifados"

  const [tab, setTab] = useState<Tab>(initialTab)
  // Livro escolhido dentro da aba atual (2º nível: "Efésios" → vê os
  // versículos daquele livro). null = mostrando a lista de livros.
  const [selectedBook, setSelectedBook] = useState<string | null>(searchParams.get("book"))
  const [marks, setMarks] = useState<BibleMark[]>([])
  const [collections, setCollections] = useState<BibleCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [gate, setGate] = useState(!isLoggedIn())
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [noteView, setNoteView] = useState<BibleMark | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
    if (!isLoggedIn()) { setLoading(false); return }
    let alive = true
    Promise.all([getAllMarks(), listCollections()]).then(([m, c]) => {
      if (!alive) return
      setMarks(m)
      setCollections(c)
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  const refreshCollections = useCallback(() => {
    listCollections().then(setCollections)
  }, [])

  function changeTab(id: Tab) {
    setTab(id)
    setSelectedBook(null)
    setQuery("")
  }

  const byTab = useMemo(
    () =>
      marks.filter((m) =>
        tab === "grifados" ? m.highlighted
        : tab === "favoritos" ? m.favorite
        : tab === "anotacoes" ? !!m.note
        : false,
      ),
    [marks, tab],
  )

  const hasQuery = query.trim().length > 0

  // Busca ignora o agrupamento por livro — resultado cruza todos os
  // livros, igual antes. Sem busca, o agrupamento por livro é que manda.
  const searched = useMemo(() => {
    if (!hasQuery) return byTab
    const q = norm(query.trim())
    return byTab.filter(
      (m) =>
        norm(m.reference).includes(q) ||
        norm(m.text).includes(q) ||
        (m.note ? norm(m.note).includes(q) : false),
    )
  }, [byTab, query, hasQuery])

  const bookGroups = useMemo(() => groupBooks(byTab), [byTab])

  const versesOfSelectedBook = useMemo(() => {
    if (!selectedBook) return []
    return byTab
      .filter((m) => m.book === selectedBook)
      .sort((a, b) => a.chapter - b.chapter || a.verse - b.verse)
  }, [byTab, selectedBook])

  // 3º nível dentro do livro: separado por capítulo, na ordem em que
  // aparecem no livro (não fica tudo misturado quando há marks de
  // vários capítulos diferentes)
  const chaptersOfSelectedBook = useMemo(() => {
    const byChapter = new Map<number, BibleMark[]>()
    for (const m of versesOfSelectedBook) {
      const list = byChapter.get(m.chapter) ?? []
      list.push(m)
      byChapter.set(m.chapter, list)
    }
    return [...byChapter.keys()]
      .sort((a, b) => a - b)
      .map((chapter) => ({ chapter, marks: byChapter.get(chapter)! }))
  }, [versesOfSelectedBook])

  function openVerse(m: BibleMark) {
    navigate(
      `/oratio/biblia/${encodeURIComponent(m.book)}/${m.chapter}?verse=${m.verse}`,
    )
  }

  async function handleCreate(name: string) {
    setShowCreate(false)
    setCreating(true)
    try {
      await createCollection(name)
      refreshCollections()
    } catch {
      /* ignora — o usuário tenta de novo */
    } finally {
      setCreating(false)
    }
  }

  function handleBack() {
    // Dentro de um livro: "voltar" sobe um nível (volta pra lista de
    // livros), não sai da tela.
    if (selectedBook) { setSelectedBook(null); return }
    navigate("/oratio/biblia")
  }

  function renderMarkCard(m: BibleMark) {
    const preview = tab === "anotacoes" && m.note ? notePreview(m.note) : null
    return (
      <div key={m.id} className={styles.card}>
        <button className={styles.cardMain} onClick={() => openVerse(m)}>
          <div className={styles.cardHead}>
            {tab === "grifados" && (
              <span
                className={styles.colorDot}
                data-hl-color={m.highlightColor ?? "amber"}
              />
            )}
            <strong>{m.reference}</strong>
          </div>
          <p className={styles.cardText}>{m.text}</p>
          {preview && (
            <p className={styles.cardNote}>
              <NotebookPen size={13} /> {preview.text}
            </p>
          )}
        </button>
        {preview?.clipped && (
          <button
            className={styles.noteMoreBtn}
            onClick={() => setNoteView(m)}
          >
            Ver anotação completa
          </button>
        )}
      </div>
    )
  }

  const showSearch = tab !== "colecoes"

  return (
    <div className={`${styles.container} page-enter`}>

      <div className={styles.glow} />

      <button className={styles.backButton} onClick={handleBack}>
        <ChevronLeft size={18} /> {selectedBook ? "Livros" : "Voltar"}
      </button>

      <div className={styles.hero}>
        <h1 className={styles.title}>{selectedBook ?? "Minha Bíblia"}</h1>
        <p className={styles.subtitle}>
          {selectedBook
            ? `${versesOfSelectedBook.length} versículo${versesOfSelectedBook.length === 1 ? "" : "s"}`
            : "Seus versículos grifados, favoritos, anotados e suas coleções."}
        </p>
      </div>

      <div className={styles.tabs}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${styles.tab} ${tab === id ? styles.tabActive : ""}`}
            onClick={() => changeTab(id)}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {showSearch && !selectedBook && (
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Buscar nos seus versículos e notas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div className={styles.stateBox}>
          <Loader2 size={26} className={styles.spinner} />
        </div>
      ) : tab === "colecoes" ? (
        <div className={styles.list}>
          <button
            className={styles.newCollection}
            onClick={() => setShowCreate(true)}
            disabled={creating}
          >
            <Plus size={16} /> Nova coleção
          </button>

          {collections.length === 0 ? (
            <div className={styles.empty}>
              <FolderClosed size={38} />
              <h3>Nenhuma coleção</h3>
              <p>Crie pastas para juntar versículos por tema e estudar.</p>
            </div>
          ) : (
            collections.map((c) => (
              <button
                key={c.id}
                className={styles.collectionCard}
                onClick={() => navigate(`/oratio/biblia/colecao/${c.id}`)}
              >
                <div className={styles.collectionText}>
                  <strong className={styles.collectionName}>{c.name}</strong>
                  <span className={styles.collectionCount}>
                    {c._count?.items ?? 0} versículo
                    {(c._count?.items ?? 0) === 1 ? "" : "s"}
                  </span>
                </div>
                <ChevronRight size={18} className={styles.collectionArrow} />
              </button>
            ))
          )}
        </div>
      ) : hasQuery ? (
        // busca cruza todos os livros — sem agrupamento
        searched.length === 0 ? (
          <div className={styles.empty}>
            <BookOpen size={38} />
            <h3>Nada aqui ainda</h3>
            <p>Nenhum resultado para essa busca.</p>
          </div>
        ) : (
          <div className={styles.list}>{searched.map(renderMarkCard)}</div>
        )
      ) : selectedBook ? (
        // 2º nível: versículos daquele livro, separados por capítulo
        <div className={styles.chapterGroups}>
          {chaptersOfSelectedBook.map((g) => (
            <div key={g.chapter}>
              <h2 className={styles.chapterHeader}>Capítulo {g.chapter}</h2>
              <div className={styles.list}>{g.marks.map(renderMarkCard)}</div>
            </div>
          ))}
        </div>
      ) : bookGroups.length === 0 ? (
        <div className={styles.empty}>
          <BookOpen size={38} />
          <h3>Nada aqui ainda</h3>
          <p>
            Abra a Bíblia, toque num versículo e escolha grifar, favoritar ou
            anotar — vai aparecer nesta lista, agrupado por livro.
          </p>
        </div>
      ) : (
        // 1º nível: lista de livros, agrupados por Antigo/Novo Testamento
        <div className={styles.list}>
          {bookGroups.map((g, i) => (
            <div key={g.book}>
              {(i === 0 || bookGroups[i - 1].testament !== g.testament) && (
                <h2 className={styles.testamentHeader}>{TESTAMENT_LABEL[g.testament]}</h2>
              )}
              <button
                className={styles.collectionCard}
                onClick={() => setSelectedBook(g.book)}
              >
                <div className={styles.collectionText}>
                  <strong className={styles.collectionName}>{g.book}</strong>
                  <span className={styles.collectionCount}>
                    {g.count} versículo{g.count === 1 ? "" : "s"}
                  </span>
                </div>
                <ChevronRight size={18} className={styles.collectionArrow} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.pageSpacer} />

      <BottomNavbar />

      <GuestGateModal
        open={gate}
        message="Crie uma conta para ter sua área de grifos, favoritos e anotações."
        onClose={() => { setGate(false); navigate("/oratio/biblia") }}
      />

      <PromptModal
        open={showCreate}
        title="Nova coleção"
        description="Dê um nome para juntar versículos por tema."
        placeholder="Ex: Promessas de Deus"
        confirmLabel="Criar"
        onConfirm={handleCreate}
        onCancel={() => setShowCreate(false)}
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
