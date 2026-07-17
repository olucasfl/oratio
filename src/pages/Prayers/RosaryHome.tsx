import {
  useState,
  useEffect
} from "react"

import styles from "./RosaryHome.module.css"

import { useNavigate }
from "react-router-dom"

import {
  ChevronLeft,
  Sparkles,
  Church,
  Shield,
  Heart,
  Flame,
  Stars,
  Cross,
  Search,
  RotateCcw
} from "lucide-react"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

import { ROSARY_DAYS }
from "../../utils/rosaryDays"

import { getRosaryProgress }
from "../../services/rosaryService"

import { ROSARIES }
from "../../utils/rosaryList"

/* =========================
NORMALIZAR TEXTO
========================= */

function normalizeText(
  text:string
){

  return text
    .normalize("NFD")
    .replace(
      /\p{Diacritic}/gu,
      ""
    )
    .toLowerCase()

}

export default function RosaryHome(){

  const navigate = useNavigate()

  const [search,setSearch] =
    useState("")

  const [progressMap,setProgressMap] =
    useState<Record<string,{
      currentStep:number
      totalSteps:number
    }>>({})

  useEffect(()=>{

    loadProgress()

  },[])

  async function loadProgress(){

    try{

      const data =
        await getRosaryProgress()

      const map:Record<string,{
        currentStep:number
        totalSteps:number
      }> = {}

      for(const p of data || []){
        map[p.type] = {
          currentStep:p.currentStep,
          totalSteps:p.totalSteps
        }
      }

      setProgressMap(map)

    }catch{

      console.log(
        "Erro ao carregar progresso dos terços"
      )

    }

  }

  function goToRosary(
    slug:string
  ){

    navigate(
      `/oratio/rosary/${slug}`
    )

  }

  function getIcon(slug:string){

    if(
      slug === "gozosos" ||
      slug === "gloriosos"
    ){
      return <Sparkles size={22}/>
    }

    if(slug === "dolorosos"){
      return <Heart size={22}/>
    }

    if(slug === "luminosos"){
      return <Stars size={22}/>
    }

    if(
      slug.includes("miguel") ||
      slug.includes("bento")
    ){
      return <Shield size={22}/>
    }

    if(
      slug.includes("espirito")
    ){
      return <Flame size={22}/>
    }

    if(slug === "via-sacra"){
      return <Cross size={22}/>
    }

    return <Church size={22}/>

  }

  /*
  =========================
  FILTRO
  =========================
  */

  const searchText =
    normalizeText(search.trim())

  const filteredRosaries =
    !searchText
      ? ROSARIES
      : ROSARIES.filter((r)=>

          normalizeText(r.name)
            .includes(searchText)

        )

  return(

    <main className={`${styles.page} page-enter`}>

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

        {/* =========================
        HEADER
        ========================= */}

        <div className={styles.header}>

          <div className={styles.badge}>

            <Sparkles size={17}/>

            <span>
              Espiritualidade Católica
            </span>

          </div>

          <h1>
            Terços
          </h1>

          <p>
            Escolha um terço para
            meditar, rezar e viver
            momentos profundos de
            espiritualidade.
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
              placeholder="Pesquisar terço..."
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
        LIST
        ========================= */}

        <div className={styles.list}>

          {filteredRosaries.length === 0 && (

            <div className={styles.empty}>

              <Church size={34}/>

              <p>
                Nenhum terço
                encontrado.
              </p>

            </div>

          )}

          {filteredRosaries.map((r)=>(

            <button
              key={r.slug}
              className={styles.card}
              onClick={()=>
                goToRosary(r.slug)
              }
            >

              <div className={styles.cardLeft}>

                <div
                  className={styles.iconBox}
                >

                  {getIcon(r.slug)}

                </div>

                <div
                  className={styles.cardInfo}
                >

                  <strong>
                    {r.name}
                  </strong>

                  {ROSARY_DAYS[r.slug] && (

                    <span>
                      {ROSARY_DAYS[r.slug]}
                    </span>

                  )}

                  {progressMap[r.slug] && (

                    <span className={styles.resumeBadge}>

                      <RotateCcw size={12}/>

                      Continuar · {" "}
                      {progressMap[r.slug].currentStep + 1}
                      /
                      {progressMap[r.slug].totalSteps}

                    </span>

                  )}

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