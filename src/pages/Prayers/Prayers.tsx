import { useEffect,useState } from "react"

import {
  useNavigate,
  useParams
} from "react-router-dom"

import {
  ChevronLeft,
  BookOpen,
  LoaderCircle,
  Check
} from "lucide-react"

import styles from "./Prayers.module.css"

import {
  getPrayer,
  completePrayer
} from "../../services/prayersService"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

export default function Prayers(){

  const { id } =
    useParams<{ id:string }>()

  const navigate = useNavigate()

  const [prayer,setPrayer] =
    useState<any>(null)

  const [loading,setLoading] =
    useState(true)

  const [completing,setCompleting] =
    useState(false)

  useEffect(()=>{

    if(!id){
      return
    }

    loadPrayer(id)

  },[id])

  async function loadPrayer(
    prayerId:string
  ){

    try{

      const data =
        await getPrayer(prayerId)

      setPrayer(data)

    }catch{

      console.log(
        "Erro ao carregar oração"
      )

    }finally{

      setLoading(false)

    }

  }

  async function handleComplete(){

    try{

      setCompleting(true)

      await completePrayer()

      navigate(-1)

    }catch{

      console.log(
        "Erro ao registrar oração"
      )

    }finally{

      setCompleting(false)

    }

  }

  /*
  =========================
  LOADING
  =========================
  */

  if(loading){

    return(

      <div className={styles.loadingPage}>

        <div className={styles.loadingCard}>

          <LoaderCircle
            className={styles.spinner}
            size={42}
          />

          <p>
            Carregando oração...
          </p>

          <button
            className={styles.backButton}
            onClick={()=>navigate(-1)}
          >

            <ChevronLeft size={18}/>

            <span>
              Voltar
            </span>

          </button>

        </div>

      </div>

    )

  }

  /*
  =========================
  NOT FOUND
  =========================
  */

  if(!prayer){

    return(

      <div className={styles.loadingPage}>

        <div className={styles.loadingCard}>

          <BookOpen size={42}/>

          <p>
            Oração não encontrada
          </p>

        </div>

      </div>

    )

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

          <div className={styles.iconBox}>

            <BookOpen size={24}/>

          </div>

          <div>

            <h1>
              {prayer.title}
            </h1>

            <p>
              Momento de oração
              e espiritualidade
            </p>

          </div>

        </div>

        {/* =========================
        PRAYER
        ========================= */}

        <div className={styles.prayerBox}>

          <pre className={styles.text}>

            {prayer.content || ""}

          </pre>

        </div>

        {/* =========================
        COMPLETE
        ========================= */}

        <button
          className={styles.completeButton}
          onClick={handleComplete}
          disabled={completing}
        >

          {completing ? (

            <>
              <LoaderCircle
                size={20}
                className={styles.buttonSpinner}
              />

              <span>
                Registrando...
              </span>
            </>

          ) : (

            <>
              <Check size={20}/>

              <span>
                Concluir oração
              </span>
            </>

          )}

        </button>

      </section>

      <div className={styles.pageSpacer}/>

      <BottomNavbar/>

    </main>

  )

}