import { useCallback, useEffect, useRef, useState } from "react"

/*
 Efeito "texto se digitando" do guia de boas-vindas.

 Espelha o padrão do Vox (`src/pages/Vox/Vox.tsx`, `handleSuggestionClick`):
 revela em pedaços com `setTimeout`, `chunk = round(len / divisor)`, o timer
 guardado num `ref` com cleanup. Vive aqui, dentro de `pages/WelcomeGuide/` —
 de propósito não é um hook compartilhado; o do Vox segue como está.

 `animate: false` (o usuário ligou "reduzir movimento") → o texto inteiro
 aparece de imediato, sem nenhum timer (é derivado, não passa por estado).
 Quem consome isto renderiza a camada como `aria-hidden`; o texto acessível
 completo mora numa cópia à parte.

 `skip()` joga pro texto inteiro na hora — usado quando a pessoa toca a tela
 no meio da animação (quem lê rápido não espera).
*/

interface Options{
 animate: boolean
 startDelay?: number
 stepMs?: number
 chunkDivisor?: number
}

export interface Typewriter{
 text: string
 done: boolean
 skip: () => void
}

export function useTypewriter(full: string, opts: Options): Typewriter{

 const { animate, startDelay = 0, stepMs = 12, chunkDivisor = 28 } = opts

 const [count,setCount] = useState(0)
 const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

 // Reinicia a contagem quando o texto (ou o modo) muda — padrão do React de
 // "ajustar estado durante o render", não dentro de um efeito (evita render
 // em cascata; regra react-hooks/set-state-in-effect).
 const [prev,setPrev] = useState({ full, animate })
 if(prev.full !== full || prev.animate !== animate){
  setPrev({ full, animate })
  setCount(0)
 }

 useEffect(()=>{

  if(timer.current){
   clearTimeout(timer.current)
   timer.current = null
  }

  if(!animate) return   // reduced motion: o texto derivado abaixo já é o full

  const chunk = Math.max(1, Math.round(full.length / chunkDivisor))
  let i = 0

  const step = ()=>{
   i = Math.min(full.length, i + chunk)
   setCount(i)
   timer.current = i < full.length ? setTimeout(step, stepMs) : null
  }

  timer.current = setTimeout(step, startDelay)

  return ()=>{
   if(timer.current){
    clearTimeout(timer.current)
    timer.current = null
   }
  }

 },[full,animate,startDelay,stepMs,chunkDivisor])

 const skip = useCallback(()=>{
  if(timer.current){
   clearTimeout(timer.current)
   timer.current = null
  }
  setCount(Number.MAX_SAFE_INTEGER)
 },[])

 const text = animate ? full.slice(0, count) : full
 const done = !animate || count >= full.length

 return { text, done, skip }

}
