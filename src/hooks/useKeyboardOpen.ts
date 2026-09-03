import { useEffect, useState } from "react"

/*
Substitui o antigo useVisualViewportOffset.

Aquele hook PERSEGUIA o visualViewport pra manter a navbar colada no
rodapé — lia innerHeight − (vv.height + vv.offsetTop) a cada frame,
inclusive no evento `scroll`, e escrevia o valor direto no CSS. Isso
causava exatamente os bugs relatados:

 - no rubber-band do topo, vv.height/offsetTop oscilam por alguns
   frames → a navbar "sentia a pancada" e pulava;
 - depois do navigator.share(), o iOS reporta vv.height menor que o
   real por um tempo indeterminado → a navbar "voava" pra ~40% da tela
   e ficava solta, descendo/subindo conforme o scroll.

Num PWA standalone não existe barra de URL, então o layout viewport e o
visual viewport SÓ divergem de verdade quando o teclado abre. Este hook
detecta só isso: teclado aberto → a navbar sai de cena com
translateY(100%) (padrão de app de chat), em vez de tentar flutuar
acima dele. Nada de listener de scroll, nada de perseguir valor errado.
*/

// Diferença mínima (px) entre a janela e o viewport visível para
// considerar "teclado aberto". Barra de URL/rubber-band ficam bem
// abaixo disso; teclado de celular é sempre > 200px.
const KEYBOARD_THRESHOLD = 120

function computeKeyboardOpen(): boolean {
  const vv = window.visualViewport
  if (!vv) return false
  const hidden = window.innerHeight - vv.height - vv.offsetTop
  return hidden > KEYBOARD_THRESHOLD
}

export function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(computeKeyboardOpen)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    let raf = 0
    const update = () => {
      raf = 0
      setOpen(computeKeyboardOpen())
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    // só `resize` — nunca `scroll` (era o que fazia a navbar pular).
    // schedule() logo abaixo ressincroniza uma vez, de forma assíncrona.
    vv.addEventListener("resize", schedule)
    schedule()

    return () => {
      if (raf) cancelAnimationFrame(raf)
      vv.removeEventListener("resize", schedule)
    }
  }, [])

  return open
}
