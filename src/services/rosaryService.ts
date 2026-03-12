import api from "./api"

/* =========================
GET ROSARY (estrutura do terço)
========================= */

export async function getRosary(type:string){

 try{

  const res = await api.get(`/oratio/rosary/${type}`)

  return res.data

 }catch(error){

  console.error("Erro ao buscar terço:", error)

  throw error

 }

}


/* =========================
START ROSARY SESSION
========================= */

export async function startRosary(){

 try{

  const res = await api.post("/oratio/rosary/start")

  return res.data

 }catch(error){

  console.error("Erro ao iniciar terço:", error)

  throw error

 }

}


/* =========================
FINISH ROSARY
========================= */

export async function finishRosary(){

 try{

  const res = await api.post("/oratio/rosary/finish")

  return res.data

 }catch(error){

  console.error("Erro ao finalizar terço:", error)

  throw error

 }

}