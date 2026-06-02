import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import styles from "./ConsecrationCarta.module.css"

import { Document, Page } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "../../utils/pdfConfig"

export default function ConsecrationCarta() {

  const navigate      = useNavigate()
  const containerRef  = useRef<HTMLDivElement>(null)
  const wrapRef       = useRef<HTMLDivElement>(null)

  /* largura base calculada pelo container — resolve o problema mobile */
  const [baseWidth,   setBaseWidth]   = useState<number | undefined>(undefined)
  const [zoomLevel,   setZoomLevel]   = useState(1.0)
  const [pdfLoading,  setPdfLoading]  = useState(true)

  /* calcula a largura ao montar e no resize */
  const computeWidth = useCallback(() => {
    if (!wrapRef.current) return
    const w = wrapRef.current.clientWidth - 24 // 12px padding cada lado
    setBaseWidth(Math.max(w, 200))
  }, [])

  useEffect(() => {
    computeWidth()
    window.addEventListener("resize", computeWidth)
    return () => window.removeEventListener("resize", computeWidth)
  }, [computeWidth])

  /* largura final aplicada ao Page */
  const pageWidth = baseWidth ? Math.round(baseWidth * zoomLevel) : undefined

  function zoomIn()  { setZoomLevel(z => Math.min(z + 0.25, 3)) }
  function zoomOut() { setZoomLevel(z => Math.max(z - 0.25, 0.5)) }
  function resetZoom(){ setZoomLevel(1.0) }

  return (

    <div className={`${styles.container} page-enter`}>

      {/* HEADER */}
      <div className={styles.header}>

        <div className={styles.headerTop}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>←</button>
          <span className={styles.title}>Carta de Consagração</span>
          <div style={{ width: 38 }} />
        </div>

        {/* CONTROLES DE ZOOM */}
        <div className={styles.zoomBar}>
          <button className={styles.zoomBtn} onClick={zoomOut}>−</button>
          <button className={styles.zoomReset} onClick={resetZoom}>
            {Math.round(zoomLevel * 100)}%
          </button>
          <button className={styles.zoomBtn} onClick={zoomIn}>+</button>
        </div>

      </div>

      {/* ÁREA DO PDF */}
      <div ref={wrapRef} className={styles.wrapper}>
        <div
          ref={containerRef}
          className={styles.viewer}
        >
          <Document
            file="/modelo-carta-consagracao.pdf"
            onLoadSuccess={() => setPdfLoading(false)}
            loading={
              <div className={styles.pdfLoading}>
                <div className={styles.spinner} />
                <span>Carregando carta...</span>
              </div>
            }
            error={
              <div className={styles.pdfError}>
                Não foi possível carregar o PDF.
              </div>
            }
          >
            {!pdfLoading && (
              <Page
                pageNumber={1}
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            )}
          </Document>
        </div>
      </div>

    </div>

  )

}
