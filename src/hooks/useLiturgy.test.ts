import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, beforeEach, vi } from "vitest"

/*
 O hook fala com o backend pelo `liturgiaService`, que por sua vez usa o `api`
 compartilhado (e portanto `VITE_API_URL`). Antes ele chamava a URL de produção
 com `fetch` cru; por isso este teste mockava `fetch` global. Agora mocka o
 service, que é a convenção do projeto — nenhum teste bate rede.
*/
vi.mock("../services/liturgiaService", () => ({
  getLiturgia: vi.fn(),
  getLiturgiaFull: vi.fn(),
}))

import { useLiturgy } from "./useLiturgy"
import { getLiturgia } from "../services/liturgiaService"

const mockedGetLiturgia = getLiturgia as unknown as ReturnType<typeof vi.fn>
const CACHE_KEY = "last_liturgy"

function today() {
  return new Date().toLocaleDateString("pt-BR")
}

beforeEach(() => {
  localStorage.clear()
  mockedGetLiturgia.mockReset()
})

describe("useLiturgy", () => {

  it("fetches on mount and caches the result for today", async () => {
    mockedGetLiturgia.mockResolvedValue({ liturgia: "X" })

    const { result } = renderHook(() => useLiturgy())
    expect(result.current.loadingLiturgy).toBe(true)

    await waitFor(() => expect(result.current.loadingLiturgy).toBe(false))

    expect(result.current.liturgy).toEqual({ liturgia: "X" })
    // sem argumentos = liturgia de hoje; o backend resolve a data
    expect(mockedGetLiturgia).toHaveBeenCalledWith()

    const cached = JSON.parse(localStorage.getItem(CACHE_KEY)!)
    expect(cached).toEqual({ date: today(), data: { liturgia: "X" } })
  })

  it("shows the cached liturgy immediately while a fresh fetch is in flight, then replaces it once it resolves", async () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today(), data: { liturgia: "cache" } }))
    let resolveFetch!: (v: unknown) => void
    mockedGetLiturgia.mockReturnValue(new Promise((r) => { resolveFetch = r }))

    const { result } = renderHook(() => useLiturgy())

    expect(result.current.liturgy).toEqual({ liturgia: "cache" })

    resolveFetch({ liturgia: "fresco" })
    await waitFor(() => expect(result.current.liturgy).toEqual({ liturgia: "fresco" }))
  })

  it("ignores a cache entry from a different day", () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: "01/01/2000", data: { liturgia: "velho" } }))
    mockedGetLiturgia.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useLiturgy())

    expect(result.current.liturgy).toBeNull()
  })

  it("removes a corrupted cache entry instead of crashing", () => {
    localStorage.setItem(CACHE_KEY, "not-json{{{")
    mockedGetLiturgia.mockReturnValue(new Promise(() => {}))

    expect(() => renderHook(() => useLiturgy())).not.toThrow()
    expect(localStorage.getItem(CACHE_KEY)).toBeNull()
  })

  it("sets a friendly error message when the request fails", async () => {
    mockedGetLiturgia.mockRejectedValue(new Error("network down"))

    const { result } = renderHook(() => useLiturgy())

    await waitFor(() => expect(result.current.loadingLiturgy).toBe(false))
    expect(result.current.liturgyError).toBe("Não foi possível carregar a liturgia agora.")
  })

  it("does not cache the result when browsing a non-today offset, and passes day/month/year", async () => {
    mockedGetLiturgia.mockResolvedValue({ liturgia: "ontem" })

    const { result } = renderHook(() => useLiturgy(-1))

    await waitFor(() => expect(result.current.loadingLiturgy).toBe(false))

    const [dia, mes, ano] = mockedGetLiturgia.mock.calls[0]
    expect(dia).toMatch(/^\d{2}$/)
    expect(mes).toMatch(/^\d{2}$/)
    expect(String(ano)).toMatch(/^\d{4}$/)
    expect(localStorage.getItem(CACHE_KEY)).toBeNull()
  })

  it("labels the offset as Hoje/Ontem/Amanhã, falling back to the formatted date otherwise", async () => {
    mockedGetLiturgia.mockResolvedValue({})

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
