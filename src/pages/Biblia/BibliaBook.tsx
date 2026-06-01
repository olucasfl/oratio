import styles from "./BibliaBook.module.css"

import {
 useParams,
 useNavigate
} from "react-router-dom"

import {
 useEffect,
 useState
} from "react"

import {
 getBook
} from "../../services/bibliaService"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

import {
 ChevronLeft,
 Search,
 BookOpen,
 ChevronRight,
 Sparkles
} from "lucide-react"

export default function BibliaBook(){

 const { book } = useParams()

 const navigate = useNavigate()

 const livro = getBook(book!)

 const [search,setSearch] = useState("")

 useEffect(()=>{

  window.scrollTo({
   top:0,
   behavior:"instant"
  })

 },[])

 if(!livro){

  return(
    <div className={styles.notFound}>
      Livro não encontrado
    </div>
  )

 }

 const capitulosFiltrados =
  livro.capitulos.filter((cap:any)=>{

    if(!search) return true

    return cap.capitulo
      .toString()
      .includes(search)

  })

 return(

  <div className={`${styles.container} page-enter`}>

    {/* GLOW */}
    <div className={styles.glowTop}></div>
    <div className={styles.glowBottom}></div>

    {/* PARTICLES */}
    <div className={styles.particles}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>

    {/* HERO */}

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
        Bíblia Sagrada
      </span>

      <h1 className={styles.title}>
        {livro.nome}
      </h1>

      <p className={styles.subtitle}>
        Escolha um capítulo para iniciar
        sua leitura espiritual.
      </p>

      <div className={styles.infoBadge}>
        {livro.capitulos.length} capítulos
      </div>

    </div>

    {/* SEARCH */}

    <div className={styles.searchCard}>

      <div className={styles.searchHeader}>

        <Sparkles size={15}/>

        <span>
          Buscar capítulo
        </span>

      </div>

      <div className={styles.searchWrapper}>

        <Search
          size={18}
          className={styles.searchIcon}
        />

        <input
          type="number"
          placeholder="Número do capítulo"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          onWheel={(e)=>e.currentTarget.blur()}
          className={styles.searchInput}
        />

      </div>

    </div>

    {/* CAPÍTULOS */}

    <div className={styles.card}>

      <div className={styles.cardHeader}>

        <BookOpen size={18}/>

        <span>
          Capítulos
        </span>

      </div>

      <div className={styles.chapterGrid}>

        {capitulosFiltrados.map((cap:any,index:number)=>(

          <button
            key={cap.capitulo}
            className={styles.chapterButton}
            style={{
              animationDelay:`${index * 0.04}s`
            }}
            onClick={()=>
              navigate(
                `/oratio/biblia/${book}/${cap.capitulo}`
              )
            }
          >

            <div className={styles.chapterLeft}>

              <div className={styles.chapterNumber}>
                {cap.capitulo}
              </div>

              <span>
                Capítulo {cap.capitulo}
              </span>

            </div>

            <ChevronRight
              size={18}
              className={styles.arrow}
            />

          </button>

        ))}

      </div>

    </div>

    <div className={styles.pageSpacer}></div>

    <BottomNavbar/>

  </div>

 )

}