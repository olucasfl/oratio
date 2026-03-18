import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import styles from "./Vox.module.css"

import { Plus } from "lucide-react"
import { Menu } from "lucide-react"

import {
 askVox,
 createConversation,
 getConversations,
 getMessages
} from "../../services/voxService"

const STORAGE_KEY = "vox_current_conversation"

interface Message{
 id:string
 role:"user" | "assistant"
 content:string
}

interface Conversation{
 id:string
 title:string
}

export default function Vox(){

 const navigate = useNavigate()

 const [messages,setMessages] = useState<Message[]>([])
 const [input,setInput] = useState("")
 const [loading,setLoading] = useState(false)

 const [conversationId,setConversationId] = useState<string | null>(null)
 const [conversations,setConversations] = useState<Conversation[]>([])
 const [menuOpen,setMenuOpen] = useState(false)

 const [error,setError] = useState<string | null>(null)

 const bottomRef = useRef<HTMLDivElement | null>(null)
 const textareaRef = useRef<HTMLTextAreaElement | null>(null)

 const initialized = useRef(false)

 /* =========================
    SCROLL
 ========================= */

 useEffect(()=>{
  bottomRef.current?.scrollIntoView({behavior:"smooth"})
 },[messages,loading])

 /* =========================
    INIT
 ========================= */

  useEffect(()=>{

  if(initialized.current) return // 👈 evita rodar duas vezes

  initialized.current = true

  init()

  },[])

 async function init(){
  try{

   setError(null)

   const list = await getConversations()
   setConversations(list || [])

   const savedConversation = localStorage.getItem(STORAGE_KEY)

    if(savedConversation){

    try{

      const msgs = await getMessages(savedConversation)

      if(!msgs?.length){
      setConversationId(savedConversation)
      setMessages([])
      return
      }

      await openConversation(savedConversation)
      return

    }catch{
      // conversa inválida → limpa storage
      localStorage.removeItem(STORAGE_KEY)
    }

    }

    // se não tiver conversa válida → cria nova
    await handleNewConversation()

  }catch{
   setError("Não foi possível carregar suas conversas.")
  }
 }

 /* =========================
    ABRIR CONVERSA
 ========================= */

 async function openConversation(id:string){

  try{

   setError(null)
   setConversationId(id)
   localStorage.setItem(STORAGE_KEY, id)
   setMenuOpen(false)
   setLoading(true)

   const msgs = await getMessages(id)

   setMessages(msgs || [])

  }catch{
   setError("Erro ao abrir conversa.")
  }finally{
  setLoading(false)
  }
 }

 /* =========================
    NOVA CONVERSA
 ========================= */

 async function handleNewConversation(){

  try{

    setLoading(true)
    setError(null)

    // 👇 verifica conversas existentes
    for(const conv of conversations){

      const msgs = await getMessages(conv.id)

      if(!msgs || msgs.length === 0){
        // 👇 reutiliza conversa vazia
        await openConversation(conv.id)
        return
      }
    }

    // 👇 se não encontrou nenhuma vazia → cria nova
    const conv = await createConversation()

    if(!conv?.id){
      throw new Error()
    }

    setConversationId(conv.id)
    localStorage.setItem(STORAGE_KEY, conv.id)
    setMessages([])

    const list = await getConversations()
    setConversations(list || [])

    setMenuOpen(false)

  }catch{
    setError("Erro ao criar nova conversa.")
  }finally{
    setLoading(false)
  }

  }

 /* =========================
    ENVIAR
 ========================= */

 async function sendMessage(){

  const text = input.trim()

  if(!text || loading || !conversationId) return

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

  try{

   setError(null)

   const res = await askVox(text, conversationId)

   if(!res?.success){
    throw new Error()
   }

   const aiMessage:Message={
    id:crypto.randomUUID(),
    role:"assistant",
    content: res.response
   }

   setMessages(prev => [...prev,aiMessage])

   localStorage.removeItem(STORAGE_KEY)

   const list = await getConversations()
   setConversations(list || [])

  }catch{

   setError("O Vox não conseguiu responder. Tente novamente.")

   setMessages(prev => [
    ...prev,
    {
     id:crypto.randomUUID(),
     role:"assistant",
     content:"O Vox está temporariamente indisponível."
    }
   ])

  }finally{
    setLoading(false)
  }
 }

 /* =========================
    ENTER
 ========================= */

 function handleKey(e:React.KeyboardEvent<HTMLTextAreaElement>){
  if(e.key==="Enter" && !e.shiftKey){
   e.preventDefault()
   sendMessage()
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

   {/* OVERLAY MOBILE */}
   {menuOpen && (
    <div
     className={styles.overlay}
     onClick={()=>setMenuOpen(false)}
    />
   )}

   {/* SIDEBAR */}

   <aside className={`${styles.sidebar} ${menuOpen ? styles.open : ""}`}>

    <div className={styles.sidebarHeader}>

      <button
        className={styles.newChatButton}
        onClick={handleNewConversation}
      >
        <Plus size={18} />
        Nova conversa
      </button>

    </div>

    {/* TEXTO UX */}
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
       {conv.title || "Nova conversa"}
      </div>

     ))}

    </div>

   </aside>

   {/* HEADER */}

   <header className={styles.header}>

    <button
     className={styles.menuButton}
     onClick={()=>setMenuOpen(prev => !prev)}
    >
     <Menu size={26} strokeWidth={2.5} />
    </button>

    <button
     className={styles.backButton}
     onClick={()=>navigate("/oratio/home")}
    >
     ←
    </button>

    <h1>VoxAI</h1>

   </header>

   {/* ERRO GLOBAL */}
   {error && (
    <div className={styles.errorBox}>
     {error}
    </div>
   )}

   {/* CHAT */}

   <main className={styles.chatArea}>

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

    {loading && (

     <div className={`${styles.message} ${styles.aiMessage}`}>
      <div className={styles.typing}>
       <span></span>
       <span></span>
       <span></span>
      </div>
     </div>

    )}

    <div ref={bottomRef}></div>

   </main>

   {/* INPUT */}

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
      disabled={loading}
     >
      ↑
     </button>

    </div>

   </div>

  </div>

 )
}