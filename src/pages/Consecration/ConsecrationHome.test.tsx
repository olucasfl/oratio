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
  getAllDays: vi.fn(() => Promise.resolve([])),
  startConsecration: vi.fn(),
  updateStartDate: vi.fn(),
  preloadConsecration: vi.fn(),
  resetConsecration: vi.fn(),
  apiErrorMessage: (_e: unknown, fallback: string) => fallback,
}))

vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))

import {
  getProgress, getCachedProgress, startConsecration, resetConsecration,
} from "../../services/consecrationService"
import ConsecrationHome from "./ConsecrationHome"

const m = {
  progress: getProgress as unknown as ReturnType<typeof vi.fn>,
  cached: getCachedProgress as unknown as ReturnType<typeof vi.fn>,
  start: startConsecration as unknown as ReturnType<typeof vi.fn>,
  reset: resetConsecration as unknown as ReturnType<typeof vi.fn>,
}

const FUTURE = "2099-12-25"

function renderHome() {
  return render(<MemoryRouter><ConsecrationHome /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  m.cached.mockReturnValue(null)
  m.progress.mockResolvedValue(null)
  m.start.mockResolvedValue(undefined)
  m.reset.mockResolvedValue(undefined)
})

describe("ConsecrationHome", () => {

  it("shows the skeleton while the first progress load is in flight", () => {
    m.progress.mockReturnValue(new Promise(() => {}))
    renderHome()
    expect(screen.getByText("Voltar")).toBeInTheDocument()
    expect(screen.queryByRole("tab", { name: "Jornada" })).not.toBeInTheDocument()
  })

  it("offers the start form when the consecration has not started", async () => {
    renderHome()
    expect(await screen.findByText("Data da sua consagração")).toBeInTheDocument()
  })

  it("rejects a past date and starts with a valid future date", async () => {
    renderHome()
    await screen.findByText("Data da sua consagração")
    const input = document.querySelector('input[type="date"]') as HTMLInputElement

    fireEvent.change(input, { target: { value: "2000-01-01" } })
    fireEvent.click(screen.getByRole("button", { name: "Iniciar Consagração" }))
    expect(await screen.findByText("Escolha uma data futura para a consagração.")).toBeInTheDocument()
    expect(m.start).not.toHaveBeenCalled()

    fireEvent.change(input, { target: { value: FUTURE } })
    fireEvent.click(screen.getByRole("button", { name: "Iniciar Consagração" }))
    await waitFor(() => expect(m.start).toHaveBeenCalledWith(FUTURE))
  })

  it("shows the countdown before the preparation window opens", async () => {
    m.progress.mockResolvedValue({
      started: true, finished: false, stages: [], completedDays: [],
      currentDay: 0, daysUntilStart: 5, consecrationDate: "2099-12-25",
    })
    renderHome()
    expect(await screen.findByText("para o início da sua preparação")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()
  })

  it("shows progress and a CTA for the actionable day once underway", async () => {
    m.progress.mockResolvedValue({
      started: true, finished: false, stages: [], completedDays: [1, 2],
      currentDay: 4, daysUntilStart: 0, consecrationDate: "2099-12-25",
    })
    renderHome()
    expect(await screen.findByText(/de 33 dias/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Retomar no dia 3" }))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/consecration/day/3")
  })

  it("shows the finished banner and reveals the restart form", async () => {
    m.progress.mockResolvedValue({
      started: true, finished: true, stages: [], completedDays: [],
      currentDay: 33, daysUntilStart: 0, consecrationDate: "2020-01-01",
      completedAt: "2020-01-01",
    })
    renderHome()
    expect(await screen.findByText("Consagração concluída")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Iniciar nova" }))
    expect(await screen.findByText("Iniciar nova consagração")).toBeInTheDocument()
  })

  it("switches to the Sobre tab", async () => {
    renderHome()
    await screen.findByText("Data da sua consagração")
    fireEvent.click(screen.getByRole("tab", { name: "Sobre" }))
    expect(await screen.findByText("A sequência de cada dia")).toBeInTheDocument()
  })

  it("cancels the consecration through the confirm modal", async () => {
    m.progress.mockResolvedValue({
      started: true, finished: false, stages: [], completedDays: [],
      currentDay: 2, daysUntilStart: 0, consecrationDate: "2099-12-25",
    })
    renderHome()
    await screen.findByText(/de 33 dias/)

    fireEvent.click(screen.getByLabelText("Alterar ou cancelar a consagração"))
    fireEvent.click(await screen.findByRole("button", { name: /Cancelar consagração/ }))
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar" }))
    await waitFor(() => expect(m.reset).toHaveBeenCalled())
  })

})
