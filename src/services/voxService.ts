const BASE_URL = "http://localhost:3000/oratio/voxai"

/* =========================
   HELPER TOKEN
========================= */

function getAuthHeaders(){
 const token = localStorage.getItem("access_token")

 return {
  "Content-Type":"application/json",
  "Authorization":`Bearer ${token}`
 }
}

/* =========================
   CRIAR CONVERSA
========================= */

export async function createConversation(){

 try{

  const res = await fetch(`${BASE_URL}/conversation`,{
   method:"POST",
   headers:getAuthHeaders()
  })

  if(!res.ok) throw new Error()

  return await res.json()

 }catch{
  return null
 }

}

/* =========================
   ENVIAR MENSAGEM
========================= */

export async function askVox(
 message:string,
 conversationId:string
){

 try{

  const res = await fetch(`${BASE_URL}/chat`,{
   method:"POST",
   headers:getAuthHeaders(),
   body:JSON.stringify({
    message,
    conversationId
   })
  })

  if(!res.ok) throw new Error()

  return await res.json()

 }catch{

  return{
   success:false,
   response:"Erro ao conectar com o Vox."
  }

 }

}

/* =========================
   LISTAR CONVERSAS
========================= */

export async function getConversations(){

 try{

  const res = await fetch(`${BASE_URL}/conversations`,{
   headers:getAuthHeaders()
  })

  if(!res.ok) throw new Error()

  return await res.json()

 }catch{
  return []
 }

}

/* =========================
   PEGAR MENSAGENS
========================= */

export async function getMessages(conversationId:string){

 try{

  const res = await fetch(
   `${BASE_URL}/conversation/${conversationId}`,
   {
    headers:getAuthHeaders()
   }
  )

  if(!res.ok) throw new Error()

  return await res.json()

 }catch{
  return []
 }

}