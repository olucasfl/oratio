import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

import { useKeyboardOpen } from "./useKeyboardOpen"

type Listener = () => void

const origVV = Object.getOwnPropertyDescriptor(window, "visualViewport")
const origInner = window.innerHeight

let listeners: Record<string, Listener[]>

function mockViewport(height: number, offsetTop = 0) {
  listeners = { resize: [], scroll: [] }
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: {
      height,
      offsetTop,
      addEventListener: (type: string, fn: Listener) => listeners[type]?.push(fn),
      removeEventListener: (type: string, fn: Listener) => {
        listeners[type] = (listeners[type] || []).filter((l) => l !== fn)
      },
    },
  })
}

function setViewportHeight(height: number) {
  const vv = window.visualViewport as unknown as { height: number }
  vv.height = height
  listeners.resize.forEach((l) => l())
}

beforeEach(() => {
  vi.useFakeTimers()
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 })
  // rAF -> síncrono para o teste
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0)
    return 0
  })
  vi.stubGlobal("cancelAnimationFrame", () => {})
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  if (origVV) Object.defineProperty(window, "visualViewport", origVV)
  else Reflect.deleteProperty(window, "visualViewport")
  Object.defineProperty(window, "innerHeight", { configurable: true, value: origInner })
})

describe("useKeyboardOpen", () => {
  it("returns false when there is no visualViewport", () => {
    Reflect.deleteProperty(window, "visualViewport")
    const { result } = renderHook(() => useKeyboardOpen())
    expect(result.current).toBe(false)
  })

  it("returns false when the visible viewport matches the window", () => {
    mockViewport(800)
    const { result } = renderHook(() => useKeyboardOpen())
    expect(result.current).toBe(false)
  })

  it("becomes true when the viewport shrinks past the threshold (keyboard)", () => {
    mockViewport(800)
    const { result } = renderHook(() => useKeyboardOpen())

    act(() => setViewportHeight(450)) // teclado ~350px
    expect(result.current).toBe(true)

    act(() => setViewportHeight(800)) // teclado fechou
    expect(result.current).toBe(false)
  })

  it("ignores small shrinks (URL bar / rubber-band)", () => {
    mockViewport(800)
    const { result } = renderHook(() => useKeyboardOpen())

    act(() => setViewportHeight(740)) // 60px — abaixo do threshold
    expect(result.current).toBe(false)
  })

  it("stops listening on unmount", () => {
    mockViewport(800)
    const { unmount } = renderHook(() => useKeyboardOpen())
    expect(listeners.resize.length).toBe(1)
    unmount()
    expect(listeners.resize.length).toBe(0)
  })
})
