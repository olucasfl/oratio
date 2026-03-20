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

 const [error,setError] = useState<string | null>(null)

 const bottomRef = useRef<HTMLDivElement | null>(null)
 const textareaRef = useRef<HTMLTextAreaElement | null>(null)

 const initialized = useRef(false)

 /* =========================
    SCROLL
 ========================= */

 useEffect(()=>{
  setTimeout(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"})
  },50)
 },[messages])

 /* =========================
    INIT (🔥 NOVO)
 ========================= */

 useEffect(()=>{

  if(initialized.current) return
  initialized.current = true

  init()

 },[])

 useEffect(()=>{
  textareaRef.current?.focus()
 },[])

 async function init(){
  try{

    setError(null)
    setLoadingConversation(true)

    const list = await getConversations()
    setConversations(list || [])

    // 🔥 pega conversa ativa do backend
    const active = await getActiveConversation()

    if(!active?.id) throw new Error()

    await openConversation(active.id)

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

  try{

    setError(null)
    setConversationId(id)
    setMenuOpen(false)
    setLoadingConversation(true)

    setMessages([])

    const msgs = await getMessages(id)

    setMessages(msgs || [])

  }catch{
    setError("Erro ao abrir conversa.")
  }finally{
    setLoadingConversation(false)
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

    setConversationId(conv.id)
    setMessages([])

    const list = await getConversations()
    setConversations(list || [])

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

  if(text.length > 500){
    alert("Pergunta muito longa.")
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
    let res

    for(let i = 0; i < 2; i++){
      res = await askVox(text, conversationId)
      if(res?.success) break
    }

    if(!res?.success){

      if(res?.error === "UNAUTHORIZED"){
        setError("Sua sessão expirou. Faça login novamente.")
      }else if(res?.error === "RATE_LIMIT"){
        setError("Você está enviando mensagens muito rápido.")
      }else if(res?.error === "TIMEOUT"){
        setError("O Vox demorou para responder. Tente novamente.")
      }else if(res?.error === "LIMIT_EXCEEDED"){
        setError("Limite diário atingido.")
      }else{
        setError(res?.message || "Erro inesperado.")
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
    setConversations(list || [])

  }catch(error:any){

    if(error?.response?.status === 401){
      setError("Sua sessão expirou. Faça login novamente.")
    }else{
      setError("Erro de conexão. Verifique sua internet.")
    }

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

  const newConv = await deleteConversation(id)

  if(newConv?.id){
    setConversationId(newConv.id)
    setMessages([])

    const list = await getConversations()
    setConversations(list || [])
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
      alert("O nome da conversa deve ter no máximo 50 caracteres.")
      return
    }

    await renameConversation(selectedConv, trimmed)

    const list = await getConversations()
    setConversations(list || [])

    setRenameOpen(false)
    setRenameValue("")
    setSelectedConv(null)
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
              onClick={(e)=>{
                e.stopPropagation()
                openRename(conv.id, conv.title || "")
              }}
            >
              <Pencil size={16}/>
            </button>

            <button
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
    >
     <Menu size={32} strokeWidth={3} />
    </button>

    <button
     className={styles.backButton}
     onClick={()=>navigate("/oratio/home")}
    >
     ←
    </button>

    <h1>VoxAI</h1>

   </header>

   {error && (
    <div className={styles.errorBox}>
     {error}
    </div>
   )}

   <main className={styles.chatArea}>

      {loadingConversation && (
        <div style={{
          textAlign:"center",
          marginTop:"60px",
          opacity:0.6,
          fontSize:"14px"
        }}>
          ⏳ Carregando conversa...
        </div>
      )}

      {messages.length === 0 && !loading && !loadingConversation && (
        <div style={{
          textAlign:"center",
          opacity:0.7,
          marginTop:"40px",
          fontSize: "18px",
          fontWeight: 800,
          lineHeight:"1.6"
        }}>
          Pergunte algo ao Vox ✨<br/><br/>
          
          <span style={{fontSize:"14px", opacity:0.85}}>
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
      <small style={{opacity:0.6}}>Vox está escrevendo...</small>
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
      rows={1}
     />

     <button
        onClick={sendMessage}
        disabled={loading || loadingConversation || !input.trim()}
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
          />

          <div className={styles.modalActions}>
            <button onClick={()=>setRenameOpen(false)}>
              Cancelar
            </button>

            <button onClick={handleRename}>
              Salvar
            </button>
          </div>

        </div>

      </div>
    )}
  </div>

 )
}