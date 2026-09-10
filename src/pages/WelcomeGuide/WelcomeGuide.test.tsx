import { render, screen, act, fireEvent } from "@testing-library/react"
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

const P1_BODY =
  "Seu companheiro de oração diária. Abra o app e encontre a liturgia de hoje, o Santo do Dia e uma frase para levar no coração."

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

function animatedBody(){
  return screen.getByRole("dialog").querySelector('[data-anim="body"]')?.textContent ?? ""
}

function animatedTitleEl(){
  return screen.getByRole("dialog").querySelector('[data-anim="title"]')
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

  it("avança as 3 páginas; a última carimba e navega pra Home", async () => {
    vi.useFakeTimers()
    setReducedMotion(false)
    renderGuide()

    const btn = () => screen.getByRole("button")

    expect(screen.getByRole("group")).toHaveAccessibleName("Página 1 de 3")
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Bem-vindo ao Oratio")
    expect(btn()).toHaveTextContent("Próximo")

    fireEvent.click(btn())
    act(() => { vi.advanceTimersByTime(600) })  // deixa a transição + typewriter da pág 2 rodar
    expect(screen.getByRole("group")).toHaveAccessibleName("Página 2 de 3")

    fireEvent.click(btn())
    act(() => { vi.advanceTimersByTime(600) })
    expect(screen.getByRole("group")).toHaveAccessibleName("Página 3 de 3")
    expect(btn()).toHaveTextContent("Começar")

    await act(async () => { fireEvent.click(btn()) })

    expect(markMock).toHaveBeenCalledTimes(1)
    expect(navigateMock).toHaveBeenCalledWith("/oratio/home", { replace: true })
  })

  it("falha do welcome-seen ainda navega pra Home", async () => {
    setReducedMotion(true)  // sem animação, avança na hora
    markMock.mockRejectedValue(new Error("rede"))
    renderGuide()

    fireEvent.click(screen.getByRole("button"))  // pág 1 → 2
    fireEvent.click(screen.getByRole("button"))  // pág 2 → 3
    await act(async () => { fireEvent.click(screen.getByRole("button")) })  // "Começar"

    expect(markMock).toHaveBeenCalledTimes(1)
    expect(navigateMock).toHaveBeenCalledWith("/oratio/home", { replace: true })
  })

  it("prefers-reduced-motion: reduce → título e corpo completos de imediato", () => {
    setReducedMotion(true)
    renderGuide()

    // sem fake timers e sem avançar nenhum: se o texto dependesse do
    // typewriter estaria vazio na camada animada
    expect(animatedBody()).toBe(P1_BODY)
    expect(screen.getByRole("dialog")).toHaveTextContent("Bem-vindo ao Oratio")
    // título completo e sem o caret (span-filho) piscando
    expect(animatedTitleEl()?.textContent).toBe("Bem-vindo ao Oratio")
    expect(animatedTitleEl()?.children.length).toBe(0)
  })

  it("com movimento, o corpo se digita aos poucos e completa com o tempo", () => {
    vi.useFakeTimers()
    setReducedMotion(false)
    renderGuide()

    act(() => { vi.advanceTimersByTime(60) })
    const early = animatedBody()

    act(() => { vi.advanceTimersByTime(5000) })
    const late = animatedBody()

    expect(early.length).toBeLessThan(late.length)
    expect(late).toBe(P1_BODY)
  })

  it("transição real: a página que sai e a que entra coexistem por um instante", () => {
    vi.useFakeTimers()
    setReducedMotion(false)
    renderGuide()

    fireEvent.click(screen.getByRole("button"))
    // logo após o clique, antes do timer de limpeza, o título da pág 1 (camada
    // que sai) e o da pág 2 ainda estão os dois no DOM
    act(() => { vi.advanceTimersByTime(0) })
    const headings = screen.getAllByRole("heading")
    // a que entra é <h1>; a que sai é um <div> aria-hidden — então só 1 heading,
    // mas o texto da que sai continua visível
    expect(headings).toHaveLength(1)
    expect(screen.getByRole("dialog")).toHaveTextContent("Bem-vindo ao Oratio")
    expect(screen.getByRole("dialog")).toHaveTextContent("Reze e acompanhe")

    act(() => { vi.advanceTimersByTime(600) })
    // depois da limpeza, só a pág 2
    expect(screen.getByRole("dialog")).not.toHaveTextContent("Bem-vindo ao Oratio")
  })

  it("tocar na tela completa o texto em curso na hora", () => {
    vi.useFakeTimers()
    setReducedMotion(false)
    renderGuide()

    act(() => { vi.advanceTimersByTime(120) })
    expect(animatedBody().length).toBeLessThan(P1_BODY.length)

    // toca no corpo (o clique borbulha pro .stage)
    fireEvent.click(screen.getByRole("dialog").querySelector('[data-anim="body"]')!)

    expect(animatedBody()).toBe(P1_BODY)
  })

  it("arrastar pra esquerda avança; pra direita não faz nada", () => {
    setReducedMotion(true)
    renderGuide()
    const stage = screen.getByRole("dialog").firstElementChild!

    // pra direita: ignorado (só pra frente)
    fireEvent.touchStart(stage, { touches: [{ clientX: 100 }] })
    fireEvent.touchEnd(stage, { changedTouches: [{ clientX: 300 }] })
    expect(screen.getByRole("group")).toHaveAccessibleName("Página 1 de 3")

    // pra esquerda: avança
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
