import { useEffect,useState } from "react"
import { useNavigate } from "react-router-dom"

import {
  ChevronLeft,
  Sparkles,
  Heart,
  BookOpen,
  ShieldCheck
} from "lucide-react"

import styles from "./PrayersCategories.module.css"

import { getPrayerCategories }
from "../../services/prayersService"

import { usePullToRefresh }
from "../../hooks/usePullToRefresh"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

type Category = {

  id:string
  name:string
  slug:string

}

export default function PrayersCategories(){

  const navigate = useNavigate()

  const [categories,setCategories] =
    useState<Category[]>([])

  const [loading,setLoading] =
    useState(true)

  useEffect(()=>{

    loadCategories()

  },[])

  usePullToRefresh(loadCategories)

  async function loadCategories(){

    try{

      const data =
        await getPrayerCategories()

      setCategories(data || [])

    }catch{

      console.log(
        "Erro ao carregar categorias"
      )

    }finally{

      setLoading(false)

    }

  }

  function handleNavigate(
    slug:string
  ){

    if(slug === "tercos"){

      navigate("/oratio/rosary")

      return

    }

    navigate(
      `/oratio/prayers/${slug}`
    )

  }

  function getIcon(slug:string){

    if(slug === "tercos"){
      return <Sparkles size={22}/>
    }

    if(slug.includes("cura")){
      return <Heart size={22}/>
    }

    if(slug.includes("prote")){
      return <ShieldCheck size={22}/>
    }

    return <BookOpen size={22}/>

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

        <div className={styles.header}>

          <div className={styles.badge}>

            <Sparkles size={18}/>

            <span>
              Orações Católicas
            </span>

          </div>

          <h1>
            Categorias
          </h1>

          <p>
            Escolha uma categoria
            para encontrar orações,
            terços e devoções da
            tradição católica.
          </p>

        </div>

        <div className={styles.categories}>

          {loading && (

            <>
              {[1,2,3,4].map(item=>(

                <div
                  key={item}
                  className={`skeleton ${styles.skeletonItem}`}
                />

              ))}
            </>

          )}

          {!loading &&
          categories.length === 0 && (

            <div className={styles.empty}>

              <BookOpen size={34}/>

              <p>
                Nenhuma categoria
                disponível.
              </p>

            </div>

          )}

          {!loading &&
          categories.map(cat=>(

            <button
              key={cat.id}
              className={styles.card}
              onClick={()=>
                handleNavigate(cat.slug)
              }
            >

              <div className={styles.cardLeft}>

                <div className={styles.iconBox}>

                  {getIcon(cat.slug)}

                </div>

                <div
                  className={styles.cardInfo}
                >

                  <strong>
                    {cat.name}
                  </strong>

                  <span>
                    Abrir categoria
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