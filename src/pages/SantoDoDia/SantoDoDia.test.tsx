import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
  useLocation: () => ({ state: locationState }),
}))

vi.mock("../../hooks/useLiturgy", () => ({ useLiturgy: vi.fn() }))
vi.mock("../../utils/saintOfDay", () => ({ resolveSaintOfDay: vi.fn() }))
vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))

import { useLiturgy } from "../../hooks/useLiturgy"
import { resolveSaintOfDay } from "../../utils/saintOfDay"
import SantoDoDia from "./SantoDoDia"

const useLiturgyMock = useLiturgy as unknown as ReturnType<typeof vi.fn>
const resolveMock = resolveSaintOfDay as unknown as ReturnType<typeof vi.fn>

let locationState: unknown = null

function renderPage() {
  return render(<MemoryRouter><SantoDoDia /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  locationState = null
  useLiturgyMock.mockReturnValue({ liturgy: null, loadingLiturgy: false })
  resolveMock.mockReturnValue(null)
})

describe("SantoDoDia", () => {

  it("shows the skeleton while the liturgy is still loading", () => {
    useLiturgyMock.mockReturnValue({ liturgy: null, loadingLiturgy: true })
    const { container } = renderPage()
    expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument()
  })

  it("shows the empty message when there is no named celebration", () => {
    renderPage()
    expect(screen.getByText(/não há uma celebração de santo/i)).toBeInTheDocument()
  })

  it("renders the saint with a biography and the readings link", () => {
    resolveMock.mockReturnValue({
      nome: "Santa Teresa", grau: "Memória", cor: "branco", corHex: "#fff", corHexSoft: "#eee",
      bio: { resumo: "Doutora da Igreja", texto: ["Nasceu em Ávila.", "Reformou o Carmelo."] },
    })
    renderPage()
    expect(screen.getByText("Santa Teresa")).toBeInTheDocument()
    expect(screen.getByText("Doutora da Igreja")).toBeInTheDocument()
    expect(screen.getByText("Reformou o Carmelo.")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Ver leituras do dia/ }))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/liturgia-completa")
  })

  it("falls back to the 'no biography yet' note", () => {
    resolveMock.mockReturnValue({
      nome: "São X", grau: "Memória Facultativa", cor: null, corHex: "#000", corHexSoft: "#ccc",
      bio: null,
    })
    renderPage()
    expect(screen.getByText(/Ainda não escrevemos os detalhes/)).toBeInTheDocument()
  })

})
