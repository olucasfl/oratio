import { useEffect, useId, useRef, useState } from "react"
import type { TouchEvent } from "react"
import { useNavigate } from "react-router-dom"
import {
 Sunrise, Cross, BookOpen,
 Calendar, Flame, Circle, HandHeart,
 CalendarCheck, HeartHandshake, Clock,
 Highlighter, Book, MessageCircle, TrendingUp,
} from "lucide-react"

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

 Cada página é um capítulo: título curto, uma linha de introdução, e uma
 lista de 3–4 recursos (ícone pequeno + nome + meia linha). Só apresentação
 do que o app tem — nada de conteúdo devocional.

 Movimento (aprovado, não muda):
 - título e introdução se digitam (padrão do Vox — ver `useTypewriter`) em
   tempos diferentes; os itens da lista entram em sequência depois;
 - a página que sai desliza pra esquerda enquanto a que entra vem da direita;
 - o ícone grande tem um movimento próprio, sutil, contínuo;
 - tocar na tela completa a animação em curso; arrastar pra esquerda avança.
 - `prefers-reduced-motion: reduce` → tudo completo e instantâneo, nenhuma
   animação de entrada, nenhuma transição, e a página que sai nem é montada.
   As animações vivem só sob `@media (prefers-reduced-motion: no-preference)`.

 A11y: `role="dialog"` + `aria-modal` + `aria-labelledby` no título; o foco
 vai pro botão de avanço a cada página. A camada que se digita e a lista
 visível são `aria-hidden`; o texto completo (título, introdução e a lista
 inteira como `<ul>/<li>`) existe desde o início numa cópia `.srOnly`. Nada
 de `aria-live`.
*/

interface Feature{
 icon: typeof Sunrise
 name: string
 note: string
}

interface Page{
 icon: typeof Sunrise
 motion: string
 title: string
 intro: string
 features: Feature[]
}

const PAGES: Page[] = [
 {
  icon: Sunrise,
  motion: "iconSunrise",
  title: "Oração diária",
  intro: "O essencial de cada dia, sempre à mão.",
  features: [
   { icon: Calendar,  name: "Liturgia do dia",       note: "As leituras e a oração da Missa de hoje." },
   { icon: Flame,     name: "Santo do dia",           note: "Quem a Igreja celebra hoje, com uma biografia." },
   { icon: Circle,    name: "Terço & Rosário",        note: "Os mistérios guiados passo a passo." },
   { icon: HandHeart, name: "Orações e Ladainhas",    note: "Uma biblioteca para rezar quando quiser." },
  ],
 },
 {
  icon: Cross,
  motion: "iconCross",
  title: "Caminhos",
  intro: "Devoções mais longas, para percorrer com calma.",
  features: [
   { icon: CalendarCheck,  name: "Consagração de 33 dias", note: "O preparo diário, com o seu progresso guardado." },
   { icon: HeartHandshake, name: "Guia de Confissão",      note: "Exame de consciência, como se confessar e o ato de contrição." },
   { icon: Clock,          name: "Uma Home que acompanha o dia", note: "\"Neste momento\" e \"Para você hoje\" mudam conforme a hora." },
  ],
 },
 {
  icon: BookOpen,
  motion: "iconBook",
  title: "Estudo e conversa",
  intro: "Para aprofundar e tirar dúvidas.",
  features: [
   { icon: Highlighter,   name: "Bíblia de Estudo",   note: "Marque versículos, faça anotações e reúna em coleções." },
   { icon: Book,          name: "Catecismo",          note: "O texto completo, para consultar quando precisar." },
   { icon: MessageCircle, name: "Vox",                note: "Converse sobre a fé com um assistente católico." },
   { icon: TrendingUp,    name: "Perfil e progresso", note: "Sua sequência de oração e o que você já rezou." },
  ],
 },
]

// Coreografia (ms). A introdução começa depois que o título termina de
// digitar; a lista entra depois disso (via `animation-delay` no CSS).
const TITLE_START = 260
const TITLE_STEP = 30
const TITLE_DIV = 10
const INTRO_STEP = 14
const INTRO_DIV = 24
const INTRO_GAP = 200

const LEAVE_MS = 420   // > duração da animação de saída no CSS
const SWIPE_PX = 56

function prefersReducedMotion(): boolean{
 if(typeof window === "undefined" || typeof window.matchMedia !== "function") return false
 return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function introStartFor(title: string): number{
 const chunk = Math.max(1, Math.round(title.length / TITLE_DIV))
 const titleDur = Math.ceil(title.length / chunk) * TITLE_STEP
 return TITLE_START + titleDur + INTRO_GAP
}

function PageIcon({ page }: { page: Page }){
 const Icon = page.icon
 return <Icon size={40} strokeWidth={1.5} />
}

function FeatureList({ features, className, hidden }: {
 features: Feature[]
 className: string
 hidden?: boolean
}){
 return(
  <ul className={className} aria-hidden={hidden || undefined}>
   {features.map((f)=>{
    const Icon = f.icon
    return(
     <li key={f.name} className={styles.feature}>
      <span className={styles.featureIcon}><Icon size={17} strokeWidth={1.75} /></span>
      <span className={styles.featureName}>{f.name}</span>
      <span className={styles.featureNote}>{f.note}</span>
     </li>
    )
   })}
  </ul>
 )
}

export default function WelcomeGuide(){

 const navigate = useNavigate()
 const titleId = useId()

 const [reduce] = useState(prefersReducedMotion)
 const [index,setIndex] = useState(0)
 const [leaving,setLeaving] = useState<number | null>(null)
 const [rushedIndex,setRushedIndex] = useState<number | null>(null)
 const [finishing,setFinishing] = useState(false)

 const advanceRef = useRef<HTMLButtonElement>(null)
 const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
 const touchX = useRef<number | null>(null)

 const page = PAGES[index]
 const isLast = index === PAGES.length - 1
 const rushed = rushedIndex === index

 const title = useTypewriter(page.title, {
  animate: !reduce && !rushed,
  startDelay: TITLE_START,
  stepMs: TITLE_STEP,
  chunkDivisor: TITLE_DIV,
 })
 const intro = useTypewriter(page.intro, {
  animate: !reduce && !rushed,
  startDelay: introStartFor(page.title),
  stepMs: INTRO_STEP,
  chunkDivisor: INTRO_DIV,
 })

 // Foco no botão de avanço a cada página — sem botão de saída, é o controle
 // principal, e o leitor de tela anuncia o novo rótulo/estado.
 useEffect(()=>{
  advanceRef.current?.focus()
 },[index])

 useEffect(()=>()=>{
  if(leaveTimer.current) clearTimeout(leaveTimer.current)
 },[])

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
 // DOM; isto só adianta a camada visual (typewriter + entrada da lista).
 function handleStageTap(){
  if(rushed) return
  setRushedIndex(index)
  title.skip()
  intro.skip()
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
      <div className={styles.title}><span className={styles.text}>{PAGES[leaving].title}</span></div>
      <p className={styles.intro}><span className={styles.text}>{PAGES[leaving].intro}</span></p>
      <FeatureList features={PAGES[leaving].features} className={styles.features} hidden />
     </div>
    )}

    <div
     key={`page-${index}`}
     className={`${styles.page} ${reduce ? "" : styles.pageEnter} ${rushed ? styles.settled : ""}`}
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

     <p className={styles.intro}>
      <span className={styles.srOnly}>{page.intro}</span>
      <span className={styles.text} data-anim="intro" aria-hidden="true">{intro.text}</span>
     </p>

     {/* cópia acessível — a lista inteira no DOM desde o início */}
     <ul className={styles.srOnly}>
      {page.features.map((f)=>(
       <li key={f.name}>{f.name}. {f.note}</li>
      ))}
     </ul>

     <FeatureList features={page.features} className={styles.features} hidden />

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
