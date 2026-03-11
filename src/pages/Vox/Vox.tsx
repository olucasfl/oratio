import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import styles from "./Vox.module.css"

import { askVox } from "../../services/voxService"

interface Message{
 role:"user" | "assistant"
 content:string
}

export default function Vox(){

 const navigate = useNavigate()

 const [messages,setMessages] = useState<Message[]>([])
 const [input,setInput] = useState("")
 const [loading,setLoading] = useState(false)

 const bottomRef = useRef<HTMLDivElement | null>(null)

 useEffect(()=>{
  bottomRef.current?.scrollIntoView({behavior:"smooth"})
 },[messages,loading])

 async function sendMessage(){

  const text = input.trim()

  if(!text || loading) return

  const userMessage:Message={
   role:"user",
   content:text
  }

  /*
  ============================
  LIMITAR HISTÓRICO (3 INTERAÇÕES)
  ============================
  */

  const limitedHistory = messages.slice(-6)

  const updated = [...limitedHistory,userMessage]

  /*
  ============================
  ATUALIZA UI
  ============================
  */

  setMessages(prev => [...prev,userMessage])

  setInput("")
  setLoading(true)

  try{

   const res = await askVox(text,updated)

   const aiMessage:Message = {

    role:"assistant",

    content: res?.success
     ? res.response
     : "O Vox não conseguiu responder agora."

   }

   /*
   ============================
   ATUALIZA UI
   ============================
   */

   setMessages(prev => [...prev,aiMessage])

  }catch{

   setMessages(prev => [
    ...prev,
    {
     role:"assistant",
     content:"O Vox está temporariamente indisponível."
    }
   ])

  }

  setLoading(false)

 }

 function handleKey(e:React.KeyboardEvent<HTMLTextAreaElement>){

  if(e.key==="Enter" && !e.shiftKey){
   e.preventDefault()
   sendMessage()
  }

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

    {messages.map((msg,index)=>{

     const isUser = msg.role==="user"

     return(

      <div
       key={index}
       className={`${styles.message} ${isUser ? styles.userMessage : styles.aiMessage}`}
      >

       {isUser ? (

        msg.content

       ):(

        <ReactMarkdown remarkPlugins={[remarkGfm]}>
         {msg.content}
        </ReactMarkdown>

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
      value={input}
      onChange={(e)=>setInput(e.target.value)}
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