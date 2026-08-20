import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { createPortal } from "react-dom"
import { useNavigate, useSearchParams } from "react-router-dom"
import { BookOpen, ChevronRight } from "lucide-react"

import { useLockBodyScroll } from "../../hooks/useLockBodyScroll"
import type { LiturgyData, LiturgyReading } from "../../hooks/useLiturgy"
import { buildQuickReadingShareText } from "../../utils/liturgyShareText"
import { isLoggedIn } from "../../utils/auth"
import GuestGateModal from "../GuestGateModal/GuestGateModal"
import ShareReadingButton from "../ShareReadingButton/ShareReadingButton"

import styles from "../../pages/Home/Home.module.css"

const TIPO_LABEL: Record<string, string> = {
 primeira: "1ª Leitura",
 segunda: "2ª Leitura",
 salmo: "Salmo",
 evangelho: "Evangelho",
 extra: "Leitura"
}

const TIPOS_VALIDOS = Object.keys(TIPO_LABEL)

interface Props {
 liturgy: LiturgyData | null
 dateOffset?: number
}

type ReadingType =
 | "primeira"
 | "segunda"
 | "salmo"
 | "evangelho"
 | "extra"

export default function LiturgyReadingButtons({ liturgy, dateOffset = 0 }: Props){

 const navigate = useNavigate()
 const [searchParams, setSearchParams] = useSearchParams()

 const [modal,setModal] =
 useState<
 (LiturgyReading & {
  tipoLeitura?: string
 }) | null
 >(null)

 const [selector,setSelector] =
 useState<LiturgyReading[] | null>(null)

 const [currentType,setCurrentType] =
  useState<ReadingType | null>(null)

 const [showGate,setShowGate] = useState(false)

 useLockBodyScroll(!!(modal || selector))

 /* =========================
 ESC FECHAR MODAL
 ========================= */

 useEffect(()=>{

  if(!modal && !selector) return

  function onEsc(
   e:KeyboardEvent
  ){

   if(e.key === "Escape"){

    setModal(null)

    setSelector(null)

   }

  }

  window.addEventListener(
   "keydown",
   onEsc
  )

  return ()=>window.removeEventListener(
   "keydown",
   onEsc
  )

 },[modal, selector])

 /* =========================
 MODAL
 ========================= */

 function openModal(type: ReadingType){

  setCurrentType(type)

  if(!liturgy?.leituras) return

  let readings:LiturgyReading[] = []

  if(type === "extra"){
   readings =
   liturgy.leituras.extras ?? []
  }

  if(type === "primeira"){
   readings =
   liturgy.leituras.primeiraLeitura ?? []
  }

  if(type === "segunda"){
   readings =
   liturgy.leituras.segundaLeitura ?? []
  }

  if(type === "salmo"){
   readings =
   liturgy.leituras.salmo ?? []
  }

  if(type === "evangelho"){
   readings =
   liturgy.leituras.evangelho ?? []
  }

  if(readings.length === 0){

   setModal({
    titulo:"",
    texto:
    "Hoje não há leitura disponível"
   })

   return

  }

  if(readings.length === 1){

   setModal({
    ...readings[0],
    tipoLeitura:type
   })

   return

  }

  setSelector(readings)

 }

 /* =========================
 ABRIR AUTOMATICAMENTE
 (link compartilhado: ?leitura=tipo)
 ========================= */

 const autoOpenedRef = useRef(false)

 useEffect(()=>{

  if(autoOpenedRef.current) return
  if(!liturgy) return

  const tipo = searchParams.get("leitura")

  if(!tipo || !TIPOS_VALIDOS.includes(tipo)) return

  autoOpenedRef.current = true

  openModal(tipo as ReadingType)

  // limpa o parâmetro da URL sem recarregar a página
  const next = new URLSearchParams(searchParams)
  next.delete("leitura")
  next.delete("offset")
  setSearchParams(next, { replace:true })

 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[liturgy, searchParams])

 /* =========================
 FORMATAR TEXTO
 ========================= */

 /*
 Retorna nós React (texto + <span> pontuais), nunca HTML bruto — o texto
 vem da API pública de liturgia (terceiro, fora do nosso controle), então
 montar uma string HTML e injetar via dangerouslySetInnerHTML abriria XSS
 pra quem abrir essa leitura rápida caso a API devolva algo malicioso.
 */
 function formatVerses(text:string): ReactNode[]{

  const value = text || ""
  const nodes: ReactNode[] = []
  let key = 0
  let lastIndex = 0

  const versePattern = /(\d+)(?=[A-Za-zÀ-ÿ“])/g
  let match: RegExpExecArray | null

  while((match = versePattern.exec(value)) !== null){

   if(match.index > lastIndex){
    nodes.push(value.slice(lastIndex, match.index))
   }

   nodes.push(<span key={key++} className="verse">{match[1]}</span>)

   lastIndex = match.index + match[1].length

  }

  if(lastIndex < value.length){
   nodes.push(value.slice(lastIndex))
  }

  if(typeof nodes[0] === "string" && /^[A-Za-zÀ-ÿ]/.test(nodes[0])){

   const first = nodes[0]

   nodes[0] = (
    <span key={`capitular-${key++}`}>
     <span className="capitular">{first[0]}</span>
     {first.slice(1)}
    </span>
   )

  }

  return nodes

 }

 /* =========================
 RESPOSTA FINAL
 ========================= */

 function getRespostaFinal(
  tipo?:string
 ){

  if(tipo === "evangelho"){

   return{
    padre:
    "Palavra da Salvação.",

    assembleia:
    "Glória a vós, Senhor."
   }

  }

  if(
   tipo === "primeira" ||
   tipo === "segunda" ||
   tipo === "extra"
  ){

   return{
    padre:
    "Palavra do Senhor.",

    assembleia:
    "Graças a Deus."
   }

  }

  return null

 }

 if(!liturgy) return null

 return(

  <>

   <div className={styles.readingsGrid}>

    {(liturgy.leituras?.extras?.length ?? 0) > 0 && (

     <button
      className={`${styles.readingCard} ${styles.readingCardWide}`}
      onClick={()=>openModal("extra")}
     >
      <span className={styles.readingLabel}>Leitura extra</span>
      <span className={styles.readingRef}>
       {liturgy.leituras?.extras?.[0]?.referencia || "Abrir"}
      </span>
      <span className={styles.readingCta}>
       Ler <ChevronRight size={12}/>
      </span>
     </button>

    )}

    <button
     className={styles.readingCard}
     onClick={()=>openModal("primeira")}
    >
     <span className={styles.readingLabel}>1ª Leitura</span>
     <span className={styles.readingRef}>
      {liturgy.leituras?.primeiraLeitura?.[0]?.referencia || "Abrir"}
     </span>
     <span className={styles.readingCta}>
      Ler <ChevronRight size={12}/>
     </span>
    </button>

    <button
     className={styles.readingCard}
     onClick={()=>openModal("salmo")}
    >
     <span className={styles.readingLabel}>Salmo</span>
     <span className={styles.readingRef}>
      {liturgy.leituras?.salmo?.[0]?.referencia || "Abrir"}
     </span>
     <span className={styles.readingCta}>
      Ler <ChevronRight size={12}/>
     </span>
    </button>

    {(liturgy.leituras?.segundaLeitura?.length ?? 0) > 0 ? (

     <button
      className={styles.readingCard}
      onClick={()=>openModal("segunda")}
     >
      <span className={styles.readingLabel}>2ª Leitura</span>
      <span className={styles.readingRef}>
       {liturgy.leituras?.segundaLeitura?.[0]?.referencia || "Abrir"}
      </span>
      <span className={styles.readingCta}>
       Ler <ChevronRight size={12}/>
      </span>
     </button>

    ) : (

     <div
      className={`${styles.readingCard} ${styles.readingCardDisabled}`}
      aria-hidden="true"
     >
      <span className={styles.readingLabel}>2ª Leitura</span>
      <span className={styles.readingRef}>— só domingos</span>
     </div>

    )}

    <button
     className={styles.readingCard}
     onClick={()=>openModal("evangelho")}
    >
     <span className={styles.readingLabel}>Evangelho</span>
     <span className={styles.readingRef}>
      {liturgy.leituras?.evangelho?.[0]?.referencia || "Abrir"}
     </span>
     <span className={styles.readingCta}>
      Ler <ChevronRight size={12}/>
     </span>
    </button>

    <button
     className={styles.massButton}
     onClick={()=>{
      if(!isLoggedIn()){
       setShowGate(true)
       return
      }
      navigate("/oratio/liturgia-completa")
     }}
    >
     <BookOpen size={17}/>
     Ler a Missa completa
    </button>

   </div>

   {/* SELECTOR */}

   {selector && createPortal(

    <div
     className={styles.modalOverlay}
     onClick={()=>
      setSelector(null)
     }
    >

     <div
      className={styles.modal}
      onClick={(e)=>
       e.stopPropagation()
      }
     >

      <h2 className={styles.modalTitle}>
       Escolha a leitura
      </h2>

      <div
       className={styles.selectorList}
      >

       {selector.map((item,index)=>(

        <button
         key={index}
         className={styles.selectorButton}
         onClick={()=>{

          setSelector(null)

          setTimeout(()=>{

           setModal({
            ...item,
            tipoLeitura:
            currentType || undefined
           })

          },0)

         }}
        >

         {item.tipo && (

          <span className={styles.selectorType}>
           {item.tipo}
          </span>

         )}

         <strong>
          {item.titulo ||
           `Leitura ${index + 1}`}
         </strong>

         {item.referencia && (

          <span className={styles.selectorRef}>
           {item.referencia}
          </span>

         )}

        </button>

       ))}

      </div>

      <button
       className={styles.closeButton}
       onClick={()=>
        setSelector(null)
       }
      >

       Fechar

      </button>

     </div>

    </div>,

    document.body

   )}

   {/* MODAL */}

   {modal && createPortal(

    <div
     className={styles.modalOverlay}
     onClick={()=>
      setModal(null)
     }
    >

     <div
      className={styles.modal}
      onClick={(e)=>
       e.stopPropagation()
      }
     >

      <h2 className={styles.modalTitle}>
       {modal.titulo ||
        modal.referencia}
      </h2>

      <p className={styles.modalReference}>
       {modal.referencia}
      </p>

      {modal.tipoLeitura &&
       modal.texto !== "Hoje não há leitura disponível" && (

        <ShareReadingButton
         label={
          TIPO_LABEL[modal.tipoLeitura] || "Leitura"
         }
         buildText={()=>
          buildQuickReadingShareText(
           TIPO_LABEL[modal.tipoLeitura!] || "Leitura",
           modal,
           getRespostaFinal(modal.tipoLeitura),
           `${window.location.origin}/oratio/home?leitura=${encodeURIComponent(modal.tipoLeitura!)}${dateOffset ? `&offset=${encodeURIComponent(String(dateOffset))}` : ""}`
          )
         }
        />

       )}

      {modal.refrao && (

       <p className={styles.modalRefrao}>
        {modal.refrao}
       </p>

      )}

      <div className={styles.modalText}>
       {formatVerses(modal.texto || "")}
      </div>

      {(() => {

       const resposta =
       getRespostaFinal(
        modal.tipoLeitura
       )

       if(!resposta) return null

       return(

        <div
         className={
          styles.responseBox
         }
        >

         <p>

          <strong>P.</strong>
          {" "}
          {resposta.padre}

         </p>

         <p
          className={
           styles.responseText
          }
         >

          <strong>R.</strong>
          {" "}
          {resposta.assembleia}

         </p>

        </div>

       )

      })()}

      <button
       className={styles.closeButton}
       onClick={()=>
        setModal(null)
       }
      >

       Fechar

      </button>

     </div>

    </div>,

    document.body

   )}

   <GuestGateModal
    open={showGate}
    message="Crie uma conta para ler a Missa completa do dia."
    onClose={()=>setShowGate(false)}
   />

  </>

 )

}
