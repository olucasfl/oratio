import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/rosaryService", () => ({ getRosaryProgress: vi.fn() }))
vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))
vi.mock("../../components/ShareReadingButton/ShareReadingButton", () => ({ default: () => <div>share</div> }))
vi.mock("../../utils/rosaryList", () => ({
  ROSARIES: [
    { slug: "gozosos", name: "Mistérios Gozosos" },
    { slug: "dolorosos", name: "Mistérios Dolorosos" },
  ],
}))

import { getRosaryProgress } from "../../services/rosaryService"
import RosaryHome from "./RosaryHome"

const getRosaryProgressMock = getRosaryProgress as unknown as ReturnType<typeof vi.fn>

function renderPage() {
  return render(<MemoryRouter><RosaryHome /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  getRosaryProgressMock.mockResolvedValue([])
})

describe("RosaryHome", () => {

  it("lists the rosaries from the catalogue", async () => {
    renderPage()
    expect(screen.getByText("Mistérios Gozosos")).toBeInTheDocument()
    expect(screen.getByText("Mistérios Dolorosos")).toBeInTheDocument()
  })

  it("filters the list by search", () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText("Pesquisar terço..."), { target: { value: "doloroso" } })
    expect(screen.getByText("Mistérios Dolorosos")).toBeInTheDocument()
    expect(screen.queryByText("Mistérios Gozosos")).not.toBeInTheDocument()
  })

  it("shows an empty state when nothing matches", () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText("Pesquisar terço..."), { target: { value: "zzz" } })
    expect(screen.getByText("Nenhum terço encontrado.")).toBeInTheDocument()
  })

  it("opens a rosary on click", () => {
    renderPage()
    fireEvent.click(screen.getByText("Mistérios Gozosos"))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/rosary/gozosos")
  })

  it("shows a resume badge when there is saved progress", async () => {
    getRosaryProgressMock.mockResolvedValue([{ type: "gozosos", currentStep: 4, totalSteps: 20 }])
    renderPage()
    expect(await screen.findByText(/Continuar/)).toHaveTextContent("5/20")
  })

})
