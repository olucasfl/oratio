/// <reference types="node" />
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, resolve } from "node:path"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { playerState, round1, round2 } from "./poteFixtures"

vi.mock("../../services/poteService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../services/poteService")>()
  return {
    ...actual,
    getRoom: vi.fn(),
    joinRoom: vi.fn(),
    round2Sync: vi.fn(),
    round2Finish: vi.fn(),
  }
})
vi.mock("../../components/ConfirmModal/ConfirmModal", () => ({ default: () => null }))

import * as svc from "../../services/poteService"
import AnimatedNumber from "./components/AnimatedNumber"
import PotePlayer from "./PotePlayer"

const m = svc as unknown as Record<string, ReturnType<typeof vi.fn>>

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

describe("sem emojis (decisão de design: só ícones do Google)", () => {
  it("nenhum arquivo do jogo, do domínio, do ícone ou do card de Dinâmicas contém emoji", () => {
    const root = process.cwd()
    const files = [
      ...walk(resolve(root, "src/pages/Pote")),
      ...walk(resolve(root, "src/components/Icon")),
      resolve(root, "src/services/poteService.ts"),
    ].filter((f) => /\.(tsx?|css)$/.test(f) && !/\.test\.tsx?$/.test(f))

    const offenders: string[] = []
    for (const file of files) {
      const src = readFileSync(file, "utf8")
      const found = src.match(/\p{Extended_Pictographic}/gu)
      if (found) offenders.push(`${file}: ${[...new Set(found)].join(" ")}`)
    }
    expect(offenders).toEqual([])
  })
})

describe("AnimatedNumber", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((q: string) => ({
      matches: q.includes("reduce"),
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia
  })

  it("com movimento reduzido troca o valor na hora", () => {
    const { rerender } = render(<AnimatedNumber value={10} />)
    expect(screen.getByText("10")).toBeInTheDocument()
    rerender(<AnimatedNumber value={55} />)
    expect(screen.getByText("55")).toBeInTheDocument()
  })

  it("com movimento normal rola até o valor final", async () => {
    window.matchMedia = vi.fn().mockImplementation((q: string) => ({
      matches: false,
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia
    const { rerender } = render(<AnimatedNumber value={0} />)
    rerender(<AnimatedNumber value={40} />)
    await waitFor(() => expect(screen.getByText("40")).toBeInTheDocument(), { timeout: 2000 })
  })
})

describe("rodada 2 — movimento e celebração", () => {
  const ROCKS = ["oracao", "missa", "familia", "estudos", "sono"]

  function renderPlayer() {
    return render(
      <MemoryRouter initialEntries={["/oratio/dinamicas/pote/1234"]}>
        <Routes>
          <Route path="/oratio/dinamicas/pote/:code" element={<PotePlayer />} />
        </Routes>
      </MemoryRouter>,
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("o indicador da aba desliza para a aba ativa", async () => {
    const state = playerState("ROUND_2", {
      round2: round2({ rocksIn: 5, placed: ROCKS, free: 30, gaps: 30, spaceLeft: 60 }),
    })
    m.getRoom.mockResolvedValue(state)
    m.joinRoom.mockResolvedValue(state)
    const { container } = renderPlayer()

    const tab = await screen.findByRole("tab", { name: /Areia/ })
    const indicator = () => container.querySelector('[class*="tabIndicator"]') as HTMLElement
    expect(indicator().style.transform).toBe("translateX(0%)")
    fireEvent.click(tab)
    expect(indicator().style.transform).toBe("translateX(200%)")
  })

  it("ativar um combo mostra a celebração com o nome do combo", async () => {
    const before = playerState("ROUND_2", {
      round2: round2({ rocksIn: 5, placed: [...ROCKS, "amigos"], free: 25, gaps: 25, spaceLeft: 50 }),
    })
    const after = playerState("ROUND_2", {
      round2: round2({
        rocksIn: 5, placed: [...ROCKS, "amigos", "role"], free: 20, gaps: 25, spaceLeft: 45,
        combos: ["turma", "deus_primeiro"],
      }),
    })
    m.getRoom.mockResolvedValue(before)
    m.joinRoom.mockResolvedValue(before)
    m.round2Sync.mockResolvedValue(after)
    renderPlayer()

    fireEvent.click(await screen.findByRole("tab", { name: /Cascalho/ }))
    fireEvent.click(screen.getByRole("button", { name: /Rolê/ }))

    const burst = await screen.findByTestId("combo-burst")
    expect(burst).toHaveTextContent("Turma reunida")
    await act(async () => {})
  })

  it("encaixar nos vãos avisa com um toast (sem combo)", async () => {
    const before = playerState("ROUND_2", {
      round2: round2({ rocksIn: 5, placed: ROCKS, free: 30, gaps: 30, spaceLeft: 60 }),
    })
    m.getRoom.mockResolvedValue(before)
    m.joinRoom.mockResolvedValue(before)
    m.round2Sync.mockResolvedValue(before)
    renderPlayer()

    fireEvent.click(await screen.findByRole("tab", { name: /Areia/ }))
    fireEvent.click(screen.getByRole("button", { name: /Série/ }))
    expect(await screen.findByText("Encaixou nos vãos")).toBeInTheDocument()
  })

  it("cada tile mostra ícone do Google, nunca emoji", async () => {
    const state = playerState("ROUND_2", { round2: round2() })
    m.getRoom.mockResolvedValue(state)
    m.joinRoom.mockResolvedValue(state)
    renderPlayer()
    const tile = await screen.findByRole("button", { name: /Oração/ })
    expect(tile.querySelector('[class*="icon"]')).toBeTruthy()
    expect(tile.textContent).not.toMatch(/\p{Extended_Pictographic}/u)
  })
})

describe("rodada 2 — resposta imediata e carregamento", () => {
  const ROCKS = ["oracao", "missa", "familia", "estudos", "sono"]

  function renderPlayer() {
    return render(
      <MemoryRouter initialEntries={["/oratio/dinamicas/pote/1234"]}>
        <Routes>
          <Route path="/oratio/dinamicas/pote/:code" element={<PotePlayer />} />
        </Routes>
      </MemoryRouter>,
    )
  }
  const deferred = <T,>() => {
    let resolve!: (v: T) => void
    let reject!: (e: unknown) => void
    const promise = new Promise<T>((res, rej) => {
      resolve = res
      reject = rej
    })
    return { promise, resolve, reject }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("tocar num item o coloca na hora, com spinner de salvando, e some quando o servidor confirma", async () => {
    const base = playerState("ROUND_2", { round2: round2() })
    const slow = deferred<unknown>()
    m.getRoom.mockResolvedValue(base)
    m.joinRoom.mockResolvedValue(base)
    m.round2Sync.mockReturnValue(slow.promise)
    renderPlayer()

    const tile = await screen.findByRole("button", { name: /Oração/ })
    expect(tile).toHaveAttribute("aria-pressed", "false")
    fireEvent.click(tile)

    // antes de o servidor responder: já está no pote, com indicador de salvando
    expect(screen.getByRole("button", { name: /Oração/ })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /Oração/ })).toHaveAttribute("aria-busy", "true")
    expect(screen.getByText("Salvando…")).toBeInTheDocument()
    expect(screen.getByText(/Pedras: 1\/5 · Espaço no pote: 88/)).toBeInTheDocument() // 20 - 8 de vão

    const confirmed = playerState("ROUND_2", { round2: round2({ placed: ["oracao"], free: 80, gaps: 8, rocksIn: 1 }) })
    slow.resolve({ ...confirmed, version: 2 })
    await waitFor(() => expect(screen.queryByText("Salvando…")).toBeNull())
    expect(screen.getByRole("button", { name: /Oração/ })).toHaveAttribute("aria-busy", "false")
    expect(screen.getByRole("button", { name: /Oração/ })).toHaveAttribute("aria-pressed", "true")
  })

  it("o placar e o espaço acompanham o toque na hora", async () => {
    const base = playerState("ROUND_2", { round2: round2({ placed: ROCKS, free: 0, gaps: 40, spaceLeft: 40, rocksIn: 5, fun: 10, life: 95 }) })
    m.getRoom.mockResolvedValue(base)
    m.joinRoom.mockResolvedValue(base)
    m.round2Sync.mockReturnValue(new Promise(() => {})) // nunca responde
    renderPlayer()

    fireEvent.click(await screen.findByRole("tab", { name: /Cascalho/ }))
    expect(screen.getByText(/Espaço no pote: 40/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Amigos/ })) // tamanho 5, vida 5, diversão 15
    expect(screen.getByText(/Espaço no pote: 35/)).toBeInTheDocument()
    // Diversão 10 (Família) + 15 (Amigos) = 25; Vida 85 + 5 + 10 (Deus em primeiro lugar) = 100 — o placar rola até lá
    await waitFor(() => expect(screen.getByText("25")).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText("100")).toBeInTheDocument())
  })

  it("se o servidor recusar, o item volta e o motivo aparece", async () => {
    const base = playerState("ROUND_2", { round2: round2() })
    m.getRoom.mockResolvedValue(base)
    m.joinRoom.mockResolvedValue(base)
    m.round2Sync.mockRejectedValue({ response: { data: { message: "NAO_CABE" } } })
    renderPlayer()

    fireEvent.click(await screen.findByRole("button", { name: /Oração/ }))
    expect(await screen.findByText("Pote cheio. Para colocar algo, tire outra coisa.")).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Oração/ })).toHaveAttribute("aria-pressed", "false"),
    )
  })

  it("toques seguidos viajam JUNTOS: dois toques rápidos = um pedido só, com a lista inteira", async () => {
    const base = playerState("ROUND_2", { round2: round2() })
    m.getRoom.mockResolvedValue(base)
    m.joinRoom.mockResolvedValue(base)
    m.round2Sync.mockResolvedValue(
      playerState("ROUND_2", { round2: round2({ placed: ["oracao", "missa"], free: 60, gaps: 16, rocksIn: 2 }) }),
    )
    renderPlayer()

    fireEvent.click(await screen.findByRole("button", { name: /Oração/ }))
    fireEvent.click(screen.getByRole("button", { name: /Missa/ }))
    await waitFor(() => expect(m.round2Sync).toHaveBeenCalledTimes(1))
    expect(m.round2Sync).toHaveBeenCalledWith("1234", ["oracao", "missa"])
  })

  it("toque durante um pedido em voo vai no pedido seguinte, que leva tudo o que já foi confirmado", async () => {
    const base = playerState("ROUND_2", { round2: round2() })
    const first = deferred<unknown>()
    m.getRoom.mockResolvedValue(base)
    m.joinRoom.mockResolvedValue(base)
    m.round2Sync.mockReturnValueOnce(first.promise).mockResolvedValue(
      playerState("ROUND_2", { round2: round2({ placed: ["oracao", "missa"], free: 60, gaps: 16, rocksIn: 2 }) }),
    )
    renderPlayer()

    fireEvent.click(await screen.findByRole("button", { name: /Oração/ }))
    await waitFor(() => expect(m.round2Sync).toHaveBeenCalledTimes(1))
    expect(m.round2Sync).toHaveBeenLastCalledWith("1234", ["oracao"])

    fireEvent.click(screen.getByRole("button", { name: /Missa/ })) // enquanto o 1º ainda não voltou
    expect(m.round2Sync).toHaveBeenCalledTimes(1) // espera o 1º

    first.resolve(playerState("ROUND_2", { round2: round2({ placed: ["oracao"], free: 80, gaps: 8, rocksIn: 1 }) }))
    await waitFor(() => expect(m.round2Sync).toHaveBeenCalledTimes(2))
    expect(m.round2Sync).toHaveBeenLastCalledWith("1234", ["oracao", "missa"]) // não "esquece" a Oração
  })

  it("item com ação pendente ignora o segundo toque", async () => {
    const base = playerState("ROUND_2", { round2: round2() })
    m.getRoom.mockResolvedValue(base)
    m.joinRoom.mockResolvedValue(base)
    m.round2Sync.mockReturnValue(new Promise(() => {}))
    renderPlayer()

    const tile = await screen.findByRole("button", { name: /Oração/ })
    fireEvent.click(tile)
    fireEvent.click(screen.getByRole("button", { name: /Oração/ }))
    await waitFor(() => expect(m.round2Sync).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByRole("button", { name: /Oração/ }))
    expect(m.round2Sync).toHaveBeenCalledTimes(1)
  })

  it("com o pote cheio de cascalho a pedra não entra (precisa de 20 livres) e nem chama o servidor", async () => {
    const cascalhos = ["amigos", "role", "futebol", "namoro", "violao", "praia", "academia", "livro", "ejc", "pastoral", "avos", "curso", "cozinhar", "quarto"]
    const sand = ["reels", "serie", "feed", "videogame", "fofoca", "youtube", "stories", "madrugada"]
    const base = playerState("ROUND_2", { round2: round2({ placed: [...cascalhos, ...sand], free: 14 }) })
    m.getRoom.mockResolvedValue(base)
    m.joinRoom.mockResolvedValue(base)
    renderPlayer()
    fireEvent.click(await screen.findByRole("button", { name: /Oração/ }))
    expect(await screen.findByText("Pote cheio. Para colocar algo, tire outra coisa.")).toBeInTheDocument()
    expect(m.round2Sync).not.toHaveBeenCalled()
  })

  it("o tamanho aparece em destaque no card da rodada 1 (e as pedras valem 20)", async () => {
    const state = playerState("ROUND_1", { round1: round1({ index: 4, currentItemId: "estudos" }) })
    m.getRoom.mockResolvedValue(state)
    m.joinRoom.mockResolvedValue(state)
    renderPlayer()
    const pill = await screen.findByLabelText("Tamanho 20")
    expect(pill).toHaveTextContent("20")
  })
})
