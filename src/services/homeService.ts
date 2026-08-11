import api from "./api"

export type HomeSuggestion = {
 id:string
 kind:"rosary" | "bible" | "catechism" | "gospel"
 title:string
 subtitle:string
 why:string
 icon:string
 path:string
}

/* Sugestões dinâmicas da seção "Para você hoje" (backend). */
export async function getHomeFeed():Promise<{ suggestions:HomeSuggestion[] }>{

 const res = await api.get("/oratio/home/feed")
 return res.data

}
