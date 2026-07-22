import { useState, useRef, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import styles from "./Vox.module.css"

import type { LucideIcon } from "lucide-react"

import {
 Plus,
 Menu,
 Trash2,
 Pencil,
 ChevronLeft,
 ChevronRight,
 Sparkles,
 Search,
 X,
 ArrowUp,
 Loader2,
 RotateCcw,
 CircleAlert,
 ShieldAlert,
 TimerOff,
 WifiOff,
 ServerCrash,
 AlertTriangle,
 BookOpen,
 ScrollText,
 HandHeart,
 Moon,
 Compass,
 HeartHandshake,
 Feather,
 Church,
 Sunrise,
 MessageCircleQuestion,
 Star,
 BookMarked,
 Anchor,
 Flame,
 Users,
 ShieldCheck,
 Landmark,
 Gift,
 Waves,
 Hourglass,
 CloudRain,
 Infinity as InfinityIcon,
 BookOpenCheck,
 HeartCrack
} from "lucide-react"

import {
 deleteConversation,
 renameConversation,
 askVoxStream,
 createConversation,
 getConversations,
 getMessages,
 getBootstrap
} from "../../services/voxService"

import { useLiturgy } from "../../hooks/useLiturgy"

import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"

interface Message{
 id:string
 role:"user" | "assistant"
 content:string
 createdAt?:string
 status?:"sending" | "sent" | "failed"
}

interface Conversation{
 id:string
 title:string
 hasMessages?: boolean
 updatedAt?: string
}

interface Suggestion{
 icon: LucideIcon
 text: string
}

/* =========================
   SUGESTÕES DE PERGUNTA
========================= */

const SUGGESTION_POOL: Suggestion[] = [
 { icon: BookOpen, text: "Qual a diferença entre pecado mortal e venial?" },
 { icon: ScrollText, text: "Me explica o que é a Santíssima Trindade." },
 { icon: HandHeart, text: "Como eu começo a rezar todos os dias?" },
 { icon: Moon, text: "Por que a Igreja recomenda a Adoração ao Santíssimo?" },
 { icon: Compass, text: "Estou com dúvidas sobre o que Deus quer para minha vida." },
 { icon: HeartHandshake, text: "Como perdoar alguém que me machucou muito?" },
 { icon: Feather, text: "O que é viver em estado de graça?" },
 { icon: Church, text: "Qual a importância da Missa dominical?" },
 { icon: Sunrise, text: "Me dá um jeito simples de rezar de manhã." },
 { icon: MessageCircleQuestion, text: "Por que confessar meus pecados a um padre, e não direto a Deus?" },
 { icon: Star, text: "O que a Igreja ensina sobre Nossa Senhora?" },
 { icon: BookMarked, text: "Explica o sentido do Pai Nosso, frase por frase." },
 { icon: Anchor, text: "O que significa ter esperança cristã mesmo diante do sofrimento?" },
 { icon: Flame, text: "O que são os dons do Espírito Santo?" },
 { icon: Users, text: "Por que a Igreja fala tanto sobre comunidade e não só sobre 'eu e Deus'?" },
 { icon: ShieldCheck, text: "Como resistir a uma tentação que sempre volta?" },
 { icon: Landmark, text: "O que é o Magistério da Igreja?" },
 { icon: Gift, text: "O que é a graça santificante?" },
 { icon: Waves, text: "O que acontece de verdade no Batismo?" },
 { icon: Hourglass, text: "Estou desanimado com meu próprio crescimento espiritual, o que fazer?" },
 { icon: CloudRain, text: "Como lidar com a sensação de que Deus está em silêncio?" },
 { icon: InfinityIcon, text: "O que a Igreja ensina sobre a vida eterna?" },
 { icon: BookOpenCheck, text: "Como eu leio a Bíblia sem me perder?" },
 { icon: HeartCrack, text: "Estou vivendo um luto, como a fé pode me ajudar?" }
]

function pickRandom(pool: Suggestion[], count: number): Suggestion[] {
 const copy = [...pool]
 const picked: Suggestion[] = []

 while(picked.length < count && copy.length > 0){
  const index = Math.floor(Math.random() * copy.length)
  picked.push(copy[index])
  copy.splice(index, 1)
 }

 return picked
}

/* =========================
   MENSAGENS DE ERRO
========================= */

interface ErrorCopy{
 message: string
 icon: LucideIcon
}

const ERROR_ICONS: Record<string, LucideIcon> = {
 RATE_LIMIT: TimerOff,
 RATE_LIMIT_GEMINI: TimerOff,
 MESSAGE_TOO_LONG: CircleAlert,
 INVALID_CONVERSATION: ShieldAlert,
 EMPTY_MESSAGE: CircleAlert,
 TIMEOUT: TimerOff,
 LIMIT_EXCEEDED: ShieldAlert,
 NETWORK_ERROR: WifiOff,
 AI_PROVIDER_ERROR: ServerCrash
}

// RATE_LIMIT/RATE_LIMIT_GEMINI de propósito não têm texto fixo aqui: o
// backend já manda a contagem regressiva real (quantos segundos faltam),
// mais específica do que qualquer texto genérico conseguiria ser.
const ERROR_MESSAGES: Record<string, string> = {
 MESSAGE_TOO_LONG: "Essa mensagem passou de 1000 caracteres. Reduza o texto para poder enviar.",
 INVALID_CONVERSATION: "Essa conversa não existe mais. Recarregue a página para abrir uma nova.",
 EMPTY_MESSAGE: "Digite algo antes de enviar.",
 TIMEOUT: "O Vox demorou demais para responder dessa vez. Tente enviar de novo.",
 LIMIT_EXCEEDED: "O Vox atingiu o limite de uso por agora. Tente novamente em alguns minutos.",
 NETWORK_ERROR: "Sem conexão com a internet. Verifique sua rede e tente de novo.",
 AI_PROVIDER_ERROR: "O Vox não conseguiu se conectar à IA agora. Tente novamente em instantes."
}

function resolveErrorCopy(code: string | null, fallbackMessage?: string): ErrorCopy{
 return {
  message: (code && ERROR_MESSAGES[code]) || fallbackMessage || "Algo deu errado ao enviar sua mensagem. Tente novamente.",
  icon: (code && ERROR_ICONS[code]) || AlertTriangle
 }
}

/* =========================
   AGRUPAMENTO DA SIDEBAR
========================= */

function startOfDay(date: Date){
 return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function groupConversationsByPeriod(list: Conversation[]): { label:string, items:Conversation[] }[]{

 const todayStart = startOfDay(new Date())
 const oneDay = 24 * 60 * 60 * 1000

 const today:Conversation[] = []
 const yesterday:Conversation[] = []
 const lastWeek:Conversation[] = []
 const older:Conversation[] = []

 for(const conv of list){
  const reference = conv.updatedAt ? new Date(conv.updatedAt) : null
  const dayStart = reference ? startOfDay(reference) : todayStart
  const diff = Math.round((todayStart - dayStart) / oneDay)

  if(diff <= 0) today.push(conv)
  else if(diff === 1) yesterday.push(conv)
  else if(diff <= 7) lastWeek.push(conv)
  else older.push(conv)
 }

 return [
  { label:"Hoje", items:today },
  { label:"Ontem", items:yesterday },
  { label:"Últimos 7 dias", items:lastWeek },
  { label:"Mais antigas", items:older }
 ].filter(group => group.items.length > 0)
}

function formatTime(iso?: string){
 return new Date(iso || "").toLocaleTimeString([],{
  hour:"2-digit",
  minute:"2-digit"
 })
}

function growTextarea(el: HTMLTextAreaElement | null){
 if(!el) return
 el.style.height = "auto"
 el.style.height = el.scrollHeight + "px"
}

// Enter vira "enviar" só em dispositivos com mouse/trackpad — em touch
// (pointer grosseiro), o teclado do celular não tem Shift de fácil
// acesso, então Enter precisa continuar quebrando linha; quem manda a
// mensagem é o botão de enviar mesmo.
function isTouchPrimaryDevice(): boolean {
 return typeof window !== "undefined" && !!window.matchMedia?.("(pointer: coarse)").matches
}

/* =========================
   BLOCOS AUXILIARES
========================= */

function SidebarSkeleton(){
 return (
  <div className={styles.sidebarSkeleton} aria-hidden="true">
   {Array.from({ length:5 }).map((_,i)=>(
    <div key={i} className={styles.skRow}>
     <div className={`skeleton ${styles.skRowLine}`} style={{ width: i % 2 === 0 ? "88%" : "64%" }} />
    </div>
   ))}
  </div>
 )
}

function ChatSkeleton(){
 return (
  <div className={styles.chatSkeleton} aria-hidden="true">
   <div className={`skeleton ${styles.skBubble} ${styles.skBubbleUser}`} style={{ width:"38%" }} />
   <div className={`skeleton ${styles.skBubble} ${styles.skBubbleAi}`} style={{ width:"72%", height:64 }} />
   <div className={`skeleton ${styles.skBubble} ${styles.skBubbleAi}`} style={{ width:"52%" }} />
   <div className={`skeleton ${styles.skBubble} ${styles.skBubbleUser}`} style={{ width:"30%" }} />
  </div>
 )
}

export default function Vox(){

 const navigate = useNavigate()
 const { liturgy } = useLiturgy()

 const [messages,setMessages] = useState<Message[]>([])
 const [input,setInput] = useState("")
 const [loading,setLoading] = useState(false)
 const [loadingConversation,setLoadingConversation] = useState(false)
 // id da mensagem do assistente que está sendo preenchida aos poucos —
 // enquanto for null, mostra os "..." de digitando; assim que o primeiro
 // pedaço da resposta chega, troca pro balão de verdade
 const [streamingMessageId,setStreamingMessageId] = useState<string | null>(null)

 const [conversationId,setConversationId] = useState<string | null>(null)
 const [conversations,setConversations] = useState<Conversation[]>([])
 const [menuOpen,setMenuOpen] = useState(false)

 const [searchQuery,setSearchQuery] = useState("")

 const [renameOpen,setRenameOpen] = useState(false)
 const [renameValue,setRenameValue] = useState("")
 const [selectedConv,setSelectedConv] = useState<string | null>(null)
 const [renaming,setRenaming] = useState(false)
 const [deletingConversationId,setDeletingConversationId] = useState<string | null>(null)
 const [confirmDeleteId,setConfirmDeleteId] = useState<string | null>(null)

 const [error,setError] = useState<string | null>(null)
 const [errorCode,setErrorCode] = useState<string | null>(null)

 const [copiedId,setCopiedId] = useState<string | null>(null)

 const [editingMessageId,setEditingMessageId] = useState<string | null>(null)
 const [editingValue,setEditingValue] = useState("")

 const [randomSuggestions,setRandomSuggestions] = useState<Suggestion[]>(()=>pickRandom(SUGGESTION_POOL, 3))

 const bottomRef = useRef<HTMLDivElement | null>(null)
 const chatAreaRef = useRef<HTMLElement | null>(null)
 const textareaRef = useRef<HTMLTextAreaElement | null>(null)
 const editTextareaRef = useRef<HTMLTextAreaElement | null>(null)

 const initialized = useRef(false)
 const openConversationRequest = useRef(0)
 const sendingRef = useRef(false)
 const typewriterTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

 const errorCopy = useMemo(()=>resolveErrorCopy(errorCode, error || undefined),[errorCode, error])

 // a última pergunta do usuário pode ser editada mesmo já respondida —
 // não só quando falha. Calculado à parte de "isLastUserMessage" no
 // .map porque precisa olhar a lista toda, não só a posição do item.
 const lastUserMessageId = useMemo(()=>{
  for(let i = messages.length - 1; i >= 0; i--){
   if(messages[i].role === "user") return messages[i].id
  }
  return null
 },[messages])

 const liturgySuggestion: Suggestion = useMemo(()=>{
  const nome = liturgy?.liturgia?.trim()
  return {
   icon: Church,
   text: nome
    ? `O que é "${nome}", que a Igreja celebra hoje?`
    : "O que a Igreja celebra hoje?"
  }
 },[liturgy?.liturgia])

 const suggestions = useMemo(
  ()=>[liturgySuggestion, ...randomSuggestions],
  [liturgySuggestion, randomSuggestions]
 )

 const filteredConversations = useMemo(()=>{
  const query = searchQuery.trim().toLowerCase()
  if(!query) return conversations
  return conversations.filter(conv =>
   (conv.title || "Nova conversa").toLowerCase().includes(query)
  )
 },[conversations, searchQuery])

 const conversationGroups = useMemo(()=>{
  if(searchQuery.trim()){
   return filteredConversations.length
    ? [{ label:"Resultados", items:filteredConversations }]
    : []
  }
  return groupConversationsByPeriod(filteredConversations)
 },[filteredConversations, searchQuery])

 /* =========================
    SCROLL
    Acompanha o fim automaticamente só se o usuário já estava perto
    dele — inclusive quando a resposta do Vox está começando (a
    mensagem do assistente sendo criada) ou crescendo. Sem essa
    checagem, a tela puxava de volta pro fim a cada pedacinho da
    resposta chegando, e não dava pra rolar pra cima e reler nada
    enquanto ela ainda estava vindo.

    Enviar uma mensagem nova é a única exceção — aí sim sempre desce,
    ver scrollToBottom() chamado direto em sendMessage().

    behavior "auto" (instantâneo) de propósito, não "smooth": uma
    rolagem suave é uma animação do navegador que continua rodando por
    conta própria por um tempo depois de disparada — se o usuário
    tentasse rolar manualmente enquanto ela ainda estivesse em
    andamento, a animação nativa podia "vencer" e puxar de volta.
 ========================= */

 function scrollToBottom(){
  setTimeout(()=>{
    bottomRef.current?.scrollIntoView({ behavior:"auto" })
  },50)
 }

 useEffect(()=>{
  const el = chatAreaRef.current
  if(!el) return

  const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
  if(distanceFromBottom > 120) return

  scrollToBottom()
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

 useEffect(()=>{
  if(!conversationId) return
  setRandomSuggestions(pickRandom(SUGGESTION_POOL, 3))
 },[conversationId])

 useEffect(()=>{
  return ()=>{
   if(typewriterTimer.current) clearTimeout(typewriterTimer.current)
  }
 },[])

 async function init(){

    try{

      setError(null)
      setLoadingConversation(true)

      const bootstrap = await getBootstrap()

      if(bootstrap?.error || !bootstrap?.active?.id){
        throw new Error()
      }

      if(Array.isArray(bootstrap.conversations)){
        setConversations(bootstrap.conversations)
      }

      await openConversation(bootstrap.active.id)

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
    cancelEdit()

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
    NOVA CONVERSA
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
    ENVIO / ENTREGA DA MENSAGEM
 ========================= */

 function updateMessageStatus(id:string, status: Message["status"]){
  setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m))
 }

 async function deliverMessage(target: Pick<Message,"id" | "content">){

  if(!conversationId) return

  setLoading(true)
  setError(null)
  setErrorCode(null)

  const assistantId = crypto.randomUUID()
  let assistantCreated = false

  function appendDelta(chunk:string){

    const isFirstChunk = !assistantCreated
    assistantCreated = true

    setMessages(prev => {

      if(isFirstChunk){
        return [...prev, {
          id: assistantId,
          role:"assistant" as const,
          content: chunk,
          createdAt: new Date().toISOString()
        }]
      }

      return prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
    })

    setStreamingMessageId(assistantId)
  }

  try{
    const res = await askVoxStream(target.content, conversationId, appendDelta)

    if(!res?.success){

      // se algo já tinha sido escrito na tela e falhou no meio, tira o
      // pedaço incompleto — melhor mostrar "falhou, tenta de novo" do
      // que uma resposta cortada sem explicação
      if(assistantCreated){
        setMessages(prev => prev.filter(m => m.id !== assistantId))
      }

      updateMessageStatus(target.id, "failed")

      const code = res?.error || "UNKNOWN_ERROR"
      setErrorCode(code)
      setError(resolveErrorCopy(code, res?.message).message)

      return
    }

    updateMessageStatus(target.id, "sent")

    const list = await getConversations()
    if(Array.isArray(list)){
      setConversations(list)
    }

  }catch{

    if(assistantCreated){
      setMessages(prev => prev.filter(m => m.id !== assistantId))
    }

    updateMessageStatus(target.id, "failed")
    setErrorCode("UNKNOWN_ERROR")
    setError("Não foi possível enviar sua mensagem. Verifique sua internet e tente novamente.")
  }finally{
    setLoading(false)
    setStreamingMessageId(null)
    sendingRef.current = false
    textareaRef.current?.focus()
  }
 }

 async function sendMessage(){

  const text = input.replace(/\r/g,"")

  if(!text.trim() || loading || loadingConversation || !conversationId){
    return
  }

  if(sendingRef.current) return
  sendingRef.current = true

  if(text.length > 1000){
    setErrorCode("MESSAGE_TOO_LONG")
    setError(resolveErrorCopy("MESSAGE_TOO_LONG").message)
    sendingRef.current = false
    return
  }

  const userMessage:Message={
  id:crypto.randomUUID(),
  role:"user",
  content:text,
  createdAt:new Date().toISOString(),
  status:"sending"
  }

  setMessages(prev => [...prev,userMessage])
  setInput("")
  growTextarea(textareaRef.current)
  scrollToBottom()

  await deliverMessage(userMessage)
 }

 async function retryMessage(id:string){

  if(loading || sendingRef.current) return

  const target = messages.find(m => m.id === id)
  if(!target) return

  sendingRef.current = true
  updateMessageStatus(id, "sending")

  await deliverMessage(target)
 }

 /* =========================
    EDITAR MENSAGEM
 ========================= */

 function startEdit(msg:Message){
  if(loading) return
  setEditingMessageId(msg.id)
  setEditingValue(msg.content)
  setTimeout(()=>{
   editTextareaRef.current?.focus()
   growTextarea(editTextareaRef.current)
  }, 0)
 }

 function cancelEdit(){
  setEditingMessageId(null)
  setEditingValue("")
 }

 async function saveEdit(){

  const trimmed = editingValue.trim()

  if(!editingMessageId || !trimmed) return

  if(trimmed.length > 1000){
   setErrorCode("MESSAGE_TOO_LONG")
   setError(resolveErrorCopy("MESSAGE_TOO_LONG").message)
   return
  }

  if(loading || sendingRef.current) return

  const id = editingMessageId

  // se essa pergunta já tinha sido respondida, a resposta antiga não
  // corresponde mais ao texto editado — corta ela (e qualquer coisa
  // depois) antes de pedir a resposta nova
  setMessages(prev => {
   const idx = prev.findIndex(m => m.id === id)
   if(idx === -1) return prev

   const truncated = prev.slice(0, idx + 1)
   truncated[idx] = { ...truncated[idx], content:trimmed, status:"sending" }
   return truncated
  })

  setEditingMessageId(null)
  setEditingValue("")

  sendingRef.current = true

  await deliverMessage({ id, content:trimmed })
 }

 /* =========================
    ENTER
 ========================= */

 function handleKey(e:React.KeyboardEvent<HTMLTextAreaElement>){
  if(e.key==="Enter" && !e.shiftKey && !loading && !isTouchPrimaryDevice()){
   e.preventDefault()
   sendMessage()
  }
 }

 function handleEditKey(e:React.KeyboardEvent<HTMLTextAreaElement>){
  if(e.key==="Enter" && !e.shiftKey && !isTouchPrimaryDevice()){
   e.preventDefault()
   saveEdit()
  }
  if(e.key==="Escape"){
   cancelEdit()
  }
 }

 // DELETAR CONVERSATION

 function handleDeleteConversation(id:string){
  setConfirmDeleteId(id)
 }

 async function performDeleteConversation(id:string){

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
  setErrorCode(null)
  setInput(e.target.value)

  growTextarea(e.target)
 }

 /* =========================
    SUGESTÕES → PREENCHER
 ========================= */

 function handleSuggestionClick(text:string){

  if(loading || loadingConversation) return

  if(typewriterTimer.current){
   clearTimeout(typewriterTimer.current)
   typewriterTimer.current = null
  }

  setError(null)
  setErrorCode(null)

  const reduceMotion =
   typeof window !== "undefined" &&
   window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

  if(reduceMotion){
   setInput(text)
   const el = textareaRef.current
   if(el){
    el.value = text
    growTextarea(el)
   }
   textareaRef.current?.focus()
   return
  }

  let i = 0
  const chunk = Math.max(1, Math.round(text.length / 32))

  const step = ()=>{
   i = Math.min(text.length, i + chunk)
   const next = text.slice(0, i)

   setInput(next)

   const el = textareaRef.current
   if(el){
    el.value = next
    growTextarea(el)
   }

   if(i < text.length){
    typewriterTimer.current = setTimeout(step, 12)
   }else{
    typewriterTimer.current = null
    textareaRef.current?.focus()
   }
  }

  step()
 }

 return(

  <div className={`${styles.container} page-enter`}>

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
          <Loader2 size={18} className={styles.spinIcon} />
        ) : (
          <>
            <Plus size={18} />
            Nova conversa
          </>
        )}
      </button>

    </div>

    <p className={styles.sidebarTitle}>Suas conversas</p>

    <div className={styles.searchBox}>
     <Search size={15} className={styles.searchIcon} />
     <input
      value={searchQuery}
      onChange={(e)=>setSearchQuery(e.target.value)}
      placeholder="Buscar conversa..."
      aria-label="Buscar conversa por título"
     />
     {searchQuery && (
      <button
       type="button"
       className={styles.searchClear}
       onClick={()=>setSearchQuery("")}
       aria-label="Limpar busca"
      >
       <X size={13} />
      </button>
     )}
    </div>

    <div className={styles.conversationList}>

     {loadingConversation && conversations.length === 0 ? (

      <SidebarSkeleton />

     ) : conversationGroups.length === 0 ? (

      <p className={styles.noResults}>
       {searchQuery ? "Nenhuma conversa encontrada." : "Nenhuma conversa ainda."}
      </p>

     ) : (

      conversationGroups.map(group => (

       <div key={group.label} className={styles.conversationGroup}>

        <span className={styles.groupLabel}>{group.label}</span>

        {group.items.map(conv => (

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

      ))

     )}

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
     <ChevronLeft size={20}/>
    </button>

    <h1>
     <span className={styles.titleBadge}>
      <Sparkles size={14} className={styles.titleIcon} />
     </span>
     VoxAI
    </h1>

   </header>

   {error && (
    <div className={styles.errorBox} role="status" aria-live="polite">
     <errorCopy.icon size={16} className={styles.errorIcon} />
     <span>{error}</span>
     {errorCode !== "LIMIT_EXCEEDED" && errorCode !== "INVALID_CONVERSATION" && errorCode !== "MESSAGE_TOO_LONG" && errorCode !== "EMPTY_MESSAGE" && (
      <button
       className={styles.retryButton}
       onClick={()=>{
        setError(null)
        setErrorCode(null)
       }}
      >
       Entendi
      </button>
     )}
    </div>
   )}

   <main className={styles.chatArea} ref={chatAreaRef}>

    {loadingConversation ? (

      <ChatSkeleton />

    ) : (

     <>

      {messages.length === 0 && !loading && (
        <div className={styles.emptyState}>

          <div className={styles.emptyIconWrap}>
           <div className={styles.emptyGlow} />
           <Sparkles size={26} strokeWidth={1.75} />
          </div>

          <h2 className={styles.emptyTitle}>Em que posso te ajudar hoje?</h2>
          <p className={styles.emptySubtitle}>
           Pergunte sobre fé, oração ou o que estiver no seu coração.
          </p>

          <span className={styles.suggestionsLabel}>Sugestões — toque para usar</span>

          <div className={styles.suggestionsGrid}>
           {suggestions.map((s, i)=>{
            const Icon = s.icon
            const isLiturgy = i === 0

            return (
             <button
              key={`${s.text}-${i}`}
              type="button"
              className={styles.suggestionCard}
              style={{ animationDelay:`${i * 60}ms` }}
              onClick={()=>handleSuggestionClick(s.text)}
             >
              <span className={styles.suggestionIconWrap}>
               <Icon size={16} strokeWidth={1.9} />
              </span>
              <span className={styles.suggestionText}>{s.text}</span>
              <ChevronRight size={15} className={styles.suggestionChevron} />
              {isLiturgy && <span className={styles.suggestionBadge}>Hoje</span>}
             </button>
            )
           })}
          </div>

        </div>
      )}

    {messages.map((msg) => {

     const isUser = msg.role === "user"
     const isLastUserMessage = isUser && msg.id === lastUserMessageId
     const isEditing = editingMessageId === msg.id

     return(

      <div
       key={msg.id}
       className={`${styles.message} ${
        isUser ? styles.userMessage : styles.aiMessage
       } ${msg.status === "failed" ? styles.messageFailed : ""}`}
      >

       {isUser ? (

        isEditing ? (

         <div className={styles.editBox}>
          <textarea
           ref={editTextareaRef}
           value={editingValue}
           onChange={(e)=>{
            setEditingValue(e.target.value)
            growTextarea(e.target)
           }}
           onKeyDown={handleEditKey}
           maxLength={1000}
           rows={1}
           aria-label="Editar mensagem"
          />
          <div className={styles.editActions}>
           <button type="button" className={styles.editCancel} onClick={cancelEdit}>
            Cancelar
           </button>
           <button
            type="button"
            className={styles.editSave}
            onClick={saveEdit}
            disabled={!editingValue.trim()}
           >
            <ArrowUp size={13} />
            Reenviar
           </button>
          </div>
         </div>

        ) : (

         <>

           <div className={styles.userMessageContent}>
             {msg.content}
           </div>

           <div className={styles.messageFooter}>

            <small className={styles.messageTime}>
              {formatTime(msg.createdAt)}
            </small>

            {msg.status === "sending" && (
             <span className={styles.statusRow}>
              <Loader2 size={11} className={styles.spinIcon} />
              Aguardando resposta
             </span>
            )}

            {msg.status === "failed" && (
             <span className={`${styles.statusRow} ${styles.statusFailed}`}>
              <AlertTriangle size={11} />
              Falha ao enviar
              <button
               type="button"
               className={styles.inlineRetry}
               onClick={()=>retryMessage(msg.id)}
              >
               <RotateCcw size={11} />
               Tentar de novo
              </button>
             </span>
            )}

            {isLastUserMessage && msg.status !== "sending" && !loading && (
             <button
              type="button"
              className={styles.editTrigger}
              onClick={()=>startEdit(msg)}
              aria-label="Editar mensagem"
             >
              <Pencil size={11} />
              Editar
             </button>
            )}

           </div>

         </>

        )

      ) : (

        <>

          <div className={styles.aiMessageHeader}>

            <button
              className={styles.copyButton}
              onClick={async ()=>{

                await navigator.clipboard.writeText(msg.content)

                setCopiedId(msg.id)

                setTimeout(()=>{
                  setCopiedId(null)
                },2000)

              }}
            >
              {copiedId === msg.id ? "Copiado!" : "Copiar"}
            </button>

          </div>

          <div className={styles.markdownContent}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{

                p({children}){
                  return <p className={styles.markdownParagraph}>{children}</p>
                },

                ul({children}){
                  return <ul className={styles.markdownList}>{children}</ul>
                },

                ol({children}){
                  return <ol className={styles.markdownList}>{children}</ol>
                },

                li({children}){
                  return <li className={styles.markdownListItem}>{children}</li>
                },

                blockquote({children}){
                  return (
                    <blockquote className={styles.markdownQuote}>
                      {children}
                    </blockquote>
                  )
                }

              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>

          <small className={styles.messageTime}>
            {formatTime(msg.createdAt)}
          </small>

        </>

      )}

      </div>

     )

    })}

    {loading && messages.length > 0 && !streamingMessageId && (

     <div className={`${styles.message} ${styles.aiMessage}`}>
      <div className={styles.typing}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <small className={styles.typingLabel}>Vox está refletindo...</small>
     </div>

    )}

     </>

    )}

    <div ref={bottomRef}></div>

   </main>

   <div className={styles.inputWrapper}>

    {input.length > 800 && (
     <div className={styles.charCountRow}>
      <span className={`${styles.charCount} ${
       input.length >= 1000 ? styles.charCountMax :
       input.length >= 950 ? styles.charCountWarn : ""
      }`}>
       {input.length}/1000
      </span>
     </div>
    )}

    <div className={styles.inputBox}>

     <textarea
      ref={textareaRef}
      spellCheck={true}
      autoComplete="off"
      autoCorrect="on"
      autoCapitalize="sentences"
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
      {loading ? (
        <Loader2 size={18} className={styles.spinIcon} />
      ) : (
        <ArrowUp size={20} strokeWidth={2.5} />
      )}
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

    <ConfirmModal
      open={!!confirmDeleteId}
      message="Tem certeza que deseja apagar essa conversa?"
      onConfirm={()=>{
        const id = confirmDeleteId
        setConfirmDeleteId(null)
        if(id) performDeleteConversation(id)
      }}
      onCancel={()=>setConfirmDeleteId(null)}
      danger
    />
  </div>

 )
}
