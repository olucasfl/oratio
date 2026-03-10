import api from "./api"

export async function getProgress(){

 const res = await api.get("/oratio/consecration/progress")

 return res.data

}

export async function startConsecration(startDate:string){

 const res = await api.post("/oratio/consecration/start",{
  startDate
 })

 return res.data

}

export async function getDay(day:number){

 const res = await api.get(`/oratio/consecration/day/${day}`)

 return res.data

}

export async function getStageDays(stageId:string){

 const res = await api.get(`/oratio/consecration/stage/${stageId}/days`)

 return res.data

}

export async function completeDay(day:number){

 const res = await api.post(`/oratio/consecration/complete/${day}`)

 return res.data

}

export async function updateStartDate(startDate:string){

 const res = await api.put(
  "/oratio/consecration/start-date",
  {startDate}
 )

 return res.data

}

export async function resetConsecration(){

 const res = await api.post("/oratio/consecration/reset")

 return res.data

}