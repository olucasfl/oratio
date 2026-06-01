import {
  useEffect,
  useState,
  useRef
} from "react"

import {
  useParams,
  useNavigate
} from "react-router-dom"

import styles from "./RosaryPage.module.css"

import {
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles
} from "lucide-react"

import {
  getRosary,
  finishRosary,
  startRosary,
  getRosarySession
} from "../../services/rosaryService"

import {
  rosaryPrayers
} from "../../utils/rosaryPrayers"

export default function RosaryPage(){

  const { type } =
    useParams<{ type:string }>()

  const navigate = useNavigate()

  const [steps,setSteps] =
    useState<any[]>([])

  const [current,setCurrent] =
    useState(0)

  const [loading,setLoading] =
    useState(true)

  const [finished,setFinished] =
    useState(false)

  const [finishing,setFinishing] =
    useState(false)

  const [
    direction,
    setDirection
  ] = useState<"next"|"prev">(
    "next"
  )

  const touchStart =
    useRef<number | null>(null)

  /*
  =========================
  LOAD ROSARY
  =========================
  */

  useEffect(()=>{

    if(!type) return

    loadRosary(type)

  },[type])

  async function loadRosary(
    rosaryType:string
  ){

    try{

      let session = null

      try{

        session =
          await getRosarySession()

      }catch{

        session = null

      }

      if(!session){

        await startRosary()

      }

      const data =
        await getRosary(
          rosaryType
        )

      setSteps(data)

    }catch(err){

      console.log(
        "Erro ao carregar terço",
        err
      )

    }finally{

      setLoading(false)

    }

  }

  /*
  =========================
  GROUP
  =========================
  */

  function getCurrentGroup(){

    const currentStep =
      steps[current]

    if(!currentStep?.title){
      return null
    }

    const baseTitle =
      currentStep.title.replace(
        /\s\d+\/\d+/,
        ""
      )

    const ignore = [

      "Sinal da Santa Cruz",

      "Pai Nosso",

      "Credo",

      "Glória ao Pai",

      "Salve Rainha",

      "Jaculatória de Fátima",

      "Oração ao Espírito Santo"

    ]

    if(
      ignore.includes(baseTitle)
    ){
      return null
    }

    let start = current

    while(

      start > 0 &&

      steps[start - 1]
        ?.title
        ?.replace(
          /\s\d+\/\d+/,
          ""
        ) === baseTitle

    ){

      start--

    }

    let end = current

    while(

      end < steps.length - 1 &&

      steps[end + 1]
        ?.title
        ?.replace(
          /\s\d+\/\d+/,
          ""
        ) === baseTitle

    ){

      end++

    }

    const total =
      end - start + 1

    if(total <= 1){
      return null
    }

    const index =
      current - start + 1

    return {
      total,
      index
    }

  }

  const group =
    getCurrentGroup()

  /*
  =========================
  NAVIGATION
  =========================
  */

  function next(){

    setCurrent((prev)=>{

      if(
        prev >= steps.length - 1
      ){
        return prev
      }

      setDirection("next")

      return prev + 1

    })

  }

  function prev(){

    setCurrent((prev)=>{

      if(prev <= 0){
        return prev
      }

      setDirection("prev")

      return prev - 1

    })

  }

  /*
  =========================
  SWIPE
  =========================
  */

  function handleTouchStart(
    e:any
  ){

    touchStart.current =
      e.touches[0].clientX

  }

  function handleTouchEnd(
    e:any
  ){

    if(
      touchStart.current === null
    ){
      return
    }

    const diff =
      e.changedTouches[0].clientX -
      touchStart.current

    if(diff < -60){
      next()
    }

    if(diff > 60){
      prev()
    }

    touchStart.current = null

  }

  /*
  =========================
  LOADING
  =========================
  */

  if(loading){

    return(

      <div className={styles.loading}>

        <div className={styles.spinner}/>

        <p>
          Carregando terço...
        </p>

      </div>

    )

  }

  /*
  =========================
  EMPTY
  =========================
  */

  if(!steps.length){

    return(

      <div className={styles.loading}>

        <p>
          Não foi possível
          carregar o terço.
        </p>

      </div>

    )

  }

  const step = steps[current]

  const isLastStep =
    current === steps.length - 1

  /*
  =========================
  FINISH
  =========================
  */

  async function handleFinish(){

    if(finishing){
      return
    }

    try{

      setFinishing(true)

      await finishRosary()

      setFinished(true)

      setTimeout(()=>{

        navigate(
          "/oratio/rosary"
        )

      },2000)

    }catch{

      console.log(
        "Erro ao finalizar terço"
      )

    }finally{

      setFinishing(false)

    }

  }

  /*
  =========================
  PROGRESS
  =========================
  */

  const progress =
    ((current + 1) /
    steps.length) * 100

  /*
  =========================
  RENDER
  =========================
  */

  return(

    <main
      className={`${styles.page} page-enter`}
      onTouchStart={
        handleTouchStart
      }
      onTouchEnd={
        handleTouchEnd
      }
    >

      {finished && (

        <div
          className={
            styles.finishedOverlay
          }
        >

          <div
            className={
              styles.finishedCard
            }
          >

            <div
              className={
                styles.finishedIcon
              }
            >

              <Sparkles size={30}/>

            </div>

            <h2>
              Terço concluído
            </h2>

            <p>
              Que Nossa Senhora
              interceda por você.
            </p>

          </div>

        </div>

      )}

      <section
        className={styles.container}
      >

        {/* =========================
        HEADER
        ========================= */}

        <button
          className={styles.back}
          onClick={()=>
            navigate(-1)
          }
        >

          <ChevronLeft size={18}/>

          <span>
            Sair do Terço
          </span>

        </button>

        {/* =========================
        PROGRESS BAR
        ========================= */}

        <div
          className={
            styles.progressWrapper
          }
        >

          <div
            className={
              styles.progressTop
            }
          >

            <span>
              Progresso
            </span>

            <span>
              {current + 1}
              {" / "}
              {steps.length}
            </span>

          </div>

          <div
            className={
              styles.progressBar
            }
          >

            <div
              className={
                styles.progressFill
              }
              style={{
                width:`${progress}%`
              }}
            />

          </div>

        </div>

        {/* =========================
        ROSARY GROUP
        ========================= */}

        {group &&
        group.total > 1 && (

          <div
            className={
              styles.rosary
            }
          >

            {Array.from({
              length:group.total
            }).map((_,i)=>{

              const active =
                i < group.index

              return(

                <span
                  key={i}
                  className={
                    active
                    ? styles.beadActive
                    : styles.bead
                  }
                >

                  {i + 1}

                </span>

              )

            })}

          </div>

        )}

        {/* =========================
        CONTENT
        ========================= */}

        <div
          key={current}
          className={
            direction === "next"
            ? styles.slideNext
            : styles.slidePrev
          }
        >

          {step.type ===
          "mystery" && (

            <div
              className={
                styles.mystery
              }
            >

              <h2>
                {step.title}
              </h2>

              <div
                className={
                  styles.text
                }
              >

                {step.text}

              </div>

            </div>

          )}

          {step.type ===
          "prayer" && (

            <div
              className={
                styles.prayer
              }
            >

              <h2>

                {step.title.replace(
                  /\s\d+\/\d+/,
                  ""
                )}

              </h2>

              <div
                className={
                  styles.text
                }
              >

                {step.text ||

                rosaryPrayers[
                  step.title.replace(
                    /\s\d+\/\d+/,
                    ""
                  )
                ]}

              </div>

            </div>

          )}

        </div>

        <div
          className={
            styles.pageSpacer
          }
        />

      </section>

      {/* =========================
      BOTTOM BAR
      ========================= */}

      <div
        className={
          styles.bottomBar
        }
      >

        {current > 0 && (

          <button
            className={styles.prev}
            onClick={prev}
          >

            <ChevronLeft size={18}/>

            <span>
              Anterior
            </span>

          </button>

        )}

        {isLastStep ? (

          <button
            className={styles.finish}
            onClick={
              handleFinish
            }
            disabled={finishing}
          >

            {finishing ? (

              <div
                className={
                  styles.spinner
                }
              />

            ) : (

              <>

                <Check size={18}/>

                <span>
                  Concluir
                </span>

              </>

            )}

          </button>

        ) : (

          <button
            className={styles.next}
            onClick={next}
          >

            <span>
              Próximo
            </span>

            <ChevronRight
              size={18}
            />

          </button>

        )}

      </div>

    </main>

  )

}