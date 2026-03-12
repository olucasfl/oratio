import { useEffect,useState,useRef } from "react"
import { useParams,useNavigate } from "react-router-dom"

import styles from "./RosaryPage.module.css"

import { getRosary, finishRosary, startRosary, getRosarySession } from "../../services/rosaryService"
import { rosaryPrayers } from "../../utils/rosaryPrayers"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

export default function RosaryPage(){

 const { type } = useParams()
 const navigate = useNavigate()

 const [steps,setSteps] = useState<any[]>([])
 const [current,setCurrent] = useState(0)
 const [loading,setLoading] = useState(true)
 const [finished,setFinished] = useState(false)

 const [direction,setDirection] = useState<"next"|"prev">("next")

 const touchStart = useRef<number | null>(null)

 useEffect(()=>{
  load()
 },[type])

    async function load(){

    if(!type) return

    try{

    let session = null

    try{
    session = await getRosarySession()
    }catch{
    session = null
    }

    if(!session){
    await startRosary()
    }

    const data = await getRosary(type)

    setSteps(data)

    }catch(err){

    console.log("Erro ao carregar terço", err)

    }finally{

    setLoading(false)

    }

    }

 function next(){

  if(current < steps.length-1){

   setDirection("next")

   setCurrent(current+1)

  }

 }

 function prev(){

  if(current > 0){

   setDirection("prev")

   setCurrent(current-1)

  }

 }

 /* =====================
 SWIPE MOBILE
 ===================== */

 function handleTouchStart(e:any){

  touchStart.current = e.touches[0].clientX

 }

 function handleTouchEnd(e:any){

  if(touchStart.current === null) return

  const diff = e.changedTouches[0].clientX - touchStart.current

  if(diff < -60){

   setDirection("next")
   next()

  }

  if(diff > 60){

   setDirection("prev")
   prev()

  }

  touchStart.current = null

 }

 if(loading){

  return(

   <div className={styles.loading}>

    <p>Carregando terço...</p>

    <button
     className={styles.back}
     onClick={()=>navigate(-1)}
    >
     ← Voltar
    </button>

   </div>

  )

 }

 const step = steps[current]

 const isAveMaria = step.title?.includes("Ave Maria")

 const isLastStep = current === steps.length-1


 /* =====================
3 AVE MARIAS INICIAIS
===================== */

// encontrar o primeiro mistério
const firstMysteryIndex = steps.findIndex(
 (s:any)=>s.type === "mystery"
)

const initialAveMariaIndexes = steps
 .map((s:any,i:number)=>({
  step:s,
  index:i
 }))
 .filter(item =>
  item.step.title?.includes("Ave Maria") &&
  item.index < firstMysteryIndex
 )
 .slice(0,3)

const initialPositions = initialAveMariaIndexes.map(i=>i.index)

const isInitialAveMaria = initialPositions.includes(current)

let initialIndex = 0

if(isInitialAveMaria){

 initialIndex =
  initialPositions.indexOf(current) + 1

}

 /* =====================
 DETECTAR DEZENA
 ===================== */

 let decadeStart = -1

 for(let i=current;i>=0;i--){

  if(steps[i].title === "Pai Nosso"){
   decadeStart = i
   break
  }

 }

 const isInsideDecade =
  isAveMaria &&
  decadeStart !== -1 &&
  steps[decadeStart-1]?.type === "mystery"


 /* =====================
 CONTAGEM DA DEZENA
 ===================== */

 let aveIndex = 0

 if(isInsideDecade){

  const decadeSteps = steps.slice(decadeStart,current+1)

  aveIndex = decadeSteps.filter(
   (s:any)=>s.title?.includes("Ave Maria")
  ).length

 }

 async function handleFinish(){

  try{

   await finishRosary()

   setFinished(true)

   setTimeout(()=>{

    navigate("/oratio/rosary")

   },2000)

  }catch{

   console.log("Erro ao finalizar terço")

  }

 }

 return(

  <div
   className={styles.page}
   onTouchStart={handleTouchStart}
   onTouchEnd={handleTouchEnd}
  >

   {/* AVISO TERÇO CONCLUÍDO */}

   {finished && (

    <div className={styles.finishedOverlay}>

     <div className={styles.finishedCard}>

      <h2>Terço concluído</h2>

      <p>Que Nossa Senhora interceda por você.</p>

     </div>

    </div>

   )}

   <div className={styles.container}>

    <button
     className={styles.back}
     onClick={()=>navigate(-1)}
    >
     ← Sair do Terço
    </button>


    {/* =====================
    3 AVE MARIAS INICIAIS
    ===================== */}

    {isInitialAveMaria && (

     <div className={styles.rosary}>

      {Array.from({length:3}).map((_,i)=>{

       const active = i < initialIndex

       return(

        <span
         key={i}
         className={active ? styles.beadActive : styles.bead}
        >
         {i+1}
        </span>

       )

      })}

     </div>

    )}


    {/* =====================
    BOLINHAS DA DEZENA
    ===================== */}

    {isInsideDecade && (

     <div className={styles.rosary}>

      {Array.from({length:10}).map((_,i)=>{

       const active = i < aveIndex

       return(

        <span
         key={i}
         className={active ? styles.beadActive : styles.bead}
        >
         {i+1}
        </span>

       )

      })}

     </div>

    )}


    {/* CONTEÚDO */}

    <div
     key={current}
     className={
      direction === "next"
      ? styles.slideNext
      : styles.slidePrev
     }
    >

     {step.type === "mystery" && (

      <div className={styles.mystery}>

       <h2>{step.title}</h2>

       <p>{step.text}</p>

      </div>

     )}

     {step.type === "prayer" && (

      <div className={styles.prayer}>

       <h2>
        {isAveMaria ? "Ave Maria" : step.title}
       </h2>

       <pre className={styles.text}>
        {rosaryPrayers[step.title.replace(/\s\d+\/10/,"")]}
       </pre>

      </div>

     )}

    </div>


    {/* CONTROLES */}

    <div className={styles.controls}>

     {!isLastStep && (

      <>

       <button
        className={styles.prev}
        onClick={prev}
       >
        Anterior
       </button>

       <button
        className={styles.next}
        onClick={next}
       >
        Próximo
       </button>

      </>

     )}

     {isLastStep && (

      <button
       className={styles.finish}
       onClick={handleFinish}
      >
       Concluir Terço
      </button>

     )}

    </div>

   </div>

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )

}