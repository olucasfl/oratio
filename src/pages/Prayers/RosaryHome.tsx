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
  Stars
} from "lucide-react"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

import { ROSARY_DAYS }
from "../../utils/rosaryDays"

/* =========================
TIPAGEM
========================= */

type Rosary = {

  name:string
  slug:string

}

/* =========================
DADOS
========================= */

const ROSARIES:Rosary[] = [

  {
    name:"Mistérios Gozosos",
    slug:"gozosos"
  },

  {
    name:"Mistérios Dolorosos",
    slug:"dolorosos"
  },

  {
    name:"Mistérios Gloriosos",
    slug:"gloriosos"
  },

  {
    name:"Mistérios Luminosos",
    slug:"luminosos"
  },

  {
    name:"Terço das 7 Dores de Maria",
    slug:"sete-dores"
  },

  {
    name:"Coroa de Nossa Senhora das Lágrimas",
    slug:"coroa-lagrimas"
  },

  {
    name:"Terço de São Bento",
    slug:"sao-bento"
  },

  {
    name:"Terço da Divina Misericórdia",
    slug:"misericordia"
  },

  {
    name:"Terço do Sagrado Coração de Jesus",
    slug:"sagrado-coracao"
  },

  {
    name:"Terço de São José",
    slug:"sao-jose"
  },

  {
    name:"Terço de São Miguel Arcanjo",
    slug:"sao-miguel"
  },

  {
    name:"Terço do Espírito Santo",
    slug:"espirito-santo"
  },

]

export default function RosaryHome(){

  const navigate = useNavigate()

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

    return <Church size={22}/>

  }

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
        LIST
        ========================= */}

        <div className={styles.list}>

          {ROSARIES.map((r)=>(

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