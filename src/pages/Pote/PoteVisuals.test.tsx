/// <reference types="node" />
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, resolve } from "node:path"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { playerState, round2 } from "./poteFixtures"

vi.mock("../../services/poteService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../services/poteService")>()
  return {
    ...actual,
    getRoom: vi.fn(),
    joinRoom: vi.fn(),
    round2Place: vi.fn(),
    round2Remove: vi.fn(),
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
      round2: round2({ unlocked: true, rocksIn: 5, placed: ROCKS, free: 30, gaps: 30, spaceLeft: 60 }),
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
      round2: round2({ unlocked: true, rocksIn: 5, placed: [...ROCKS, "amigos"], free: 25, gaps: 25, spaceLeft: 50 }),
    })
    const after = playerState("ROUND_2", {
      round2: round2({
        unlocked: true, rocksIn: 5, placed: [...ROCKS, "amigos", "role"], free: 20, gaps: 25, spaceLeft: 45,
        combos: ["turma", "deus_primeiro"],
      }),
    })
    m.getRoom.mockResolvedValue(before)
    m.joinRoom.mockResolvedValue(before)
    m.round2Place.mockResolvedValue(after)
    renderPlayer()

    fireEvent.click(await screen.findByRole("tab", { name: /Cascalho/ }))
    fireEvent.click(screen.getByRole("button", { name: /Rolê/ }))

    const burst = await screen.findByTestId("combo-burst")
    expect(burst).toHaveTextContent("Turma reunida")
    await act(async () => {})
  })

  it("encaixar nos vãos avisa com um toast (sem combo)", async () => {
    const before = playerState("ROUND_2", {
      round2: round2({ unlocked: true, rocksIn: 5, placed: ROCKS, free: 30, gaps: 30, spaceLeft: 60 }),
    })
    m.getRoom.mockResolvedValue(before)
    m.joinRoom.mockResolvedValue(before)
    m.round2Place.mockResolvedValue(before)
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
