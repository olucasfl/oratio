import api from "./api"

export const startConsecration = async (date:string)=>{

 const res = await api.post("/oratio/consecration/start",{
  startDate:date
 })

 return res.data
}

export const getProgress = async ()=>{

 const res = await api.get("/oratio/consecration/progress")
 return res.data

}

export const getDay = async (day:number)=>{

 const res = await api.get(`/oratio/consecration/day/${day}`)
 return res.data

}