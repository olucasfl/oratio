import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import styles from "./Vox.module.css"

import { Plus } from "lucide-react"
import { Menu } from "lucide-react"
import { Trash2, Pencil } from "lucide-react"
import { deleteConversation, renameConversation } from "../../services/voxService"

import {
 askVox,
 createConversation,
 getConversations,
 getMessages,
 getActiveConversation
} from "../../services/voxService"

interface Message{
 id:string
 role:"user" | "assistant"
 content:string
}

interface Conversation{
 id:string
 title:string
 hasMessages?: boolean
}

interface VoxAskResponse{
 success:boolean
 response?:string
 error?:string
 message?:string
}

export default function Vox(){

 const navigate = useNavigate()

 const [messages,setMessages] = useState<Message[]>([])
 const [input,setInput] = useState("")
 const [loading,setLoading] = useState(false)
 const [loadingConversation,setLoadingConversation] = useState(false)

 const [conversationId,setConversationId] = useState<string | null>(null)
 const [conversations,setConversations] = useState<Conversation[]>([])
 const [menuOpen,setMenuOpen] = useState(false)

 const [renameOpen,setRenameOpen] = useState(false)
 const [renameValue,setRenameValue] = useState("")
 const [selectedConv,setSelectedConv] = useState<string | null>(null)
 const [renaming,setRenaming] = useState(false)
 const [deletingConversationId,setDeletingConversationId] = useState<string | null>(null)

 const [error,setError] = useState<string | null>(null)

 const bottomRef = useRef<HTMLDivElement | null>(null)
 const textareaRef = useRef<HTMLTextAreaElement | null>(null)

 const initialized = useRef(false)
 const openConversationRequest = useRef(0)

 /* =========================
    SCROLL
 ========================= */

 useEffect(()=>{
  setTimeout(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"})
  },50)
 },[messages])

 useEffect(() => {
  if (menuOpen) {
    document.body.style.overflow = "hidden"
    document.body.style.touchAction = "none"
  } else {
    document.body.style.overflow = ""
    document.body.style.touchAction = ""
  }

  return () => {
    document.body.style.overflow = ""
    document.body.style.touchAction = ""
  }
}, [menuOpen])

useEffect(()=>{
  if(initialized.current) return
  initialized.current = true

  setTimeout(()=>{
    init()
  }, 0)
},[])

 useEffect(()=>{
  textareaRef.current?.focus()
 },[])

 async function init(){

    try{

      setError(null)
      setLoadingConversation(true)

      const list = await getConversations()

      if(Array.isArray(list)){
        setConversations(list)
      }

      const active = await getActiveConversation()

      if(active?.error){

        if(list?.[0]?.id){
          await openConversation(list[0].id)
          return
        }

        const conv = await createConversation()
        if(!conv?.id){
          throw new Error()
        }

        await openConversation(conv.id)
        return
      }

      if(!active?.id){

        if(list?.[0]?.id){
          await openConversation(list[0].id)
          return
        }

        const conv = await createConversation()
        if(!conv?.id){
          throw new Error()
        }

        await openConversation(conv.id)
        return
      }

      await openConversation(active.id)

      const finalList = await getConversations()

      if(Array.isArray(finalList)){
        setConversations(finalList)
      }

    }catch{
      setError("Não foi possível carregar suas conversas.")
    }finally{
      setLoadingConversation(false)
    }
  }

 /* =========================
    ABRIR CONVERSA
 ========================= */

 async function openConversation(id:string){
  const requestId = ++openConversationRequest.current

  try{

    setError(null)
    setConversationId(id)
    setMenuOpen(false)
    setLoadingConversation(true)

    const msgs = await getMessages(id)

    if(requestId !== openConversationRequest.current) return

    setMessages(msgs || [])

  }catch{
    setError("Erro ao abrir conversa.")
  }finally{
    if(requestId === openConversationRequest.current){
      setLoadingConversation(false)
    }
  }
 }

 /* =========================
    NOVA CONVERSA (🔥 LIMPO)
 ========================= */

 async function handleNewConversation(){

  try{

    setLoadingConversation(true)
    setError(null)

    const conv = await createConversation()

    if(!conv?.id) throw new Error()

    await openConversation(conv.id)

    setMenuOpen(false)

  }catch{
    setError("Erro ao criar nova conversa.")
  } finally {
    setLoadingConversation(false)
  }
 }

 /* =========================
    ENVIAR
 ========================= */

 async function sendMessage(){

  const text = input.trim()

  if(!text || loading || loadingConversation || !conversationId) return

  if(text.length > 1000){
    setError("A mensagem deve ter no máximo 1000 caracteres.")
    return
  }

  const userMessage:Message={
    id:crypto.randomUUID(),
    role:"user",
    content:text
  }

  setMessages(prev => [...prev,userMessage])
  setInput("")

  if(textareaRef.current){
    textareaRef.current.style.height = "auto"
  }

  setLoading(true)
  setError(null)

  try{
    const res = await askVox(text, conversationId) as VoxAskResponse

    if(!res?.success || !res?.response){

      if(res?.error === "RATE_LIMIT"){
        setError("Você está enviando mensagens muito rápido.")
      }else if(res?.error === "MESSAGE_TOO_LONG"){
        setError("A mensagem deve ter no máximo 1000 caracteres.")
      }else if(res?.error === "INVALID_CONVERSATION"){
        setError("Conversa inválida. Recarregue a página.")
      }else if(res?.error === "EMPTY_MESSAGE"){
        setError("Digite uma mensagem antes de enviar.")
      }else if(res?.error === "TIMEOUT"){
        setError("O Vox demorou para responder. Tente novamente.")
      }else if(res?.error === "LIMIT_EXCEEDED"){
        setError("Limite diário atingido.")
      }else if(res?.error === "NETWORK_ERROR"){
        setError("Erro de conexão. Verifique sua internet.")
      }else if(res?.error === "AI_PROVIDER_ERROR"){
        setError("Erro na comunicação com a IA.")
      }else{
        setError(res?.message || "Erro inesperado no envio da mensagem.")
      }

      return
    }

    const aiMessage:Message={
      id:crypto.randomUUID(),
      role:"assistant",
      content: res.response
    }

    setMessages(prev => [...prev,aiMessage])

    const list = await getConversations()
    if(Array.isArray(list)){
      setConversations(list)
    }

  }catch(error:any){
    setError("Erro ao processar sua mensagem.")

  }finally{
    setLoading(false)
  }
 }

 /* =========================
    ENTER
 ========================= */

 function handleKey(e:React.KeyboardEvent<HTMLTextAreaElement>){
  if(e.key==="Enter" && !e.shiftKey && !loading){
   e.preventDefault()
   sendMessage()
  }
 }

 // DELETAR CONVERSATION

 async function handleDeleteConversation(id:string){

  const confirmDelete = confirm("Tem certeza que deseja apagar essa conversa?")
  if(!confirmDelete) return

  try{
    setDeletingConversationId(id)
    setError(null)

    const newConv = await deleteConversation(id)
    if(!newConv?.id){
      throw new Error("DELETE_FAILED")
    }

    const list = await getConversations()
    if(Array.isArray(list)){
      setConversations(list)
    }
    await openConversation(newConv.id)
  }catch{
    setError("Não foi possível apagar a conversa.")
  }finally{
    setDeletingConversationId(null)
  }
  }

  //RENAME CONVERSATION

  function openRename(id:string, title:string){
    setSelectedConv(id)
    setRenameValue(title)
    setRenameOpen(true)
  }

  async function handleRename(){

    const trimmed = renameValue.trim()

    if(!selectedConv || !trimmed) return

    if(trimmed.length > 50){
      setError("O nome da conversa deve ter no máximo 50 caracteres.")
      return
    }

    try{
      setRenaming(true)
      setError(null)

      const updated = await renameConversation(selectedConv, trimmed)
      if(!updated){
        throw new Error("RENAME_FAILED")
      }

      const list = await getConversations()
      if(Array.isArray(list)){
        setConversations(list)
      }

      setRenameOpen(false)
      setRenameValue("")
      setSelectedConv(null)
    }catch{
      setError("Não foi possível renomear a conversa.")
    }finally{
      setRenaming(false)
    }
  }

 /* =========================
    AUTO RESIZE
 ========================= */

 function handleChange(e:React.ChangeEvent<HTMLTextAreaElement>){

  setError(null)
  setInput(e.target.value)

  const el = textareaRef.current
  if(!el) return

  el.style.height = "auto"
  el.style.height = el.scrollHeight+"px"
 }

 return(

  <div className={styles.container}>

   {menuOpen && (
    <div
     className={styles.overlay}
     onClick={()=>setMenuOpen(false)}
    />
   )}

   <aside className={`${styles.sidebar} ${menuOpen ? styles.open : ""}`}>

    <div className={styles.sidebarHeader}>

      <button
        className={styles.newChatButton}
        onClick={handleNewConversation}
        disabled={loadingConversation}
      >
        {loadingConversation ? (
          <div className={styles.spinner}></div>
        ) : (
          <>
            <Plus size={18} />
            Nova conversa
          </>
        )}
      </button>

    </div>

    <p className={styles.sidebarTitle}>Suas conversas</p>
    <p className={styles.sidebarSubtitle}>
     Retome suas perguntas com o Vox
    </p>

    <div className={styles.conversationList}>

     {conversations.map(conv => (

      <div
       key={conv.id}
       className={`${styles.conversationItem} ${
        conv.id === conversationId ? styles.active : ""
       }`}
       onClick={()=>openConversation(conv.id)}
      >
       <div className={styles.conversationContent}>

          <span className={styles.conversationTitle}>
            {conv.title || "Nova conversa"}
          </span>

        {conv.hasMessages && (
          <div className={styles.conversationActions}>

            <button
              className={styles.iconActionButton}
              disabled={renaming || deletingConversationId === conv.id}
              aria-label={`Renomear conversa ${conv.title || "Nova conversa"}`}
              onClick={(e)=>{
                e.stopPropagation()
                openRename(conv.id, conv.title || "")
              }}
            >
              <Pencil size={16}/>
            </button>

            <button
              className={styles.iconActionButton}
              disabled={renaming || deletingConversationId === conv.id}
              aria-label={`Apagar conversa ${conv.title || "Nova conversa"}`}
              onClick={(e)=>{
                e.stopPropagation()
                handleDeleteConversation(conv.id)
              }}
            >
              <Trash2 size={16}/>
            </button>

          </div>
        )}
        </div>
      </div>

     ))}

    </div>

   </aside>

   <header className={styles.header}>

    <button
     className={styles.menuButton}
     onClick={()=>setMenuOpen(prev => !prev)}
     aria-label="Abrir menu de conversas"
    >
     <Menu size={32} strokeWidth={3} />
    </button>

    <button
     className={styles.backButton}
     onClick={()=>navigate("/oratio/home")}
     aria-label="Voltar para início"
    >
     ←
    </button>

    <h1>VoxAI</h1>

   </header>

   {error && (
    <div className={styles.errorBox} role="status" aria-live="polite">
     {error}
    </div>
   )}

   <main className={styles.chatArea}>

      {loadingConversation && (
        <div className={styles.statusInfo}>
          ⏳ Carregando conversa...
        </div>
      )}

      {messages.length === 0 && !loading && !loadingConversation && (
        <div className={styles.emptyState}>
          Pergunte algo ao Vox ✨<br/><br/>
          
          <span className={styles.emptyStateHint}>
            Você pode pedir explicações, tirar dúvidas ou conversar sobre:<br/><br/>

            📖 Doutrina Católica<br/>
            🙏 Espiritualidade e vida de oração<br/>
            ❤️ Sentimentos, dúvidas e desafios pessoais<br/>
            ❓ Qualquer tema espiritual ou questão da vida
          </span>
        </div>
      )}

    {messages.map(msg => {

     const isUser = msg.role === "user"

     return(

      <div
       key={msg.id}
       className={`${styles.message} ${
        isUser ? styles.userMessage : styles.aiMessage
       }`}
      >

       {isUser ? msg.content : (

        <div className={styles.markdownContent}>
         <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {msg.content}
         </ReactMarkdown>
        </div>

       )}

      </div>

     )

    })}

    {loading && !loadingConversation && messages.length > 0 && (

     <div className={`${styles.message} ${styles.aiMessage}`}>
      <div className={styles.typing}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <small className={styles.typingLabel}>Vox está escrevendo...</small>
     </div>

    )}

    <div ref={bottomRef}></div>

   </main>

   <div className={styles.inputWrapper}>

    <div className={styles.inputBox}>

     <textarea
      ref={textareaRef}
      value={input}
      onChange={handleChange}
      onKeyDown={handleKey}
      placeholder="Pergunte algo ao Vox..."
      maxLength={1000}
      aria-label="Digite sua pergunta para o Vox"
      rows={1}
     />

     <button
        onClick={sendMessage}
        disabled={loading || loadingConversation || !input.trim()}
        aria-label="Enviar mensagem"
      >
      {loading ? "..." : "↑"}
     </button>

    </div>

   </div>

        {renameOpen && (
      <div className={styles.modalOverlay}>

        <div className={styles.modal}>

          <h3>Renomear conversa</h3>

          <input
            value={renameValue}
            onChange={(e)=>setRenameValue(e.target.value)}
            placeholder="Novo nome..."
            maxLength={50}
            aria-label="Novo nome da conversa"
          />

          <div className={styles.modalActions}>
            <button onClick={()=>setRenameOpen(false)} disabled={renaming}>
              Cancelar
            </button>

            <button onClick={handleRename} disabled={renaming}>
              {renaming ? "Salvando..." : "Salvar"}
            </button>
          </div>

        </div>

      </div>
    )}
  </div>

 )
}