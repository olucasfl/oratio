import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

import styles from "../Catecismo/Catecismo.module.css"
import { Document, Page, pdfjs } from "react-pdf"

import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"

import worker from "pdfjs-dist/build/pdf.worker.min.mjs?url"
pdfjs.GlobalWorkerOptions.workerSrc = worker

const PAGE_KEY = "tratado_page"
const SCALE_KEY = "tratado_scale"

export default function Tratado(){

  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const [page, setPage] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1.2)

  const [inputPagina, setInputPagina] = useState("")
  const [loaded, setLoaded] = useState(false)

  /* ================= RESTORE ================= */

  function restoreState(pdf:any){
    const savedPage = localStorage.getItem(PAGE_KEY)
    const savedScale = localStorage.getItem(SCALE_KEY)

    if(savedPage){
      const p = Number(savedPage)
      if(p >= 1 && p <= pdf.numPages){
        setPage(p)
      }
    }

    if(savedScale){
      setScale(Number(savedScale))
    }
  }

  /* ================= SAVE ================= */

  useEffect(()=>{
    if(!loaded) return
    localStorage.setItem(PAGE_KEY, String(page))
  },[page, loaded])

  useEffect(()=>{
    if(!loaded) return
    localStorage.setItem(SCALE_KEY, String(scale))
  },[scale, loaded])

  /* ================= PDF ================= */

  function onLoadSuccess(pdf:any){
    setNumPages(pdf.numPages)
    restoreState(pdf)
    setLoaded(true)
  }

  function irParaPagina(){
    const pagina = Number(inputPagina)
    if(pagina >= 1 && pagina <= numPages){
      setPage(pagina)
    }
  }

  /* ================= SWIPE ================= */

  useEffect(()=>{
    const el = containerRef.current
    if(!el) return

    let startX = 0

    const onTouchStart = (e:any)=>{
      if(e.touches.length === 1){
        startX = e.touches[0].clientX
      }
    }

    const onTouchEnd = (e:any)=>{
      const endX = e.changedTouches[0].clientX
      const diff = startX - endX

      if(scale <= 1.05 && Math.abs(diff) > 80){
        if(diff > 0){
          setPage(p => Math.min(p + 1, numPages))
        }else{
          setPage(p => Math.max(p - 1, 1))
        }
      }
    }

    el.addEventListener("touchstart", onTouchStart)
    el.addEventListener("touchend", onTouchEnd)

    return ()=>{
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchend", onTouchEnd)
    }

  },[numPages, scale])

  /* ================= SCROLL TO TOP ================= */

  useEffect(()=>{
    containerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  },[page])

  return(

    <div className={styles.container}>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <button
            className={styles.backButton}
            onClick={()=>navigate(-1)}
          >
            ←
          </button>

          <div className={styles.title}>
            Tratado
          </div>
        </div>

        {/* BUSCA DE PÁGINA */}
        <div className={styles.searchBar}>
          <div className={styles.searchGroup}>
            <input
              placeholder="Página"
              value={inputPagina}
              onChange={(e)=>setInputPagina(e.target.value)}
              onKeyDown={(e)=>{
                if(e.key === "Enter") irParaPagina()
              }}
            />
            <button onClick={irParaPagina}>Ir</button>
          </div>
        </div>
      </div>

      {/* PDF */}
      <div
        ref={containerRef}
        className={`${styles.viewer} ${scale <= 1 ? styles.centered : ""}`}
      >
        <div>
          <Document
            file="/tratado.pdf"
            onLoadSuccess={onLoadSuccess}
            loading="Carregando PDF..."
            error="Erro ao carregar PDF"
          >
            <Page
              key={`${page}-${scale}`}
              pageNumber={page}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>

        <button onClick={()=>setPage(p => Math.max(p - 1, 1))}>←</button>

        <span className={styles.pageInfo}>
          {page}/{numPages}
        </span>

        <button onClick={()=>setPage(p => Math.min(p + 1, numPages))}>→</button>

        <div className={styles.zoom}>
          <button onClick={()=>setScale(s => Math.max(1, s - 0.2))}>−</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={()=>setScale(s => Math.min(4, s + 0.2))}>+</button>
        </div>

      </div>

    </div>
  )
}