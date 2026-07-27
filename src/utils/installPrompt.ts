interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null

/*
Precisa rodar assim que o módulo é importado (não dentro de um
componente) — o Chrome dispara esse evento uma única vez, cedo no
carregamento da página, e se ninguém estiver ouvindo ainda nesse
momento ele se perde de vez, e o botão "Instalar agora" nunca teria
o que chamar.
*/
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault()
  deferredPrompt = e as BeforeInstallPromptEvent
})

window.addEventListener("appinstalled", () => {
  deferredPrompt = null
})

export function canInstallDirectly(){
  return deferredPrompt !== null
}

export async function promptInstall(){
  if(!deferredPrompt) return false

  await deferredPrompt.prompt()
  const choice = await deferredPrompt.userChoice

  deferredPrompt = null

  return choice.outcome === "accepted"
}
