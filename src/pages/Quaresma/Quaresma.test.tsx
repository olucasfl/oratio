import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

const janela = {
  year: 2026, total: 40, currentDay: 5, reachable: true,
  todayIsPrayerDay: true, isRestDay: false,
  schedule: Array.from({ length: 40 }, (_, i) => `2026-08-${String(i + 1).padStart(2, "0")}`),
}

vi.mock("../../data/quaresmaSaoMiguel", () => ({
  QUARESMA_ABOUT: [{ icon: "flame", title: "A origem", lead: "São Francisco", text: "Instituiu a devoção." }],
  QUARESMA_MOTTO: { latim: "Quis ut Deus", traducao: "Quem como Deus", nota: "O grito de São Miguel" },
  QUARESMA_STEPS: [{ id: "s1", title: "Passo 1" }],
  QUARESMA_TIPS: [{ icon: "hand", title: "Constância", text: "Todo dia." }],
  buildTimeline: () => janela.schedule.map((date, i) => ({
    kind: "day" as const, date, dayNumber: i + 1, isFeast: i === 39, isSunday: false,
  })),
  countLateDays: () => 1,
  formatLong: (iso: string) => `data ${iso}`,
  formatShort: (iso: string) => iso.slice(8),
  getMilestones: () => [],
  getQuaresmaWindow: () => janela,
}))

vi.mock("../../services/quaresmaService", () => ({
  apiErrorMessage: (_e: unknown, f: string) => f,
  getCachedProgress: vi.fn(() => null),
  getProgress: vi.fn(),
  savePenance: vi.fn(),
}))

vi.mock("../../hooks/useOffline", () => ({ useOffline: () => false }))
vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))

import { getProgress, savePenance } from "../../services/quaresmaService"
import Quaresma from "./Quaresma"

const getProgressMock = getProgress as unknown as ReturnType<typeof vi.fn>
const savePenanceMock = savePenance as unknown as ReturnType<typeof vi.fn>

function renderPage() {
  return render(<MemoryRouter><Quaresma /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  janela.reachable = true
  getProgressMock.mockResolvedValue({ completedDays: [1, 2], currentDay: 5, penance: "Jejum de doces" })
  savePenanceMock.mockResolvedValue(undefined)
})

describe("Quaresma", () => {

  it("redirects home when the devotion window is not reachable", () => {
    janela.reachable = false
    renderPage()
    expect(navigateMock).toHaveBeenCalledWith("/oratio/home", { replace: true })
  })

  it("renders the journey with the day grid", async () => {
    renderPage()
    expect(screen.getByText("Quaresma de São Miguel")).toBeInTheDocument()
    expect(await screen.findByText("Os 40 dias")).toBeInTheDocument()
  })

  it("navigates to the actionable day from the CTA", async () => {
    renderPage()
    const cta = await screen.findByText(/Rezar o dia 3|Retomar no dia 3/)
    fireEvent.click(cta.closest("button")!)
    expect(navigateMock).toHaveBeenCalledWith("/oratio/quaresma/dia/3")
  })

  it("adds and persists a penance", async () => {
    renderPage()
    fireEvent.click(screen.getByRole("tab", { name: "Penitências" }))
    await screen.findByText("Jejum de doces")

    fireEvent.change(screen.getByPlaceholderText("Escreva sua penitência"), {
      target: { value: "Rezar às 6h" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Adicionar penitência" }))
    await waitFor(() =>
      expect(savePenanceMock).toHaveBeenCalledWith("Jejum de doces\nRezar às 6h"),
    )
  })

  it("deletes a penance", async () => {
    renderPage()
    fireEvent.click(screen.getByRole("tab", { name: "Penitências" }))
    await screen.findByText("Jejum de doces")
    fireEvent.click(screen.getByRole("button", { name: 'Apagar "Jejum de doces"' }))
    await waitFor(() => expect(savePenanceMock).toHaveBeenCalledWith(""))
  })

  it("shows the motto on the Sobre tab", async () => {
    renderPage()
    fireEvent.click(screen.getByRole("tab", { name: "Sobre" }))
    expect(await screen.findByText("Quis ut Deus")).toBeInTheDocument()
  })

})
