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
  Sparkles,
  Clock
} from "lucide-react"

import {
  getRosary,
  finishRosary,
  startRosary,
  getRosarySession,
  updateRosaryStep
} from "../../services/rosaryService"

import {
  rosaryPrayers
} from "../../utils/rosaryPrayers"

import Skeleton from "../../components/Skeleton/Skeleton"
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"

/* =========================
FORMATAR TEMPO
========================= */

function formatElapsed(totalSeconds:number){

  const minutes =
    Math.floor(totalSeconds / 60)

  const seconds =
    totalSeconds % 60

  return (
    String(minutes).padStart(2,"0") +
    ":" +
    String(seconds).padStart(2,"0")
  )

}

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

  const [
    resumePrompt,
    setResumePrompt
  ] = useState<{
    step:number
    total:number
  } | null>(null)

  const [elapsed,setElapsed] =
    useState(0)

  const touchStart =
    useRef<number | null>(null)

  const elapsedRef =
    useRef(0)

  const currentRef =
    useRef(0)

  useEffect(()=>{
    elapsedRef.current = elapsed
  },[elapsed])

  useEffect(()=>{
    currentRef.current = current
  },[current])

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

      let session:any = null

      try{

        session =
          await getRosarySession(
            rosaryType
          )

      }catch{

        session = null

      }

      if(!session){

        session =
          await startRosary(
            rosaryType
          )

      }

      const data =
        await getRosary(
          rosaryType
        )

      setSteps(data)

      setElapsed(
        session?.elapsedSeconds || 0
      )

      if(
        session?.currentStep > 0 &&
        session.currentStep < data.length
      ){

        setResumePrompt({
          step:session.currentStep,
          total:data.length
        })

      }

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
  RETOMAR / REINICIAR
  =========================
  */

  function handleContinue(){

    if(!resumePrompt) return

    currentRef.current =
      resumePrompt.step

    setCurrent(resumePrompt.step)
    setResumePrompt(null)

  }

  async function handleRestart(){

    if(!type) return

    setResumePrompt(null)

    try{

      await startRosary(type,true)

    }catch{

      console.log(
        "Erro ao reiniciar terço"
      )

    }

    currentRef.current = 0
    elapsedRef.current = 0

    setCurrent(0)
    setElapsed(0)

  }

  /*
  =========================
  TIMER (visual)
  =========================
  */

  useEffect(()=>{

    if(loading || resumePrompt){
      return
    }

    const interval =
      setInterval(()=>{

        setElapsed((prev)=>
          prev + 1
        )

      },1000)

    return ()=>
      clearInterval(interval)

  },[loading,resumePrompt])

  /*
  =========================
  SYNC STEP / TEMPO

  Só existe 1 requisição de
  sincronização em voo por vez.
  Se chegar um pedido novo
  enquanto uma está em andamento,
  ele só é reenviado (com os
  valores mais recentes) depois
  que a anterior terminar — isso
  evita que respostas fora de
  ordem sobrescrevam um passo
  mais avançado com um mais antigo.
  =========================
  */

  const syncInFlight =
    useRef(false)

  const syncPending =
    useRef(false)

  function syncProgress(){

    if(!type) return

    if(syncInFlight.current){
      syncPending.current = true
      return
    }

    runSync(type)

  }

  async function runSync(
    rosaryType:string
  ){

    syncInFlight.current = true

    try{

      await updateRosaryStep(
        rosaryType,
        currentRef.current,
        elapsedRef.current
      )

    }catch{

      // ignora, tenta de novo
      // no próximo sync

    }finally{

      syncInFlight.current = false

      if(syncPending.current){

        syncPending.current = false

        runSync(rosaryType)

      }

    }

  }

  useEffect(()=>{

    if(loading || resumePrompt){
      return
    }

    const interval =
      setInterval(
        syncProgress,
        20000
      )

    function handleVisibility(){

      if(document.hidden){
        syncProgress()
      }

    }

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    )

    return ()=>{

      clearInterval(interval)

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      )

    }

  },[loading,resumePrompt,type])

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

      const newStep = prev + 1

      currentRef.current = newStep

      syncProgress()

      return newStep

    })

  }

  function prev(){

    setCurrent((prev)=>{

      if(prev <= 0){
        return prev
      }

      setDirection("prev")

      const newStep = prev - 1

      currentRef.current = newStep

      syncProgress()

      return newStep

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

      <main className={`${styles.page} page-enter`}>

        <div style={{padding:"20px 20px 0"}}>
          <button
            style={{background:"none",border:"none",color:"var(--oratio-primary)",fontSize:15,cursor:"pointer",fontFamily:"var(--oratio-font-text)"}}
            onClick={()=>navigate(-1)}
          >
            ← Voltar
          </button>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:16,padding:"24px 20px"}}>
          <Skeleton height={26} width="65%" radius={8}/>
          <Skeleton height={18} width="45%" radius={6}/>
          <Skeleton height={200} width="100%" radius={20}/>
          <Skeleton height={56} width="100%" radius={12}/>
          <Skeleton height={56} width="100%" radius={12}/>
        </div>

      </main>

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

    if(finishing || !type){
      return
    }

    try{

      setFinishing(true)

      await finishRosary(type)

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

      <ConfirmModal
        open={resumePrompt !== null}
        title="Retomar terço?"
        message={
          resumePrompt
          ? `Você parou no passo ${resumePrompt.step + 1} de ${resumePrompt.total}. Deseja continuar de onde parou ou começar do início?`
          : ""
        }
        confirmLabel="Continuar de onde parei"
        cancelLabel="Começar do zero"
        onConfirm={handleContinue}
        onCancel={handleRestart}
      />

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

        <div className={styles.headerRow}>

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

          <div className={styles.timer}>

            <Clock size={13}/>

            <span>
              {formatElapsed(elapsed)}
            </span>

          </div>

        </div>

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
