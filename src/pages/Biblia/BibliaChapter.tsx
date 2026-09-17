import { useParams,useNavigate,useSearchParams } from "react-router-dom"
import { useState,useRef,useEffect,useCallback,useMemo } from "react"
import { createPortal } from "react-dom"

import {
 ChevronLeft,
 Search,
 BookOpen,
 Cross,
 Sparkles,
 Type,
 Heart,
 NotebookPen,
 ListChecks,
 Highlighter,
 FolderPlus,
 Check,
 X
} from "lucide-react"

import { getChapter }
from "../../services/bibliaService"

import { saveReadingProgress }
from "../../services/readingProgressService"

import {
 getChapterMarks,
 upsertMark,
 isDeleted,
 HIGHLIGHT_COLORS,
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

import AddToCollectionSheet
from "../../components/AddToCollectionSheet/AddToCollectionSheet"

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

// toast simples, opcionalmente com um atalho (ex.: "Ver" → Minha Bíblia,
// já filtrada no livro/aba do que acabou de ser marcado)
interface Toast { text:string; action?: { label:string; onClick:()=>void } }

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
 const [collVerse,setCollVerse]   = useState<number | null>(null)
 const [noteSaving,setNoteSaving] = useState(false)
 const [toast,setToast]           = useState<Toast | null>(null)
 const [gateMsg,setGateMsg]       = useState<string | null>(null)

 /* seleção múltipla — grifar/anotar/adicionar à coleção vários versículos
    de uma vez, sem repetir o toque em cada um */
 const [selectMode,setSelectMode]       = useState(false)
 const [selected,setSelected]           = useState<Set<number>>(new Set())
 const [bulkColorPicker,setBulkColorPicker] = useState(false)
 const [bulkNoteOpen,setBulkNoteOpen]   = useState(false)
 const [bulkCollOpen,setBulkCollOpen]   = useState(false)
 const [bulkSaving,setBulkSaving]       = useState(false)

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
   setToast({ text:"Não foi possível salvar. Tente de novo." })
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
  if(ok){
   setNoteVerse(null)
   if(note.trim()){
    setToast({
     text:"Anotação salva",
     action:{ label:"Ver", onClick:()=>navigate(minhaBibliaLink("anotacoes")) }
    })
   }
  }
 }

 async function deleteNote(){
  if(noteVerse === null) return
  setNoteSaving(true)
  const ok = await applyMark(noteVerse, { note: "" })
  setNoteSaving(false)
  if(ok) setNoteVerse(null)
 }

 // link de atalho pro toast: pousa direto na aba/livro do que acabou de
 // ser marcado, em vez de a pessoa ter que navegar até "Minha Bíblia" e
 // achar o livro de novo
 function minhaBibliaLink(tab:"grifados"|"anotacoes"){
  return `/oratio/biblia/minha?tab=${tab}&book=${encodeURIComponent(book!)}`
 }

 function toggleSelected(verseNum:number){
  setSelected((s)=>{
   const next = new Set(s)
   if(next.has(verseNum)) next.delete(verseNum)
   else next.add(verseNum)
   return next
  })
 }

 function exitSelectMode(){
  setSelectMode(false)
  setSelected(new Set())
  setBulkColorPicker(false)
 }

 async function applyBulkHighlight(color:HighlightColor){
  setBulkColorPicker(false)
  setBulkSaving(true)
  const verses = [...selected]
  const results = await Promise.all(
   verses.map((v)=>applyMark(v, { highlighted:true, highlightColor:color }))
  )
  setBulkSaving(false)
  const okCount = results.filter(Boolean).length
  if(okCount > 0){
   setToast({
    text: `${okCount} versículo${okCount === 1 ? "" : "s"} grifado${okCount === 1 ? "" : "s"}`,
    action: { label:"Ver", onClick:()=>navigate(minhaBibliaLink("grifados")) }
   })
  }
  exitSelectMode()
 }

 async function applyBulkNote(note:string){
  setBulkSaving(true)
  const verses = [...selected]
  const results = await Promise.all(verses.map((v)=>applyMark(v, { note })))
  setBulkSaving(false)
  setBulkNoteOpen(false)
  const okCount = results.filter(Boolean).length
  if(okCount > 0){
   setToast({
    text: `${okCount} versículo${okCount === 1 ? "" : "s"} anotado${okCount === 1 ? "" : "s"}`,
    action: { label:"Ver", onClick:()=>navigate(minhaBibliaLink("anotacoes")) }
   })
  }
  exitSelectMode()
 }

 // itens da coleção pros versículos selecionados (modo múltiplo do
 // AddToCollectionSheet) — só recalcula quando a seleção muda, pra não
 // disparar o sheet de novo a cada render enquanto está aberto
 const bulkItems = useMemo(()=>{
  if(!capitulo) return []
  return [...selected].map((v)=>{
   const vv = capitulo.versiculos.find((x:Verse)=>x.versiculo === v)
   return {
    book: book!,
    chapter: chapterNum,
    verse: v,
    reference: buildReference(v),
    text: vv?.texto ?? ""
   }
  })
 },[selected,capitulo,book,chapterNum,buildReference])

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
       className={`${styles.selectBtn} ${selectMode ? styles.readingBtnOn : ""}`}
       onClick={()=> selectMode ? exitSelectMode() : setSelectMode(true)}
       aria-pressed={selectMode}
       aria-label={selectMode ? "Cancelar seleção de versículos" : "Selecionar vários versículos"}
      >
       <ListChecks size={15}/>
       {selectMode ? "Cancelar" : "Selecionar"}
      </button>

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
      const isSelected = selected.has(v.versiculo)

      return(

        <p
          key={v.versiculo}
          ref={(el)=>{
            verseRefs.current[v.versiculo] = el
          }}
          className={`${styles.verse} ${selectMode ? styles.verseSelectable : ""} ${isSelected ? styles.verseSelected : ""}`}
          onClick={()=> selectMode ? toggleSelected(v.versiculo) : openSheet(v.versiculo)}
        >

          {selectMode && (
            <span className={`${styles.selectDot} ${isSelected ? styles.selectDotOn : ""}`}>
              {isSelected && <Check size={12}/>}
            </span>
          )}

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
              onClick={(e)=>{
                e.stopPropagation()
                if(selectMode) toggleSelected(v.versiculo)
                else setNoteVerse(v.versiculo)
              }}
            />
          )}

          {!selectMode && (
            <button
              className={`${styles.favBtn} ${mark?.favorite ? styles.favBtnOn : ""}`}
              onClick={(e)=>{ e.stopPropagation(); toggleFavoriteQuick(v.versiculo) }}
              aria-label={mark?.favorite ? "Desfavoritar versículo" : "Favoritar versículo"}
            >
              <Heart size={14} fill={mark?.favorite ? "currentColor" : "none"} />
            </button>
          )}

        </p>

      )

    })}

   </div>

   {selectMode && (
     <div className={styles.bulkBar}>

       {bulkColorPicker && (
         <div className={styles.bulkSwatches}>
           {HIGHLIGHT_COLORS.map((c)=>(
             <button
               key={c}
               className={`${styles.swatch} ${styles["sw_" + c]}`}
               onClick={()=>applyBulkHighlight(c)}
               aria-label={`Grifar selecionados de ${c}`}
               disabled={bulkSaving}
             />
           ))}
         </div>
       )}

       <div className={styles.bulkRow}>

         <span className={styles.bulkCount}>
           {selected.size === 0
             ? "Toque nos versículos"
             : `${selected.size} selecionado${selected.size === 1 ? "" : "s"}`}
         </span>

         <div className={styles.bulkActions}>

           <button
             className={styles.bulkBtn}
             disabled={selected.size === 0 || bulkSaving}
             onClick={()=>setBulkColorPicker((v)=>!v)}
           >
             <Highlighter size={16}/> Grifar
           </button>

           <button
             className={styles.bulkBtn}
             disabled={selected.size === 0 || bulkSaving}
             onClick={()=>setBulkNoteOpen(true)}
           >
             <NotebookPen size={16}/> Anotar
           </button>

           <button
             className={styles.bulkBtn}
             disabled={selected.size === 0 || bulkSaving}
             onClick={()=>setBulkCollOpen(true)}
           >
             <FolderPlus size={16}/> Coleção
           </button>

           <button
             className={styles.bulkCancel}
             onClick={exitSelectMode}
             aria-label="Cancelar seleção"
           >
             <X size={18}/>
           </button>

         </div>

       </div>

     </div>
   )}

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
       ).then((ok)=>{
         if(ok && color){
           setToast({
             text:"Grifo salvo",
             action:{ label:"Ver", onClick:()=>navigate(minhaBibliaLink("grifados")) }
           })
         }
       })
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
     onAddToCollection={()=>{
       const v = sheetVerse
       setSheetVerse(null)
       setCollVerse(v)
     }}
     onAskVox={()=>{
       if(sheetVerse === null) return
       const text = capitulo.versiculos.find((v:Verse)=>v.versiculo === sheetVerse)?.texto ?? ""
       const ref = buildReference(sheetVerse)
       setSheetVerse(null)
       navigate("/oratio/vox", {
         state: { draft: `${ref} — "${text}"\n\nO que este versículo quer me dizer?` }
       })
     }}
   />

   <AddToCollectionSheet
     open={collVerse !== null}
     onClose={()=>setCollVerse(null)}
     reference={collVerse !== null ? buildReference(collVerse) : ""}
     item={
       collVerse !== null
        ? (()=>{
            const vv = capitulo.versiculos.find((v:Verse)=>v.versiculo === collVerse)
            return vv
             ? {
                 book: book!,
                 chapter: chapterNum,
                 verse: collVerse,
                 reference: buildReference(collVerse),
                 text: vv.texto
               }
             : null
          })()
        : null
     }
     onDone={(msg)=>setToast({ text:msg })}
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

   {/* seleção múltipla — anotar aplica o mesmo texto a todos os
       selecionados (initialNote vazio: não há "excluir" nesse modo) */}
   <VerseNoteEditor
     open={bulkNoteOpen}
     reference={`${selected.size} versículo${selected.size === 1 ? "" : "s"} selecionado${selected.size === 1 ? "" : "s"}`}
     initialNote=""
     saving={bulkSaving}
     onClose={()=>setBulkNoteOpen(false)}
     onSave={applyBulkNote}
     onDelete={()=>{}}
   />

   <AddToCollectionSheet
     open={bulkCollOpen}
     onClose={()=>{ setBulkCollOpen(false); exitSelectMode() }}
     reference={`${selected.size} versículo${selected.size === 1 ? "" : "s"} selecionado${selected.size === 1 ? "" : "s"}`}
     item={null}
     items={bulkItems}
     onDone={(msg)=>setToast({ text:msg })}
   />

   <GuestGateModal
     open={gateMsg !== null}
     message={gateMsg || ""}
     onClose={()=>setGateMsg(null)}
   />

   {toast && createPortal(
     <div className={styles.toast}>
       <span>{toast.text}</span>
       {toast.action && (
         <button
           className={styles.toastAction}
           onClick={()=>{ toast.action!.onClick(); setToast(null) }}
         >
           {toast.action.label}
         </button>
       )}
     </div>,
     document.body
   )}

  </div>

 )

}
