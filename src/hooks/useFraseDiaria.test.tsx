import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

vi.mock("../data/frases-diarias.json", () => ({
  default: {
    frases: [
      { id: 1, texto: "Frase 1", autor: "A", origem: "O", referencia: "R1", categoria: "C" },
      { id: 2, texto: "Frase 2", autor: "A", origem: "O", referencia: "R2", categoria: "C" },
      { id: 3, texto: "Frase 3", autor: "A", origem: "O", referencia: "R3", categoria: "C" },
    ],
  },
}))

import { useFraseDiaria } from "./useFraseDiaria"

const STORAGE_KEY = "oratio_frase_dia"
const HISTORICO_KEY = "oratio_frases_historico"

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  vi.setSystemTime(new Date("2026-01-15T12:00:00Z"))
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("useFraseDiaria", () => {

  it("draws a new frase and persists it when there is no prior state", () => {
    vi.spyOn(Math, "random").mockReturnValue(0) // sempre escolhe o primeiro disponível

    const { result } = renderHook(() => useFraseDiaria())

    expect(result.current.frase?.id).toBe(1)
    expect(result.current.resgatada).toBe(false)

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored).toEqual({ data: "2026-01-15", fraseId: 1, resgatada: false })
  })

  it("reuses the persisted frase when it's still for today", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: "2026-01-15", fraseId: 2, resgatada: true }))

    const { result } = renderHook(() => useFraseDiaria())

    expect(result.current.frase?.id).toBe(2)
    expect(result.current.resgatada).toBe(true)
  })

  it("draws a fresh frase (resetting resgatada) when the persisted state is from a previous day", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: "2026-01-14", fraseId: 2, resgatada: true }))
    vi.spyOn(Math, "random").mockReturnValue(0)

    const { result } = renderHook(() => useFraseDiaria())

    expect(result.current.resgatada).toBe(false)
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored.data).toBe("2026-01-15")
  })

  it("excludes ids seen within the last 30 days from the draw", () => {
    localStorage.setItem(HISTORICO_KEY, JSON.stringify([
      { id: 1, data: "2026-01-10" },
      { id: 2, data: "2026-01-12" },
    ]))
    vi.spyOn(Math, "random").mockReturnValue(0) // só sobra o id 3 disponível

    const { result } = renderHook(() => useFraseDiaria())

    expect(result.current.frase?.id).toBe(3)
  })

  it("resets the history once every frase has already appeared within the window", () => {
    localStorage.setItem(HISTORICO_KEY, JSON.stringify([
      { id: 1, data: "2026-01-10" },
      { id: 2, data: "2026-01-11" },
      { id: 3, data: "2026-01-12" },
    ]))
    vi.spyOn(Math, "random").mockReturnValue(0)

    const { result } = renderHook(() => useFraseDiaria())

    expect(result.current.frase?.id).toBe(1)
    const historico = JSON.parse(localStorage.getItem(HISTORICO_KEY)!)
    expect(historico).toHaveLength(1)
  })

  it("drops history entries older than the 30-day window before choosing", () => {
    // 15/01/2026 - 15/12/2025 = 31 dias -> fora da janela, volta a ficar disponível
    localStorage.setItem(HISTORICO_KEY, JSON.stringify([{ id: 1, data: "2025-12-15" }]))
    vi.spyOn(Math, "random").mockReturnValue(0)

    const { result } = renderHook(() => useFraseDiaria())

    expect(result.current.frase?.id).toBe(1)
  })

  it("resgatar() marks the phrase as claimed in both state and storage", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    const { result } = renderHook(() => useFraseDiaria())

    act(() => { result.current.resgatar() })

    expect(result.current.resgatada).toBe(true)
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored.resgatada).toBe(true)
  })

  it("resgatar() is a no-op when there is nothing stored yet", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    const { result } = renderHook(() => useFraseDiaria())
    localStorage.removeItem(STORAGE_KEY)

    act(() => { result.current.resgatar() })

    expect(result.current.resgatada).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

})
