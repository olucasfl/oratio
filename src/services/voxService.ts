const BASE_URL = "https://finance-api-y0ol.onrender.com/oratio/voxai"

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

async function parseJson(response: Response){
 try{
  return await response.json()
 }catch{
  return null
 }
}

export async function getActiveConversation(){

 try{

  const res = await fetch(`${BASE_URL}/conversation/active`,{
   headers:getAuthHeaders()
  })

  if(!res.ok){
   if(res.status === 401){
    return { error:"UNAUTHORIZED", status:401 }
   }

   const body = await parseJson(res)
   return {
    error:"FETCH_ERROR",
    status:res.status,
    message: body?.message || "Não foi possível obter a conversa ativa."
   }
  }

  return await res.json()

 }catch(error:any){
  return {
   error:"NETWORK_ERROR",
   message: error?.message || "Não foi possível conectar ao servidor."
  }
 }

}

export async function createConversation(){

 try{

  const res = await fetch(`${BASE_URL}/conversation`,{
   method:"POST",
   headers:getAuthHeaders()
  })

  if(!res.ok){
   if(res.status === 401){
    return { error:"UNAUTHORIZED", status:401 }
   }

   const body = await parseJson(res)
   return {
    error:"FETCH_ERROR",
    status:res.status,
    message: body?.message || "Não foi possível criar nova conversa."
   }
  }

  return await res.json()

 }catch(error:any){
  return {
   error:"NETWORK_ERROR",
   message: error?.message || "Não foi possível conectar ao servidor."
  }
 }

}

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

  if(!res.ok){
   const body = await parseJson(res)

   if(res.status === 401){
    return {
     success:false,
     error:"UNAUTHORIZED",
     message: body?.message || "Sessão expirada."
    }
   }

   if(res.status === 429){
    return {
     success:false,
     error:"LIMIT_EXCEEDED",
     message: body?.message || "Limite diário atingido."
    }
   }

   return {
    success:false,
    error:"AI_PROVIDER_ERROR",
    message: body?.message || "Erro na comunicação com o Vox."
   }
  }

  return await res.json()

 }catch(error:any){
  const message = error?.name === "AbortError"
   ? "A requisição para o Vox expirou."
   : "Erro ao conectar com o Vox."

  return{
   success:false,
   error:"NETWORK_ERROR",
   message
  }
 }

}

export async function getConversations(){

 try{

  const res = await fetch(`${BASE_URL}/conversations`,{
   headers:getAuthHeaders()
  })

  if(!res.ok){
   return null
  }

  return await res.json()

 }catch{
  return null
 }

}

export async function getMessages(conversationId:string){

 try{

  const res = await fetch(
   `${BASE_URL}/conversation/${conversationId}`,
   {
    headers:getAuthHeaders()
   }
  )

  if(!res.ok){
   return null
  }

  return await res.json()

 }catch{
  return null
 }

}

export async function deleteConversation(conversationId:string){

 try{

  const res = await fetch(
   `${BASE_URL}/conversation/${conversationId}`,
   {
    method:"DELETE",
    headers:getAuthHeaders()
   }
  )

  if(!res.ok) throw new Error()

  return await res.json()

 }catch{
  return null
 }

}

export async function renameConversation(
 conversationId:string,
 title:string
){

 try{

  const res = await fetch(
   `${BASE_URL}/conversation/${conversationId}`,
   {
    method:"PATCH",
    headers:getAuthHeaders(),
    body:JSON.stringify({ title })
   }
  )

  if(!res.ok) throw new Error()

  return await res.json()

 }catch{
  return null
 }

}