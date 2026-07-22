import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { RefreshCw } from "lucide-react"

import {
 PullToRefreshContext,
 type RefreshHandler
} from "../../contexts/PullToRefreshContext"

import styles from "./PullToRefresh.module.css"

type Phase = "idle" | "pulling" | "ready" | "refreshing"

/* =========================
   CONSTANTES DO GESTO
========================= */

const MAX_PULL = 100          // quanto o indicador consegue esticar, no máximo (px)
const THRESHOLD = 64          // quanto precisa puxar pra soltar e atualizar (px)
const REFRESH_PIN_HEIGHT = 56 // altura do indicador enquanto está atualizando de verdade
const ACTIVATE_DRAG_PX = 4    // arrasto mínimo pra confirmar que é um puxão, não um toque
const MAX_REFRESH_MS = 15_000 // trava de segurança — nunca fica girando pra sempre

interface Props{
 children: ReactNode
}

export default function PullToRefresh({ children }:Props){

 const rootRef = useRef<HTMLDivElement | null>(null)

 const [pullDistance,setPullDistance] = useState(0)
 const [pulling,setPulling] = useState(false) // true durante o arrasto ativo (sem transição CSS)
 const [phase,setPhaseState] = useState<Phase>("idle")

 // Espelham o estado em refs pra serem lidos dentro dos listeners nativos
 // (registrados uma única vez) sem sofrer de closure desatualizada.
 const phaseRef = useRef<Phase>("idle")
 const handlerRef = useRef<RefreshHandler | null>(null)

 function setPhase(next:Phase){
  phaseRef.current = next
  setPhaseState(next)
 }

 const register = useCallback((handler:RefreshHandler | null)=>{
  handlerRef.current = handler
 },[])

 const ctxValue = useMemo(()=>({ register }),[register])

 /* =========================
    FINALIZAÇÃO (sucesso, erro ou timeout — sempre fecha)
 ========================= */

 function finish(){
  setPhase("idle")
  setPullDistance(0)
 }

 function runRefresh(){

  setPhase("refreshing")
  setPullDistance(REFRESH_PIN_HEIGHT)

  const handler = handlerRef.current

  if(!handler){
   finish()
   return
  }

  let settled = false

  const timeoutId = setTimeout(()=>{
   if(!settled){
    settled = true
    finish()
   }
  }, MAX_REFRESH_MS)

  handler()
   .catch(()=>{
    // Engolido de propósito: cada tela já trata o próprio erro de
    // carregamento (mensagem, estado vazio etc.) — aqui só garante que
    // o spinner nunca fica preso por causa de uma falha na atualização.
   })
   .finally(()=>{
    if(!settled){
     settled = true
     clearTimeout(timeoutId)
     finish()
    }
   })

 }

 /* =========================
    GESTO (touch nativo, não sintético do React)

    touchmove precisa de { passive:false } pra preventDefault() funcionar
    — React anexa handlers de touch como passivos por padrão, então isso
    tem que ser feito via addEventListener manual, não via onTouchMove
    no JSX.
 ========================= */

 useEffect(()=>{

  const el = rootRef.current
  if(!el) return

  let startY = 0
  let watching = false  // dedo na tela, no topo da página, observando se vai puxar
  let committed = false // confirmado que é um puxão — já estamos no controle do gesto

  function getScrollTop(){
   return (
    document.scrollingElement?.scrollTop ??
    document.documentElement.scrollTop ??
    0
   )
  }

  function reset(){
   committed = false
   setPulling(false)
   setPullDistance(0)
   setPhase("idle")
  }

  function onTouchStart(e:TouchEvent){

   if(phaseRef.current === "refreshing") return
   if(!handlerRef.current) return
   if(getScrollTop() > 0) return

   startY = e.touches[0].clientY
   watching = true
   committed = false

  }

  function onTouchMove(e:TouchEvent){

   if(!watching) return

   const currentY = e.touches[0].clientY
   const rawDelta = currentY - startY

   if(rawDelta <= 0){
    // voltou a subir ou nem chegou a descer — não é (mais) um puxão,
    // devolve o controle pro scroll normal da página
    if(committed) reset()
    watching = false
    return
   }

   if(!committed){
    if(rawDelta < ACTIVATE_DRAG_PX) return
    committed = true
    setPulling(true)
   }

   // a partir daqui o gesto é nosso — impede o bounce/scroll nativo de
   // brigar com o arrasto visual
   e.preventDefault()

   // curva de resistência (efeito "elástico"): aproxima-se de MAX_PULL
   // sem nunca ultrapassar, em vez de um corte seco
   const damped =
    MAX_PULL * (1 - Math.exp(-rawDelta / (MAX_PULL * 1.5)))

   setPullDistance(damped)
   setPhase(damped >= THRESHOLD ? "ready" : "pulling")

  }

  function onTouchEnd(){

   if(!watching) return
   watching = false

   if(!committed) return

   setPulling(false)

   if(phaseRef.current === "ready"){
    committed = false
    runRefresh()
   }else{
    reset()
   }

  }

  function onTouchCancel(){
   if(!committed){ watching = false; return }
   watching = false
   reset()
  }

  el.addEventListener("touchstart", onTouchStart, { passive:true })
  el.addEventListener("touchmove", onTouchMove, { passive:false })
  el.addEventListener("touchend", onTouchEnd, { passive:true })
  el.addEventListener("touchcancel", onTouchCancel, { passive:true })

  return ()=>{
   el.removeEventListener("touchstart", onTouchStart)
   el.removeEventListener("touchmove", onTouchMove)
   el.removeEventListener("touchend", onTouchEnd)
   el.removeEventListener("touchcancel", onTouchCancel)
  }

 },[])

 const progress = Math.min(1, pullDistance / THRESHOLD)

 return(

  <PullToRefreshContext.Provider value={ctxValue}>

   <div ref={rootRef} className={styles.root}>

    <div
     className={styles.indicator}
     style={{
      height: pullDistance,
      transition: pulling ? "none" : "height .28s cubic-bezier(.22,1,.36,1)"
     }}
    >

     <div
      className={styles.iconWrap}
      style={{ opacity: phase === "refreshing" ? 1 : progress }}
     >

      <RefreshCw
       size={20}
       className={phase === "refreshing" ? styles.spinning : undefined}
       style={
        phase === "refreshing"
         ? undefined
         : { transform:`rotate(${progress * 360}deg)` }
       }
      />

     </div>

    </div>

    {children}

   </div>

  </PullToRefreshContext.Provider>

 )

}
