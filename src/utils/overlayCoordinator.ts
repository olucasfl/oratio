/*
Registro simples de "algum popup bloqueante está aberto" — pra avisos
que aparecem sozinhos (ex: sugestão de instalar o app) saberem que não
devem aparecer por cima de um modal que já está na tela (aviso de
conta, gate de recurso bloqueado, etc), em vez de empilhar.
*/

const openIds = new Set<string>()
const listeners = new Set<() => void>()

export function markOverlayOpen(id: string){
  openIds.add(id)
  listeners.forEach((fn) => fn())
}

export function markOverlayClosed(id: string){
  openIds.delete(id)
  listeners.forEach((fn) => fn())
}

export function isOverlayBlocking(){
  return openIds.size > 0
}

export function subscribeOverlay(fn: () => void){
  listeners.add(fn)
  return () => listeners.delete(fn)
}
