import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

import styles from "./ConsecrationCarta.module.css"

import { Document, Page } from "react-pdf"

import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "../../utils/pdfConfig"

export default function ConsecrationCarta(){

  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const [scale,setScale] = useState(1.2)

  /* ================= SCROLL TOP ================= */

  useEffect(()=>{
    containerRef.current?.scrollTo({
      top:0,
      behavior:"smooth"
    })
  },[scale])

  return(

    <div className={styles.container}>

      {/* ================= HEADER ================= */}

      <div className={styles.header}>

        <div className={styles.headerTop}>

          <button
            className={styles.backButton}
            onClick={()=>navigate(-1)}
          >
            ←
          </button>

          <div className={styles.title}>
            Modelo da Carta
          </div>

        </div>

      </div>

      {/* ================= PDF ================= */}

      <div
        ref={containerRef}
        className={`${styles.viewer} ${scale <= 1 ? styles.centered : ""}`}
      >
        <div>

          <Document
            file="/modelo-carta-consagracao.pdf"
            loading="Carregando PDF..."
            error="Erro ao carregar PDF"
          >
            <Page
              key={scale}
              pageNumber={1}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>

        </div>
      </div>

      {/* ================= FOOTER ================= */}

      <div className={styles.footer}>

        {/* espaço vazio só pra centralizar igual tratado */}
        <div style={{width:"34px"}} />

        <span className={styles.pageInfo}>
          1/1
        </span>

        <div className={styles.zoom}>

          <button onClick={()=>setScale(s => Math.max(1, s - 0.2))}>
            −
          </button>

          <span>{Math.round(scale * 100)}%</span>

          <button onClick={()=>setScale(s => Math.min(4, s + 0.2))}>
            +
          </button>

        </div>

      </div>

    </div>

  )
}