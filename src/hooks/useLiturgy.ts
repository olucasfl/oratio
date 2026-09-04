import { useEffect, useMemo, useState } from "react"
import { getLiturgia } from "../services/liturgiaService"

export type LiturgyReading = {
 tipo?: string
 titulo?: string
 referencia?: string
 texto?: string
 refrao?: string
}

export type LiturgyData = {
 data?: string
 liturgia?: string
 cor?: string
 leituras?: {
  primeiraLeitura?: LiturgyReading[]
  segundaLeitura?: LiturgyReading[]
  salmo?: LiturgyReading[]
  evangelho?: LiturgyReading[]
  extras?: LiturgyReading[]
 }
}

const LITURGY_CACHE_KEY =
"last_liturgy"

export function useLiturgy(initialOffset = 0){

 const today = useMemo(
  ()=>new Date().toLocaleDateString("pt-BR"),
 [])

 const [liturgy,setLiturgy] =
  useState<LiturgyData | null>(null)

 const [loadingLiturgy,setLoadingLiturgy] =
  useState(true)

 const [liturgyError,setLiturgyError] =
  useState<string | null>(null)

 const [dateOffset,setDateOffset] =
  useState(initialOffset)

 const displayDateStr = useMemo(()=>{
  const d = new Date()
  d.setDate(d.getDate() + dateOffset)
  return d.toLocaleDateString("pt-BR")
 },[dateOffset])

 const displayDateLabel = useMemo(()=>{
  if(dateOffset === 0) return "Hoje"
  if(dateOffset === -1) return "Ontem"
  if(dateOffset === 1) return "Amanhã"
  return displayDateStr
 },[dateOffset, displayDateStr])

 function loadLiturgyFromCache(){

  const saved =
  localStorage.getItem(
   LITURGY_CACHE_KEY
  )

  if(!saved) return

  try{

   const parsed =
   JSON.parse(saved)

   if(parsed?.date === today){

    setLiturgy(parsed.data)

   }

  }catch{

   localStorage.removeItem(
    LITURGY_CACHE_KEY
   )

  }

 }

 async function loadLiturgy(){

  setLoadingLiturgy(true)

  setLiturgyError(null)

  const d = new Date()
  d.setDate(d.getDate() + dateOffset)

  const dia = String(d.getDate()).padStart(2,"0")
  const mes = String(d.getMonth()+1).padStart(2,"0")
  const ano = d.getFullYear()

  try{

   const data = dateOffset === 0
    ? await getLiturgia()
    : await getLiturgia(dia, mes, ano)

   setLiturgy(data)

   if(dateOffset === 0){
    localStorage.setItem(
     LITURGY_CACHE_KEY,
     JSON.stringify({ date:today, data })
    )
   }

  }catch{

   setLiturgyError(
    "Não foi possível carregar a liturgia agora."
   )

  }finally{

   setLoadingLiturgy(false)

  }

 }

 useEffect(()=>{

  if(dateOffset === 0){
   loadLiturgyFromCache()
  }else{
   setLiturgy(null)
  }

  void loadLiturgy()

 },[dateOffset])

 return {
  liturgy,
  loadingLiturgy,
  liturgyError,
  dateOffset,
  setDateOffset,
  displayDateLabel,
  reloadLiturgy: loadLiturgy
 }

}
