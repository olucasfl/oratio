import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { useLiturgy } from "./useLiturgy"

const LITURGY_URL = "https://finance-api-y0ol.onrender.com/liturgia"
const CACHE_KEY = "last_liturgy"

function today() {
  return new Date().toLocaleDateString("pt-BR")
}

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal("fetch", vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("useLiturgy", () => {

  it("fetches on mount and caches the result for today", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true, json: async () => ({ liturgia: "X" }),
    })

    const { result } = renderHook(() => useLiturgy())
    expect(result.current.loadingLiturgy).toBe(true)

    await waitFor(() => expect(result.current.loadingLiturgy).toBe(false))

    expect(result.current.liturgy).toEqual({ liturgia: "X" })
    expect(fetch).toHaveBeenCalledWith(LITURGY_URL, { cache: "no-store" })

    const cached = JSON.parse(localStorage.getItem(CACHE_KEY)!)
    expect(cached).toEqual({ date: today(), data: { liturgia: "X" } })
  })

  it("shows the cached liturgy immediately while a fresh fetch is in flight, then replaces it once it resolves", async () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today(), data: { liturgia: "cache" } }))
    let resolveFetch!: (v: unknown) => void
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(new Promise((r) => { resolveFetch = r }))

    const { result } = renderHook(() => useLiturgy())

    expect(result.current.liturgy).toEqual({ liturgia: "cache" })

    resolveFetch({ ok: true, json: async () => ({ liturgia: "fresco" }) })
    await waitFor(() => expect(result.current.liturgy).toEqual({ liturgia: "fresco" }))
  })

  it("ignores a cache entry from a different day", () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: "01/01/2000", data: { liturgia: "velho" } }))
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useLiturgy())

    expect(result.current.liturgy).toBeNull()
  })

  it("removes a corrupted cache entry instead of crashing", () => {
    localStorage.setItem(CACHE_KEY, "not-json{{{")
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}))

    expect(() => renderHook(() => useLiturgy())).not.toThrow()
    expect(localStorage.getItem(CACHE_KEY)).toBeNull()
  })

  it("sets a friendly error message when the fetch itself fails", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network down"))

    const { result } = renderHook(() => useLiturgy())

    await waitFor(() => expect(result.current.loadingLiturgy).toBe(false))
    expect(result.current.liturgyError).toBe("Não foi possível carregar a liturgia agora.")
  })

  it("sets the same friendly error when the response resolves but isn't ok", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, json: async () => ({}) })

    const { result } = renderHook(() => useLiturgy())

    await waitFor(() => expect(result.current.loadingLiturgy).toBe(false))
    expect(result.current.liturgyError).toBe("Não foi possível carregar a liturgia agora.")
  })

  it("does not cache the result when browsing a non-today offset, and builds the URL with day/month/year", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, json: async () => ({ liturgia: "ontem" }) })

    const { result } = renderHook(() => useLiturgy(-1))

    await waitFor(() => expect(result.current.loadingLiturgy).toBe(false))

    const [url] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toMatch(/\?dia=\d{2}&mes=\d{2}&ano=\d{4}/)
    expect(localStorage.getItem(CACHE_KEY)).toBeNull()
  })

  it("labels the offset as Hoje/Ontem/Amanhã, falling back to the formatted date otherwise", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, json: async () => ({}) })

    const { result } = renderHook(() => useLiturgy())
    await waitFor(() => expect(result.current.loadingLiturgy).toBe(false))
    expect(result.current.displayDateLabel).toBe("Hoje")

    await act(async () => { result.current.setDateOffset(-1) })
    expect(result.current.displayDateLabel).toBe("Ontem")

    await act(async () => { result.current.setDateOffset(1) })
    expect(result.current.displayDateLabel).toBe("Amanhã")

    await act(async () => { result.current.setDateOffset(5) })
    expect(result.current.displayDateLabel).not.toMatch(/^(Hoje|Ontem|Amanhã)$/)
  })

})
