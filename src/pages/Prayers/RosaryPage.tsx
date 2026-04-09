import { useEffect,useState,useRef } from "react"
import { useParams,useNavigate } from "react-router-dom"

import styles from "./RosaryPage.module.css"

import {
 getRosary,
 finishRosary,
 startRosary,
 getRosarySession
} from "../../services/rosaryService"

import { rosaryPrayers } from "../../utils/rosaryPrayers"

export default function RosaryPage(){

 const { type } = useParams<{type:string}>()
 const navigate = useNavigate()

 const [steps,setSteps] = useState<any[]>([])
 const [current,setCurrent] = useState(0)
 const [loading,setLoading] = useState(true)
 const [finished,setFinished] = useState(false)

 const [direction,setDirection] = useState<"next"|"prev">("next")

 const touchStart = useRef<number | null>(null)

 useEffect(()=>{

  if(!type) return

  loadRosary(type)

 },[type])

 async function loadRosary(rosaryType:string){

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

   const data = await getRosary(rosaryType)

   setSteps(data)

  }catch(err){

   console.log("Erro ao carregar terço",err)

  }finally{

   setLoading(false)

  }

 }

 function getCurrentGroup(){

  const currentStep = steps[current]
  if(!currentStep?.title) return null

  const baseTitle = currentStep.title.replace(/\s\d+\/\d+/,"")

  // 🔥 IGNORAR ORAÇÕES QUE NÃO SÃO CONTAGEM
  const ignore = ["Pai Nosso","Credo","Glória ao Pai","Salve Rainha"]

  if(ignore.includes(baseTitle)) return null

  // ← volta
  let start = current
  while(
    start > 0 &&
    steps[start - 1]?.title?.replace(/\s\d+\/\d+/,"") === baseTitle
  ){
    start--
  }

  // → avança
  let end = current
  while(
    end < steps.length - 1 &&
    steps[end + 1]?.title?.replace(/\s\d+\/\d+/,"") === baseTitle
  ){
    end++
  }

  const total = end - start + 1

  if(total <= 1) return null

  const index = current - start + 1

  return { total, index }
}

  const group = getCurrentGroup()

 function next(){

  setCurrent((prev)=>{

   if(prev >= steps.length-1) return prev

   setDirection("next")

   return prev + 1

  })

 }

 function prev(){

  setCurrent((prev)=>{

   if(prev <= 0) return prev

   setDirection("prev")

   return prev - 1

  })

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

  if(diff < -60) next()

  if(diff > 60) prev()

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

 if(!steps.length){

  return(

   <div className={styles.loading}>
    Não foi possível carregar o terço.
   </div>

  )

 }

 const step = steps[current]

 const isLastStep = current === steps.length-1

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

    {group && group.total > 1 && (

    <div className={styles.rosary}>

      {Array.from({ length: group.total }).map((_, i) => {

        const active = i < group.index

        return (
          <span
            key={i}
            className={active ? styles.beadActive : styles.bead}
          >
            {i + 1}
          </span>
        )

      })}

    </div>

  )}

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

       <h2>{step.title.replace(/\s\d+\/\d+/, "")}</h2>

       <pre className={styles.text}>
          {step.text || rosaryPrayers[
            step.title.replace(/\s\d+\/\d+/,"")
          ]}
        </pre>

      </div>

     )}

    </div>


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

  </div>

 )
}