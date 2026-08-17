import api from "./api"
import { saveLocal, getLocal } from "../utils/localCache"

const DAYS_KEY = "oratio_consecration_days"
const ALL_DAYS_KEY = "oratio_consecration_all_days"

export type ConsecrationProgress = {
  started: boolean
  startDate?: string
  consecrationDate?: string
  currentDay?: number
  startedToday?: boolean
  daysUntilStart?: number
  completedDays?: number[]
  progress?: number
  finished?: boolean
  completedAt?: string | null
  stages?: any[]
}

/**
 * Namespace de cache por usuário — deriva do `sub` do access_token (sem
 * precisar de request nem de libs extras). Sem isso, o progresso de uma
 * conta podia sobreviver no localStorage e "vazar" pra outra conta usada
 * no mesmo aparelho quando a leitura online falhava e caía no cache.
 */
function currentUserId(): string {
  try {
    const token = localStorage.getItem("access_token")
    if (!token) return "anon"
    const payload = token.split(".")[1]
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
    return json?.sub ?? "anon"
  } catch {
    return "anon"
  }
}

function progressKey() {
  return `oratio_consecration_progress_${currentUserId()}`
}

/* ============================= */
/* PRELOAD ALL DAYS */
/* ============================= */

export async function preloadConsecration(){

  const cached = getLocal(ALL_DAYS_KEY)

  /* ============================= */
  /* 1. SE TEM CACHE → USA */
  /* ============================= */

  if(cached){

    /* ============================= */
    /* 2. ATUALIZA EM BACKGROUND */
    /* ============================= */

    api.get("/oratio/consecration/all-days")
      .then(res => {

        const days = res.data

        saveLocal(ALL_DAYS_KEY, days, 60)

        days.forEach((day:any)=>{
          saveLocal(`${DAYS_KEY}_${day.dayNumber}`, day, 60)
        })

      })
      .catch(() => {})

    return

  }

  /* ============================= */
  /* 3. SEM CACHE → API NORMAL */
  /* ============================= */

  try{

    const res = await api.get("/oratio/consecration/all-days")

    const days = res.data

    saveLocal(ALL_DAYS_KEY, days, 60)

    days.forEach((day:any)=>{
      saveLocal(`${DAYS_KEY}_${day.dayNumber}`, day, 60)
    })

  }catch{}

}

/** Todos os dias (com orações), já agrupados por etapa. Usa cache. */
export async function getAllDays(): Promise<any[]> {

  const cached = getLocal(ALL_DAYS_KEY)
  if (cached) return cached

  const res = await api.get("/oratio/consecration/all-days")
  saveLocal(ALL_DAYS_KEY, res.data, 60)
  return res.data

}

/* ============================= */
/* PROGRESS */
/* ============================= */

export async function getProgress(): Promise<ConsecrationProgress | null> {

 try{

  const res = await api.get("/oratio/consecration/progress")

  saveLocal(progressKey(), res.data, 5)

  return res.data

 }catch{

  return getLocal(progressKey())

 }

}

/** Progresso salvo no aparelho, sem tocar na rede. */
export function getCachedProgress(): ConsecrationProgress | null {
  return getLocal(progressKey())
}

/* ============================= */
/* START */
/* ============================= */

export async function startConsecration(consecrationDate:string){

  await api.post("/oratio/consecration/start",{
   consecrationDate
  })

}

/* ============================= */
/* GET DAY */
/* ============================= */

export async function getDay(day:number){

 const cached = getLocal(`${DAYS_KEY}_${day}`)

 if(cached) return cached

 try{

  const res = await api.get(`/oratio/consecration/day/${day}`)

  saveLocal(`${DAYS_KEY}_${day}`,res.data, 60)

  return res.data

 }catch{

  const cached = getLocal(`${DAYS_KEY}_${day}`)

  if(cached) return cached

  throw new Error("Sem conexão")

 }

}

/* ============================= */
/* COMPLETE / UNDO DAY */
/* ============================= */

export async function completeDay(day:number){
  await api.post(`/oratio/consecration/complete/${day}`)
}

export async function uncompleteDay(day:number){
  await api.delete(`/oratio/consecration/complete/${day}`)
}

/* ============================= */
/* UPDATE CONSECRATION DATE */
/* ============================= */

export async function updateStartDate(consecrationDate:string){

  await api.put("/oratio/consecration/consecration-date",{
    consecrationDate
  })

}

/* ============================= */
/* FINISH (concluir os 33 dias) */
/* ============================= */

export async function finishConsecration(){
  await api.post("/oratio/consecration/finish")
}

/* ============================= */
/* RESET (cancelar) */
/* ============================= */

export async function resetConsecration(){

 removeLocalProgress()

 await api.post("/oratio/consecration/reset")

}

function removeLocalProgress(){
  localStorage.removeItem(progressKey())
}

/** Mensagem de erro que o backend mandou, se houver — senão o fallback. */
export function apiErrorMessage(err: any, fallback: string) {
  const message = err?.response?.data?.message
  if (Array.isArray(message)) return message[0] ?? fallback
  if (typeof message === "string") return message
  return fallback
}
