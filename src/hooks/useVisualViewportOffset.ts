import { useEffect } from "react"

/*
Navbar "bugando" ao voltar do navigator.share() num PWA (Android): a
folha nativa deixa o LAYOUT viewport maior que o visível por um tempo,
então a navbar (position:fixed; bottom:var(--vv-bottom-offset)) ora fica
no fundo real, ora "voa" pra metade da tela conforme o scroll.

Já foram tentadas 5 correções que PERSEGUEM o viewport (offset por
estado do React, nudge de scroll, reflow, offset global, e a última com
debounce). Todas falham pela mesma razão: aplicam o valor do viewport
mesmo quando ele está momentaneamente ERRADO (grande demais), e aí a
navbar salta pro centro.

Esta versão muda a estratégia:

1. TRAVA DURA (o mais importante): o offset é limitado a MAX_LIFT px. O
   ajuste legítimo (barra de URL aparecendo/sumindo) é pequeno; o valor
   bugado pós-share é enorme (~meia tela). Limitando, a navbar pode subir
   no máximo um pouquinho — NUNCA vai pro centro nem "se solta". É o que
   resolve o sintoma de vez, mesmo se o viewport continuar mentindo.
2. Leitura contínua via requestAnimationFrame, escrita DIRETO no DOM
   (sem estado do React, sem debounce) — some a lag e o "pisca-pisca";
   assim que o Android reporta o viewport certo, a navbar assenta.
3. Sem dividir por --oratio-font-scale: a navbar é renderizada em portal
   no document.body, FORA do #root que tem o zoom, então não sofre a
   escala (a divisão de antes introduzia erro).
4. Ressincroniza em rajada ao voltar o foco/visibilidade e quando o
   ShareReadingButton chamar resyncViewport() logo após a folha fechar —
   é o que "fechar e abrir o app" faz na prática.
*/

const MAX_LIFT = 96 // teto de subida da navbar (px de tela real)

function readOffset(): number {
  const vv = window.visualViewport
  if (!vv) return 0
  const raw = Math.round(window.innerHeight - (vv.height + vv.offsetTop))
  // clamp: nunca negativo, nunca mais que MAX_LIFT (anti "voar pro centro")
  return Math.min(Math.max(0, raw), MAX_LIFT)
}

function applyOffset() {
  document.documentElement.style.setProperty(
    "--vv-bottom-offset",
    `${readOffset()}px`,
  )
}

// Chamado pelo botão de compartilhar assim que a folha nativa fecha:
// relê o viewport em rajada por ~1,2s até ele parar de mentir.
export function resyncViewport() {
  let n = 0
  const id = setInterval(() => {
    applyOffset()
    if (++n > 24) clearInterval(id)
  }, 50)
}

export function useVisualViewportOffset() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    let raf = 0
    const schedule = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0
          applyOffset()
        })
      }
    }

    applyOffset()

    vv.addEventListener("resize", schedule)
    vv.addEventListener("scroll", schedule)
    window.addEventListener("resize", schedule)
    window.addEventListener("orientationchange", schedule)

    // "fechar e abrir o app" corrige — replicamos ao reganhar visibilidade/foco
    const onWake = () => resyncViewport()
    window.addEventListener("visibilitychange", onWake)
    window.addEventListener("pageshow", onWake)
    window.addEventListener("focus", onWake)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      vv.removeEventListener("resize", schedule)
      vv.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      window.removeEventListener("orientationchange", schedule)
      window.removeEventListener("visibilitychange", onWake)
      window.removeEventListener("pageshow", onWake)
      window.removeEventListener("focus", onWake)
    }
  }, [])
}
