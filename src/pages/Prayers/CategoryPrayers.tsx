import { useEffect,useState } from "react"
import {
  useParams,
  useNavigate
} from "react-router-dom"

import {
  ChevronLeft,
  Search,
  BookOpen,
  Sparkles
} from "lucide-react"

import styles from "./CategoryPrayers.module.css"

import {
  getPrayersByCategory
} from "../../services/prayersService"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

/* =========================
NORMALIZAR TEXTO
========================= */

function normalizeText(
  text:string
){

  return text
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()

}

export default function CategoryPrayers(){

  const { slug } = useParams()

  const navigate = useNavigate()

  const [prayers,setPrayers] =
    useState<any[]>([])

  const [loading,setLoading] =
    useState(true)

  const [search,setSearch] =
    useState("")

  useEffect(()=>{

    load()

  },[slug])

  async function load(){

    if(!slug){
      return
    }

    try{

      const data =
        await getPrayersByCategory(slug)

      setPrayers(data || [])

    }catch{

      console.log(
        "Erro ao carregar orações"
      )

    }finally{

      setLoading(false)

    }

  }

  /*
  =========================
  FILTRO
  =========================
  */

  const searchText =
    normalizeText(search.trim())

  const filteredPrayers =
    !searchText
      ? prayers
      : prayers.filter((p:any)=>{

          const title =
            normalizeText(
              p?.title || ""
            )

          return title.includes(
            searchText
          )

        })

  return(

    <main className={styles.page}>

      <section className={styles.container}>

        <button
          className={styles.backButton}
          onClick={()=>navigate(-1)}
        >

          <ChevronLeft size={18}/>

          <span>
            Voltar
          </span>

        </button>

        <div className={styles.header}>

          <div className={styles.badge}>

            <Sparkles size={17}/>

            <span>
              Biblioteca Católica
            </span>

          </div>

          <h1>
            Orações
          </h1>

          <p>
            Explore orações,
            devoções e momentos
            de espiritualidade.
          </p>

        </div>

        {/* =========================
        BUSCA
        ========================= */}

        <div className={styles.searchWrapper}>

          <div className={styles.searchBox}>

            <Search size={18}/>

            <input
              type="text"
              placeholder="Pesquisar oração..."
              value={search}
              onChange={(e)=>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        {/* =========================
        LISTA
        ========================= */}

        <div className={styles.list}>

          {loading && (

            <>
              {[1,2,3,4].map(item=>(

                <div
                  key={item}
                  className={styles.skeleton}
                />

              ))}
            </>

          )}

          {!loading &&
          filteredPrayers.length === 0 && (

            <div className={styles.empty}>

              <BookOpen size={34}/>

              <p>
                Nenhuma oração
                encontrada.
              </p>

            </div>

          )}

          {!loading &&
          filteredPrayers.map(p=>(

            <button
              key={p.id}
              className={styles.card}
              onClick={()=>
                navigate(
                  `/oratio/prayer/${p.id}`
                )
              }
            >

              <div className={styles.cardLeft}>

                <div
                  className={styles.iconBox}
                >

                  <BookOpen size={20}/>

                </div>

                <div
                  className={styles.cardInfo}
                >

                  <strong>
                    {p.title}
                  </strong>

                  <span>
                    Abrir oração
                  </span>

                </div>

              </div>

              <div className={styles.arrow}>
                →
              </div>

            </button>

          ))}

        </div>

      </section>

      <div className={styles.pageSpacer}/>

      <BottomNavbar/>

    </main>

  )

}