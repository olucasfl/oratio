import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"

import styles from "../Catecismo/Catecismo.module.css"
import { Document, Page } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "../../utils/pdfConfig"

const PAGE_KEY = "tratado_page"
const ZOOM_KEY = "tratado_zoom"

export default function Tratado() {

  const navigate  = useNavigate()
  const wrapRef   = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<HTMLDivElement>(null)

  const [page,       setPage]       = useState(1)
  const [numPages,   setNumPages]   = useState(0)
  const [baseWidth,  setBaseWidth]  = useState<number | undefined>(undefined)
  const [zoomLevel,  setZoomLevel]  = useState(1.0)
  const [loaded,     setLoaded]     = useState(false)
  const [pdfLoading, setPdfLoading] = useState(true)

  const [inputPagina, setInputPagina] = useState("")

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

  function onLoadSuccess(doc: any) {
    setNumPages(doc.numPages)
    setPdfLoading(false)
    restoreState(doc)
    setLoaded(true)
  }

  function irParaPagina() {
    const p = Number(inputPagina)
    if (p >= 1 && p <= numPages) { setPage(p); setInputPagina("") }
  }

  /* ── swipe para trocar página (só quando zoom = 1) ── */
  useEffect(() => {
    const el = viewerRef.current
    if (!el) return

    let startX = 0

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) startX = e.touches[0].clientX
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (zoomLevel > 1.0) return
      const diff = startX - e.changedTouches[0].clientX
      if (Math.abs(diff) > 80) {
        if (diff > 0) setPage(p => Math.min(p + 1, numPages))
        else          setPage(p => Math.max(p - 1, 1))
      }
    }

    el.addEventListener("touchstart", onTouchStart)
    el.addEventListener("touchend",   onTouchEnd)
    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchend",   onTouchEnd)
    }
  }, [numPages, zoomLevel])

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
          <button className={styles.backButton} onClick={() => navigate("/oratio/consecration")}><ChevronLeft size={20} /></button>
          <span className={styles.title}>Tratado da Verdadeira Devoção</span>
          <div style={{ width: 38 }} />
        </div>

        {/* BUSCA DE PÁGINA */}
        <div className={styles.searchBar}>
          <div className={styles.searchGroup}>
            <input
              placeholder="Ir para página..."
              value={inputPagina}
              onChange={e => setInputPagina(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") irParaPagina() }}
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

      {/* PDF */}
      <div ref={wrapRef} className={styles.wrapper}>
        <div ref={viewerRef} className={styles.viewer}>

          <Document
            file="/tratado.pdf"
            onLoadSuccess={onLoadSuccess}
            loading={
              <div className={styles.pdfLoading}>
                <div className={styles.spinner} />
                <span>Carregando tratado...</span>
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

      {/* FOOTER */}
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
