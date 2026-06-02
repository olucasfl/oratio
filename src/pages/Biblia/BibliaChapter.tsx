import { useParams,useNavigate,useSearchParams } from "react-router-dom"
import { useState,useRef,useEffect } from "react"

import {
 ChevronLeft,
 Search,
 BookOpen,
 Cross,
 Sparkles
} from "lucide-react"

import { getChapter }
from "../../services/bibliaService"

import { useReadingSize }
from "../../hooks/useReadingSize"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

import styles
from "./BibliaChapter.module.css"

export default function BibliaChapter(){

 const { book,chapter } = useParams()
 const [searchParams]   = useSearchParams()
 const navigate         = useNavigate()

 const targetVerse = Number(searchParams.get("verse")) || 0

 const capitulo =
  getChapter(book!,Number(chapter))

 const [search,setSearch] =
  useState("")

 const { size, fontSize, setSize } = useReadingSize()

 const verseRefs =
  useRef<Record<number,HTMLParagraphElement | null>>({})

 /* scroll to top apenas quando não tem versículo alvo */
 useEffect(()=>{
  if(!targetVerse){
   window.scrollTo({ top:0, behavior:"instant" })
  }
 },[])

 /* auto-scroll + highlight para o versículo vindo da busca */
 useEffect(()=>{
  if(!targetVerse) return

  const timer = setTimeout(()=>{

   const el = verseRefs.current[targetVerse]
   if(!el) return

   el.scrollIntoView({ behavior:"smooth", block:"center" })
   el.classList.add(styles.highlight)

   setTimeout(()=>{
    el.classList.remove(styles.highlight)
   }, 2500)

  }, 250) // aguarda o DOM renderizar

  return ()=> clearTimeout(timer)

 },[targetVerse])

 function goToVerse(){

  if(!search) return

  const verseNumber =
   Number(search)

  if(isNaN(verseNumber)) return

  const element =
   verseRefs.current[verseNumber]

  if(!element) return

  element.scrollIntoView({
   behavior:"smooth",
   block:"center"
  })

  element.classList.add(styles.highlight)

  setTimeout(()=>{
   element.classList.remove(styles.highlight)
  },2200)

 }

 if(!capitulo){

  return(
   <div className={styles.notFound}>
    Capítulo não encontrado
   </div>
  )

 }

 return(

  <div className={`${styles.container} page-enter`}>

   <div className={styles.glow}></div>

   {/* HEADER */}

   <div className={styles.hero}>

    <button
      className={styles.backButton}
      onClick={()=>navigate(-1)}
    >
      <ChevronLeft size={18}/>
      Voltar
    </button>

    <div className={styles.heroIcon}>
      <BookOpen size={34}/>
    </div>

    <span className={styles.badge}>
      Palavra de Deus
    </span>

    <h1 className={styles.title}>
      {book}
    </h1>

    <div className={styles.chapterBadge}>
      Capítulo {chapter}
    </div>

   </div>

   {/* SEARCH + TAMANHO */}

   <div className={styles.searchCard}>

    <div className={styles.searchHeader}>

      <Sparkles size={16}/>

      <span>
        Buscar versículo
      </span>

      <div className={styles.fontSizeBtns}>

       <button
        className={`${styles.fontBtn} ${size==="sm" ? styles.fontBtnActive : ""}`}
        onClick={()=>setSize("sm")}
        aria-label="Fonte pequena"
       >A</button>

       <button
        className={`${styles.fontBtn} ${styles.fontBtnMd} ${size==="md" ? styles.fontBtnActive : ""}`}
        onClick={()=>setSize("md")}
        aria-label="Fonte média"
       >A</button>

       <button
        className={`${styles.fontBtn} ${styles.fontBtnLg} ${size==="lg" ? styles.fontBtnActive : ""}`}
        onClick={()=>setSize("lg")}
        aria-label="Fonte grande"
       >A</button>

      </div>

    </div>

    <div className={styles.searchBox}>

      <div className={styles.searchInputWrapper}>

        <Search
          size={18}
          className={styles.searchIcon}
        />

        <input
          type="text"
          inputMode="numeric"
          placeholder="Número do versículo"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className={styles.searchInput}
        />

      </div>

      <button
        className={styles.searchButton}
        onClick={goToVerse}
      >
        Ir
      </button>

    </div>

   </div>

   {/* TEXTO */}

   <div className={styles.textCard} style={{ "--reading-font": `${fontSize}px` } as React.CSSProperties}>

    <div className={styles.chapterHeader}>

      <Cross size={16}/>

      <span>
        {book} {chapter}
      </span>

    </div>

    {capitulo.versiculos.map((v:any,index:number)=>{

      if(index === 0){

        return(

          <p
            key={v.versiculo}
            ref={(el)=>{
              verseRefs.current[v.versiculo] = el
            }}
            className={styles.verse}
          >

            <span className={styles.capitular}>
              {v.texto.charAt(0)}
            </span>

            {v.texto.slice(1)}

          </p>

        )

      }

      return(

        <p
          key={v.versiculo}
          ref={(el)=>{
            verseRefs.current[v.versiculo] = el
          }}
          className={styles.verse}
        >

          <span className={styles.number}>
            {v.versiculo}
          </span>

          {v.texto}

        </p>

      )

    })}

   </div>

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )

}