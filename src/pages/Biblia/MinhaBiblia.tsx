import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
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
} from "lucide-react"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"
import GuestGateModal from "../../components/GuestGateModal/GuestGateModal"

import { isLoggedIn } from "../../utils/auth"
import { getAllMarks, type BibleMark } from "../../services/bibleMarksService"
import {
  listCollections,
  createCollection,
  type BibleCollection,
} from "../../services/bibleCollectionsService"

import styles from "./MinhaBiblia.module.css"

type Tab = "grifados" | "favoritos" | "anotacoes" | "colecoes"

const TABS: { id: Tab; label: string; icon: typeof Highlighter }[] = [
  { id: "grifados", label: "Grifados", icon: Highlighter },
  { id: "favoritos", label: "Favoritos", icon: Heart },
  { id: "anotacoes", label: "Anotações", icon: NotebookPen },
  { id: "colecoes", label: "Coleções", icon: FolderClosed },
]

function norm(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

export default function MinhaBiblia() {

  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>("grifados")
  const [marks, setMarks] = useState<BibleMark[]>([])
  const [collections, setCollections] = useState<BibleCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [gate, setGate] = useState(!isLoggedIn())
  const [creating, setCreating] = useState(false)

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

  const filtered = useMemo(() => {
    const byTab = marks.filter((m) =>
      tab === "grifados" ? m.highlighted
      : tab === "favoritos" ? m.favorite
      : tab === "anotacoes" ? !!m.note
      : false,
    )
    const q = norm(query.trim())
    if (!q) return byTab
    return byTab.filter(
      (m) =>
        norm(m.reference).includes(q) ||
        norm(m.text).includes(q) ||
        (m.note ? norm(m.note).includes(q) : false),
    )
  }, [marks, tab, query])

  function openVerse(m: BibleMark) {
    navigate(
      `/oratio/biblia/${encodeURIComponent(m.book)}/${m.chapter}?verse=${m.verse}`,
    )
  }

  async function handleCreate() {
    const name = window.prompt("Nome da coleção")?.trim()
    if (!name) return
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

  const showSearch = tab !== "colecoes"

  return (
    <div className={`${styles.container} page-enter`}>

      <div className={styles.glow} />

      <button className={styles.backButton} onClick={() => navigate("/oratio/biblia")}>
        <ChevronLeft size={18} /> Voltar
      </button>

      <div className={styles.hero}>
        <h1 className={styles.title}>Minha Bíblia</h1>
        <p className={styles.subtitle}>
          Seus versículos grifados, favoritos, anotados e suas coleções.
        </p>
      </div>

      <div className={styles.tabs}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${styles.tab} ${tab === id ? styles.tabActive : ""}`}
            onClick={() => setTab(id)}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {showSearch && (
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
        <div className={styles.stateBox}>Carregando…</div>
      ) : tab === "colecoes" ? (
        <div className={styles.list}>
          <button
            className={styles.newCollection}
            onClick={handleCreate}
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
                className={styles.card}
                onClick={() => navigate(`/oratio/biblia/colecao/${c.id}`)}
              >
                <div className={styles.collectionRow}>
                  <div>
                    <strong className={styles.collectionName}>{c.name}</strong>
                    <span className={styles.collectionCount}>
                      {c._count?.items ?? 0} versículo
                      {(c._count?.items ?? 0) === 1 ? "" : "s"}
                    </span>
                  </div>
                  <ChevronRight size={18} />
                </div>
              </button>
            ))
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <BookOpen size={38} />
          <h3>Nada aqui ainda</h3>
          <p>
            Abra a Bíblia, toque num versículo e escolha grifar, favoritar ou
            anotar — vai aparecer nesta lista.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((m) => (
            <button key={m.id} className={styles.card} onClick={() => openVerse(m)}>
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
              {tab === "anotacoes" && m.note && (
                <p className={styles.cardNote}>
                  <NotebookPen size={13} /> {m.note}
                </p>
              )}
            </button>
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
    </div>
  )
}
