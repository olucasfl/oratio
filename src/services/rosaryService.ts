import api from "./api"

export async function getRosary(type:string){

 const res = await api.get(`/oratio/rosary/${type}`)
 return res.data

}

export async function startRosary(type:string, restart?:boolean){

 const res = await api.post("/oratio/rosary/start", { type, restart })
 return res.data

}

export async function updateRosaryStep(type:string, step:number, elapsedSeconds?:number){

 const res = await api.post("/oratio/rosary/step", { type, step, elapsedSeconds })
 return res.data

}

export async function finishRosary(type:string){

 const res = await api.post("/oratio/rosary/finish", { type })
 return res.data

}

export async function getRosarySession(type:string){

 const res = await api.get("/oratio/rosary/session", { params:{ type } })
 return res.data

}

export async function getRosaryProgress(){

 const res = await api.get("/oratio/rosary/progress")
 return res.data

}

export async function getRosaryHistory(){

 const res = await api.get("/oratio/rosary/history")
 return res.data

}
