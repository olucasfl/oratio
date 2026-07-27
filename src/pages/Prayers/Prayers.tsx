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

import { isLoggedIn } from "../../utils/auth"

import { buildPrayerShareText } from "../../utils/prayerShareText"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

import GuestGateModal
from "../../components/GuestGateModal/GuestGateModal"

import ShareReadingButton
from "../../components/ShareReadingButton/ShareReadingButton"

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

  const [showGate,setShowGate] =
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

    if(!isLoggedIn()){
      setShowGate(true)
      return
    }

    try{

      setCompleting(true)

      await completePrayer(prayer?.title)

      navigate("/oratio/prayers")

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

      <main className={`${styles.page} page-enter`}>

        <section className={styles.container}>

          <button className={styles.backButton} onClick={()=>navigate("/oratio/prayers")}>
            <ChevronLeft size={18}/>
            <span>Voltar</span>
          </button>

          <div style={{display:"flex",flexDirection:"column",gap:14,paddingTop:16}}>
            <div className="skeleton" style={{height:28,width:"55%",borderRadius:8}}/>
            <div className="skeleton" style={{height:18,width:"35%",borderRadius:6}}/>
            <div className="skeleton" style={{height:160,width:"100%",borderRadius:16}}/>
            <div className="skeleton" style={{height:120,width:"100%",borderRadius:16}}/>
            <div className="skeleton" style={{height:120,width:"100%",borderRadius:16}}/>
          </div>

        </section>

      </main>

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
          onClick={()=>navigate("/oratio/prayers")}
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

        <ShareReadingButton
          label="oração"
          buildText={()=>
            buildPrayerShareText(
              prayer.title,
              `${window.location.origin}/oratio/prayer/${id}`
            )
          }
        />

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

      <GuestGateModal
        open={showGate}
        message="Crie uma conta para concluir suas orações e acompanhar seu progresso espiritual."
        onClose={()=>setShowGate(false)}
      />

    </main>

  )

}