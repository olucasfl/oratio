import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { usePublishHeightVar } from "./usePublishHeightVar"

let observeSpy: ReturnType<typeof vi.fn>
let disconnectSpy: ReturnType<typeof vi.fn>
let lastCallback: ResizeObserverCallback | null = null

beforeEach(() => {
  observeSpy = vi.fn()
  disconnectSpy = vi.fn()
  lastCallback = null

  vi.stubGlobal("ResizeObserver", class {
    constructor(cb: ResizeObserverCallback) { lastCallback = cb }
    observe = observeSpy
    disconnect = disconnectSpy
    unobserve = vi.fn()
  })
})

function ref<T>(current: T) {
  return { current }
}

function withOffsetHeight(el: HTMLElement, height: number) {
  Object.defineProperty(el, "offsetHeight", { configurable: true, value: height })
  return el
}

describe("usePublishHeightVar", () => {

  it("publishes the measured element's offsetHeight as a CSS var on the target, on mount", () => {
    const measure = withOffsetHeight(document.createElement("div"), 64)
    const target = document.createElement("div")

    renderHook(() => usePublishHeightVar(ref(measure), ref(target), "--bar-height"))

    expect(target.style.getPropertyValue("--bar-height")).toBe("64px")
    expect(observeSpy).toHaveBeenCalledWith(measure)
  })

  it("re-syncs when the ResizeObserver callback fires with a changed height", () => {
    const measure = withOffsetHeight(document.createElement("div"), 64)
    const target = document.createElement("div")

    renderHook(() => usePublishHeightVar(ref(measure), ref(target), "--bar-height"))

    withOffsetHeight(measure, 90)
    lastCallback!([] as unknown as ResizeObserverEntry[], {} as ResizeObserver)

    expect(target.style.getPropertyValue("--bar-height")).toBe("90px")
  })

  it("does nothing when either ref isn't attached yet", () => {
    const target = document.createElement("div")
    renderHook(() => usePublishHeightVar(ref(null), ref(target), "--bar-height"))

    expect(observeSpy).not.toHaveBeenCalled()
    expect(target.style.getPropertyValue("--bar-height")).toBe("")
  })

  it("disconnects the observer on unmount", () => {
    const measure = document.createElement("div")
    const target = document.createElement("div")

    const { unmount } = renderHook(() => usePublishHeightVar(ref(measure), ref(target), "--bar-height"))
    unmount()

    expect(disconnectSpy).toHaveBeenCalled()
  })

})
