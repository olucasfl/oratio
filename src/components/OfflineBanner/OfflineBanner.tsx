import { useEffect, useRef, useState } from "react"
import { WifiOff, Wifi } from "lucide-react"

import { useOffline } from "../../hooks/useOffline"

import styles from "./OfflineBanner.module.css"

export default function OfflineBanner(){

 const isOffline = useOffline()
 const [showBackOnline,setShowBackOnline] = useState(false)
 const wasOffline = useRef(isOffline)

 useEffect(()=>{

  if(wasOffline.current && !isOffline){

   setShowBackOnline(true)

   const timer = setTimeout(()=>setShowBackOnline(false), 2500)

   wasOffline.current = isOffline

   return ()=>clearTimeout(timer)

  }

  wasOffline.current = isOffline

 },[isOffline])

 if(!isOffline && !showBackOnline) return null

 return(

  <div className={`${styles.banner} ${isOffline ? styles.offline : styles.online}`}>

   {isOffline ? (
    <><WifiOff size={15}/> Você está offline</>
   ) : (
    <><Wifi size={15}/> Conexão restabelecida</>
   )}

  </div>

 )

}
