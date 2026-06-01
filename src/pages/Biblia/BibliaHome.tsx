import styles from "./BibliaHome.module.css"
import { useNavigate } from "react-router-dom"
import { useEffect,useState,useCallback } from "react"

import {
 getOldTestament,
 getNewTestament,
 searchVerses,
 type VerseResult
} from "../../services/bibliaService"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

import {
 Search,
 ChevronRight,
 BookOpen,
 Cross
} from "lucide-react"

type SearchMode = "livros" | "versiculos"

export default function BibliaHome(){

 const navigate = useNavigate()

 const antigo = getOldTestament()
 const novo = getNewTestament()

 const [search,setSearch] = useState("")
 const [searchMode,setSearchMode] = useState<SearchMode>("livros")
 const [verseQuery,setVerseQuery] = useState("")
 const [verseResults,setVerseResults] = useState<VerseResult[]>([])
 const [searching,setSearching] = useState(false)

 useEffect(()=>{
  window.scrollTo({ top:0, behavior:"instant" })
 },[])

 /* ==============================
  BUSCA DE VERS\u00cdCULOS (debounced)
 ============================== */

 useEffect(()=>{

  if(verseQuery.length < 3){
   setVerseResults([])
   setSearching(false)
   return
  }

  setSearching(true)

  const timer = setTimeout(()=>{
   const results = searchVerses(verseQuery)
   setVerseResults(results)
   setSearching(false)
  }, 450)

  return ()=>clearTimeout(timer)

 },[verseQuery])

 /* ==============================
  FILTRO DE LIVROS
 ============================== */

 function removeAccents(text:string){
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
 }

 function filterBooks(books:any[]){
  const q = removeAccents(search)
  return books.filter((book:any)=>removeAccents(book.nome).includes(q))
 }

 const antigoFiltrado = filterBooks(antigo)
 const novoFiltrado   = filterBooks(novo)
 const totalBooks     = antigo.length + novo.length

 /* ==============================
  HIGHLIGHT
 ============================== */

 function highlight(text:string, query:string){

  if(!query) return text

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")
  const regex = new RegExp(`(${escaped})`, "gi")
  const parts = text.split(regex)

  return parts.map((part)=>
   regex.test(part)
    ? `<mark>${part}</mark>`
    : part
  ).join("")

 }

 const goToVerse = useCallback((r:VerseResult)=>{
  navigate(`/oratio/biblia/${r.book}/${r.chapter}`)
 },[navigate])

 return(

  <div className={`${styles.container} page-enter`}>

   <div className={styles.glow}></div>

   {/* VOLTAR */}

   <button
    className={styles.backButton}
    onClick={()=>navigate(-1)}
   >
    ← Voltar
   </button>

   {/* HERO */}

   <div className={styles.hero}>

    <div className={styles.heroIcon}>
      <BookOpen size={38}/>
    </div>

    <span className={styles.badge}>
      Palavra de Deus
    </span>

    <h1 className={styles.title}>
      Bíblia Sagrada
    </h1>

    <p className={styles.subtitle}>
      Leia, medite e aproxime-se diariamente
      da Palavra de Cristo.
    </p>

    <div className={styles.stats}>
      <span>{totalBooks} livros</span>
      <span>Antigo e Novo Testamento</span>
    </div>

   </div>

   {/* ABAS DE BUSCA */}

   <div className={styles.searchTabs}>

    <button
     className={`${styles.searchTab} ${searchMode==="livros" ? styles.searchTabActive : ""}`}
     onClick={()=>setSearchMode("livros")}
    >
     <BookOpen size={14}/> Livros
    </button>

    <button
     className={`${styles.searchTab} ${searchMode==="versiculos" ? styles.searchTabActive : ""}`}
     onClick={()=>setSearchMode("versiculos")}
    >
     <Search size={14}/> Versículos
    </button>

   </div>

   {/* SEARCH — LIVROS */}

   {searchMode === "livros" && (
    <div className={styles.searchWrapper}>
     <Search size={18} className={styles.searchIcon}/>
     <input
      type="search"
      placeholder="Pesquisar livro..."
      value={search}
      onChange={(e)=>setSearch(e.target.value)}
      className={styles.searchInput}
     />
    </div>
   )}

   {/* SEARCH — VERSÍCULOS */}

   {searchMode === "versiculos" && (
    <>
    <p className={styles.verseSearchDesc}>
     Pesquise por palavras ou frases em todos os livros da Bíblia.
     <br/>
     <span>Ex: "não temas", "luz do mundo", "amor"</span>
    </p>
    <div className={styles.searchWrapper}>
     <Search size={18} className={styles.searchIcon}/>
     <input
      type="search"
      placeholder="Buscar na Bíblia..."
      value={verseQuery}
      onChange={(e)=>setVerseQuery(e.target.value)}
      className={styles.searchInput}
      autoFocus
     />
    </div>
    </>
   )}

   {/* RESULTADOS DE VERSÍCULOS */}

   {searchMode === "versiculos" && (

    <div className={styles.verseResultsSection}>

     {verseQuery.length > 0 && verseQuery.length < 3 && (
      <p className={styles.verseHint}>
       Digite ao menos 3 caracteres para buscar.
      </p>
     )}

     {searching && (
      <p className={styles.verseHint}>Buscando...</p>
     )}

     {!searching && verseQuery.length >= 3 && verseResults.length === 0 && (
      <div className={styles.empty}>
       <BookOpen size={36}/>
       <h3>Nenhum versículo encontrado</h3>
       <p>Tente outras palavras.</p>
      </div>
     )}

     {!searching && verseResults.length > 0 && (
      <>
       <p className={styles.verseCount}>
        {verseResults.length === 50
         ? "Primeiros 50 resultados"
         : `${verseResults.length} resultado${verseResults.length > 1 ? "s" : ""}`}
       </p>

       <div className={styles.verseResultsList}>

        {verseResults.map((r,i)=>(

         <button
          key={i}
          className={styles.verseCard}
          onClick={()=>goToVerse(r)}
         >

          <div className={styles.verseCardRef}>
           <BookOpen size={13}/>
           <strong>{r.book} {r.chapter},{r.verse}</strong>
          </div>

          <p
           className={styles.verseCardText}
           dangerouslySetInnerHTML={{
            __html: highlight(
             r.text.length > 120
              ? r.text.slice(0,120) + "…"
              : r.text,
             verseQuery
            )
           }}
          />

         </button>

        ))}

       </div>
      </>
     )}

    </div>

   )}

   {/* LIVROS (só quando modo livros) */}

   {searchMode === "livros" && (
   <>

   {antigoFiltrado.length > 0 && (

    <section className={styles.section}>

      <div className={styles.sectionHeader}>

        <div className={styles.sectionIcon}>
          <Cross size={18}/>
        </div>

        <div>
          <h2>Antigo Testamento</h2>
          <span>
            {antigoFiltrado.length} livros
          </span>
        </div>

      </div>

      <div className={styles.booksGrid}>

        {antigoFiltrado.map((book:any)=>(

          <button
            key={book.nome}
            className={styles.bookCard}
            onClick={()=>
              navigate(`/oratio/biblia/${book.nome}`)
            }
          >

            <div className={styles.bookLeft}>

              <div className={styles.bookIcon}>
                <BookOpen size={16}/>
              </div>

              <span>{book.nome}</span>

            </div>

            <ChevronRight size={18}/>

          </button>

        ))}

      </div>

    </section>

   )}

   {/* NOVO TESTAMENTO */}

   {novoFiltrado.length > 0 && (

    <section className={styles.section}>

      <div className={styles.sectionHeader}>

        <div className={styles.sectionIcon}>
          <BookOpen size={18}/>
        </div>

        <div>
          <h2>Novo Testamento</h2>
          <span>
            {novoFiltrado.length} livros
          </span>
        </div>

      </div>

      <div className={styles.booksGrid}>

        {novoFiltrado.map((book:any)=>(

          <button
            key={book.nome}
            className={styles.bookCard}
            onClick={()=>
              navigate(`/oratio/biblia/${book.nome}`)
            }
          >

            <div className={styles.bookLeft}>

              <div className={styles.bookIcon}>
                <BookOpen size={16}/>
              </div>

              <span>{book.nome}</span>

            </div>

            <ChevronRight size={18}/>

          </button>

        ))}

      </div>

    </section>

   )}

   {antigoFiltrado.length === 0 &&
    novoFiltrado.length === 0 && (

    <div className={styles.empty}>

      <BookOpen size={40}/>

      <h3>Nenhum livro encontrado</h3>

      <p>
        Tente pesquisar com outro nome.
      </p>

    </div>

   )}

   </>
   )}

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )

}