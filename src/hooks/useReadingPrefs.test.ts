import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, beforeEach } from "vitest"
import { useReadingPrefs, FONT_MIN, FONT_MAX } from "./useReadingPrefs"

const KEY = "bibliaLeituraPrefs"

beforeEach(() => {
  localStorage.clear()
})

describe("useReadingPrefs", () => {

  it("returns sane defaults when nothing is stored", () => {
    const { result } = renderHook(() => useReadingPrefs())
    expect(result.current.prefs.theme).toBe("claro")
    expect(result.current.prefs.font).toBe("serif")
    expect(result.current.prefs.fontSize).toBeGreaterThanOrEqual(FONT_MIN)
    expect(result.current.lineHeight).toBeGreaterThan(1)
  })

  it("hydrates from a valid stored object", () => {
    localStorage.setItem(KEY, JSON.stringify({
      fontSize: 24, spacing: "solto", font: "sans", theme: "escuro", width: "largo",
    }))
    const { result } = renderHook(() => useReadingPrefs())
    expect(result.current.prefs).toEqual({
      fontSize: 24, spacing: "solto", font: "sans", theme: "escuro", width: "largo",
    })
  })

  it("ignores garbage in storage and falls back to defaults", () => {
    localStorage.setItem(KEY, "not json")
    const { result } = renderHook(() => useReadingPrefs())
    expect(result.current.prefs.theme).toBe("claro")
  })

  it("drops individual invalid fields but keeps the valid ones", () => {
    localStorage.setItem(KEY, JSON.stringify({ theme: "roxo", font: "sans" }))
    const { result } = renderHook(() => useReadingPrefs())
    expect(result.current.prefs.theme).toBe("claro")
    expect(result.current.prefs.font).toBe("sans")
  })

  it("update persists a patch and clamps the font size", () => {
    const { result } = renderHook(() => useReadingPrefs())

    act(() => { result.current.update({ fontSize: 999, theme: "sepia" }) })

    expect(result.current.prefs.fontSize).toBe(FONT_MAX)
    expect(result.current.prefs.theme).toBe("sepia")
    expect(JSON.parse(localStorage.getItem(KEY)!).theme).toBe("sepia")
  })

  it("clamps the font size at the lower bound too", () => {
    const { result } = renderHook(() => useReadingPrefs())
    act(() => { result.current.update({ fontSize: 2 }) })
    expect(result.current.prefs.fontSize).toBe(FONT_MIN)
  })

  it("exposes a bigger lineHeight for looser spacing", () => {
    const { result } = renderHook(() => useReadingPrefs())
    const normal = result.current.lineHeight
    act(() => { result.current.update({ spacing: "solto" }) })
    expect(result.current.lineHeight).toBeGreaterThan(normal)
  })
})
