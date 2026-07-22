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
   ASK VOX (STREAMING)
========================= */

interface StreamResult{
  success: boolean
  error?: string
  message?: string
  retryAfterSeconds?: number
}

/*
Reaproveita a instância `api` (axios) de propósito, em vez de um fetch()
cru — assim o header de autenticação e o refresh automático de token em
401 (já configurados nos interceptors de api.ts) continuam funcionando
sem duplicar nada aqui.

A técnica: com responseType "text" e onDownloadProgress, o XHR por
baixo do axios vai expondo o texto da resposta conforme ele chega
(event.target.responseText cresce a cada pedaço). Cada callback recebe
o texto ACUMULADO até agora, não só o pedaço novo — por isso o parser
guarda quantas linhas já processou (processedLines) em vez de tentar
separar "o que é novo" ingenuamente, o que quebraria toda vez que um
evento SSE fosse cortado ao meio entre dois pedaços de rede.
*/
export async function askVoxStream(
  message: string,
  conversationId: string,
  onDelta: (text:string) => void
): Promise<StreamResult>{

  let processedLines = 0
  let sawDone = false
  let streamError: StreamResult | null = null

  function consume(fullText: string, isFinal: boolean){

    const lines = fullText.split("\n")
    // a última linha pode estar incompleta (o evento ainda não terminou
    // de chegar) — só processa ela quando isFinal garantir que acabou
    const completeCount = isFinal ? lines.length : lines.length - 1

    for(let i = processedLines; i < completeCount; i++){

      const line = lines[i].trim()
      if(!line.startsWith("data:")) continue

      const jsonStr = line.slice(5).trim()
      if(!jsonStr) continue

      try{
        const evt = JSON.parse(jsonStr)

        if(evt.type === "delta" && typeof evt.text === "string"){
          onDelta(evt.text)
        }else if(evt.type === "done"){
          sawDone = true
        }else if(evt.type === "error"){
          streamError = {
            success:false,
            error: evt.error,
            message: evt.message,
            retryAfterSeconds: evt.retryAfterSeconds
          }
        }
      }catch{
        // JSON incompleto — não deveria acontecer já que só processamos
        // linhas "completas", mas se acontecer é só ignorar
      }
    }

    processedLines = completeCount
  }

  try{

    const res = await api.post(`${BASE_URL}/chat/stream`, { message, conversationId }, {
      responseType: "text",
      onDownloadProgress: (progressEvent: any) => {
        const fullText: string = progressEvent?.event?.target?.responseText ?? ""
        if(fullText) consume(fullText, false)
      }
    })

    // garante que a última linha (só confirmada completa agora que a
    // requisição inteira terminou) também é processada
    consume(typeof res.data === "string" ? res.data : "", true)

    if(streamError) return streamError

    if(!sawDone){
      return {
        success:false,
        error:"UNKNOWN_ERROR",
        message:"A resposta foi interrompida antes de terminar."
      }
    }

    return { success:true }

  }catch(error:any){

    if(error.response?.status === 429){
      return {
        success:false,
        error:"LIMIT_EXCEEDED",
        message:"Limite diário atingido."
      }
    }

    if(!error.response){
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