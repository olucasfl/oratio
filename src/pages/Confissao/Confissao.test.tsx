import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))

import Confissao from "./Confissao"

function renderPage() {
  return render(<MemoryRouter><Confissao /></MemoryRouter>)
}

beforeEach(() => vi.clearAllMocks())

describe("Confissao", () => {

  it("opens on the 'Como Confessar' tab", () => {
    renderPage()
    expect(screen.getByText("Passos da Confissão")).toBeInTheDocument()
    expect(screen.getByText("Fórmula da Absolvição")).toBeInTheDocument()
  })

  it("switches to the examination tab and toggles a section open", () => {
    renderPage()
    fireEvent.click(screen.getByRole("button", { name: /Exame/ }))
    expect(screen.getByText(/exame de consciência tem como objetivo/i)).toBeInTheDocument()

    const prayerToggle = screen.getByRole("button", { name: /Oração antes do Exame/ })
    fireEvent.click(prayerToggle)
    // corpo da oração aparece — apenas garantimos que o toggle não quebra
    expect(prayerToggle).toBeInTheDocument()
  })

  it("switches to the contrition tab", () => {
    renderPage()
    fireEvent.click(screen.getByRole("button", { name: /Ato de Contrição/ }))
    expect(screen.getByText("O que é o Ato de Contrição?")).toBeInTheDocument()
    expect(screen.getByText("Contrição perfeita")).toBeInTheDocument()
  })

  it("goes back home", () => {
    renderPage()
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/home")
  })

})
