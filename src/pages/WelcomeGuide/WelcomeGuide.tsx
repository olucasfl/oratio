import { useEffect, useId, useRef, useState } from "react"
import type { TouchEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Sunrise, Cross, BookOpen } from "lucide-react"

import { markWelcomeSeen } from "../../services/welcomeService"

import { useTypewriter } from "./useTypewriter"
import styles from "./WelcomeGuide.module.css"

/*
 Guia de boas-vindas de primeira entrada — spec `docs/specs/boas-vindas.md`
 (mestra: `oratio-api/docs/specs/boas-vindas.md`).

 Tela cheia, no máximo 3 páginas, navegação SÓ pra frente ("Próximo" →
 "Começar"), sem "pular" e sem botão de saída — a pessoa precisa ver que
 aquilo acaba (indicador de progresso) e só sai ao concluir. `welcomeSeenAt`
 só é carimbado ao tocar "Começar" na última página; fechar o app no meio
 recomeça da página 1 no próximo login. A visibilidade/unicidade é do
 `showWelcome` do `GET /users/me` (o shell `WelcomeGate` redireciona pra cá)
 — este componente não decide se aparece.

 Movimento:
 - o texto se digita (padrão do Vox — ver `useTypewriter`), título e corpo
   em tempos diferentes;
 - a página que sai desliza pra esquerda enquanto a que entra vem da direita
   (coerente com "só pra frente");
 - o ícone tem um movimento próprio, sutil, contínuo;
 - tocar na tela completa a animação em curso; arrastar pra esquerda avança.
 - `prefers-reduced-motion: reduce` → texto inteiro e instantâneo, nenhuma
   animação de entrada, nenhuma transição, e a página que sai nem é montada.
   Caminho de primeira classe: as animações vivem só sob
   `@media (prefers-reduced-motion: no-preference)` no CSS.

 A11y: `role="dialog"` + `aria-modal` + `aria-labelledby` no título; o foco
 vai pro botão de avanço a cada página; a camada que se digita é
 `aria-hidden` e o texto completo existe desde o início numa cópia
 visualmente escondida (`.srOnly`) — nada de `aria-live`.
*/

interface Page{
 icon: typeof Sunrise
 motion: string
 title: string
 body: string
}

const PAGES: Page[] = [
 {
  icon: Sunrise,
  motion: "iconSunrise",
  title: "Bem-vindo ao Oratio",
  body: "Seu companheiro de oração diária. Abra o app e encontre a liturgia de hoje, o Santo do Dia e uma frase para levar no coração.",
 },
 {
  icon: Cross,
  motion: "iconCross",
  title: "Reze e acompanhe",
  body: "Terço, orações e a Consagração de 33 dias, com o seu progresso guardado a cada dia. E o exame de consciência para preparar a confissão.",
 },
 {
  icon: BookOpen,
  motion: "iconBook",
  title: "Estude e converse",
  body: "Bíblia de Estudo para marcar versículos e reuni-los em coleções, o Catecismo sempre à mão, e o Vox para conversar sobre a fé.",
 },
]

// Coreografia (ms). O corpo começa depois que o título termina de digitar,
// com uma pausa — por isso o startDelay do corpo é calculado a partir do
// tamanho do título, não fixo.
const TITLE_START = 240
const TITLE_STEP = 26
const TITLE_DIV = 12
const BODY_STEP = 12
const BODY_DIV = 26
const BODY_GAP = 180

const LEAVE_MS = 420   // > duração da animação de saída no CSS
const SWIPE_PX = 56

function prefersReducedMotion(): boolean{
 if(typeof window === "undefined" || typeof window.matchMedia !== "function") return false
 return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function bodyStartFor(title: string): number{
 const chunk = Math.max(1, Math.round(title.length / TITLE_DIV))
 const titleDur = Math.ceil(title.length / chunk) * TITLE_STEP
 return TITLE_START + titleDur + BODY_GAP
}

function PageIcon({ page }: { page: Page }){
 const Icon = page.icon
 return <Icon size={56} strokeWidth={1.5} />
}

export default function WelcomeGuide(){

 const navigate = useNavigate()
 const titleId = useId()

 const [reduce] = useState(prefersReducedMotion)
 const [index,setIndex] = useState(0)
 const [leaving,setLeaving] = useState<number | null>(null)
 const [finishing,setFinishing] = useState(false)

 const advanceRef = useRef<HTMLButtonElement>(null)
 const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
 const touchX = useRef<number | null>(null)

 const page = PAGES[index]
 const isLast = index === PAGES.length - 1

 const title = useTypewriter(page.title, {
  animate: !reduce,
  startDelay: TITLE_START,
  stepMs: TITLE_STEP,
  chunkDivisor: TITLE_DIV,
 })
 const body = useTypewriter(page.body, {
  animate: !reduce,
  startDelay: bodyStartFor(page.title),
  stepMs: BODY_STEP,
  chunkDivisor: BODY_DIV,
 })

 // Foco no botão de avanço a cada página — sem botão de saída, é o controle
 // principal, e o leitor de tela anuncia o novo rótulo/estado.
 useEffect(()=>{
  advanceRef.current?.focus()
 },[index])

 useEffect(()=>()=>{
  if(leaveTimer.current) clearTimeout(leaveTimer.current)
 },[])

 const revealing = !title.done || !body.done

 async function advance(){

  if(finishing) return

  if(!isLast){
   if(!reduce){
    setLeaving(index)
    if(leaveTimer.current) clearTimeout(leaveTimer.current)
    leaveTimer.current = setTimeout(()=>{
     setLeaving(null)
     leaveTimer.current = null
    }, LEAVE_MS)
   }
   setIndex((i)=> i + 1)
   return
  }

  // Última página: carimba a conclusão e entra no app. Se a chamada falhar
  // (rede), entra assim mesmo — `showWelcome` volta `true` no próximo boot e
  // o guia reaparece uma vez; não prender ninguém na porta do app.
  setFinishing(true)
  try{
   await markWelcomeSeen()
  }catch{
   /* melhor esforço */
  }
  navigate("/oratio/home", { replace: true })
 }

 // Tocar na tela (fora do botão, que fica no rodapé) completa a animação em
 // curso — quem lê rápido não espera. O texto acessível completo já está no
 // DOM; isto só adianta a camada visual.
 function handleStageTap(){
  if(revealing){
   title.skip()
   body.skip()
  }
 }

 function handleTouchStart(e: TouchEvent<HTMLDivElement>){
  touchX.current = e.touches[0]?.clientX ?? null
 }

 function handleTouchEnd(e: TouchEvent<HTMLDivElement>){
  if(touchX.current === null) return
  const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current
  touchX.current = null
  // arrastar pra esquerda avança; pra direita não faz nada (só pra frente)
  if(dx < -SWIPE_PX) void advance()
 }

 return(

  <div
   className={styles.screen}
   role="dialog"
   aria-modal="true"
   aria-labelledby={titleId}
  >

   <div
    className={styles.stage}
    onClick={handleStageTap}
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
   >

    {leaving !== null && (
     <div
      key={`leave-${leaving}`}
      className={`${styles.page} ${styles.pageLeave}`}
      aria-hidden="true"
     >
      <div className={styles.iconWrap}>
       <span className={styles.iconGlyph}>
        <PageIcon page={PAGES[leaving]} />
       </span>
      </div>
      <div className={styles.title}>
       <span className={styles.text}>{PAGES[leaving].title}</span>
      </div>
      <p className={styles.body}>
       <span className={styles.text}>{PAGES[leaving].body}</span>
      </p>
     </div>
    )}

    <div
     key={`page-${index}`}
     className={`${styles.page} ${reduce ? "" : styles.pageEnter}`}
    >

     <div className={styles.iconWrap} aria-hidden="true">
      <span className={`${styles.iconGlyph} ${styles[page.motion]}`}>
       <PageIcon page={page} />
      </span>
     </div>

     <h1 id={titleId} className={styles.title}>
      <span className={styles.srOnly}>{page.title}</span>
      <span className={styles.text} data-anim="title" aria-hidden="true">
       {title.text}
       {!title.done && <span className={styles.caret} />}
      </span>
     </h1>

     <p className={styles.body}>
      <span className={styles.srOnly}>{page.body}</span>
      <span className={styles.text} data-anim="body" aria-hidden="true">{body.text}</span>
     </p>

    </div>

   </div>

   <div className={styles.footer}>

    <div
     className={styles.dots}
     role="group"
     aria-label={`Página ${index + 1} de ${PAGES.length}`}
    >
     {PAGES.map((_,i)=>(
      <span
       key={i}
       className={`${styles.dot} ${i === index ? styles.dotOn : ""} ${i < index ? styles.dotDone : ""}`}
      />
     ))}
    </div>

    <button
     ref={advanceRef}
     type="button"
     className={styles.advance}
     onClick={()=> void advance()}
     disabled={finishing}
    >
     {isLast ? (finishing ? "Abrindo…" : "Começar") : "Próximo"}
    </button>

   </div>

  </div>

 )

}
