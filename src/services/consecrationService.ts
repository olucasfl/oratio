import api from "./api"
import { saveLocal, getLocal } from "../utils/localCache"

const PROGRESS_KEY = "oratio_consecration_progress"
const DAYS_KEY = "oratio_consecration_days"
const ALL_DAYS_KEY = "oratio_consecration_all_days"

/* ============================= */
/* PRELOAD ALL DAYS */
/* ============================= */

export async function preloadConsecration(){

  const cached = getLocal(ALL_DAYS_KEY)

  /* ============================= */
  /* 1. SE TEM CACHE → USA */
  /* ============================= */

  if(cached){
    console.log("Usando cache da consagração")

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

        const stages:any = {}

        days.forEach((day:any)=>{
          const stageId = day.stage.id

          if(!stages[stageId]){
            stages[stageId] = []
          }

          stages[stageId].push(day)
        })

        Object.keys(stages).forEach(stageId=>{
          saveLocal(`stage_${stageId}`, stages[stageId], 60)
        })

        console.log("Cache atualizado em background")

      })
      .catch(() => {
        console.log("Erro ao atualizar em background")
      })

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

    const stages:any = {}

    days.forEach((day:any)=>{
      const stageId = day.stage.id

      if(!stages[stageId]){
        stages[stageId] = []
      }

      stages[stageId].push(day)
    })

    Object.keys(stages).forEach(stageId=>{
      saveLocal(`stage_${stageId}`, stages[stageId], 60)
    })

    console.log("Consagração carregada da API")

  }catch{
    console.log("Erro no preload")
  }
}

/* ============================= */
/* PROGRESS */
/* ============================= */

export async function getProgress(){

 try{

  const res = await api.get("/oratio/consecration/progress")

  saveLocal(PROGRESS_KEY, res.data, 5)

  return res.data

 }catch{

  const cached = getLocal(PROGRESS_KEY)

  if(cached) return cached

  return null

 }

}

/* ============================= */
/* START */
/* ============================= */

export async function startConsecration(consecrationDate:string){

 try{

  await api.post("/oratio/consecration/start",{
   consecrationDate
  })

 }catch(err){

  console.log("Erro ao iniciar consagração",err)

 }

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
/* STAGE DAYS */
/* ============================= */

export async function getStageDays(stageId:string){

 const cached = getLocal(`stage_${stageId}`)

 if(cached) return cached

 try{

  const res = await api.get(`/oratio/consecration/stage/${stageId}/days`)

  saveLocal(`stage_${stageId}`,res.data, 60)

  return res.data

 }catch{

  const cached = getLocal(`stage_${stageId}`)

  if(cached) return cached

  throw new Error("Sem conexão")

 }

}

/* ============================= */
/* COMPLETE DAY */
/* ============================= */

export async function completeDay(day:number){

 const progress = getLocal(PROGRESS_KEY)

 if(progress){

  progress.completedDays = day
  progress.currentDay = day + 1

  saveLocal(PROGRESS_KEY,progress)

 }

 try{

  await api.post(`/oratio/consecration/complete/${day}`)

 }catch{}

}

/* ============================= */
/* UNCOMPLETE DAY */
/* ============================= */

export async function uncompleteDay(day:number){

 const progress = getLocal(PROGRESS_KEY)

 if(progress){

  progress.completedDays = day - 1
  progress.currentDay = day

  saveLocal(PROGRESS_KEY,progress)

 }

 try{

  await api.delete(`/oratio/consecration/complete/${day}`)

 }catch{}

}

/* ============================= */
/* UPDATE CONSECRATION DATE */
/* ============================= */

export async function updateStartDate(consecrationDate:string){

 const progress = getLocal(PROGRESS_KEY)

 if(progress){

  progress.startDate = consecrationDate

  saveLocal(PROGRESS_KEY,progress)

 }

 try{

  await api.put("/oratio/consecration/consecration-date",{
   consecrationDate
  })

 }catch{}

}

/* ============================= */
/* RESET */
/* ============================= */

export async function resetConsecration(){

 localStorage.removeItem(PROGRESS_KEY)

 try{

  await api.post("/oratio/consecration/reset")

 }catch{}

}