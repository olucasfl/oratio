import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, beforeEach } from "vitest"
import { useReadingSize } from "./useReadingSize"

const KEY = "oratio-reading-size"

beforeEach(() => {
  localStorage.clear()
})

describe("useReadingSize", () => {

  it("defaults to 'md' when nothing is stored", () => {
    const { result } = renderHook(() => useReadingSize())
    expect(result.current.size).toBe("md")
    expect(result.current.fontSize).toBe(18)
  })

  it("reads a validly stored size on init", () => {
    localStorage.setItem(KEY, "lg")
    const { result } = renderHook(() => useReadingSize())
    expect(result.current.size).toBe("lg")
    expect(result.current.fontSize).toBe(22)
  })

  it("falls back to 'md' for an invalid/legacy stored value", () => {
    localStorage.setItem(KEY, "huge")
    const { result } = renderHook(() => useReadingSize())
    expect(result.current.size).toBe("md")
  })

  it("setSize updates state and persists the choice", () => {
    const { result } = renderHook(() => useReadingSize())

    act(() => { result.current.setSize("sm") })

    expect(result.current.size).toBe("sm")
    expect(result.current.fontSize).toBe(15)
    expect(localStorage.getItem(KEY)).toBe("sm")
  })

})
