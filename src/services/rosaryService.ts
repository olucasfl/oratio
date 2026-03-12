import api from "./api"

export async function getRosary(type:string){

 const res = await api.get(`/oratio/rosary/${type}`)
 return res.data

}

export async function startRosary(){

 const res = await api.post("/oratio/rosary/start")
 return res.data

}

export async function finishRosary(){

 const res = await api.post("/oratio/rosary/finish")
 return res.data

}

export async function getRosarySession(){

 const res = await api.get("/oratio/rosary/session")
 return res.data

}