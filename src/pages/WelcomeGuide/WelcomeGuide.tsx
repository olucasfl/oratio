import { useEffect, useId, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Sunrise, Cross, BookOpen } from "lucide-react"

import { markWelcomeSeen } from "../../services/welcomeService"

import styles from "./WelcomeGuide.module.css"

/*
 Guia de boas-vindas de primeira entrada — spec `docs/specs/boas-vindas.md`.

 Tela cheia, no máximo 3 páginas, navegação só pra frente ("Próximo" →
 "Começar"), sem "pular" e sem botão de saída: a pessoa precisa ver que
 aquilo acaba (indicador de progresso) e só sai ao concluir. `welcomeSeenAt`
 só é carimbado ao tocar "Começar" na última página — fechar o app no meio
 recomeça da página 1 no próximo login (comportamento correto p/ um guia sem
 pular).

 A visibilidade e a unicidade são governadas por `showWelcome` do
 `GET /users/me` (o shell `WelcomeGate` redireciona pra cá) — este componente
 não decide se aparece.
*/

interface Page{
 icon: typeof Sunrise
 title: string
 body: string
}

const PAGES: Page[] = [
 {
  icon: Sunrise,
  title: "Bem-vindo ao Oratio",
  body: "Seu espaço de oração diária. Orações, terço, consagração e o Santo do Dia, sempre à mão.",
 },
 {
  icon: Cross,
  title: "Reze e acompanhe",
  body: "Marque suas orações, acompanhe a consagração e veja seu progresso ao longo dos dias.",
 },
 {
  icon: BookOpen,
  title: "Estude e converse",
  body: "Bíblia de Estudo para marcar e organizar versículos, e o Vox para tirar dúvidas sobre a fé.",
 },
]

export default function WelcomeGuide(){

 const navigate = useNavigate()
 const titleId = useId()

 const [index,setIndex] = useState(0)
 const [finishing,setFinishing] = useState(false)

 const advanceRef = useRef<HTMLButtonElement>(null)

 const isLast = index === PAGES.length - 1
 const page = PAGES[index]
 const Icon = page.icon

 // Move o foco pro botão de avanço a cada página — sem botão de saída, é o
 // controle principal, e um leitor de tela anuncia o novo rótulo/estado.
 useEffect(()=>{
  advanceRef.current?.focus()
 },[index])

 async function handleAdvance(){

  if(finishing) return

  if(!isLast){
   setIndex((i)=> i + 1)
   return
  }

  // Última página: carimba a conclusão e entra no app. Se a chamada falhar
  // (rede), entra assim mesmo — não prender a pessoa na porta do app; o
  // `showWelcome` volta `true` no próximo boot e o guia reaparece uma vez.
  setFinishing(true)

  try{
   await markWelcomeSeen()
  }catch{
   /* melhor esforço — segue pra Home de qualquer jeito */
  }

  navigate("/oratio/home", { replace: true })
 }

 return(

  <div
   className={styles.screen}
   role="dialog"
   aria-modal="true"
   aria-labelledby={titleId}
  >

   <div className={styles.card}>

    <div className={styles.iconWrap} aria-hidden="true">
     <Icon size={64} strokeWidth={1.5} />
    </div>

    <h1 id={titleId} className={styles.title}>
     {page.title}
    </h1>

    <p className={styles.body}>
     {page.body}
    </p>

    <div
     className={styles.dots}
     role="group"
     aria-label={`Página ${index + 1} de ${PAGES.length}`}
    >
     {PAGES.map((_,i)=>(
      <span
       key={i}
       className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
      />
     ))}
    </div>

    <button
     ref={advanceRef}
     type="button"
     className={styles.advance}
     onClick={handleAdvance}
     disabled={finishing}
    >
     {isLast ? (finishing ? "Abrindo…" : "Começar") : "Próximo"}
    </button>

   </div>

  </div>

 )

}
