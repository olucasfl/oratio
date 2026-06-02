import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"

import styles from "./Catecismo.module.css"
import { Document, Page } from "react-pdf"
import "../../utils/pdfConfig"
import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"

const PAGE_KEY  = "catecismo_page"
const ZOOM_KEY  = "catecismo_zoom"

export default function Catecismo() {

  const navigate     = useNavigate()
  const wrapRef      = useRef<HTMLDivElement>(null)
  const viewerRef    = useRef<HTMLDivElement>(null)

  const [page,         setPage]         = useState(1)
  const [numPages,     setNumPages]     = useState(0)
  const [baseWidth,    setBaseWidth]    = useState<number | undefined>(undefined)
  const [zoomLevel,    setZoomLevel]    = useState(1.0)
  const [pdf,          setPdf]          = useState<any>(null)
  const [loaded,       setLoaded]       = useState(false)
  const [pdfLoading,   setPdfLoading]   = useState(true)

  const [inputPagina,  setInputPagina]  = useState("")
  const [inputArtigo,  setInputArtigo]  = useState("")
  const [searchLoading,setSearchLoading]= useState(false)
  const [resultados,   setResultados]   = useState<any[]>([])
  const [showResults,  setShowResults]  = useState(false)

  /* ── mede largura do wrapper ── */
  const computeWidth = useCallback(() => {
    if (!wrapRef.current) return
    setBaseWidth(wrapRef.current.clientWidth - 24)
  }, [])

  useEffect(() => {
    computeWidth()
    window.addEventListener("resize", computeWidth)
    return () => window.removeEventListener("resize", computeWidth)
  }, [computeWidth])

  /* ── largura final do Page ── */
  const pageWidth = baseWidth ? Math.round(baseWidth * zoomLevel) : undefined

  /* ── restaura estado salvo ── */
  function restoreState(doc: any) {
    const savedPage = localStorage.getItem(PAGE_KEY)
    const savedZoom = localStorage.getItem(ZOOM_KEY)
    if (savedPage) {
      const p = Number(savedPage)
      if (p >= 1 && p <= doc.numPages) setPage(p)
    }
    if (savedZoom) setZoomLevel(Number(savedZoom))
  }

  /* ── persiste estado ── */
  useEffect(() => { if (loaded) localStorage.setItem(PAGE_KEY, String(page)) }, [page, loaded])
  useEffect(() => { if (loaded) localStorage.setItem(ZOOM_KEY, String(zoomLevel)) }, [zoomLevel, loaded])

  /* ── scroll para o topo ao trocar página ── */
  useEffect(() => {
    viewerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }, [page])

  /* ── callbacks PDF ── */
  function onLoadSuccess(doc: any) {
    setNumPages(doc.numPages)
    setPdf(doc)
    setPdfLoading(false)
    restoreState(doc)
    setLoaded(true)
  }

  /* ── navegar para página ── */
  function irParaPagina() {
    const p = Number(inputPagina)
    if (p >= 1 && p <= numPages) { setPage(p); setInputPagina("") }
  }

  /* ── busca por artigo ── */
  async function irParaArtigo() {
    if (!pdf) return
    const artigo = inputArtigo.trim()
    if (!artigo) return

    setSearchLoading(true)
    setResultados([])

    try {
      const encontrados: any[] = []
      const regex = new RegExp(`${artigo}\\s*\\.`)

      for (let i = 1; i <= numPages; i++) {
        const p    = await pdf.getPage(i)
        const text = await p.getTextContent()
        const pageText = text.items
          .map((item: any) => item.str)
          .join("")
          .replace(/\s+/g, " ")

        if (regex.test(pageText)) {
          const index   = pageText.indexOf(artigo)
          const preview = pageText.substring(index, index + 120)
          encontrados.push({ pagina: i, preview })
        }
      }

      setResultados(encontrados)
      setShowResults(true)

      if (encontrados.length === 1) {
        setPage(encontrados[0].pagina)
        setShowResults(false)
      }
    } catch (err) {
      console.error(err)
    }

    setSearchLoading(false)
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>, tipo: "artigo" | "pagina") {
    if (e.key !== "Enter") return
    if (tipo === "artigo") irParaArtigo()
    if (tipo === "pagina") irParaPagina()
  }

  function prevPage() { setPage(p => Math.max(p - 1, 1)) }
  function nextPage() { setPage(p => Math.min(p + 1, numPages)) }
  function zoomOut()  { setZoomLevel(z => Math.max(parseFloat((z - 0.25).toFixed(2)), 0.5)) }
  function zoomIn()   { setZoomLevel(z => Math.min(parseFloat((z + 0.25).toFixed(2)), 3.0)) }
  function resetZoom(){ setZoomLevel(1.0) }

  return (

    <div className={`${styles.container} page-enter`}>

      {/* HEADER */}
      <div className={styles.header}>

        <div className={styles.headerTop}>
          <button className={styles.backButton} onClick={() => navigate("/oratio/home")}>←</button>
          <span className={styles.title}>Catecismo da Igreja</span>
          <div style={{ width: 38 }} />
        </div>

        {/* BUSCA */}
        <div className={styles.searchBar}>
          <div className={styles.searchGroup}>
            <input
              placeholder="Artigo (ex: 1210)"
              value={inputArtigo}
              onChange={e => setInputArtigo(e.target.value)}
              onKeyDown={e => handleKey(e, "artigo")}
            />
            <button onClick={irParaArtigo}>
              {searchLoading ? "..." : "Buscar"}
            </button>
          </div>

          <div className={styles.searchGroup}>
            <input
              placeholder="Página"
              value={inputPagina}
              onChange={e => setInputPagina(e.target.value)}
              onKeyDown={e => handleKey(e, "pagina")}
            />
            <button onClick={irParaPagina}>Ir</button>
          </div>
        </div>

        {/* ZOOM */}
        <div className={styles.zoomBar}>
          <button className={styles.zoomBtn} onClick={zoomOut}>−</button>
          <button className={styles.zoomReset} onClick={resetZoom}>
            {Math.round(zoomLevel * 100)}%
          </button>
          <button className={styles.zoomBtn} onClick={zoomIn}>+</button>
        </div>

      </div>

      {/* RESULTADOS DE BUSCA */}
      {showResults && (
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <h3>Resultados ({resultados.length})</h3>
            <button onClick={() => setShowResults(false)}>✕</button>
          </div>

          {resultados.length === 0 && (
            <p className={styles.noResults}>Nenhum artigo encontrado.</p>
          )}

          {resultados.map((r, i) => (
            <div
              key={i}
              className={styles.resultItem}
              onClick={() => { setPage(r.pagina); setShowResults(false) }}
            >
              <strong>Página {r.pagina}</strong>
              <p>{r.preview}...</p>
            </div>
          ))}
        </div>
      )}

      {/* OVERLAY DE BUSCA */}
      {searchLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loader} />
          <p>Buscando artigo...</p>
        </div>
      )}

      {/* PDF */}
      <div ref={wrapRef} className={styles.wrapper}>
        <div ref={viewerRef} className={styles.viewer}>

          <Document
            file="/catecismo.pdf"
            onLoadSuccess={onLoadSuccess}
            loading={
              <div className={styles.pdfLoading}>
                <div className={styles.spinner} />
                <span>Carregando catecismo...</span>
              </div>
            }
            error={<div className={styles.pdfError}>Erro ao carregar o PDF.</div>}
          >
            {!pdfLoading && (
              <Page
                key={`${page}-${pageWidth}`}
                pageNumber={page}
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            )}
          </Document>

        </div>
      </div>

      {/* FOOTER — navegação de páginas */}
      <div className={styles.footer}>

        <button
          className={styles.navBtn}
          onClick={prevPage}
          disabled={page <= 1}
        >
          <ChevronLeft size={18} />
        </button>

        <span className={styles.pageInfo}>{page} / {numPages || "—"}</span>

        <button
          className={styles.navBtn}
          onClick={nextPage}
          disabled={page >= numPages}
        >
          <ChevronRight size={18} />
        </button>

      </div>

    </div>

  )

}
