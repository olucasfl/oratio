import { renderHook } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { useVisualViewportOffset, resyncViewport } from "./useVisualViewportOffset"

function makeVisualViewport(overrides: Partial<{ height: number; offsetTop: number }> = {}) {
  const target = new EventTarget()
  return Object.assign(target, {
    height: overrides.height ?? 600,
    offsetTop: overrides.offsetTop ?? 0,
  }) as unknown as VisualViewport
}

let rafCallbacks: FrameRequestCallback[] = []

beforeEach(() => {
  rafCallbacks = []
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    rafCallbacks.push(cb)
    return rafCallbacks.length
  })
  vi.stubGlobal("cancelAnimationFrame", vi.fn())
  document.documentElement.style.removeProperty("--vv-bottom-offset")
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete (window as any).visualViewport // eslint-disable-line @typescript-eslint/no-explicit-any
  vi.useRealTimers()
})

function flushRaf() {
  const cbs = rafCallbacks.splice(0)
  cbs.forEach((cb) => cb(0))
}

describe("useVisualViewportOffset", () => {

  it("does nothing (no crash) when the browser has no visualViewport support", () => {
    delete (window as any).visualViewport // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(() => renderHook(() => useVisualViewportOffset())).not.toThrow()
  })

  it("applies the offset immediately on mount", () => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 700 })
    Object.defineProperty(window, "visualViewport", {
      configurable: true, value: makeVisualViewport({ height: 660, offsetTop: 0 }),
    })

    renderHook(() => useVisualViewportOffset())

    expect(document.documentElement.style.getPropertyValue("--vv-bottom-offset")).toBe("40px")
  })

  /*
  O núcleo da correção documentada no arquivo: um gap "bugado" (a folha
  nativa do compartilhar deixando o layout viewport gigante por um
  instante) NUNCA pode empurrar a navbar até o centro da tela -- só até
  MAX_LIFT (96px).
  */
  it("clamps an absurdly large gap (post-share bug) down to MAX_LIFT instead of letting the navbar fly to center", () => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 700 })
    Object.defineProperty(window, "visualViewport", {
      configurable: true, value: makeVisualViewport({ height: 350, offsetTop: 0 }),
    })

    renderHook(() => useVisualViewportOffset())

    expect(document.documentElement.style.getPropertyValue("--vv-bottom-offset")).toBe("96px")
  })

  it("never applies a negative offset", () => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 700 })
    Object.defineProperty(window, "visualViewport", {
      configurable: true, value: makeVisualViewport({ height: 750, offsetTop: 0 }),
    })

    renderHook(() => useVisualViewportOffset())

    expect(document.documentElement.style.getPropertyValue("--vv-bottom-offset")).toBe("0px")
  })

  it("re-applies (via rAF) when the visualViewport resizes", () => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 700 })
    const vv = makeVisualViewport({ height: 660, offsetTop: 0 })
    Object.defineProperty(window, "visualViewport", { configurable: true, value: vv })

    renderHook(() => useVisualViewportOffset())
    expect(document.documentElement.style.getPropertyValue("--vv-bottom-offset")).toBe("40px")

    ;(vv as unknown as { height: number }).height = 620
    vv.dispatchEvent(new Event("resize"))
    flushRaf()

    expect(document.documentElement.style.getPropertyValue("--vv-bottom-offset")).toBe("80px")
  })

  it("cleans up its listeners on unmount", () => {
    const vv = makeVisualViewport()
    Object.defineProperty(window, "visualViewport", { configurable: true, value: vv })
    const removeSpy = vi.spyOn(vv, "removeEventListener")
    const windowRemoveSpy = vi.spyOn(window, "removeEventListener")

    const { unmount } = renderHook(() => useVisualViewportOffset())
    unmount()

    expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function))
    expect(windowRemoveSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function))
  })

})

describe("resyncViewport", () => {

  it("re-applies the offset in a burst for ~1.2s, then stops itself", () => {
    vi.useFakeTimers()
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 700 })
    Object.defineProperty(window, "visualViewport", {
      configurable: true, value: makeVisualViewport({ height: 660, offsetTop: 0 }),
    })
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval")

    resyncViewport()
    vi.advanceTimersByTime(50 * 26)

    expect(document.documentElement.style.getPropertyValue("--vv-bottom-offset")).toBe("40px")
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

})
