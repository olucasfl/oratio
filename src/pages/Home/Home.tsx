import styles from "./Home.module.css"
import { useNavigate } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"
import { LogOut, User } from "lucide-react"
import { isPWA } from "../../utils/isPwa"
import { preloadConsecration } from "../../services/consecrationService"

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
 const [selector,setSelector] = useState<LiturgyReading[] | null>(null)
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

    /* 🔥 CARREGA DADOS */
    loadLiturgyFromCache()
    void loadLiturgy()
    preloadConsecration()

  },[])

 useEffect(() => {

  const token = localStorage.getItem("access_token")

  if(!token){
    navigate("/login", { replace: true })
  }

}, [])

 useEffect(()=>{
  if(!modal && !selector) return

  function onEsc(e:KeyboardEvent){
   if(e.key === "Escape"){
    setModal(null)
    setSelector(null)
   }
  }

  window.addEventListener("keydown", onEsc)
  return () => window.removeEventListener("keydown", onEsc)
 },[modal, selector])

 useEffect(() => {
  if (modal || selector) {

    const scrollY = window.scrollY

    document.body.style.position = "fixed"
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = "0"
    document.body.style.right = "0"
    document.body.style.overflow = "hidden"
    document.body.style.width = "100%"

  } else {

    const scrollY = document.body.style.top

    document.body.style.position = ""
    document.body.style.top = ""
    document.body.style.left = ""
    document.body.style.right = ""
    document.body.style.overflow = ""
    document.body.style.width = ""

    if(scrollY){
      window.scrollTo(0, parseInt(scrollY || "0") * -1)
    }
  }

  return () => {
    document.body.style.position = ""
    document.body.style.top = ""
    document.body.style.left = ""
    document.body.style.right = ""
    document.body.style.overflow = ""
    document.body.style.width = ""
  }

}, [modal, selector])

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
   const res = await fetch(LITURGY_URL, {
      cache: "no-store"
    })
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

  function openModal(type:"primeira" | "segunda" | "salmo" | "evangelho" | "extra"){

    if(!liturgy?.leituras) return

    let readings: LiturgyReading[] = []

    if(type === "extra"){
        readings = liturgy.leituras.extras ?? []
    }

    if(type === "primeira"){
        readings = liturgy.leituras.primeiraLeitura ?? []
    }

    if(type === "segunda"){
        readings = liturgy.leituras.segundaLeitura ?? []
    }

    if(type === "salmo"){
        readings = liturgy.leituras.salmo ?? []
    }

    if(type === "evangelho"){
        readings = liturgy.leituras.evangelho ?? []
    }

    if(readings.length === 0){
        setModal({
            titulo: "",
            texto: "Hoje não possui segunda leitura"
        })
        return
    }

    if(readings.length === 1){
        setModal(readings[0])
        return
    }

    setSelector(readings)
  }

 function formatVerses(text:string){

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

        {(liturgy.leituras?.extras?.length ?? 0) > 0 && (
        <button onClick={()=>openModal("extra")}>
            Extra {(liturgy.leituras?.extras?.length ?? 0) > 1 && `(${liturgy.leituras?.extras?.length})`}
        </button>
        )}

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
        Evangelho {(liturgy.leituras?.evangelho?.length ?? 0) > 1 && `(${liturgy.leituras?.evangelho?.length})`}
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

   {selector && (
  <div
    className={styles.modalOverlay}
    onClick={()=>setSelector(null)}
  >
    <div
      className={styles.modal}
      onClick={(e)=>e.stopPropagation()}
    >

      <h2 className={styles.modalTitle}>
        Escolha a leitura
      </h2>

      <div style={{display:"flex", flexDirection:"column", gap:"12px"}}>

        {selector.map((item,index)=>(
            <button
                key={index}
                className={styles.primaryButton}
                onClick={()=>{
                    setSelector(null)
                    setTimeout(()=> setModal(item), 0)
                }}
                >
                <div style={{
                display:"flex",
                flexDirection:"column",
                alignItems:"flex-start",
                gap:"2px"
                }}>

                {item.tipo && (
                    <span style={{
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    opacity: 0.7
                    }}>
                    {item.tipo}
                    </span>
                )}

                <strong style={{ fontSize: "1rem" }}>
                    {item.titulo || `Leitura ${index+1}`}
                </strong>

                {item.referencia && (
                    <span style={{
                    fontSize: "0.85rem",
                    opacity: 0.8
                    }}>
                    {item.referencia}
                    </span>
                )}

                </div>
            </button>
            ))}

        </div>

        <button
            className={styles.closeButton}
            onClick={()=>setSelector(null)}
        >
            Fechar
        </button>

        </div>
    </div>
    )}

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