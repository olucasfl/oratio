import { useContext, useEffect, useRef } from "react"

import {
 PullToRefreshContext,
 type RefreshHandler
} from "../contexts/PullToRefreshContext"

/*
Registra a função de recarregar dados dessa tela no PullToRefresh
global (montado uma vez em App.tsx, em volta de <Routes>). Só a tela
atualmente montada tem handler ativo — trocar de rota desmonta a tela
anterior (limpando o handler dela) antes da próxima montar o dela.

Só uma função por vez pode reagir ao puxar; se a tela não chamar esse
hook, o gesto simplesmente não ativa nela (sem handler registrado, o
PullToRefresh ignora o toque e deixa o scroll normal acontecer).

`enabled=false` desliga o gesto sem precisar desmontar nada — útil
pra telas que só às vezes fazem sentido (ex: com um modal aberto).
*/
export function usePullToRefresh(
 onRefresh: () => void | Promise<void>,
 enabled = true
){

 const ctx = useContext(PullToRefreshContext)

 const handlerRef = useRef(onRefresh)

 useEffect(()=>{
  handlerRef.current = onRefresh
 })

 useEffect(()=>{

  if(!ctx || !enabled) return

  const stableHandler: RefreshHandler = ()=>
   Promise.resolve(handlerRef.current())

  ctx.register(stableHandler)

  return ()=> ctx.register(null)

 },[ctx, enabled])

}
