import { render, screen, act, fireEvent, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const navigateMock = vi.fn()
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return { ...actual, useNavigate: () => navigateMock }
})
vi.mock("../../services/welcomeService", () => ({ markWelcomeSeen: vi.fn() }))

import { markWelcomeSeen } from "../../services/welcomeService"
import WelcomeGuide from "./WelcomeGuide"

const markMock = markWelcomeSeen as unknown as ReturnType<typeof vi.fn>

const P1_INTRO = "O essencial de cada dia, sempre à mão."

// Os 3 capítulos e seus itens — precisam bater com o PAGES de WelcomeGuide.tsx.
const CHAPTERS = [
  {
    title: "Oração diária",
    items: ["Liturgia do dia", "Santo do dia", "Terço & Rosário", "Orações e Ladainhas"],
  },
  {
    title: "Caminhos",
    items: ["Consagração de 33 dias", "Guia de Confissão", "Uma Home que acompanha o dia"],
  },
  {
    title: "Estudo e conversa",
    items: ["Bíblia de Estudo", "Catecismo", "Vox", "Perfil e progresso"],
  },
]

function setReducedMotion(on: boolean){
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: on && query.includes("reduce"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

function renderGuide(){
  return render(<MemoryRouter><WelcomeGuide /></MemoryRouter>)
}

function animatedIntro(){
  return screen.getByRole("dialog").querySelector('[data-anim="intro"]')?.textContent ?? ""
}

function animatedTitleEl(){
  return screen.getByRole("dialog").querySelector('[data-anim="title"]')
}

// A lista visível é aria-hidden; a única com role="list" é a cópia acessível
// (`<ul>/<li>` completa, no DOM desde o início).
function accessibleItems(){
  return within(screen.getByRole("list")).getAllByRole("listitem").map((li) => li.textContent ?? "")
}

beforeEach(() => {
  vi.clearAllMocks()
  markMock.mockResolvedValue({ ok: true })
})

afterEach(() => {
  vi.useRealTimers()
  // @ts-expect-error — remove o stub entre os testes
  delete window.matchMedia
})

describe("WelcomeGuide", () => {

  it("avança os 3 capítulos, cada um com seus itens; a última carimba e navega pra Home", async () => {
    setReducedMotion(true)  // vai direto ao estado final de cada tela
    renderGuide()

    const btn = () => screen.getByRole("button")

    for (let c = 0; c < CHAPTERS.length; c++) {
      expect(screen.getByRole("group")).toHaveAccessibleName(`Página ${c + 1} de 3`)
      expect(screen.getByRole("dialog")).toHaveAccessibleName(CHAPTERS[c].title)

      const items = accessibleItems()
      expect(items).toHaveLength(CHAPTERS[c].items.length)
      for (const name of CHAPTERS[c].items) {
        expect(items.some((t) => t.startsWith(name))).toBe(true)
      }

      if (c < CHAPTERS.length - 1) {
        expect(btn()).toHaveTextContent("Próximo")
        fireEvent.click(btn())
      }
    }

    expect(btn()).toHaveTextContent("Começar")
    await act(async () => { fireEvent.click(btn()) })

    expect(markMock).toHaveBeenCalledTimes(1)
    expect(navigateMock).toHaveBeenCalledWith("/oratio/home", { replace: true })
  })

  it("falha do welcome-seen ainda navega pra Home", async () => {
    setReducedMotion(true)
    markMock.mockRejectedValue(new Error("rede"))
    renderGuide()

    fireEvent.click(screen.getByRole("button"))
    fireEvent.click(screen.getByRole("button"))
    await act(async () => { fireEvent.click(screen.getByRole("button")) })

    expect(markMock).toHaveBeenCalledTimes(1)
    expect(navigateMock).toHaveBeenCalledWith("/oratio/home", { replace: true })
  })

  it("prefers-reduced-motion: reduce → título, introdução e lista completos de imediato", () => {
    setReducedMotion(true)
    renderGuide()

    // sem fake timers e sem avançar: se dependesse do typewriter estaria vazio
    expect(animatedIntro()).toBe(P1_INTRO)
    expect(animatedTitleEl()?.textContent).toBe("Oração diária")
    expect(animatedTitleEl()?.children.length).toBe(0)  // sem caret
    expect(accessibleItems()).toHaveLength(4)
  })

  it("com movimento, a introdução se digita aos poucos e completa com o tempo", () => {
    vi.useFakeTimers()
    setReducedMotion(false)
    renderGuide()

    act(() => { vi.advanceTimersByTime(60) })
    const early = animatedIntro()

    act(() => { vi.advanceTimersByTime(5000) })
    const late = animatedIntro()

    expect(early.length).toBeLessThan(late.length)
    expect(late).toBe(P1_INTRO)
  })

  it("transição real: a página que sai e a que entra coexistem por um instante", () => {
    vi.useFakeTimers()
    setReducedMotion(false)
    renderGuide()

    fireEvent.click(screen.getByRole("button"))
    act(() => { vi.advanceTimersByTime(0) })
    expect(screen.getAllByRole("heading")).toHaveLength(1)  // só a que entra é <h1>
    expect(screen.getByRole("dialog")).toHaveTextContent("Oração diária")
    expect(screen.getByRole("dialog")).toHaveTextContent("Caminhos")

    act(() => { vi.advanceTimersByTime(600) })
    expect(screen.getByRole("dialog")).not.toHaveTextContent("Oração diária")
  })

  it("tocar na tela completa o texto e a lista em curso", () => {
    vi.useFakeTimers()
    setReducedMotion(false)
    renderGuide()

    act(() => { vi.advanceTimersByTime(120) })
    expect(animatedIntro().length).toBeLessThan(P1_INTRO.length)

    fireEvent.click(screen.getByRole("dialog").querySelector('[data-anim="intro"]')!)

    expect(animatedIntro()).toBe(P1_INTRO)
    // a página fica marcada como "assentada" (as animações de entrada param)
    expect(screen.getByRole("dialog").querySelector('[class*="settled"]')).not.toBeNull()
  })

  it("arrastar pra esquerda avança; pra direita não faz nada", () => {
    setReducedMotion(true)
    renderGuide()
    const stage = screen.getByRole("dialog").firstElementChild!

    fireEvent.touchStart(stage, { touches: [{ clientX: 100 }] })
    fireEvent.touchEnd(stage, { changedTouches: [{ clientX: 300 }] })
    expect(screen.getByRole("group")).toHaveAccessibleName("Página 1 de 3")

    fireEvent.touchStart(stage, { touches: [{ clientX: 300 }] })
    fireEvent.touchEnd(stage, { changedTouches: [{ clientX: 100 }] })
    expect(screen.getByRole("group")).toHaveAccessibleName("Página 2 de 3")
  })

  it("não tem controle de pular nem de sair — só o avanço", () => {
    setReducedMotion(true)
    renderGuide()

    const buttons = screen.getAllByRole("button")
    expect(buttons).toHaveLength(1)
    expect(buttons[0]).toHaveTextContent("Próximo")
    expect(screen.queryByRole("button", { name: /pular|fechar|sair/i })).toBeNull()
  })

})
