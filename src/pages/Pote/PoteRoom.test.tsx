import { act, render, renderHook, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { leaderState, playerState, room } from "./poteFixtures"

vi.mock("../../services/poteService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../services/poteService")>()
  return { ...actual, getRoom: vi.fn() }
})

import * as svc from "../../services/poteService"
import PoteScreen from "./PoteScreen"
import usePoteRoom from "./usePoteRoom"
import { formatClock, round2Remaining } from "./useRound2Clock"

const getRoom = svc.getRoom as unknown as ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

async function flush() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0)
  })
}

describe("usePoteRoom — polling", () => {
  it("o jogador consulta a cada 1,5 s; o líder a cada 1 s (poupa o servidor)", async () => {
    getRoom.mockResolvedValue({ ...playerState("LOBBY"), version: 1 })
    const player = renderHook(() => usePoteRoom("1234"))
    await flush()
    getRoom.mockClear()
    await act(async () => { await vi.advanceTimersByTimeAsync(1200) })
    expect(getRoom).not.toHaveBeenCalled()
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    expect(getRoom).toHaveBeenCalledTimes(1)
    player.unmount()

    getRoom.mockResolvedValue(leaderState("LOBBY"))
    renderHook(() => usePoteRoom("1234"))
    await flush()
    getRoom.mockClear()
    await act(async () => { await vi.advanceTimersByTimeAsync(1100) })
    expect(getRoom).toHaveBeenCalledTimes(1)
  })

  it("aba em segundo plano consulta bem menos", async () => {
    getRoom.mockResolvedValue({ ...playerState("LOBBY"), version: 1 })
    renderHook(() => usePoteRoom("1234"))
    await flush()
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true })
    getRoom.mockClear()
    await act(async () => { await vi.advanceTimersByTimeAsync(1600) }) // o ciclo em andamento termina
    getRoom.mockClear()
    await act(async () => { await vi.advanceTimersByTimeAsync(3000) })
    expect(getRoom).not.toHaveBeenCalled()
    await act(async () => { await vi.advanceTimersByTimeAsync(1500) })
    expect(getRoom).toHaveBeenCalled()
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false })
  })

  it("primeira chamada sem since; as seguintes mandam a última versão; {changed:false} não troca o estado", async () => {
    getRoom
      .mockResolvedValueOnce({ ...playerState("LOBBY"), version: 5 })
      .mockResolvedValue({ changed: false, version: 5 })

    const { result } = renderHook(() => usePoteRoom("1234"))
    await flush()
    expect(getRoom).toHaveBeenNthCalledWith(1, "1234", undefined)
    expect(result.current.data?.version).toBe(5)

    await act(async () => { await vi.advanceTimersByTimeAsync(1500) })
    expect(getRoom).toHaveBeenNthCalledWith(2, "1234", 5)
    expect(result.current.data?.version).toBe(5)
  })

  it("para de insistir em 403 e expõe o erro", async () => {
    getRoom.mockRejectedValue({ response: { status: 403 } })
    const { result } = renderHook(() => usePoteRoom("1234"))
    await flush()
    expect(result.current.error).toBe("forbidden")
    await act(async () => { await vi.advanceTimersByTimeAsync(5000) })
    expect(getRoom).toHaveBeenCalledTimes(1)
  })

  it("queda de rede: mantém o último estado bom e tenta de novo", async () => {
    getRoom
      .mockResolvedValueOnce({ ...playerState("LOBBY"), version: 2 })
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue({ ...playerState("ROUND_1"), version: 3 })

    const { result } = renderHook(() => usePoteRoom("1234"))
    await flush()
    await act(async () => { await vi.advanceTimersByTimeAsync(1500) })
    expect(result.current.data?.room.phase).toBe("LOBBY") // erro não apaga o estado
    expect(result.current.error).toBeNull()

    await act(async () => { await vi.advanceTimersByTimeAsync(3000) })
    expect(result.current.data?.room.phase).toBe("ROUND_1")
  })

  it("act aplica a resposta da ação e não deixa uma resposta mais velha voltar no tempo", async () => {
    getRoom.mockResolvedValue({ ...playerState("ROUND_1"), version: 10 })
    const { result } = renderHook(() => usePoteRoom("1234"))
    await flush()

    let err: string | null = "x"
    await act(async () => {
      err = await result.current.act(async () => ({ ...playerState("ROUND_2"), version: 11 }))
    })
    expect(err).toBeNull()
    expect(result.current.data?.room.phase).toBe("ROUND_2")

    await act(async () => {
      await result.current.act(async () => ({ ...playerState("LOBBY"), version: 4 }))
    })
    expect(result.current.data?.room.phase).toBe("ROUND_2")
  })

  it("act devolve a mensagem do servidor quando a ação falha", async () => {
    getRoom.mockResolvedValue({ ...playerState("ROUND_1"), version: 1 })
    const { result } = renderHook(() => usePoteRoom("1234"))
    await flush()
    let err: string | null = null
    await act(async () => {
      err = await result.current.act(() => Promise.reject({ response: { data: { message: "NAO_CABE" } } }))
    })
    expect(err).toBe("NAO_CABE")
  })

  it("now() segue o relógio do servidor, não o do celular", async () => {
    const serverNow = new Date(Date.now() + 60_000).toISOString()
    getRoom.mockResolvedValue({ ...playerState("LOBBY", {}, { serverNow }), version: 1 })
    const { result } = renderHook(() => usePoteRoom("1234"))
    await flush()
    expect(Math.abs(result.current.now() - (Date.now() + 60_000))).toBeLessThan(50)
  })
})

describe("relógio da rodada 2", () => {
  it("rodada 2 rodando: restante = fim − agora (nunca negativo)", () => {
    const r = room("ROUND_2", { round2EndsAt: new Date(10_000).toISOString() })
    expect(round2Remaining(r, 4_000)).toBe(6_000)
    expect(round2Remaining(r, 99_000)).toBe(0)
  })

  it("pausada: valor congelado do servidor; fora da rodada 2: null", () => {
    expect(round2Remaining(room("ROUND_2", { isPaused: true, round2RemainingMs: 42_000 }), 0)).toBe(42_000)
    expect(round2Remaining(room("ROUND_1"), 0)).toBeNull()
  })

  it("formatClock arredonda para cima e formata m:ss", () => {
    expect(formatClock(180_000)).toBe("3:00")
    expect(formatClock(59_100)).toBe("1:00")
    expect(formatClock(5_000)).toBe("0:05")
    expect(formatClock(null)).toBe("--:--")
  })
})

describe("PoteScreen (telão)", () => {
  function renderScreen() {
    return render(
      <MemoryRouter initialEntries={["/oratio/dinamicas/pote/1234/telao"]}>
        <Routes>
          <Route path="/oratio/dinamicas/pote/:code/telao" element={<PoteScreen />} />
        </Routes>
      </MemoryRouter>,
    )
  }

  it("lobby: código grande e nenhum e-mail", async () => {
    getRoom.mockResolvedValue(leaderState("LOBBY"))
    const { container } = renderScreen()
    await flush()
    expect(screen.getByLabelText("Código da sala 1234")).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/@/)
  })

  it("pausa cobre o telão", async () => {
    const s = leaderState("ROUND_1")
    getRoom.mockResolvedValue({ ...s, room: { ...s.room, isPaused: true } })
    renderScreen()
    await flush()
    expect(screen.getByTestId("pause-overlay")).toBeInTheDocument()
  })

  it("sala cancelada e jogo encerrado", async () => {
    getRoom.mockResolvedValue(leaderState("CANCELLED"))
    const first = renderScreen()
    await flush()
    expect(screen.getByText("A sala foi encerrada pelo líder.")).toBeInTheDocument()
    first.unmount()

    getRoom.mockResolvedValue(leaderState("ENDED"))
    renderScreen()
    await flush()
    expect(screen.getByText("Obrigado por jogar!")).toBeInTheDocument()
  })

  it("sem acesso mostra sala indisponível", async () => {
    getRoom.mockRejectedValue({ response: { status: 403 } })
    renderScreen()
    await flush()
    expect(screen.getByText("Sala indisponível")).toBeInTheDocument()
  })
})
