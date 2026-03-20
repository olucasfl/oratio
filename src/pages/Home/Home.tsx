import styles from "./Home.module.css"
import { useNavigate } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"
import { LogOut, User } from "lucide-react"
import { isPWA } from "../../utils/isPwa"
import { preloadConsecration } from "../../services/consecrationService"

type LiturgyReading = {
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
 }
}

type FeatureItem = {
 title: string
 description: string
 actionLabel: string
 path: string
}

const LITURGY_URL = "https://finance-api-y0ol.onrender.com/liturgia"
const LITURGY_CACHE_KEY = "last_liturgy"

export default function Home(){
 const navigate = useNavigate()
 const pwa = isPWA()
 const today = useMemo(() => new Date().toLocaleDateString("pt-BR"), [])

 const [liturgy,setLiturgy] = useState<LiturgyData | null>(null)
 const [modal,setModal] = useState<LiturgyReading | null>(null)
 const [loadingLiturgy,setLoadingLiturgy] = useState(true)
 const [liturgyError,setLiturgyError] = useState<string | null>(null)

 const features:FeatureItem[] = [
  {
   title: "Consagração à Nossa Senhora",
   description:
    "Um caminho espiritual de 33 dias segundo o método de São Luís Maria Grignion de Montfort.",
   actionLabel: "Iniciar Consagração",
   path: "/oratio/consecration"
  },
  {
   title: "Orações",
   description: "Reze as principais orações da tradição católica.",
   actionLabel: "Abrir Orações",
   path: "/oratio/prayers"
  },
  {
   title: "Bíblia Sagrada",
   description: "Leia a Palavra de Deus completa na tradução Ave-Maria.",
   actionLabel: "Abrir Bíblia",
   path: "/oratio/biblia"
  },
  {
   title: "Catecismo da Igreja",
   description:
    "Leia o Catecismo oficial com navegação rápida por artigo e acesso direto ao documento.",
   actionLabel: "Abrir Catecismo",
   path: "/oratio/catecismo"
  },
  {
   title: "VoxAI - Inteligência Artificial Católica",
   description:
    "Assistente espiritual católico. Tire dúvidas sobre fé, moral, liturgia e vida cristã.",
   actionLabel: "Perguntar ao VoxAI",
   path: "/oratio/vox"
  }
 ]

 useEffect(()=>{
  loadLiturgyFromCache()
  void loadLiturgy()
  preloadConsecration()
 },[])

 useEffect(()=>{
  if(!modal) return

  function onEsc(e:KeyboardEvent){
   if(e.key === "Escape"){
    setModal(null)
   }
  }

  window.addEventListener("keydown", onEsc)
  return () => window.removeEventListener("keydown", onEsc)
 },[modal])

 function handleLogout(){
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  navigate("/login")
 }

 function loadLiturgyFromCache(){
  const saved = localStorage.getItem(LITURGY_CACHE_KEY)
  if(!saved) return

  try{
   const parsed = JSON.parse(saved)
   if(parsed?.date === today){
    setLiturgy(parsed.data as LiturgyData)
   }
  }catch{
   localStorage.removeItem(LITURGY_CACHE_KEY)
  }
 }

 async function loadLiturgy(){
  setLoadingLiturgy(true)
  setLiturgyError(null)

  try{
   const res = await fetch(LITURGY_URL)
   if(!res.ok){
    throw new Error("LITURGY_FETCH_FAILED")
   }

   const data = await res.json()
   setLiturgy(data)

   localStorage.setItem(LITURGY_CACHE_KEY, JSON.stringify({
    date: today,
    data
   }))
  }catch{
   if(!liturgy){
    setLiturgyError("Não foi possível carregar a liturgia agora.")
   }
  }finally{
   setLoadingLiturgy(false)
  }
 }

 function getReadingByType(type:"primeira" | "segunda" | "salmo" | "evangelho"){
  if(!liturgy?.leituras) return null

  if(type === "segunda"){
   const second = liturgy.leituras.segundaLeitura ?? []
   if(second.length === 0){
    return {
     titulo:"Segunda Leitura",
     referencia:"",
     texto:"Hoje não possui segunda leitura."
    } as LiturgyReading
   }
   return second[0] ?? null
  }

  if(type === "primeira"){
   return liturgy.leituras.primeiraLeitura?.[0] ?? null
  }

  if(type === "salmo"){
   return liturgy.leituras.salmo?.[0] ?? null
  }

  return liturgy.leituras.evangelho?.[0] ?? null
 }

 function openModal(type:"primeira" | "segunda" | "salmo" | "evangelho"){
  const reading = getReadingByType(type)
  if(!reading) return
  setModal(reading)
 }

 function formatVerses(text:string){

  let formatted = text.replace(
   /(\d+)(?=[A-Za-z“])/g,
   '<span class="verse">$1</span>'
  )

  formatted = formatted.replace(
   /^([A-Za-zÀ-ÿ])/,
   '<span class="capitular">$1</span>'
  )

  return formatted

 }

 return(
  <div className={styles.container}>
   {!pwa && (
    <div className={styles.topButtons}>
     <button
      className={styles.profileButton}
      onClick={()=>navigate("/oratio/profile")}
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

   <section className={styles.liturgyCard}>
    <h2>Liturgia {today}</h2>
    {loadingLiturgy && !liturgy && <p className={styles.infoText}>Carregando liturgia...</p>}
    {liturgyError && !liturgy && <p className={styles.errorText}>{liturgyError}</p>}

    {liturgy && (
     <div className={styles.liturgyButtons}>
      <button onClick={()=>openModal("primeira")}>
       Primeira Leitura
      </button>

      <button onClick={()=>openModal("salmo")}>
       Salmo
      </button>

      <button onClick={()=>openModal("segunda")}>
       Segunda Leitura
      </button>

      <button onClick={()=>openModal("evangelho")}>
       Evangelho
      </button>
     </div>
    )}
   </section>

   <div className={styles.featuresGrid}>
    {features.map(item => (
     <section className={styles.featureCard} key={item.path}>
      <h2>{item.title}</h2>
      <p>{item.description}</p>
      <button
       className={styles.primaryButton}
       onClick={()=>navigate(item.path)}
      >
       {item.actionLabel}
      </button>
     </section>
    ))}
   </div>

   {modal && (
    <div
     className={styles.modalOverlay}
     onClick={()=>setModal(null)}
    >

     <div
      className={styles.modal}
      onClick={(e)=>e.stopPropagation()}
     >
      <h2 className={styles.modalTitle}>
       {modal.titulo || modal.referencia}
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
        __html: formatVerses(modal.texto || "")
       }}
      />

      <button
       className={styles.closeButton}
       onClick={()=>setModal(null)}
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