import { useParams,useNavigate,useSearchParams } from "react-router-dom"
import { useState,useRef,useEffect,useCallback } from "react"
import { createPortal } from "react-dom"

import {
 ChevronLeft,
 Search,
 BookOpen,
 Cross,
 Sparkles,
 Type,
 Heart,
 NotebookPen
} from "lucide-react"

import { getChapter }
from "../../services/bibliaService"

import { saveReadingProgress }
from "../../services/readingProgressService"

import {
 getChapterMarks,
 upsertMark,
 isDeleted,
 type BibleMark,
 type HighlightColor
} from "../../services/bibleMarksService"

import { isLoggedIn }
from "../../utils/auth"

import { useReadingPrefs }
from "../../hooks/useReadingPrefs"

import ReadingPanel
from "../../components/ReadingPanel/ReadingPanel"

import VerseActionSheet
from "../../components/VerseActionSheet/VerseActionSheet"

import VerseNoteEditor
from "../../components/VerseNoteEditor/VerseNoteEditor"

import GuestGateModal
from "../../components/GuestGateModal/GuestGateModal"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

import ShareReadingButton
from "../../components/ShareReadingButton/ShareReadingButton"

import { buildBibleChapterShareText }
from "../../utils/bibleShareText"

import styles
from "./BibliaChapter.module.css"

interface Verse { versiculo:number; texto:string }

export default function BibliaChapter(){

 const { book,chapter } = useParams()
 const [searchParams]   = useSearchParams()
 const navigate         = useNavigate()

 const targetVerse = Number(searchParams.get("verse")) || 0

 const capitulo =
  getChapter(book!,Number(chapter))

 const chapterNum = Number(chapter)

 const [search,setSearch] = useState("")

 const [panelOpen,setPanelOpen] = useState(false)

 const { prefs, update, lineHeight, fontFamily } = useReadingPrefs()

 /* marcações do capítulo (grifo / favorito / nota), por número de versículo */
 const [marks,setMarks] = useState<Record<number,BibleMark>>({})

 const [sheetVerse,setSheetVerse] = useState<number | null>(null)
 const [noteVerse,setNoteVerse]   = useState<number | null>(null)
 const [noteSaving,setNoteSaving] = useState(false)
 const [toast,setToast]           = useState<string | null>(null)
 const [gateMsg,setGateMsg]       = useState<string | null>(null)

 const verseRefs =
  useRef<Record<number,HTMLParagraphElement | null>>({})

 /* scroll to top apenas quando não tem versículo alvo */
 useEffect(()=>{
  if(!targetVerse){
   window.scrollTo({ top:0, behavior:"instant" })
  }
 },[])

 /* salva "onde parou" na Bíblia (best-effort) — alimenta a seção
    "Para você hoje" da Home. Só grava capítulo válido e só quem tem conta. */
 useEffect(()=>{
  if(!book || !chapter || !capitulo) return
  const reference = `${encodeURIComponent(book)}/${encodeURIComponent(chapter)}`
  saveReadingProgress("BIBLE", reference, `${book} ${chapter}`)
 },[book,chapter,capitulo])

 /* carrega as marcações do capítulo (silencioso — leitura nunca depende disso) */
 useEffect(()=>{
  if(!book || !capitulo) return
  let alive = true
  getChapterMarks(book, chapterNum).then((list)=>{
   if(!alive) return
   const map:Record<number,BibleMark> = {}
   for(const m of list) map[m.verse] = m
   setMarks(map)
  })
  return ()=>{ alive = false }
 },[book,chapterNum,capitulo])

 /* auto-dismiss do toast */
 useEffect(()=>{
  if(!toast) return
  const t = setTimeout(()=>setToast(null), 3200)
  return ()=>clearTimeout(t)
 },[toast])

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

 const buildReference = useCallback(
  (verseNum:number)=>`${book} ${chapter},${verseNum}`,
  [book,chapter]
 )

 /*
  Aplica um patch (grifo / favorito / nota) num versículo de forma
  otimista e persiste no backend. Em erro, desfaz e avisa.
  Retorna se deu certo (o editor de nota usa pra saber se fecha).
 */
 const applyMark = useCallback(async (
  verseNum:number,
  patch:{ highlighted?:boolean; highlightColor?:HighlightColor; favorite?:boolean; note?:string }
 ):Promise<boolean>=>{

  if(!isLoggedIn()){
   setGateMsg("Crie uma conta para grifar, favoritar e anotar versículos.")
   return false
  }

  const verse = capitulo?.versiculos.find((v:Verse)=>v.versiculo === verseNum)
  if(!verse) return false

  const reference = buildReference(verseNum)
  const prev = marks[verseNum]

  const nextNote =
   patch.note !== undefined
    ? (patch.note.trim() || null)
    : (prev?.note ?? null)

  const nextHighlighted =
   patch.highlighted ?? (patch.highlightColor ? true : (prev?.highlighted ?? false))

  const optimistic:BibleMark = {
   id: prev?.id ?? `tmp-${verseNum}`,
   book: book!,
   chapter: chapterNum,
   verse: verseNum,
   reference,
   text: verse.texto,
   highlighted: nextHighlighted,
   highlightColor: nextHighlighted
    ? (patch.highlightColor ?? prev?.highlightColor ?? "amber")
    : null,
   favorite: patch.favorite ?? prev?.favorite ?? false,
   note: nextNote,
   createdAt: prev?.createdAt ?? new Date().toISOString(),
   updatedAt: new Date().toISOString()
  }

  setMarks((m)=>{
   const next = { ...m }
   if(!optimistic.highlighted && !optimistic.favorite && !optimistic.note){
    delete next[verseNum]
   }else{
    next[verseNum] = optimistic
   }
   return next
  })

  try{
   const result = await upsertMark({
    book: book!,
    chapter: chapterNum,
    verse: verseNum,
    reference,
    text: verse.texto,
    ...patch
   })

   setMarks((m)=>{
    const next = { ...m }
    if(isDeleted(result)) delete next[verseNum]
    else next[verseNum] = result
    return next
   })

   return true

  }catch{
   setMarks((m)=>{
    const next = { ...m }
    if(prev) next[verseNum] = prev
    else delete next[verseNum]
    return next
   })
   setToast("Não foi possível salvar. Tente de novo.")
   return false
  }

 },[book,chapter,chapterNum,capitulo,marks,buildReference])

 function openSheet(verseNum:number){
  if(!isLoggedIn()){
   setGateMsg("Crie uma conta para grifar, favoritar e anotar versículos.")
   return
  }
  setSheetVerse(verseNum)
 }

 async function toggleFavoriteQuick(verseNum:number){
  const current = !!marks[verseNum]?.favorite
  await applyMark(verseNum, { favorite: !current })
 }

 async function saveNote(note:string){
  if(noteVerse === null) return
  setNoteSaving(true)
  const ok = await applyMark(noteVerse, { note })
  setNoteSaving(false)
  if(ok) setNoteVerse(null)
 }

 async function deleteNote(){
  if(noteVerse === null) return
  setNoteSaving(true)
  const ok = await applyMark(noteVerse, { note: "" })
  setNoteSaving(false)
  if(ok) setNoteVerse(null)
 }

 if(!capitulo){

  return(
   <div className={styles.notFound}>
    Capítulo não encontrado
   </div>
  )

 }

 const sheetMark = sheetVerse !== null ? marks[sheetVerse] : undefined
 const noteMark  = noteVerse  !== null ? marks[noteVerse]  : undefined

 return(

  <div className={`${styles.container} page-enter`}>

   <div className={styles.glow}></div>

   {/* HEADER */}

   <div className={styles.hero}>

    <button
      className={styles.backButton}
      onClick={()=>navigate(`/oratio/biblia/${book}`)}
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

      <button
       className={styles.readingBtn}
       onClick={()=>setPanelOpen(true)}
       aria-label="Ajustes de leitura"
      >
       <Type size={15}/>
       Leitura
      </button>

      <ShareReadingButton
       compact
       label={`${book} ${chapter}`}
       buildText={()=>
        buildBibleChapterShareText(
         book!,
         chapter!,
         `${window.location.origin}/oratio/biblia/${encodeURIComponent(book!)}/${encodeURIComponent(chapter!)}`
        )
       }
      />

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

   <div
     className={styles.textCard}
     data-reading-theme={prefs.theme}
     data-reading-width={prefs.width}
     style={{
       "--reading-font": `${prefs.fontSize}px`,
       "--reading-line": String(lineHeight),
       "--reading-family": fontFamily
     } as React.CSSProperties}
   >

    <div className={styles.chapterHeader}>

      <Cross size={16}/>

      <span>
        {book} {chapter}
      </span>

    </div>

    {capitulo.versiculos.map((v:Verse,index:number)=>{

      const mark = marks[v.versiculo]
      const isDrop = index === 0

      return(

        <p
          key={v.versiculo}
          ref={(el)=>{
            verseRefs.current[v.versiculo] = el
          }}
          className={styles.verse}
          onClick={()=>openSheet(v.versiculo)}
        >

          {isDrop ? (
            <>
              <span className={styles.capitular}>{v.texto.charAt(0)}</span>
              <span
                className={mark?.highlighted ? styles.hl : undefined}
                data-hl-color={mark?.highlighted ? (mark.highlightColor ?? "amber") : undefined}
              >
                {v.texto.slice(1)}
              </span>
            </>
          ) : (
            <>
              <span className={styles.number}>{v.versiculo}</span>
              <span
                className={mark?.highlighted ? styles.hl : undefined}
                data-hl-color={mark?.highlighted ? (mark.highlightColor ?? "amber") : undefined}
              >
                {v.texto}
              </span>
            </>
          )}

          {mark?.note && (
            <NotebookPen
              size={14}
              className={styles.noteFlag}
              onClick={(e)=>{ e.stopPropagation(); setNoteVerse(v.versiculo) }}
            />
          )}

          <button
            className={`${styles.favBtn} ${mark?.favorite ? styles.favBtnOn : ""}`}
            onClick={(e)=>{ e.stopPropagation(); toggleFavoriteQuick(v.versiculo) }}
            aria-label={mark?.favorite ? "Desfavoritar versículo" : "Favoritar versículo"}
          >
            <Heart size={14} fill={mark?.favorite ? "currentColor" : "none"} />
          </button>

        </p>

      )

    })}

   </div>

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

   <ReadingPanel
     open={panelOpen}
     onClose={()=>setPanelOpen(false)}
     prefs={prefs}
     update={update}
   />

   <VerseActionSheet
     open={sheetVerse !== null}
     onClose={()=>setSheetVerse(null)}
     reference={sheetVerse !== null ? buildReference(sheetVerse) : ""}
     text={sheetVerse !== null ? (capitulo.versiculos.find((v:Verse)=>v.versiculo === sheetVerse)?.texto ?? "") : ""}
     mark={sheetMark}
     onSetHighlight={(color)=>{
       if(sheetVerse === null) return
       applyMark(
         sheetVerse,
         color ? { highlighted:true, highlightColor:color } : { highlighted:false }
       )
       setSheetVerse(null)
     }}
     onToggleFavorite={()=>{
       if(sheetVerse === null) return
       applyMark(sheetVerse, { favorite: !sheetMark?.favorite })
       setSheetVerse(null)
     }}
     onEditNote={()=>{
       const v = sheetVerse
       setSheetVerse(null)
       setNoteVerse(v)
     }}
   />

   <VerseNoteEditor
     open={noteVerse !== null}
     reference={noteVerse !== null ? buildReference(noteVerse) : ""}
     initialNote={noteMark?.note ?? ""}
     saving={noteSaving}
     onClose={()=>setNoteVerse(null)}
     onSave={saveNote}
     onDelete={deleteNote}
   />

   <GuestGateModal
     open={gateMsg !== null}
     message={gateMsg || ""}
     onClose={()=>setGateMsg(null)}
   />

   {toast && createPortal(
     <div className={styles.toast}>{toast}</div>,
     document.body
   )}

  </div>

 )

}
