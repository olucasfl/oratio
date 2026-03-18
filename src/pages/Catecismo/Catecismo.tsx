import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

import styles from "./Catecismo.module.css"
import { Document, Page, pdfjs } from "react-pdf"

import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"

import worker from "pdfjs-dist/build/pdf.worker.min.mjs?url"
pdfjs.GlobalWorkerOptions.workerSrc = worker

export default function Catecismo(){

  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const [page, setPage] = useState(1)
  const [numPages, setNumPages] = useState<number>(0)

  const [inputPagina, setInputPagina] = useState("")
  const [inputArtigo, setInputArtigo] = useState("")

  const [scale, setScale] = useState(1.2)

  const [pdf, setPdf] = useState<any>(null)
  const [loadingSearch, setLoadingSearch] = useState(false)

  const [resultados, setResultados] = useState<any[]>([])
  const [mostrarResultados, setMostrarResultados] = useState(false)

  const [loaded, setLoaded] = useState(false)
  const [isZooming, setIsZooming] = useState(false)

  const [visualScale, setVisualScale] = useState(1.2)

  const visualScaleRef = useRef(visualScale)

  useEffect(()=>{
    visualScaleRef.current = visualScale
  },[visualScale])

  /* =========================
     RESTORE
  ========================= */

  function restoreState(pdf:any){
    const savedPage = localStorage.getItem("catecismo_page")
    const savedScale = localStorage.getItem("catecismo_scale")

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

  /* =========================
     SAVE STATE
  ========================= */

  useEffect(()=>{
    if(!loaded) return
    localStorage.setItem("catecismo_page", String(page))
  },[page, loaded])

  useEffect(()=>{
    if(!loaded) return
    localStorage.setItem("catecismo_scale", String(scale))
  },[scale, loaded])

  useEffect(()=>{
  setVisualScale(scale)
}, [scale])

  /* =========================
     PDF LOAD
  ========================= */

  function onLoadSuccess(pdf:any){
    setNumPages(pdf.numPages)
    setPdf(pdf)
    restoreState(pdf)
    setLoaded(true)
  }

  function irParaPagina(){
    const pagina = Number(inputPagina)
    if(pagina >= 1 && pagina <= numPages){
      setPage(pagina)
    }
  }

  /* =========================
     PINCH ZOOM
  ========================= */

  useEffect(()=>{
    const el = containerRef.current
    if(!el) return

    let initialDistance = 0
    let initialScale = visualScaleRef.current

    function getDistance(touches:any){
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx*dx + dy*dy)
    }

    const onTouchStart = (e:any)=>{
      if(e.touches.length === 2){
        setIsZooming(true)
        initialDistance = getDistance(e.touches)
        initialScale = visualScaleRef.current
      }
    }

    const onTouchMove = (e:any)=>{
      if(e.touches.length === 2){
        e.preventDefault()

        const newDistance = getDistance(e.touches)
        const ratio = newDistance / initialDistance

        let newScale = initialScale * ratio
        newScale = Math.max(0.5, Math.min(newScale, 3))

        setVisualScale(newScale)
      }
    }

    const onTouchEnd = ()=>{
      setIsZooming(false)

      setScale(visualScaleRef.current)
    }

    el.addEventListener("touchstart", onTouchStart, { passive:false })
    el.addEventListener("touchmove", onTouchMove, { passive:false })
    el.addEventListener("touchend", onTouchEnd)

    return ()=>{
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
    }

  },[])

  /* =========================
     SWIPE
  ========================= */

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

      if(isZooming) return // 🔥 evita conflito

      const endX = e.changedTouches[0].clientX
      const diff = startX - endX

      if(Math.abs(diff) > 80){
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

  },[numPages, isZooming])

  /* =========================
     BUSCA (INTOCADA)
  ========================= */

  async function irParaArtigo(){

    if(!pdf) return

    const artigo = inputArtigo.trim()
    if(!artigo) return

    setLoadingSearch(true)
    setResultados([])

    try{

      const encontrados:any[] = []

      const regex = new RegExp(`${artigo}\\s*\\.`)

      for(let i = 1; i <= numPages; i++){

        const p = await pdf.getPage(i)
        const text = await p.getTextContent()

        const pageText = text.items
          .map((item:any)=>item.str)
          .join("")
          .replace(/\s+/g," ")

        if(regex.test(pageText)){

          const index = pageText.indexOf(artigo)
          const preview = pageText.substring(index, index + 120)

          encontrados.push({
            pagina: i,
            preview
          })
        }
      }

      setResultados(encontrados)
      setMostrarResultados(true)

      if(encontrados.length === 1){
        setPage(encontrados[0].pagina)
        setMostrarResultados(false)
      }

    }catch(err){
      console.error(err)
    }

    setLoadingSearch(false)
  }

  function handleKey(e:React.KeyboardEvent<HTMLInputElement>, tipo:"artigo"|"pagina"){
    if(e.key === "Enter"){
      if(tipo === "artigo") irParaArtigo()
      if(tipo === "pagina") irParaPagina()
    }
  }

  return(

    <div className={styles.container}>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <button
            className={styles.backButton}
            onClick={()=>navigate("/oratio/home")}
          >
            ←
          </button>

          <div className={styles.title}>
            Catecismo
          </div>
        </div>

        <div className={styles.searchBar}>
          <div className={styles.searchGroup}>
            <input
              placeholder="Artigo (ex: 1210)"
              value={inputArtigo}
              onChange={(e)=>setInputArtigo(e.target.value)}
              onKeyDown={(e)=>handleKey(e,"artigo")}
            />
            <button onClick={irParaArtigo}>Buscar</button>
          </div>

          <div className={styles.searchGroup}>
            <input
              placeholder="Página"
              value={inputPagina}
              onChange={(e)=>setInputPagina(e.target.value)}
              onKeyDown={(e)=>handleKey(e,"pagina")}
            />
            <button onClick={irParaPagina}>Ir</button>
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loadingSearch && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loader}></div>
          <p>Buscando artigo...</p>
        </div>
      )}

      {/* RESULTADOS */}
      {mostrarResultados && (
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <h3>Resultados ({resultados.length})</h3>
            <button onClick={()=>setMostrarResultados(false)}>✕</button>
          </div>

          {resultados.length === 0 && (
            <p className={styles.noResults}>
              Nenhum artigo encontrado.
            </p>
          )}

          {resultados.map((r, i)=>(
            <div
              key={i}
              className={styles.resultItem}
              onClick={()=>{
                setPage(r.pagina)
                setMostrarResultados(false)
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
            >
              <strong>Página {r.pagina}</strong>
              <p>{r.preview}...</p>
            </div>
          ))}
        </div>
      )}

      {/* PDF */}
      <div ref={containerRef} className={styles.viewer}>
        <div
          style={{
            transform: `scale(${visualScale})`,
            transformOrigin: "center center",
            transition: isZooming ? "none" : "transform 0.2s ease"
          }}
        >
          <Document file="/catecismo.pdf" onLoadSuccess={onLoadSuccess}>
            <Page
              key={`${page}-${scale}`}
              pageNumber={page}
              scale={scale}
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
          <button onClick={()=>setScale(s => Math.max(0.5, s - 0.2))}>−</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={()=>setScale(s => Math.min(3, s + 0.2))}>+</button>
        </div>

      </div>

    </div>
  )
}