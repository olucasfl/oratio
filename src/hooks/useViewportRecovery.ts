import { useEffect } from "react"

/*
Bug relatado: depois que a folha nativa de compartilhamento
(navigator.share) fecha num PWA instalado (Android, principalmente),
o navegador fica com a noção interna do viewport visual "presa" numa
altura errada — relatado como a navbar flutuando na metade da tela e
o scroll batendo num "limite" fantasma no meio da página. Não é só a
navbar: qualquer position:fixed e qualquer max-height:Ndvh reflete
esse mesmo valor de viewport errado, então a correção precisa ser
global, não por componente.

Duas tentativas anteriores (só na navbar) não resolveram:
1) recalcular um "bottom" customizado a cada evento de
   visualViewport.resize — o navegador dispara VÁRIOS resizes
   intermediários enquanto a sheet termina de fechar, cada um com um
   valor diferente, e cada re-render aplicava um offset novo — isso
   provavelmente CAUSAVA o "sobe e desce" relatado.
2) rolar a página pro MESMO lugar (scrollTo(x, y)) pra forçar
   recálculo — sem efeito nenhum: como não há delta de scroll de
   verdade, o navegador não tem motivo pra processar nada e ignora a
   chamada silenciosamente (é essencialmente um no-op).

Essa versão força um scroll de verdade (1px pra baixo e de volta),
que gera eventos de scroll reais e obriga o compositor a resincronizar
a posição/tamanho do viewport visual contra a realidade — e faz isso
no nível do documento inteiro (não um elemento isolado), repetindo a
correção algumas vezes ao longo de ~1s pra cobrir o caso da sheet
ainda estar terminando de fechar quando a primeira tentativa roda.
*/
export function useViewportRecovery(){

 useEffect(()=>{

  let pending = false

  function realScrollNudge(){

   const doc = document.scrollingElement || document.documentElement
   const y = doc.scrollTop
   const x = doc.scrollLeft

   // se não há nada pra rolar (página cabe inteira na tela), rola o
   // html/body mesmo assim — 1px de overscroll não é visível e ainda
   // gera o evento de scroll que queremos
   window.scrollBy(0, 1)
   window.scrollTo(x, y)

  }

  function recover(){

   if(pending) return
   pending = true

   const delays = [0, 120, 350, 700]

   delays.forEach((delay)=>{
    setTimeout(realScrollNudge, delay)
   })

   setTimeout(()=>{ pending = false }, 800)

  }

  document.addEventListener("visibilitychange", recover)
  window.addEventListener("pageshow", recover)
  window.addEventListener("focus", recover)

  return ()=>{
   document.removeEventListener("visibilitychange", recover)
   window.removeEventListener("pageshow", recover)
   window.removeEventListener("focus", recover)
  }

 },[])

}
