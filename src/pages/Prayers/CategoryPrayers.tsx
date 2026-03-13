import { useEffect,useState } from "react"
import { useParams,useNavigate } from "react-router-dom"

import styles from "./CategoryPrayers.module.css"

import { getPrayersByCategory } from "../../services/prayersService"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

/* =========================
NORMALIZAR TEXTO
remove acentos e lowercase
========================= */

function normalizeText(text:string){

 return text
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"")
  .toLowerCase()

}

export default function CategoryPrayers(){

 const { slug } = useParams()

 const navigate = useNavigate()

 const [prayers,setPrayers] = useState<any[]>([])
 const [loading,setLoading] = useState(true)

 const [search,setSearch] = useState("")

 useEffect(()=>{
  load()
 },[slug])

 async function load(){

  if(!slug) return

  try{

   const data = await getPrayersByCategory(slug)

   setPrayers(data || [])

  }catch{

   console.log("Erro ao carregar orações")

  }finally{

   setLoading(false)

  }

 }

 /* =========================
 FILTRO DE BUSCA
 ========================= */

 const searchText = normalizeText(search.trim())

 const filteredPrayers = !searchText
  ? prayers
  : prayers.filter((p:any)=>{

     const prayerTitle = normalizeText(p?.title || "")

     return prayerTitle.includes(searchText)

    })

 if(loading){

  return(

   <div className={styles.loading}>

    <p>Carregando orações...</p>

    <button
     className={styles.back}
     onClick={()=>navigate(-1)}
    >
     ← Voltar
    </button>

   </div>

  )

 }

 return(

  <div className={styles.page}>

   <div className={styles.container}>

    <button
     className={styles.back}
     onClick={()=>navigate(-1)}
    >
     ← Voltar
    </button>

    <h1>Orações</h1>

    {/* =========================
    BUSCA
    ========================= */}

    <div className={styles.searchBox}>

     <input
      type="text"
      placeholder="Pesquisar oração..."
      value={search}
      onChange={(e)=>setSearch(e.target.value)}
      className={styles.searchInput}
     />

    </div>

    {/* =========================
    LISTA
    ========================= */}

    <div className={styles.list}>

     {filteredPrayers.length === 0 && (

      <p className={styles.empty}>
       Nenhuma oração encontrada.
      </p>

     )}

     {filteredPrayers.map(p=>(

      <div
       key={p.id}
       className={styles.card}
       onClick={()=>navigate(`/oratio/prayer/${p.id}`)}
      >

       {p.title}

      </div>

     ))}

    </div>

   </div>

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )

}