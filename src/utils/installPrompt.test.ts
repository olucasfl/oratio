import { describe, it, expect, beforeEach } from "vitest"
import { canInstallDirectly, wasInstalled, promptInstall } from "./installPrompt"

function fireBeforeInstallPrompt(outcome: "accepted" | "dismissed" = "accepted") {
  const evt = new Event("beforeinstallprompt", { cancelable: true }) as any // eslint-disable-line @typescript-eslint/no-explicit-any
  evt.prompt = () => Promise.resolve()
  evt.userChoice = Promise.resolve({ outcome })
  window.dispatchEvent(evt)
}

function fireAppInstalled() {
  window.dispatchEvent(new Event("appinstalled"))
}

// O módulo guarda `deferredPrompt` como estado privado, resetado só pelo
// evento "appinstalled" -- dispara ele + limpa localStorage antes de cada
// teste pra não vazar estado entre eles.
beforeEach(() => {
  fireAppInstalled()
  localStorage.clear()
})

describe("canInstallDirectly / promptInstall", () => {

  it("is false before any beforeinstallprompt event has fired", () => {
    expect(canInstallDirectly()).toBe(false)
  })

  it("becomes true once the browser fires beforeinstallprompt", () => {
    fireBeforeInstallPrompt()
    expect(canInstallDirectly()).toBe(true)
  })

  it("promptInstall resolves false immediately when there is nothing deferred", async () => {
    await expect(promptInstall()).resolves.toBe(false)
  })

  it("promptInstall shows the native prompt, resolves true when accepted, and consumes the deferred prompt", async () => {
    fireBeforeInstallPrompt("accepted")

    await expect(promptInstall()).resolves.toBe(true)
    expect(canInstallDirectly()).toBe(false)
  })

  it("promptInstall resolves false when the user dismisses the native prompt", async () => {
    fireBeforeInstallPrompt("dismissed")
    await expect(promptInstall()).resolves.toBe(false)
  })

})

describe("wasInstalled", () => {

  it("is false by default", () => {
    expect(wasInstalled()).toBe(false)
  })

  it("becomes true once appinstalled fires, and clears any deferred prompt", () => {
    fireBeforeInstallPrompt()
    expect(canInstallDirectly()).toBe(true)

    fireAppInstalled()

    expect(wasInstalled()).toBe(true)
    expect(canInstallDirectly()).toBe(false)
  })

})
