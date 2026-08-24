import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

vi.mock("./api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

import api from "./api"
import {
  isPushSupported,
  getPermission,
  getPushStatus,
  enablePush,
  disablePush,
  sendTestPush,
  syncPushTimezone,
} from "./pushService"

// `api` é totalmente mockado acima.
const mockedApi = api as any // eslint-disable-line @typescript-eslint/no-explicit-any

/*
jsdom não implementa a Push API (serviceWorker/PushManager/Notification),
então cada teste liga/desliga esse "suporte" manualmente via stubs globais.
Isso testa os dois lados de `isPushSupported()` de verdade, em vez de
assumir que o ambiente já suporta.
*/
let fakeNotification: { permission: NotificationPermission; requestPermission: ReturnType<typeof vi.fn> }
let fakeSubscription: { endpoint: string; toJSON: () => unknown; unsubscribe: ReturnType<typeof vi.fn> }
let fakeRegistration: { pushManager: { subscribe: ReturnType<typeof vi.fn>; getSubscription: ReturnType<typeof vi.fn> } }

function stubSupported() {
  vi.stubGlobal("PushManager", class {})
  vi.stubGlobal("Notification", fakeNotification)
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: { ready: Promise.resolve(fakeRegistration) },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
  delete (navigator as any).serviceWorker // eslint-disable-line @typescript-eslint/no-explicit-any

  fakeSubscription = {
    endpoint: "https://push.example/abc",
    toJSON: () => ({ keys: { p256dh: "p256dh-val", auth: "auth-val" } }),
    unsubscribe: vi.fn().mockResolvedValue(true),
  }
  fakeRegistration = {
    pushManager: {
      subscribe: vi.fn().mockResolvedValue(fakeSubscription),
      getSubscription: vi.fn().mockResolvedValue(null),
    },
  }
  fakeNotification = {
    permission: "default",
    requestPermission: vi.fn().mockResolvedValue("granted"),
  }
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete (navigator as any).serviceWorker // eslint-disable-line @typescript-eslint/no-explicit-any
})

describe("isPushSupported", () => {

  it("is false when serviceWorker/PushManager/Notification are unavailable", () => {
    expect(isPushSupported()).toBe(false)
  })

  it("is true once serviceWorker, PushManager and Notification are all present", () => {
    stubSupported()
    expect(isPushSupported()).toBe(true)
  })

})

describe("getPermission", () => {

  it("returns 'unsupported' when push isn't supported at all", () => {
    expect(getPermission()).toBe("unsupported")
  })

  it("returns Notification.permission when push is supported", () => {
    stubSupported()
    fakeNotification.permission = "granted"
    expect(getPermission()).toBe("granted")
  })

})

describe("getPushStatus", () => {

  it("is false when push isn't supported", async () => {
    await expect(getPushStatus()).resolves.toBe(false)
  })

  it("is true when this device already has an active subscription", async () => {
    stubSupported()
    fakeRegistration.pushManager.getSubscription.mockResolvedValue(fakeSubscription)
    await expect(getPushStatus()).resolves.toBe(true)
  })

  it("is false when there is no subscription on this device", async () => {
    stubSupported()
    fakeRegistration.pushManager.getSubscription.mockResolvedValue(null)
    await expect(getPushStatus()).resolves.toBe(false)
  })

  it("is false, not a thrown error, when checking the subscription fails", async () => {
    stubSupported()
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { ready: Promise.reject(new Error("boom")) },
    })
    await expect(getPushStatus()).resolves.toBe(false)
  })

})

describe("enablePush", () => {

  it("throws 'unsupported' when push isn't supported", async () => {
    await expect(enablePush()).rejects.toThrow("unsupported")
  })

  it("throws 'denied' when the user denies the permission prompt", async () => {
    stubSupported()
    fakeNotification.requestPermission.mockResolvedValue("denied")
    await expect(enablePush()).rejects.toThrow("denied")
  })

  it("throws 'no-key' when the backend has no VAPID public key configured", async () => {
    stubSupported()
    mockedApi.get.mockResolvedValue({ data: { publicKey: "" } })
    await expect(enablePush()).rejects.toThrow("no-key")
  })

  it("subscribes with the decoded VAPID key and sends the subscription + device timezone to the backend", async () => {
    stubSupported()
    // "QQ" (base64url, sem padding) decodifica pro único byte 0x41 ('A') —
    // trava a conversão base64url -> Uint8Array usada como applicationServerKey.
    mockedApi.get.mockResolvedValue({ data: { publicKey: "QQ" } })
    mockedApi.post.mockResolvedValue({ data: { ok: true } })

    await enablePush()

    expect(fakeRegistration.pushManager.subscribe).toHaveBeenCalledWith({
      userVisibleOnly: true,
      applicationServerKey: Uint8Array.from([65]),
    })

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    expect(mockedApi.post).toHaveBeenCalledWith("/oratio/notifications/subscribe", {
      endpoint: "https://push.example/abc",
      p256dh: "p256dh-val",
      auth: "auth-val",
      timezone,
    })
  })

})

describe("disablePush", () => {

  it("does nothing when push isn't supported", async () => {
    await expect(disablePush()).resolves.toBeUndefined()
    expect(mockedApi.delete).not.toHaveBeenCalled()
  })

  it("does nothing (no API calls, nothing to unsubscribe) when there's no active subscription", async () => {
    stubSupported()
    fakeRegistration.pushManager.getSubscription.mockResolvedValue(null)
    await disablePush()
    expect(mockedApi.delete).not.toHaveBeenCalled()
  })

  it("removes the subscription on the backend and unsubscribes locally", async () => {
    stubSupported()
    fakeRegistration.pushManager.getSubscription.mockResolvedValue(fakeSubscription)
    mockedApi.delete.mockResolvedValue({ data: { ok: true } })

    await disablePush()

    expect(mockedApi.delete).toHaveBeenCalledWith("/oratio/notifications/subscribe", {
      data: { endpoint: "https://push.example/abc" },
    })
    expect(fakeSubscription.unsubscribe).toHaveBeenCalled()
  })

  it("still unsubscribes locally even when the backend removal call fails", async () => {
    stubSupported()
    fakeRegistration.pushManager.getSubscription.mockResolvedValue(fakeSubscription)
    mockedApi.delete.mockRejectedValue(new Error("network down"))

    await disablePush()

    expect(fakeSubscription.unsubscribe).toHaveBeenCalled()
  })

})

describe("sendTestPush", () => {

  it("posts to /oratio/notifications/test", async () => {
    mockedApi.post.mockResolvedValue({ data: {} })
    await sendTestPush()
    expect(mockedApi.post).toHaveBeenCalledWith("/oratio/notifications/test")
  })

})

/*
syncPushTimezone() é chamado sem gate em todo boot do app (App.tsx) — tem
que ser um no-op seguro quando push não está ligado, e nunca deve lançar
(é "melhor esforço" por design).
*/
describe("syncPushTimezone", () => {

  it("does not call the backend when push is not enabled on this device", async () => {
    await syncPushTimezone()
    expect(mockedApi.patch).not.toHaveBeenCalled()
  })

  it("patches the current device timezone when push is enabled", async () => {
    stubSupported()
    fakeRegistration.pushManager.getSubscription.mockResolvedValue(fakeSubscription)
    mockedApi.patch.mockResolvedValue({ data: { ok: true } })

    await syncPushTimezone()

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    expect(mockedApi.patch).toHaveBeenCalledWith("/oratio/notifications/timezone", { timezone })
  })

  it("never throws, even when the backend call fails", async () => {
    stubSupported()
    fakeRegistration.pushManager.getSubscription.mockResolvedValue(fakeSubscription)
    mockedApi.patch.mockRejectedValue(new Error("network down"))

    await expect(syncPushTimezone()).resolves.toBeUndefined()
  })

})
