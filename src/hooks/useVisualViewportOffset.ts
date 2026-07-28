import { useEffect } from "react"

/*
Histórico: já foram tentadas 4 correções pra navbar "bugando" depois
de voltar do navigator.share() num PWA instalado (Android,
principalmente) — nudge de scroll, reflow forçado, etc. Nenhuma
resolveu, e a descrição mais recente do bug deixou o mecanismo real
mais claro: rolando a tela pra baixo a navbar assenta no lugar certo;
rolando pra cima ela "sobe" e para na metade — ou seja, o valor que o
CSS usa pra saber onde fica o fundo real da tela (visualViewport)
fica desatualizado especificamente durante/logo depois da folha
nativa de compartilhamento, e só se corrige sozinho em certas
transições de scroll.

A ÚNICA fonte confiável desse valor é window.visualViewport, lido ao
vivo — é literalmente a API que existe pra isso. A primeira tentativa
(há algumas versões atrás) já usava isso, mas aplicava o offset via
estado do React em CADA evento de resize/scroll do visualViewport —
e como esses eventos disparam várias vezes em sequência enquanto a
sheet nativa termina de fechar (cada tick com um valor intermediário
diferente), cada re-render aplicava um offset novo, e ISSO que causava
a navbar visivelmente "subindo e descendo". A falha não era a fonte
de dados, era aplicar cada valor intermediário sem esperar as coisas
pararem de mudar.

Essa versão faz a mesma leitura, mas:
- aplica via propriedade customizada de CSS (--vv-bottom-offset) num
  ref direto, sem passar pelo estado do React — zero re-render, zero
  chance de "piscar" um valor errado na tela;
- só COMMITA um valor novo depois que os eventos do visualViewport
  pararem de disparar por 120ms (debounce) — ignora os valores
  intermediários da transição, só aplica quando ela já assentou.
*/
export function useVisualViewportOffset(){

 useEffect(()=>{

  const vv = window.visualViewport
  if(!vv) return

  let debounceId: ReturnType<typeof setTimeout> | null = null

  function apply(){

   const offset = Math.max(
    0,
    Math.round(window.innerHeight - (vv!.height + vv!.offsetTop))
   )

   document.documentElement.style.setProperty(
    "--vv-bottom-offset",
    `${offset}px`
   )

  }

  function onChange(){

   if(debounceId) clearTimeout(debounceId)
   debounceId = setTimeout(apply, 120)

  }

  apply()

  vv.addEventListener("resize", onChange)
  vv.addEventListener("scroll", onChange)

  return ()=>{
   if(debounceId) clearTimeout(debounceId)
   vv.removeEventListener("resize", onChange)
   vv.removeEventListener("scroll", onChange)
  }

 },[])

}
