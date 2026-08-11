import api from "./api"
import { isLoggedIn } from "../utils/auth"

export type ReadingKind = "BIBLE" | "CATECHISM"

/*
 Grava onde a pessoa parou numa frente de leitura (Bíblia / Catecismo),
 pra alimentar a seção "Para você hoje" da Home.

 - Só faz sentido pra quem tem conta (o progresso é salvo por usuário).
 - Silencioso de propósito: é um "nice to have" em background; se a
   chamada falhar, a leitura em si não pode ser prejudicada.
*/
export async function saveReadingProgress(
 kind:ReadingKind,
 reference:string,
 label:string
):Promise<void>{

 if(!isLoggedIn()) return

 try{
  await api.put("/oratio/reading-progress", { kind, reference, label })
 }catch{
  /* progresso de leitura é best-effort — nunca quebra a leitura */
 }

}
