import styles from "./Home.module.css"
import { useNavigate } from "react-router-dom"
import { useEffect, useMemo, useCallback, useState } from "react"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

import {
 LogOut,
 User,
 ChevronLeft,
 ChevronRight
} from "lucide-react"

import { isPWA } from "../../utils/isPwa"

import {
 preloadConsecration
} from "../../services/consecrationService"

import JourneyCard
from "../../components/JourneyCard/JourneyCard"

/* =========================
TIPAGENS
========================= */

type LiturgyReading = {
 tipo?: string
 titulo?: string
 referencia?: string
 texto?: string
 refrao?: string
}

type LiturgyData = {
 leituras?: {
  primeiraLeitura?: LiturgyReading[]
  segundaLeitura?: LiturgyReading[]
  salmo?: LiturgyReading[]
  evangelho?: LiturgyReading[]
  extras?: LiturgyReading[]
 }
}

type FeatureItem = {
 title:string
 description:string
 actionLabel:string
 path:string
 badge?:string
}

/* =========================
CONSTANTES
========================= */

const LITURGY_URL =
"https://finance-api-y0ol.onrender.com/liturgia"

const LITURGY_CACHE_KEY =
"last_liturgy"

/* =========================
COMPONENTE
========================= */

export default function Home(){

 const navigate = useNavigate()

 const pwa = isPWA()

 const today = useMemo(
  ()=>new Date().toLocaleDateString("pt-BR"),
 []
 )

 /* =========================
 STATES
 ========================= */

 const [liturgy,setLiturgy] =
 useState<LiturgyData | null>(null)

 const [modal,setModal] =
 useState<
 (LiturgyReading & {
  tipoLeitura?: string
 }) | null
 >(null)

 const [selector,setSelector] =
 useState<LiturgyReading[] | null>(null)

 const [loadingLiturgy,
  setLoadingLiturgy] = useState(true)

 const [liturgyError,
  setLiturgyError] = useState<string | null>(null)

 const [dateOffset, setDateOffset] = useState(0)

 const displayDateStr = useMemo(()=>{
  const d = new Date()
  d.setDate(d.getDate() + dateOffset)
  return d.toLocaleDateString("pt-BR")
 },[dateOffset])

 const displayDateLabel = useMemo(()=>{
  if(dateOffset === 0) return "Hoje"
  if(dateOffset === -1) return "Ontem"
  if(dateOffset === 1) return "Amanhã"
  return displayDateStr
 },[dateOffset, displayDateStr])

 const [
  currentType,
  setCurrentType
 ] = useState<
  "primeira"
  | "segunda"
  | "salmo"
  | "evangelho"
  | "extra"
  | null
 >(null)

 /* =========================
 FEATURES
 ========================= */

 const features = useMemo<FeatureItem[]>(()=>[

  {
   title:"Orações",

   description:
`Reze as principais orações da tradição católica.
-Contém Terços
-Orações de Santos
-Orações tradicionais
-Ladainhas`,

   actionLabel:
   "Abrir Orações",

   path:
   "/oratio/prayers"
  },

  {
   title:"Guia para a Confissão",

   description:
   "Exame de consciência completo pelos 10 Mandamentos e Preceitos da Igreja, como se confessar corretamente e Ato de Contrição.",

   actionLabel:
   "Abrir Guia",

   path:
   "/oratio/confissao",

   badge:"SACRAMENTO"
  },

  {
   title:
   "Consagração à Nossa Senhora",

   description:
   "Um caminho espiritual de 33 dias segundo o método de São Luís Maria Grignion de Montfort.",

   actionLabel:
   "Iniciar Consagração",

   path:
   "/oratio/consecration",

   badge:"33 DIAS"
  },

  {
   title:"Bíblia Sagrada",

   description:
   "Leia a Palavra de Deus completa na tradução Ave-Maria.",

   actionLabel:
   "Abrir Bíblia",

   path:
   "/oratio/biblia"
  },

  {
   title:"Catecismo da Igreja",

   description:
   "Leia o Catecismo oficial com navegação rápida por artigo.",

   actionLabel:
   "Abrir Catecismo",

   path:
   "/oratio/catecismo"
  },

  {
   title:
   "VoxAI - Inteligência Artificial Católica",

   description:
   "Assistente espiritual católico. Tire dúvidas sobre fé, moral e liturgia.",

   actionLabel:
   "Perguntar ao VoxAI",

   path:
   "/oratio/vox",

   badge:"IA"
  }

 ],[])

 /* =========================
 INIT
 ========================= */

 useEffect(()=>{
  preloadConsecration()
 },[])

 useEffect(()=>{

  if(dateOffset === 0){
   loadLiturgyFromCache()
  }else{
   setLiturgy(null)
  }

  void loadLiturgy()

 },[dateOffset])

 /* =========================
 AUTH
 ========================= */

 useEffect(()=>{

  const token =
  localStorage.getItem("access_token")

  if(!token){

   navigate("/login", {
    replace:true
   })

  }

 },[])

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
 LOCK BODY
 ========================= */

 useEffect(()=>{

  if(modal || selector){

   const scrollY = window.scrollY

   document.body.style.position =
   "fixed"

   document.body.style.top =
   `-${scrollY}px`

   document.body.style.left = "0"

   document.body.style.right = "0"

   document.body.style.width = "100%"

   document.body.style.overflow =
   "hidden"

  }else{

   const scrollY =
   document.body.style.top

   document.body.style.position = ""

   document.body.style.top = ""

   document.body.style.left = ""

   document.body.style.right = ""

   document.body.style.width = ""

   document.body.style.overflow = ""

   if(scrollY){

    window.scrollTo(
     0,
     parseInt(scrollY || "0") * -1
    )

   }

  }

  return ()=>{

   document.body.style.position = ""

   document.body.style.top = ""

   document.body.style.left = ""

   document.body.style.right = ""

   document.body.style.width = ""

   document.body.style.overflow = ""

  }

 },[modal, selector])

 /* =========================
 LOGOUT
 ========================= */

 const handleLogout = useCallback(()=>{

  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  navigate("/login")

 },[navigate])

 /* =========================
 CACHE
 ========================= */

 function loadLiturgyFromCache(){

  const saved =
  localStorage.getItem(
   LITURGY_CACHE_KEY
  )

  if(!saved) return

  try{

   const parsed =
   JSON.parse(saved)

   if(parsed?.date === today){

    setLiturgy(parsed.data)

   }

  }catch{

   localStorage.removeItem(
    LITURGY_CACHE_KEY
   )

  }

 }

 /* =========================
 FETCH LITURGY
 ========================= */

 async function loadLiturgy(){

  setLoadingLiturgy(true)

  setLiturgyError(null)

  const d = new Date()
  d.setDate(d.getDate() + dateOffset)

  const dia = String(d.getDate()).padStart(2,"0")
  const mes = String(d.getMonth()+1).padStart(2,"0")
  const ano = d.getFullYear()

  const url = dateOffset === 0
   ? LITURGY_URL
   : `${LITURGY_URL}?dia=${dia}&mes=${mes}&ano=${ano}`

  try{

   const res = await fetch(url, { cache:"no-store" })

   if(!res.ok) throw new Error()

   const data = await res.json()

   setLiturgy(data)

   if(dateOffset === 0){
    localStorage.setItem(
     LITURGY_CACHE_KEY,
     JSON.stringify({ date:today, data })
    )
   }

  }catch{

   setLiturgyError(
    "Não foi possível carregar a liturgia agora."
   )

  }finally{

   setLoadingLiturgy(false)

  }

 }

 /* =========================
 MODAL
 ========================= */

 function openModal(
  type:
  | "primeira"
  | "segunda"
  | "salmo"
  | "evangelho"
  | "extra"
 ){

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
 FORMATAR TEXTO
 ========================= */

 function formatVerses(
  text:string
 ){

  let formatted = text.replace(
   /(\d+)(?=[A-Za-zÀ-ÿ“])/g,
   '<span class="verse">$1</span>'
  )

  formatted = formatted.replace(
   /^([A-Za-zÀ-ÿ])/,
   '<span class="capitular">$1</span>'
  )

  return formatted

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

 /* =========================
 JSX
 ========================= */

 return(

  <div className={`${styles.container} page-enter`}>

   {!pwa && (

    <div className={styles.topButtons}>

     <button
      className={styles.profileButton}
      onClick={()=>
       navigate("/oratio/profile")
      }
      aria-label="Abrir perfil"
     >

      <User size={18}/>

     </button>

     <button
      className={styles.logoutButton}
      onClick={handleLogout}
      aria-label="Sair da conta"
     >

      <LogOut size={18}/>

     </button>

    </div>

   )}

   {/* HERO */}

   <section className={styles.hero}>

    <div className={styles.logoWrapper}>

     <span className={styles.logoLeft}>
      ORA
     </span>

     <div className={styles.cross}></div>

     <span className={styles.logoRight}>
      IO
     </span>

    </div>

    <p className={styles.subtitle}>
     Aplicativo de espiritualidade católica
    </p>

   </section>

   {/* LITURGIA */}

   <section className={styles.liturgyCard}>

    <div className={styles.sectionHeader}>

     <span className={styles.sectionBadge}>
      LITURGIA DO DIA
     </span>

     <div className={styles.liturgyDateNav}>

      <button
       className={styles.liturgyNavBtn}
       onClick={()=>setDateOffset(o=>o-1)}
       aria-label="Dia anterior"
      >
       <ChevronLeft size={18}/>
      </button>

      <h2>{displayDateLabel}</h2>

      <button
       className={styles.liturgyNavBtn}
       onClick={()=>setDateOffset(o=>o+1)}
       disabled={dateOffset >= 2}
       aria-label="Próximo dia"
      >
       <ChevronRight size={18}/>
      </button>

     </div>

     {dateOffset !== 0 && (
      <button
       className={styles.liturgyTodayBtn}
       onClick={()=>setDateOffset(0)}
      >
       Voltar para hoje
      </button>
     )}

    </div>

    {loadingLiturgy && !liturgy && (

     <p className={styles.infoText}>
      Carregando liturgia...
     </p>

    )}

    {liturgyError && !liturgy && (

     <p className={styles.errorText}>
      {liturgyError}
     </p>

    )}

    {liturgy && (

     <div className={styles.liturgyButtons}>

      {(liturgy.leituras?.extras?.length ?? 0) > 0 && (

       <button
        onClick={()=>
         openModal("extra")
        }
       >

        Extra

       </button>

      )}

      <button
       onClick={()=>
        openModal("primeira")
       }
      >

       Primeira Leitura

      </button>

      <button
       onClick={()=>
        openModal("salmo")
       }
      >

       Salmo

      </button>

      <button
       onClick={()=>
        openModal("segunda")
       }
      >

       Segunda Leitura

      </button>

      <button
       onClick={()=>
        openModal("evangelho")
       }
      >

       Evangelho

      </button>

      <button
       className={styles.primaryButton}
       onClick={()=>
        navigate(
         "/oratio/liturgia-completa"
        )
       }
      >

       Ver Liturgia Completa

      </button>

     </div>

    )}

   </section>

   {/* JORNADA */}

   <JourneyCard/>

   {/* FEATURES */}

   <div className={styles.featuresGrid}>

    {features.map((item)=>(

     <section
      key={item.path}
      className={styles.featureCard}
     >

      {item.badge && (

       <span className={styles.cardBadge}>
        {item.badge}
       </span>

      )}

      <div>

       <h2>{item.title}</h2>

       <p>
        {item.description}
       </p>

      </div>

      <button
       className={styles.primaryButton}
       onClick={()=>
        navigate(item.path)
       }
      >

       {item.actionLabel}

      </button>

     </section>

    ))}

   </div>

   {/* SELECTOR */}

   {selector && (

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

    </div>

   )}

   {/* MODAL */}

   {modal && (

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

      {modal.refrao && (

       <p className={styles.modalRefrao}>
        {modal.refrao}
       </p>

      )}

      <div
       className={styles.modalText}
       dangerouslySetInnerHTML={{
        __html:
        formatVerses(
         modal.texto || ""
        )
       }}
      />

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

    </div>

   )}

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )

}