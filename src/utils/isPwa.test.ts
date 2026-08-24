import { describe, it, expect, afterEach, vi } from "vitest"
import { isPWA } from "./isPwa"

afterEach(() => {
  vi.unstubAllGlobals()
  delete (window.navigator as any).standalone // eslint-disable-line @typescript-eslint/no-explicit-any
})

describe("isPWA", () => {

  it("is true when display-mode: standalone matches", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === "(display-mode: standalone)",
    }) as MediaQueryList)

    expect(isPWA()).toBe(true)
  })

  it("is true on iOS Safari when navigator.standalone is set, even without matchMedia support", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }) as MediaQueryList)
    Object.defineProperty(window.navigator, "standalone", { configurable: true, value: true })

    expect(isPWA()).toBe(true)
  })

  it("is false in a normal browser tab", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }) as MediaQueryList)

    expect(isPWA()).toBe(false)
  })

})
