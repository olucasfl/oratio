import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/liturgiaService", () => ({ getLiturgiaFull: vi.fn() }))
vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))

import { getLiturgiaFull } from "../../services/liturgiaService"
import LiturgiaFull, { formatVerses } from "./LiturgiaFull"

const getLiturgiaFullMock = getLiturgiaFull as unknown as ReturnType<typeof vi.fn>

const MISSA = {
  liturgia: "Terça-feira da 1ª Semana",
  data: "2026-02-10",
  tipo: "ferial",
  secoes: [
    { titulo: "Ritos Iniciais", conteudo: { entrada: "Vinde, adoremos o Senhor." } },
  ],
}

function renderPage() {
  return render(<MemoryRouter><LiturgiaFull /></MemoryRouter>)
}

/*
formatVerses recebe texto da API pública de liturgia (terceiro, fora do
nosso controle) e antes injetava o resultado via dangerouslySetInnerHTML
sem escapar nada — qualquer HTML/script retornado pela API rodava no
navegador de quem abrisse a liturgia do dia. Esses testes travam a
correção: o texto tem que sempre virar conteúdo de texto do React, nunca
marcação interpretada pelo navegador.
*/
describe("formatVerses", () => {

  it("never lets markup in the source text become a real DOM element", () => {
    const malicious = '<img src=x onerror="window.__pwned = true">'
    const { container } = render(<div>{formatVerses(malicious)}</div>)
    expect(container.querySelector("img")).toBeNull()
    expect(container.textContent).toContain(malicious)
  })

  it("never lets a <script> tag in the source text execute", () => {
    const malicious = '<script>window.__pwned = true</script>'
    const { container } = render(<div>{formatVerses(malicious)}</div>)
    expect(container.querySelector("script")).toBeNull()
    expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined()
  })

  it("still wraps a verse number immediately followed by a letter in a .verse span", () => {
    const { container } = render(<div>{formatVerses("1Em o princípio")}</div>)
    const verse = container.querySelector(".verse")
    expect(verse).not.toBeNull()
    expect(verse?.textContent).toBe("1")
    expect(container.textContent).toBe("1Em o princípio")
  })

  it("wraps the first letter in a .capitular span when the text doesn't start with a verse number", () => {
    const { container } = render(<div>{formatVerses("Em o princípio")}</div>)
    const capitular = container.querySelector(".capitular")
    expect(capitular).not.toBeNull()
    expect(capitular?.textContent).toBe("E")
    expect(container.textContent).toBe("Em o princípio")
  })

  it("returns an empty result for empty input without throwing", () => {
    expect(() => render(<div>{formatVerses("")}</div>)).not.toThrow()
  })

})

describe("LiturgiaFull", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it("shows a loading state before the liturgy resolves", () => {
    getLiturgiaFullMock.mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByText("📖 Carregando liturgia...")).toBeInTheDocument()
  })

  it("renders the liturgy once loaded and caches it", async () => {
    getLiturgiaFullMock.mockResolvedValue(MISSA)
    renderPage()
    expect(await screen.findByText("Terça-feira da 1ª Semana")).toBeInTheDocument()
    expect(screen.getByText("Ferial")).toBeInTheDocument()
    expect(screen.getByText("Vinde, adoremos o Senhor.")).toBeInTheDocument()
    await waitFor(() =>
      expect(Object.keys(localStorage).some(k => k.startsWith("oratio-liturgia-"))).toBe(true),
    )
  })

  it("shows an error state with a retry button when the fetch fails and there is no cache", async () => {
    getLiturgiaFullMock.mockRejectedValue(new Error("500"))
    renderPage()
    expect(await screen.findByText(/Não foi possível carregar a liturgia/)).toBeInTheDocument()

    getLiturgiaFullMock.mockResolvedValue(MISSA)
    fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/ }))
    expect(await screen.findByText("Terça-feira da 1ª Semana")).toBeInTheDocument()
  })

  it("reloads for the next day when the forward arrow is pressed", async () => {
    getLiturgiaFullMock.mockResolvedValue(MISSA)
    renderPage()
    await screen.findByText("Terça-feira da 1ª Semana")
    getLiturgiaFullMock.mockClear()

    const nav = screen.getAllByRole("button").filter(b => b.className.includes("navButton"))
    fireEvent.click(nav[1])
    await waitFor(() => expect(getLiturgiaFullMock).toHaveBeenCalled())
  })

  it("dismisses the standing notice", async () => {
    getLiturgiaFullMock.mockResolvedValue(MISSA)
    renderPage()
    await screen.findByText("Terça-feira da 1ª Semana")
    const notice = screen.getByText(/estrutura padrão da Santa Missa/)
    fireEvent.click(notice.parentElement!.querySelector("button")!)
    expect(screen.queryByText(/estrutura padrão da Santa Missa/)).not.toBeInTheDocument()
  })

})
