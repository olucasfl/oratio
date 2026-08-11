import api from "./api"

/*
Camada de push (Web Push + VAPID). Fala com o backend em
/oratio/notifications/* e com o Service Worker do navegador.

No iOS o push SÓ funciona com o app instalado na tela inicial
(PWA, iOS 16.4+) e a permissão precisa vir de um gesto do usuário —
por isso enablePush() é sempre chamado a partir de um clique.
*/

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

export function getPermission(): NotificationPermission | "unsupported" {
  if (!isPushSupported()) return "unsupported"
  return Notification.permission
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

/* Ativo = existe uma inscrição de push neste aparelho */
export async function getPushStatus(): Promise<boolean> {
  try {
    if (!isPushSupported()) return false
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    return !!sub
  } catch {
    return false
  }
}

/*
Liga o push: pede permissão, inscreve no navegador e manda as chaves
pro backend. Lança "denied" se o usuário negar, "unsupported" se o
aparelho não suportar, "no-key" se o servidor não tiver VAPID.
*/
export async function enablePush(): Promise<void> {
  if (!isPushSupported()) throw new Error("unsupported")

  const permission = await Notification.requestPermission()
  if (permission !== "granted") throw new Error("denied")

  const reg = await navigator.serviceWorker.ready

  const { data } = await api.get<{ publicKey: string }>(
    "/oratio/notifications/public-key",
  )

  if (!data?.publicKey) throw new Error("no-key")

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(data.publicKey) as BufferSource,
  })

  const json = sub.toJSON()
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"

  await api.post("/oratio/notifications/subscribe", {
    endpoint: sub.endpoint,
    p256dh: json.keys?.p256dh,
    auth: json.keys?.auth,
    timezone,
  })
}

/* Desliga o push: remove a inscrição do navegador e do backend */
export async function disablePush(): Promise<void> {
  if (!isPushSupported()) return

  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()

  if (sub) {
    await api
      .delete("/oratio/notifications/subscribe", { data: { endpoint: sub.endpoint } })
      .catch(() => {})
    await sub.unsubscribe().catch(() => {})
  }
}

/* Fase A — teste: pede pro backend disparar um push pra você mesmo */
export async function sendTestPush(): Promise<void> {
  await api.post("/oratio/notifications/test")
}

/* Mantém o fuso da inscrição em dia (chamado no boot, best-effort) */
export async function syncPushTimezone(): Promise<void> {
  try {
    if (!(await getPushStatus())) return
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    await api.patch("/oratio/notifications/timezone", { timezone })
  } catch {
    /* best-effort */
  }
}
