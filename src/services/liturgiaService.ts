import api from "./api"

export async function getLiturgiaFull(dia:string, mes:string, ano:number){

 const res = await api.get("/liturgia/full", {
  params:{ dia, mes, ano }
 })

 return res.data

}
