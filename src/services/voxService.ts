import api from "./api"

const BASE_URL = "/oratio/voxai"

/* =========================
   BOOTSTRAP (lista + conversa ativa numa só chamada)
========================= */

export async function getBootstrap(){
  try {
    const res = await api.get(`${BASE_URL}/bootstrap`)
    return res.data
  } catch {
    return {
      error: "FETCH_ERROR",
      message: "Não foi possível carregar suas conversas."
    }
  }
}

/* =========================
   GET ACTIVE CONVERSATION
========================= */

export async function getActiveConversation(){
  try {
    const res = await api.get(`${BASE_URL}/conversation/active`)
    return res.data
  } catch {
    return {
      error: "FETCH_ERROR",
      message: "Não foi possível obter a conversa ativa."
    }
  }
}

/* =========================
   CREATE CONVERSATION
========================= */

export async function createConversation(){
  try {
    const res = await api.post(`${BASE_URL}/conversation`)
    return res.data
  } catch {
    return {
      error: "FETCH_ERROR",
      message: "Não foi possível criar nova conversa."
    }
  }
}

/* =========================
   ASK VOX
========================= */

export async function askVox(message:string, conversationId:string){
  try {
    const res = await api.post(`${BASE_URL}/chat`, {
      message,
      conversationId
    })

    return res.data

  } catch (error:any) {

    if (error.response?.status === 429) {
      return {
        success:false,
        error:"LIMIT_EXCEEDED",
        message:"Limite diário atingido."
      }
    }

    if (!error.response) {
      return {
        success:false,
        error:"NETWORK_ERROR",
        message:"Sem conexão com a internet."
      }
    }

    return {
      success:false,
      error:"AI_PROVIDER_ERROR",
      message:"Erro na comunicação com o Vox."
    }
  }
}

/* =========================
   GET CONVERSATIONS
========================= */

export async function getConversations(){
  try {
    const res = await api.get(`${BASE_URL}/conversations`)
    return res.data
  } catch {
    return null
  }
}

/* =========================
   GET MESSAGES
========================= */

export async function getMessages(conversationId:string){
  try {
    const res = await api.get(`${BASE_URL}/conversation/${conversationId}`)
    return res.data
  } catch {
    return null
  }
}

/* =========================
   DELETE
========================= */

export async function deleteConversation(conversationId:string){
  try {
    const res = await api.delete(`${BASE_URL}/conversation/${conversationId}`)
    return res.data
  } catch {
    return null
  }
}

/* =========================
   RENAME
========================= */

export async function renameConversation(conversationId:string, title:string){
  try {
    const res = await api.patch(`${BASE_URL}/conversation/${conversationId}`, {
      title
    })
    return res.data
  } catch {
    return null
  }
}