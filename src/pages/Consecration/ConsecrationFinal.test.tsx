import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/consecrationService", () => ({
  getProgress: vi.fn(),
  getCachedProgress: vi.fn(() => null),
  finishConsecration: vi.fn(),
  apiErrorMessage: (_e: unknown, fallback: string) => fallback,
}))

vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))

import { getProgress, getCachedProgress, finishConsecration } from "../../services/consecrationService"
import ConsecrationFinal from "./ConsecrationFinal"

const m = {
  progress: getProgress as unknown as ReturnType<typeof vi.fn>,
  cached: getCachedProgress as unknown as ReturnType<typeof vi.fn>,
  finish: finishConsecration as unknown as ReturnType<typeof vi.fn>,
}

function renderFinal() {
  return render(<MemoryRouter><ConsecrationFinal /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  m.cached.mockReturnValue(null)
  m.finish.mockResolvedValue(undefined)
})

describe("ConsecrationFinal", () => {

  it("shows the skeleton on first load", () => {
    m.progress.mockReturnValue(new Promise(() => {}))
    renderFinal()
    expect(screen.getByText("Voltar")).toBeInTheDocument()
    expect(screen.queryByText("Carta de Consagração")).not.toBeInTheDocument()
  })

  it("locks the conclusion while the 33 days are not complete", async () => {
    m.progress.mockResolvedValue({ completedDays: [1, 2, 3], finished: false })
    renderFinal()
    expect(await screen.findByText(/Faltam 30 dias para liberar a conclusão/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Concluir Consagração" })).toBeDisabled()
  })

  it("finishes the consecration through the confirm modal", async () => {
    m.progress.mockResolvedValue({
      completedDays: Array.from({ length: 33 }, (_, i) => i + 1), finished: false,
    })
    renderFinal()
    fireEvent.click(await screen.findByRole("button", { name: "Concluir Consagração" }))
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar" }))
    await waitFor(() => expect(m.finish).toHaveBeenCalled())
  })

  it("shows the completed hero when already finished", async () => {
    m.progress.mockResolvedValue({
      completedDays: Array.from({ length: 33 }, (_, i) => i + 1),
      finished: true, completedAt: "2024-05-31",
    })
    renderFinal()
    expect(await screen.findByText("Você se consagrou a Nossa Senhora")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Ver minha jornada" }))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/consecration")
  })

  it("navigates to the letter template", async () => {
    m.progress.mockResolvedValue({ completedDays: [], finished: false })
    renderFinal()
    fireEvent.click(await screen.findByRole("button", { name: "Ver modelo da carta" }))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/consecration/carta")
  })

})
