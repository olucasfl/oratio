import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { emptyStats, leaderPlayer, leaderState } from "./poteFixtures"

vi.mock("../../services/poteService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../services/poteService")>()
  return {
    ...actual,
    getRoom: vi.fn(),
    setPhase: vi.fn(),
    setPaused: vi.fn(),
    extendRound2: vi.fn(),
    removePlayer: vi.fn(),
    cancelRoom: vi.fn(),
    searchUsers: vi.fn().mockResolvedValue([]),
    inviteUsers: vi.fn(),
  }
})
vi.mock("../../components/ConfirmModal/ConfirmModal", () => ({
  default: ({ open, title, message, onConfirm }: { open: boolean; title?: string; message: string; onConfirm: () => void }) =>
    open ? (
      <div role="dialog">
        <p>{title}</p>
        <p>{message}</p>
        <button onClick={onConfirm}>confirmar-modal</button>
      </div>
    ) : null,
}))

import * as svc from "../../services/poteService"
import PoteLeader from "./PoteLeader"

const m = svc as unknown as Record<string, ReturnType<typeof vi.fn>>

function renderLeader() {
  return render(
    <MemoryRouter initialEntries={["/oratio/dinamicas/pote/1234/lider"]}>
      <Routes>
        <Route path="/oratio/dinamicas/pote/:code/lider" element={<PoteLeader />} />
        <Route path="/oratio/dinamicas/pote/:code" element={<p>tela-do-jogador</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

const serve = (state: unknown) => m.getRoom.mockResolvedValue(state)

beforeEach(() => {
  vi.clearAllMocks()
  m.searchUsers.mockResolvedValue([])
})

describe("PoteLeader — controles por fase", () => {
  it("LOBBY: Iniciar, Convidar, Abrir telão e Cancelar; mostra o código e a contagem", async () => {
    serve(leaderState("LOBBY", [leaderPlayer(), leaderPlayer({ userId: "u2", displayName: "Bia", joined: false })]))
    renderLeader()

    expect(await screen.findByLabelText("Código da sala 1234")).toBeInTheDocument()
    expect(screen.getByText("Iniciar")).toBeInTheDocument()
    expect(screen.getByText("Convidar mais gente")).toBeInTheDocument()
    expect(screen.getByText("Abrir telão")).toBeInTheDocument()
    expect(screen.getByText("Cancelar sala")).toBeInTheDocument()
    expect(screen.getByText("1 jogador (2 convidados)")).toBeInTheDocument()
    expect(screen.queryByText("Pausar")).toBeNull()
  })

  it("Iniciar avança para ROUND_1", async () => {
    const state = leaderState("LOBBY")
    serve(state)
    m.setPhase.mockResolvedValue(leaderState("ROUND_1"))
    renderLeader()
    fireEvent.click(await screen.findByText("Iniciar"))
    await waitFor(() => expect(m.setPhase).toHaveBeenCalledWith("1234", "ROUND_1"))
  })

  it("ROUND_1: Pausar/Retomar, sem confirmação quando todos terminaram", async () => {
    const done = leaderState("ROUND_1", [
      leaderPlayer({ round1: { status: "FINISHED", index: 19, total: 19, fill: 60, rocksIn: 3, rocksMissing: ["missa", "oracao"] } }),
    ])
    serve(done)
    m.setPhase.mockResolvedValue(leaderState("RESULT_1"))
    m.setPaused.mockResolvedValue(done)
    renderLeader()

    fireEvent.click(await screen.findByText("Pausar"))
    await waitFor(() => expect(m.setPaused).toHaveBeenCalledWith("1234", true))

    fireEvent.click(screen.getByText("Encerrar rodada 1"))
    await waitFor(() => expect(m.setPhase).toHaveBeenCalledWith("1234", "RESULT_1"))
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("ROUND_1: encerrar com gente jogando pede confirmação antes de enviar", async () => {
    serve(leaderState("ROUND_1")) // Ana ainda está no item 13
    m.setPhase.mockResolvedValue(leaderState("RESULT_1"))
    renderLeader()

    fireEvent.click(await screen.findByText("Encerrar rodada 1"))
    expect(m.setPhase).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog")).toHaveTextContent("1 pessoa ainda estão jogando")

    fireEvent.click(screen.getByText("confirmar-modal"))
    await waitFor(() => expect(m.setPhase).toHaveBeenCalledWith("1234", "RESULT_1"))
  })

  it("RESULT_1 → Mostrar parábola; PARABLE → Iniciar rodada 2", async () => {
    serve(leaderState("RESULT_1"))
    m.setPhase.mockResolvedValue(leaderState("PARABLE"))
    const first = renderLeader()
    fireEvent.click(await screen.findByText("Mostrar parábola"))
    await waitFor(() => expect(m.setPhase).toHaveBeenCalledWith("1234", "PARABLE"))
    first.unmount()

    serve(leaderState("PARABLE"))
    renderLeader()
    expect(await screen.findByText("Iniciar rodada 2")).toBeInTheDocument()
    expect(screen.getByText("O pote do professor")).toBeInTheDocument()
  })

  it("ROUND_2: +1 minuto e encerrar", async () => {
    const done = leaderState("ROUND_2", [leaderPlayer({ round2: { status: "FINISHED", fill: 70, spaceLeft: 0, rocksIn: 5, fun: 60, life: 150, classification: "PLENA" } })])
    serve(done)
    m.extendRound2.mockResolvedValue(done)
    m.setPhase.mockResolvedValue(leaderState("FINAL"))
    renderLeader()

    fireEvent.click(await screen.findByText("+1 minuto"))
    await waitFor(() => expect(m.extendRound2).toHaveBeenCalledWith("1234"))
    fireEvent.click(screen.getByText("Encerrar rodada 2"))
    await waitFor(() => expect(m.setPhase).toHaveBeenCalledWith("1234", "FINAL"))
  })

  it("FINAL: só Encerrar jogo", async () => {
    serve(leaderState("FINAL"))
    m.setPhase.mockResolvedValue(leaderState("ENDED"))
    renderLeader()
    fireEvent.click(await screen.findByText("Encerrar jogo"))
    await waitFor(() => expect(m.setPhase).toHaveBeenCalledWith("1234", "ENDED"))
    expect(screen.queryByText("Cancelar sala")).toBeNull()
  })

  it("pausado: mostra o rótulo e o botão vira Retomar", async () => {
    const state = leaderState("ROUND_1")
    serve({ ...state, room: { ...state.room, isPaused: true } })
    renderLeader()
    expect(await screen.findByText("Retomar")).toBeInTheDocument()
    expect(screen.getByText(/pausado/)).toBeInTheDocument()
  })
})

describe("PoteLeader — destrutivas e presença", () => {
  it("cancelar a sala pede confirmação", async () => {
    serve(leaderState("LOBBY"))
    m.cancelRoom.mockResolvedValue(leaderState("CANCELLED"))
    renderLeader()
    fireEvent.click(await screen.findByText("Cancelar sala"))
    expect(m.cancelRoom).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText("confirmar-modal"))
    await waitFor(() => expect(m.cancelRoom).toHaveBeenCalledWith("1234"))
  })

  it("remover jogador pede confirmação e usa o userId dele", async () => {
    serve(leaderState("LOBBY"))
    m.removePlayer.mockResolvedValue(leaderState("LOBBY", []))
    renderLeader()
    fireEvent.click(await screen.findByLabelText("Remover Ana"))
    expect(m.removePlayer).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText("confirmar-modal"))
    await waitFor(() => expect(m.removePlayer).toHaveBeenCalledWith("1234", "u1"))
  })

  it("marca desconectado quem não está conectado", async () => {
    serve(leaderState("ROUND_1", [leaderPlayer({ connected: false, displayName: "João" })]))
    renderLeader()
    expect(await screen.findByText(/desconectado/)).toBeInTheDocument()
  })

  it("um erro do servidor aparece na barra do líder", async () => {
    serve(leaderState("LOBBY"))
    m.setPhase.mockRejectedValue({ response: { data: { message: "Ninguém entrou na sala ainda." } } })
    renderLeader()
    fireEvent.click(await screen.findByText("Iniciar"))
    expect(await screen.findByRole("alert")).toHaveTextContent("Ninguém entrou na sala ainda.")
  })

  it("um jogador que abre o painel do líder é encaminhado para a tela dele", async () => {
    serve({ changed: true, version: 1, role: "PLAYER", room: leaderState("LOBBY").room, me: {}, progress: {} })
    renderLeader()
    expect(await screen.findByText("Só o líder da sala")).toBeInTheDocument()
    fireEvent.click(screen.getByText("Ir para a minha tela de jogador"))
    expect(await screen.findByText("tela-do-jogador")).toBeInTheDocument()
  })

  it("não expõe e-mail em lugar nenhum da tela", async () => {
    serve(leaderState("LOBBY"))
    const { container } = renderLeader()
    await screen.findByLabelText("Código da sala 1234")
    expect(container.textContent).not.toMatch(/@/)
  })
})

describe("PoteLeader — estatísticas", () => {
  it("RESULT_1: resumo X de N e a pedra mais deixada de fora", async () => {
    const stats = {
      ...emptyStats(),
      round1: { finished: 12, withAllRocks: 4, mostMissedRock: { id: "oracao", count: 6 }, mostTakenSand: null },
    }
    serve(leaderState("RESULT_1", [leaderPlayer({ round1: { status: "FINISHED", index: 19, total: 19, fill: 60, rocksIn: 3, rocksMissing: ["oracao", "missa"] } })], { stats }))
    renderLeader()
    expect(await screen.findByText("4 de 12 tiveram uma semana com Deus")).toBeInTheDocument()
    expect(screen.getByText(/Pedra mais deixada de fora: Oração \(6 pessoas\)/)).toBeInTheDocument()
    expect(screen.getByText(/fora: Oração, Missa/)).toBeInTheDocument()
  })

  it("FINAL: comparativo de pedras rodada 1 × rodada 2 e classificações", async () => {
    const stats = {
      ...emptyStats(),
      round1: { finished: 4, withAllRocks: 1, mostMissedRock: null, mostTakenSand: null },
      round2: { ...emptyStats().round2, finished: 4, withAllRocks: 4 },
      classifications: { PLENA: 3, PESADA: 1, VAZIA: 0, CORRIDA: 0 },
    }
    serve(leaderState("FINAL", [leaderPlayer()], { stats }))
    renderLeader()
    expect(await screen.findByText("25% × 100%")).toBeInTheDocument()
    expect(screen.getByText(/Semana plena/)).toBeInTheDocument()
  })
})
