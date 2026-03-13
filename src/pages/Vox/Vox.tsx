import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import styles from "./Vox.module.css"

import { askVox } from "../../services/voxService"

interface Message{
 id:string
 role:"user" | "assistant"
 content:string
}

const MAX_HISTORY = 6

export default function Vox(){

 const navigate = useNavigate()

 const [messages,setMessages] = useState<Message[]>([])
 const [input,setInput] = useState("")
 const [loading,setLoading] = useState(false)

 const bottomRef = useRef<HTMLDivElement | null>(null)
 const textareaRef = useRef<HTMLTextAreaElement | null>(null)

 /* =========================
 SCROLL AUTOMÁTICO
 ========================= */

 useEffect(()=>{
  if(messages.length){
   bottomRef.current?.scrollIntoView({behavior:"smooth"})
  }
 },[messages,loading])

 /* =========================
 ENVIAR PERGUNTA
 ========================= */

 async function sendMessage(){

  const text = input.trim()

  if(!text || loading) return

  if(text.length > 500){
   alert("Pergunta muito longa.")
   return
  }

  const userMessage:Message={
   id:crypto.randomUUID(),
   role:"user",
   content:text
  }

  /* limitar histórico */

  const limitedHistory = messages.slice(-MAX_HISTORY)

  const updated = [...limitedHistory,userMessage]

  /* atualizar UI */

  setMessages(prev => [...prev,userMessage])

  setInput("")

  if(textareaRef.current){
   textareaRef.current.style.height = "auto"
  }

  setLoading(true)

  try{

   const res = await askVox(text,updated)

   const aiMessage:Message={

    id:crypto.randomUUID(),

    role:"assistant",

    content: res?.success
     ? res.response
     : "O Vox não conseguiu responder agora."

   }

   setMessages(prev => [...prev,aiMessage])

  }catch{

   setMessages(prev => [
    ...prev,
    {
     id:crypto.randomUUID(),
     role:"assistant",
     content:"O Vox está temporariamente indisponível."
    }
   ])

  }

  setLoading(false)

 }

 /* =========================
 ENTER PARA ENVIAR
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

  setInput(e.target.value)

  const el = textareaRef.current

  if(!el) return

  el.style.height="auto"

  el.style.height = el.scrollHeight+"px"

 }

 return(

  <div className={styles.container}>

   <header className={styles.header}>

    <button
     className={styles.backButton}
     onClick={()=>navigate("/oratio/home")}
     aria-label="Voltar"
     type="button"
    >
     ←
    </button>

    <h1>VoxAI</h1>

   </header>

   <main className={styles.chatArea}>

    {messages.map((msg)=>{

     const isUser = msg.role==="user"

     return(

      <div
       key={msg.id}
       className={`${styles.message} ${isUser ? styles.userMessage : styles.aiMessage}`}
      >

       {isUser ? (

        msg.content

       ):(

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

   <div className={styles.inputWrapper}>

    <div className={styles.inputBox}>

     <textarea
      ref={textareaRef}
      value={input}
      onChange={handleChange}
      onKeyDown={handleKey}
      placeholder="Pergunte algo ao Vox..."
      rows={1}
      spellCheck={false}
      autoFocus
     />

     <button
      onClick={sendMessage}
      disabled={loading}
      type="button"
      aria-label="Enviar pergunta"
     >
      ↑
     </button>

    </div>

   </div>

  </div>

 )
}