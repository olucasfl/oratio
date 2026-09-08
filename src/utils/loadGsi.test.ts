import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

/*
loadGsi injeta o <script> do Google Identity Services uma vez e resolve
quando window.google.accounts.id aparece. jsdom não executa o script, então
simulamos: disparamos o "load" do <script> e populamos window.google à mão.
*/

function lastGsiScript() {
  const scripts = document.head.querySelectorAll<HTMLScriptElement>(
    'script[src="https://accounts.google.com/gsi/client"]',
  )
  return scripts[scripts.length - 1] ?? null
}

const fakeId = { initialize: vi.fn(), renderButton: vi.fn(), prompt: vi.fn(), cancel: vi.fn() }

beforeEach(() => {
  vi.resetModules()
  document.head.innerHTML = ""
  delete (window as unknown as { google?: unknown }).google
})

afterEach(() => {
  delete (window as unknown as { google?: unknown }).google
})

describe("loadGsi", () => {

  it("injects the GSI script once and resolves with google.accounts.id after it loads", async () => {
    const { loadGsi: load } = await import("./loadGsi")

    const p = load()

    const script = lastGsiScript()
    expect(script).not.toBeNull()
    expect(script?.async).toBe(true)

    // simula o carregamento do script
    ;(window as unknown as { google: unknown }).google = { accounts: { id: fakeId } }
    script?.dispatchEvent(new Event("load"))

    await expect(p).resolves.toBe(fakeId)
  })

  it("returns immediately (no new script) when google.accounts.id already exists", async () => {
    ;(window as unknown as { google: unknown }).google = { accounts: { id: fakeId } }

    const { loadGsi: load } = await import("./loadGsi")
    await expect(load()).resolves.toBe(fakeId)
    expect(lastGsiScript()).toBeNull()
  })

  it("shares one script/promise across concurrent callers", async () => {
    const { loadGsi: load } = await import("./loadGsi")

    const p1 = load()
    const p2 = load()

    expect(
      document.head.querySelectorAll('script[src="https://accounts.google.com/gsi/client"]').length,
    ).toBe(1)

    ;(window as unknown as { google: unknown }).google = { accounts: { id: fakeId } }
    lastGsiScript()?.dispatchEvent(new Event("load"))

    await expect(p1).resolves.toBe(fakeId)
    await expect(p2).resolves.toBe(fakeId)
  })

  it("rejects when the script errors", async () => {
    const { loadGsi: load } = await import("./loadGsi")

    const p = load()
    lastGsiScript()?.dispatchEvent(new Event("error"))

    await expect(p).rejects.toThrow(/GSI/)
  })

})
