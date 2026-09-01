import styles from "./BibliaHome.module.css"
import { useNavigate } from "react-router-dom"
import { useEffect,useState,useCallback } from "react"

import {
 getOldTestament,
 getNewTestament,
 searchVerses,
 searchVersesByKeywords,
 getRecentSearches,
 addRecentSearch,
 clearRecentSearches,
 type VerseResult
} from "../../services/bibliaService"

import { BIBLE_TOPICS, type BibleTopic } from "../../data/bibleTopics"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

import GuestGateModal
from "../../components/GuestGateModal/GuestGateModal"

import { isLoggedIn } from "../../utils/auth"

import {
 Search,
 ChevronRight,
 ChevronLeft,
 BookOpen,
 Bookmark,
 Cross,
 Clock,
 X,
 Sparkles
} from "lucide-react"

type SearchMode = "livros" | "versiculos"

const FETCH_LIMIT = 200
const PAGE_SIZE = 24

export default function BibliaHome(){

 const navigate = useNavigate()

 const antigo = getOldTestament()
 const novo = getNewTestament()

 const [search,setSearch] = useState("")
 const [searchMode,setSearchMode] = useState<SearchMode>("livros")
 const [verseQuery,setVerseQuery] = useState("")
 const [activeTopic,setActiveTopic] = useState<BibleTopic | null>(null)
 const [verseResults,setVerseResults] = useState<VerseResult[]>([])
 const [visibleCount,setVisibleCount] = useState(PAGE_SIZE)
 const [searching,setSearching] = useState(false)
 const [recentSearches,setRecentSearches] = useState<string[]>([])
 const [gateMessage,setGateMessage] = useState<string | null>(null)

 useEffect(()=>{
  window.scrollTo({ top:0, behavior:"instant" })
  setRecentSearches(getRecentSearches())
 },[])

 /* ==============================
  BUSCA DE VERS\u00cdCULOS (debounced)
 ============================== */

 useEffect(()=>{

  if(verseQuery.length < 3){
   if(!activeTopic) setVerseResults([])
   setSearching(false)
   return
  }

  setActiveTopic(null)
  setSearching(true)

  const timer = setTimeout(()=>{
   const results = searchVerses(verseQuery, FETCH_LIMIT)
   setVerseResults(results)
   setVisibleCount(PAGE_SIZE)
   setSearching(false)
   addRecentSearch(verseQuery)
   setRecentSearches(getRecentSearches())
  }, 450)

  return ()=>clearTimeout(timer)

 },[verseQuery])

 /* ==============================
  BUSCA POR TEMA
 ============================== */

 function handleTopicClick(topic:BibleTopic){
  setActiveTopic(topic)
  setVerseQuery("")
  setSearching(true)
  const results = searchVersesByKeywords(topic.keywords, FETCH_LIMIT)
  setVerseResults(results)
  setVisibleCount(PAGE_SIZE)
  setSearching(false)
 }

 function clearTopic(){
  setActiveTopic(null)
  setVerseResults([])
  setVisibleCount(PAGE_SIZE)
 }

 function handleQueryChange(v:string){
  setVerseQuery(v)
  if(activeTopic) setActiveTopic(null)
 }

 function handleSearchTabClick(){

  if(!isLoggedIn()){
   setGateMessage(
    "Crie uma conta para pesquisar qualquer palavra ou tema na Bíblia."
   )
   return
  }

  setSearchMode("versiculos")

 }

 function handleMinhaBibliaClick(){

  if(!isLoggedIn()){
   setGateMessage(
    "Crie uma conta para ter sua área de grifos, favoritos e anotações."
   )
   return
  }

  navigate("/oratio/biblia/minha")

 }

 function handleRecentClick(q:string){
  setActiveTopic(null)
  setVerseQuery(q)
 }

 function handleClearRecent(){
  clearRecentSearches()
  setRecentSearches([])
 }

 function loadMoreResults(){
  setVisibleCount((c)=>c + PAGE_SIZE)
 }

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

 function highlight(text:string, terms:string | string[]){

  const list = (Array.isArray(terms) ? terms : [terms]).filter(Boolean)
  if(list.length === 0) return text

  const escaped = list.map((t)=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"))
  const regex = new RegExp(`(${escaped.join("|")})`, "gi")
  const parts = text.split(regex)

  return parts.map((part,i)=>
   i % 2 === 1
    ? `<mark>${part}</mark>`
    : part
  ).join("")

 }

 function truncate(text:string, max = 180){

  if(text.length <= max) return text

  const cut = text.slice(0,max)
  const lastSpace = cut.lastIndexOf(" ")

  return (lastSpace > 40 ? cut.slice(0,lastSpace) : cut) + "…"

 }

 const goToVerse = useCallback((r:VerseResult)=>{
  navigate(`/oratio/biblia/${r.book}/${r.chapter}?verse=${r.verse}`)
 },[navigate])

 return(

  <div className={`${styles.container} page-enter`}>

   <div className={styles.glow}></div>

   {/* VOLTAR */}

   <button
    className={styles.backButton}
    onClick={()=>navigate("/oratio/home")}
   >
    <ChevronLeft size={18}/>
    Voltar
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

   {/* ABAS: BÍBLIA | MINHA BÍBLIA */}

   <div className={styles.searchTabs}>

    <button
     className={`${styles.searchTab} ${styles.searchTabActive}`}
    >
     <BookOpen size={14}/> Bíblia
    </button>

    <button
     className={styles.searchTab}
     onClick={handleMinhaBibliaClick}
    >
     <Bookmark size={14}/> Minha Bíblia
    </button>

   </div>

   {/* SEARCH — LIVROS + entrada da busca de palavras */}

   {searchMode === "livros" && (
    <>
     <button className={styles.verseSearchCard} onClick={handleSearchTabClick}>
      <div className={styles.verseSearchIcon}>
       <Sparkles size={20}/>
      </div>
      <div className={styles.verseSearchTexts}>
       <strong>Pesquisar na Bíblia</strong>
       <span>Encontre qualquer palavra, versículo ou tema — “amor”, “não temas”…</span>
      </div>
      <ChevronRight size={18} className={styles.verseSearchArrow}/>
     </button>

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
    </>
   )}

   {/* SEARCH — VERSÍCULOS */}

   {searchMode === "versiculos" && (
    <>
    <button
     className={styles.verseSearchBack}
     onClick={()=>{ setSearchMode("livros"); clearTopic(); setVerseQuery("") }}
    >
     <ChevronLeft size={16}/> Voltar aos livros
    </button>
    <p className={styles.verseSearchDesc}>
     Digite uma palavra ou frase e encontre tudo sobre ela na Bíblia,
     ou escolha um tema abaixo.
    </p>
    <div className={styles.searchWrapper}>
     <Search size={18} className={styles.searchIcon}/>
     <input
      type="search"
      placeholder='Buscar palavra ou frase, ex: "amor", "não temas"...'
      value={verseQuery}
      onChange={(e)=>handleQueryChange(e.target.value)}
      className={styles.searchInput}
      autoFocus
     />
    </div>
    </>
   )}

   {/* DESCOBRIR — TEMAS E PESQUISAS RECENTES */}

   {searchMode === "versiculos" && !activeTopic && verseQuery.trim().length < 3 && (

    <div className={styles.discoverPanel}>

     <div>
      <h3 className={styles.discoverTitle}>
       <Sparkles size={14}/> Pesquisar por tema
      </h3>
      <p className={styles.discoverHint}>
       Toque em um tema para ver os versículos relacionados
      </p>
      <div className={styles.topicsGrid}>
       {BIBLE_TOPICS.map((topic)=>{
        const TopicIcon = topic.icon
        return (
         <button
          key={topic.id}
          className={styles.topicChip}
          onClick={()=>handleTopicClick(topic)}
         >
          <TopicIcon size={15} className={styles.topicIcon}/>
          {topic.label}
         </button>
        )
       })}
      </div>
     </div>

     {recentSearches.length > 0 && (
      <div>
       <div className={styles.discoverTitleRow}>
        <h3 className={styles.discoverTitle}>
         <Clock size={14}/> Pesquisas recentes
        </h3>
        <button className={styles.clearRecentBtn} onClick={handleClearRecent}>
         Limpar
        </button>
       </div>
       <div className={styles.topicsGrid}>
        {recentSearches.map((q)=>(
         <button
          key={q}
          className={styles.recentChip}
          onClick={()=>handleRecentClick(q)}
         >
          {q}
         </button>
        ))}
       </div>
      </div>
     )}

    </div>

   )}

   {/* RESULTADOS DE VERSÍCULOS */}

   {searchMode === "versiculos" && (

    <div className={styles.verseResultsSection}>

     {activeTopic && (
      <div className={styles.topicHeader}>
       <span className={styles.topicHeaderLabel}>
        <activeTopic.icon size={17}/> {activeTopic.label}
       </span>
       <button className={styles.topicClearBtn} onClick={clearTopic}>
        <X size={14}/> Limpar
       </button>
      </div>
     )}

     {!activeTopic && verseQuery.length > 0 && verseQuery.length < 3 && (
      <p className={styles.verseHint}>
       Digite ao menos 3 caracteres para buscar.
      </p>
     )}

     {searching && (
      <p className={styles.verseHint}>Buscando...</p>
     )}

     {!searching && (activeTopic || verseQuery.length >= 3) && verseResults.length === 0 && (
      <div className={styles.empty}>
       <BookOpen size={36}/>
       <h3>Nenhum versículo encontrado</h3>
       <p>Tente outras palavras ou outro tema.</p>
      </div>
     )}

     {!searching && verseResults.length > 0 && (
      <>
       <p className={styles.verseCount}>
        {Math.min(visibleCount,verseResults.length)} de {verseResults.length}
        {verseResults.length === FETCH_LIMIT ? "+" : ""} resultado{verseResults.length > 1 ? "s" : ""}
       </p>

       <div className={styles.verseResultsList}>

        {verseResults.slice(0,visibleCount).map((r,i)=>(

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
             truncate(r.text),
             activeTopic ? activeTopic.keywords : verseQuery
            )
           }}
          />

         </button>

        ))}

       </div>

       {visibleCount < verseResults.length && (
        <button className={styles.loadMoreBtn} onClick={loadMoreResults}>
         Carregar mais resultados
        </button>
       )}
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

   <GuestGateModal
    open={gateMessage !== null}
    message={gateMessage || ""}
    onClose={()=>setGateMessage(null)}
   />

  </div>

 )

}