import api from "./api"

/*
 Liturgia do dia. Sem `dia/mes/ano` o backend devolve a de hoje.

 Passa pelo `api` compartilhado — e portanto por `VITE_API_URL` — de propósito:
 este hook chamava `https://finance-api-y0ol.onrender.com/liturgia` com `fetch`
 cru, o que fazia o dev local sempre bater na liturgia de PRODUÇÃO, mesmo com o
 backend rodando na máquina. Testar uma mudança de liturgia localmente era
 impossível sem editar o arquivo.
*/
export async function getLiturgia(dia?:string, mes?:string, ano?:number){

 const res = await api.get("/liturgia", {
  params: dia ? { dia, mes, ano } : undefined
 })

 return res.data

}

export async function getLiturgiaFull(dia:string, mes:string, ano:number){

 const res = await api.get("/liturgia/full", {
  params:{ dia, mes, ano }
 })

 return res.data

}
