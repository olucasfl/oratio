import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { playerState, round1, round2 } from "./poteFixtures"

vi.mock("../../services/poteService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../services/poteService")>()
  return {
    ...actual,
    getRoom: vi.fn(),
    joinRoom: vi.fn(),
    tutorialDone: vi.fn(),
    round1Action: vi.fn(),
    round2Sync: vi.fn(),
    round2Finish: vi.fn(),
  }
})
vi.mock("../../components/ConfirmModal/ConfirmModal", () => ({
  default: ({ open, onConfirm }: { open: boolean; onConfirm: () => void }) =>
    open ? <button onClick={onConfirm}>confirmar-modal</button> : null,
}))

import * as svc from "../../services/poteService"
import PotePlayer from "./PotePlayer"

const m = svc as unknown as Record<string, ReturnType<typeof vi.fn>>

function renderPlayer() {
  return render(
    <MemoryRouter initialEntries={["/oratio/dinamicas/pote/1234"]}>
      <Routes>
        <Route path="/oratio/dinamicas/pote/:code" element={<PotePlayer />} />
        <Route path="/oratio/dinamicas/pote/:code/lider" element={<p>painel-do-lider</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function serve(state: unknown) {
  m.getRoom.mockResolvedValue(state)
  m.joinRoom.mockResolvedValue(state)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("PotePlayer — acesso", () => {
  it("sem convite (403) mostra Sem convite e não insiste", async () => {
    m.getRoom.mockRejectedValue({ response: { status: 403 } })
    renderPlayer()
    expect(await screen.findByText("Sem convite")).toBeInTheDocument()
    expect(screen.getByText("Você não foi convidado para esta dinâmica.")).toBeInTheDocument()
    expect(m.joinRoom).not.toHaveBeenCalled()
  })

  it("sala inexistente (404)", async () => {
    m.getRoom.mockRejectedValue({ response: { status: 404 } })
    renderPlayer()
    expect(await screen.findByText("Sala não encontrada")).toBeInTheDocument()
  })

  it("jogador removido vê o aviso", async () => {
    serve({ ...playerState("LOBBY"), removed: true, me: undefined })
    renderPlayer()
    expect(await screen.findByText("Você foi removido da sala")).toBeInTheDocument()
  })

  it("o líder que abre a URL do jogador é levado ao painel dele", async () => {
    serve({ changed: true, version: 1, role: "LEADER", room: playerState("LOBBY").room, players: [], stats: {} })
    renderPlayer()
    expect(await screen.findByText("painel-do-lider")).toBeInTheDocument()
  })

  it("entra na sala uma vez (join) assim que o estado chega", async () => {
    serve(playerState("LOBBY"))
    renderPlayer()
    expect(await screen.findByText(/Aguardando o líder começar/)).toBeInTheDocument()
    await waitFor(() => expect(m.joinRoom).toHaveBeenCalledTimes(1))
    expect(m.joinRoom).toHaveBeenCalledWith("1234")
  })
})

describe("PotePlayer — sala de espera", () => {
  it("sem pote: mostra quem já entrou, com contagem e a si mesmo marcado", async () => {
    serve({
      ...playerState("LOBBY"),
      lobby: {
        players: [
          { displayName: "Bia", isMe: false },
          { displayName: "Ana", isMe: true },
        ],
      },
    })
    renderPlayer()
    expect(await screen.findByText("2 pessoas na sala")).toBeInTheDocument()
    expect(screen.getByText("Bia")).toBeInTheDocument()
    expect(screen.getByText("Ana")).toBeInTheDocument()
    expect(screen.getByText("você")).toBeInTheDocument()
    expect(screen.queryByTestId("jar")).toBeNull() // o pote só aparece dentro do jogo
  })

  it("singular quando só você entrou", async () => {
    serve({ ...playerState("LOBBY"), lobby: { players: [{ displayName: "Ana", isMe: true }] } })
    renderPlayer()
    expect(await screen.findByText("1 pessoa na sala")).toBeInTheDocument()
  })

  it("a lista cresce quando chega gente nova (polling)", async () => {
    const first = { ...playerState("LOBBY"), version: 1, lobby: { players: [{ displayName: "Ana", isMe: true }] } }
    const second = {
      ...playerState("LOBBY"),
      version: 2,
      lobby: { players: [{ displayName: "Ana", isMe: true }, { displayName: "Caio", isMe: false }] },
    }
    m.getRoom.mockResolvedValueOnce(first).mockResolvedValue(second)
    m.joinRoom.mockResolvedValue(first)
    renderPlayer()
    expect(await screen.findByText("1 pessoa na sala")).toBeInTheDocument()
    expect(await screen.findByText("Caio", {}, { timeout: 3000 })).toBeInTheDocument()
    expect(screen.getByText("2 pessoas na sala")).toBeInTheDocument()
  })
})

describe("PotePlayer — rodada 1", () => {
  it("tutorial de 3 telas e o botão final avisa o servidor", async () => {
    const state = playerState("ROUND_1", { round1: round1({ status: "IN_TUTORIAL", currentItemId: null }) })
    serve(state)
    m.tutorialDone.mockResolvedValue(state)
    renderPlayer()

    expect(await screen.findByText(/Este pote é a sua semana/)).toBeInTheDocument()
    fireEvent.click(screen.getByText("Próximo"))
    expect(screen.getByText(/6 segundos para tocar em Pegar/)).toBeInTheDocument()
    fireEvent.click(screen.getByText("Próximo"))
    expect(screen.getByText(/O que entra no pote não sai mais/)).toBeInTheDocument()
    // o tutorial NÃO explica a regra dos vãos nem a Vida
    expect(screen.queryByText(/vão/i)).toBeNull()
    expect(screen.queryByText(/vida/i)).toBeNull()

    fireEvent.click(screen.getByText("Entendi, começar"))
    await waitFor(() => expect(m.tutorialDone).toHaveBeenCalledWith("1234"))
  })

  it("mostra o item com a Diversão e esconde a Vida; Pegar envia TAKE com o índice", async () => {
    const state = playerState("ROUND_1", { round1: round1({ index: 0, currentItemId: "reels" }) })
    serve(state)
    m.round1Action.mockResolvedValue(state)
    renderPlayer()

    expect(await screen.findByText("1 de 19")).toBeInTheDocument()
    expect(screen.getByText("+10 diversão")).toBeInTheDocument()
    expect(screen.queryByText(/Vida/)).toBeNull()

    fireEvent.click(screen.getByText("Pegar"))
    await waitFor(() => expect(m.round1Action).toHaveBeenCalledWith("1234", 0, "TAKE"))
  })

  it("Deixar passar envia PASS", async () => {
    const state = playerState("ROUND_1", { round1: round1() })
    serve(state)
    m.round1Action.mockResolvedValue(state)
    renderPlayer()
    fireEvent.click(await screen.findByText("Deixar passar"))
    await waitFor(() => expect(m.round1Action).toHaveBeenCalledWith("1234", 0, "PASS"))
  })

  it("pedra que não cabe: botão cinza com a conta e nenhuma chamada ao tocar", async () => {
    const state = playerState("ROUND_1", {
      round1: round1({ index: 17, currentItemId: "missa", free: 4, gaps: 0 }),
    })
    serve(state)
    renderPlayer()

    const button = await screen.findByText("Não cabe: precisa de 20, você tem 4")
    fireEvent.click(button)
    expect(m.round1Action).not.toHaveBeenCalled()
    expect(screen.getByTestId("item-card").className).toMatch(/shake/)
  })

  it("faixa Ficou de fora lista o que passou sem entrar", async () => {
    // a ordem é sorteada por jogador: o servidor manda só o que já passou (seen)
    const state = playerState("ROUND_1", {
      round1: round1({ index: 3, currentItemId: "missa", free: 90, seen: ["reels", "serie", "amigos"], placed: ["reels"] }),
    })
    serve(state)
    renderPlayer()
    const strip = await screen.findByTestId("left-out")
    expect(strip).toHaveTextContent("Série")
    expect(strip).toHaveTextContent("Amigos")
    expect(strip).not.toHaveTextContent("Reels")
  })

  it("terminou: tela de espera com o contador dos outros", async () => {
    const state = {
      ...playerState("ROUND_1", { round1: round1({ status: "FINISHED", index: 19, currentItemId: null }) }),
      progress: { total: 12, round1Finished: 7, round2Finished: 0 },
    }
    serve(state)
    renderPlayer()
    expect(
      await screen.findByText("Sua semana acabou. Aguardando os outros… (7/12 terminaram)"),
    ).toBeInTheDocument()
  })

  it("com a sala pausada: overlay e botões desabilitados", async () => {
    serve(playerState("ROUND_1", { round1: round1() }, { isPaused: true }))
    renderPlayer()
    expect(await screen.findByTestId("pause-overlay")).toHaveTextContent("Pausado pelo líder")
    expect(screen.getByText("Pegar")).toBeDisabled()
    expect(screen.getByText("Deixar passar")).toBeDisabled()
  })
})

describe("PotePlayer — resultado, parábola e rodada 2", () => {
  it("resultado 1 sem as 5 pedras: nomeia as de fora e mostra a penalidade", async () => {
    serve(
      playerState("RESULT_1", {
        round1: round1({
          status: "FINISHED", index: 19, currentItemId: null,
          placed: ["estudos", "sono", "familia"], rocksMissing: ["oracao", "missa"],
          fun: 143, life: 15, penalty: 40,
        }),
      }),
    )
    renderPlayer()
    expect(await screen.findByText(/não coube: Oração, Missa/)).toBeInTheDocument()
    expect(screen.getByTestId("penalty")).toHaveTextContent("−40")
  })

  it("resultado 1 com as 5 pedras: parabéns", async () => {
    serve(
      playerState("RESULT_1", {
        round1: round1({ status: "FINISHED", index: 19, currentItemId: null, rocksMissing: [], life: 85, penalty: 0, placed: ["oracao"] }),
      }),
    )
    renderPlayer()
    expect(await screen.findByText(/Você teve uma semana com Deus/)).toBeInTheDocument()
  })

  it("parábola com as 3 perguntas", async () => {
    serve(playerState("PARABLE"))
    renderPlayer()
    expect(await screen.findByText("O pote do professor")).toBeInTheDocument()
    expect(screen.getByText("Na rodada 1, o que você pegou sem pensar?")).toBeInTheDocument()
    expect(screen.getByText(/Mt 6,33/)).toBeInTheDocument()
  })

  it("rodada 2: cascalho e areia estão liberados desde o início (nada de cadeado)", async () => {
    serve(playerState("ROUND_2", { round2: round2({ rocksIn: 0 }) }))
    renderPlayer()
    expect(await screen.findByText(/Pedras: 0\/5 · Espaço no pote: 100/)).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /Cascalho/ })).toBeEnabled()
    expect(screen.getByRole("tab", { name: /Areia/ })).toBeEnabled()
    expect(screen.queryByText(/Primeiro as pedras/)).toBeNull()
  })

  it("rodada 2: tocar numa pedra a coloca", async () => {
    const state = playerState("ROUND_2", { round2: round2() })
    serve(state)
    m.round2Sync.mockResolvedValue(state)
    renderPlayer()
    fireEvent.click(await screen.findByRole("button", { name: /Oração/ }))
    await waitFor(() => expect(m.round2Sync).toHaveBeenCalledWith("1234", ["oracao"]))
  })

  it("rodada 2 destravada: mostra o espaço para escolhas e retira o cascalho tocando de novo", async () => {
    const rocks = ["oracao", "missa", "familia", "estudos", "sono"]
    const state = playerState("ROUND_2", {
      round2: round2({
        rocksIn: 5, placed: [...rocks, "amigos"], spaceLeft: 55, free: 25, gaps: 30,
      }),
    })
    serve(state)
    m.round2Sync.mockResolvedValue(state)
    renderPlayer()

    expect(await screen.findByText(/Espaço no pote: 35/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("tab", { name: /Cascalho/ }))
    const amigos = screen.getByRole("button", { name: /Amigos/ })
    expect(amigos).toHaveAttribute("aria-pressed", "true")
    fireEvent.click(amigos)
    await waitFor(() =>
      expect(m.round2Sync).toHaveBeenCalledWith("1234", ["oracao", "missa", "familia", "estudos", "sono"]),
    )
  })

  it("pote cheio: avisa sem chamar o servidor", async () => {
    const rocks = ["oracao", "missa", "familia", "estudos", "sono"]
    const cascalhos = ["amigos", "role", "futebol", "namoro", "violao", "praia", "academia", "livro"]
    serve(
      playerState("ROUND_2", {
        round2: round2({ rocksIn: 5, placed: [...rocks, ...cascalhos], spaceLeft: 0, free: 0, gaps: 0 }),
      }),
    )
    renderPlayer()
    fireEvent.click(await screen.findByRole("tab", { name: /Areia/ }))
    fireEvent.click(screen.getByRole("button", { name: /Reels/ }))
    expect(await screen.findByText("Pote cheio. Para colocar algo, tire outra coisa.")).toBeInTheDocument()
    expect(m.round2Sync).not.toHaveBeenCalled()
  })

  it("fechar a semana pede confirmação", async () => {
    const state = playerState("ROUND_2", { round2: round2() })
    serve(state)
    m.round2Finish.mockResolvedValue(state)
    renderPlayer()
    fireEvent.click(await screen.findByText("Fechar minha semana"))
    expect(m.round2Finish).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText("confirmar-modal"))
    await waitFor(() => expect(m.round2Finish).toHaveBeenCalledWith("1234"))
  })
})

describe("PotePlayer — final", () => {
  it("mostra a classificação e o texto final, sem campo de compromisso", async () => {
    const state = playerState("FINAL", {
      round2: round2({
        status: "FINISHED", classification: "PLENA", fun: 70, life: 160, combos: ["deus_primeiro"],
        placed: ["oracao", "missa", "familia", "estudos", "sono"], rocksIn: 5,
      }),
    })
    serve(state)
    renderPlayer()

    expect(await screen.findByText("Semana plena")).toBeInTheDocument()
    expect(screen.getByText("Não dá para colocar tudo")).toBeInTheDocument()
    expect(screen.getByText("Então, como anda o seu tempo?")).toBeInTheDocument()
    expect(screen.queryByText(/Qual pedra você vai colocar/)).toBeNull()
    expect(screen.queryByRole("textbox")).toBeNull()
  })

  it("sala cancelada pelo líder", async () => {
    serve(playerState("CANCELLED"))
    renderPlayer()
    expect(await screen.findByText("A sala foi encerrada pelo líder.")).toBeInTheDocument()
  })

  it("obrigado ao fim do jogo", async () => {
    serve(playerState("ENDED"))
    renderPlayer()
    expect(await screen.findByText("Obrigado por jogar!")).toBeInTheDocument()
  })
})
