import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, afterEach, vi } from "vitest"
import { useOffline } from "./useOffline"

const originalOnLine = window.navigator.onLine

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", { configurable: true, value })
}

afterEach(() => {
  setOnline(originalOnLine)
})

describe("useOffline", () => {

  it("starts offline when navigator.onLine is false", () => {
    setOnline(false)
    const { result } = renderHook(() => useOffline())
    expect(result.current).toBe(true)
  })

  it("starts online when navigator.onLine is true", () => {
    setOnline(true)
    const { result } = renderHook(() => useOffline())
    expect(result.current).toBe(false)
  })

  it("flips to offline when the window 'offline' event fires", () => {
    setOnline(true)
    const { result } = renderHook(() => useOffline())

    act(() => { window.dispatchEvent(new Event("offline")) })

    expect(result.current).toBe(true)
  })

  it("flips back to online when the window 'online' event fires", () => {
    setOnline(false)
    const { result } = renderHook(() => useOffline())

    act(() => { window.dispatchEvent(new Event("online")) })

    expect(result.current).toBe(false)
  })

  it("removes its online/offline listeners on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener")
    const { unmount } = renderHook(() => useOffline())

    unmount()

    const eventNames = removeSpy.mock.calls.map(([name]) => name)
    expect(eventNames).toContain("online")
    expect(eventNames).toContain("offline")
  })

})
