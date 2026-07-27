import { useEffect } from "react"

export function useLockBodyScroll(locked: boolean){

 useEffect(()=>{

  if(!locked) return

  const scrollY = window.scrollY

  document.body.style.position = "fixed"
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = "0"
  document.body.style.right = "0"
  document.body.style.width = "100%"
  document.body.style.overflow = "hidden"

  /*
  A restauração precisa acontecer só aqui, no cleanup — não num branch
  "else" separado. Um branch else lia "document.body.style.top" pra
  saber quanto restaurar, mas o cleanup do efeito anterior (que sempre
  roda antes do próximo efeito, inclusive na troca locked=true→false)
  já tinha zerado esse valor, então a rolagem nunca era restaurada de
  fato. Fechando sobre "scrollY" direto, sem reler do DOM, evita a
  corrida de vez.
  */
  return ()=>{

   document.body.style.position = ""
   document.body.style.top = ""
   document.body.style.left = ""
   document.body.style.right = ""
   document.body.style.width = ""
   document.body.style.overflow = ""

   window.scrollTo(0, scrollY)

  }

 },[locked])

}
