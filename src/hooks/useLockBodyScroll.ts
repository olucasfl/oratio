import { useEffect } from "react"

export function useLockBodyScroll(locked: boolean){

 useEffect(()=>{

  if(locked){

   const scrollY = window.scrollY

   document.body.style.position = "fixed"
   document.body.style.top = `-${scrollY}px`
   document.body.style.left = "0"
   document.body.style.right = "0"
   document.body.style.width = "100%"
   document.body.style.overflow = "hidden"

  }else{

   const scrollY = document.body.style.top

   document.body.style.position = ""
   document.body.style.top = ""
   document.body.style.left = ""
   document.body.style.right = ""
   document.body.style.width = ""
   document.body.style.overflow = ""

   if(scrollY){
    window.scrollTo(0, parseInt(scrollY || "0") * -1)
   }

  }

  return ()=>{

   document.body.style.position = ""
   document.body.style.top = ""
   document.body.style.left = ""
   document.body.style.right = ""
   document.body.style.width = ""
   document.body.style.overflow = ""

  }

 },[locked])

}
