import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../data/quaresmaSaoMiguel", () => ({
  QUARESMA_STEPS: [
    { id: "s1", title: "Invocação", hint: "Comece assim", content: "Vinde, São Miguel" },
    { id: "s2", title: "Ladainha", hint: "Reze devagar", content: "São Miguel, rogai por nós" },
  ],
  formatLong: (iso: string) => `data ${iso}`,
  getQuaresmaWindow: () => ({
    total: 40, currentDay: 5, year: 2026,
    schedule: Array.from({ length: 40 }, (_, i) => `2026-08-${String(i + 1).padStart(2, "0")}`),
  }),
}))

vi.mock("../../services/quaresmaService", () => ({
  getProgress: vi.fn(),
  getCachedProgress: vi.fn(() => null),
  completeDay: vi.fn(),
  uncompleteDay: vi.fn(),
  apiErrorMessage: (_e: unknown, fallback: string) => fallback,
}))

vi.mock("../../hooks/useOffline", () => ({ useOffline: () => false }))

import { getProgress, completeDay, uncompleteDay } from "../../services/quaresmaService"
import QuaresmaDia from "./QuaresmaDia"

const m = {
  progress: getProgress as unknown as ReturnType<typeof vi.fn>,
  complete: completeDay as unknown as ReturnType<typeof vi.fn>,
  uncomplete: uncompleteDay as unknown as ReturnType<typeof vi.fn>,
}

function renderDay(day = "3") {
  return render(
    <MemoryRouter initialEntries={[`/oratio/quaresma/dia/${day}`]}>
      <Routes>
        <Route path="/oratio/quaresma/dia/:day" element={<QuaresmaDia />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  m.progress.mockResolvedValue({ completedDays: [1, 2], currentDay: 5 })
  m.complete.mockResolvedValue(undefined)
  m.uncomplete.mockResolvedValue(undefined)
})

describe("QuaresmaDia", () => {

  it("redirects to the journey for an out-of-range day", () => {
    renderDay("999")
    expect(navigateMock).toHaveBeenCalledWith("/oratio/quaresma", { replace: true })
  })

  it("renders the day header and the first step", async () => {
    renderDay("3")
    expect(await screen.findByText("Invocação")).toBeInTheDocument()
    expect(screen.getByText("Dia 3 de 40")).toBeInTheDocument()
    expect(screen.getByText("Passo 1 de 2")).toBeInTheDocument()
  })

  it("moves through the steps", async () => {
    renderDay("3")
    await screen.findByText("Invocação")
    fireEvent.click(screen.getByRole("button", { name: /Próxima/ }))
    expect(await screen.findByText("Ladainha")).toBeInTheDocument()
  })

  it("completes the actionable day with the celebration screen", async () => {
    renderDay("3")
    await screen.findByText("Invocação")
    fireEvent.click(screen.getByRole("button", { name: /Próxima/ }))
    fireEvent.click(await screen.findByRole("button", { name: /Concluir dia/ }))
    await waitFor(() => expect(m.complete).toHaveBeenCalledWith(3))
    expect(await screen.findByText("Dia 3 concluído")).toBeInTheDocument()
  })

  it("undoes the last completed day", async () => {
    m.progress.mockResolvedValue({ completedDays: [1, 2, 3], currentDay: 5 })
    renderDay("3")
    await screen.findByText("Invocação")
    fireEvent.click(screen.getByRole("button", { name: /Próxima/ }))
    fireEvent.click(await screen.findByRole("button", { name: "Desmarcar" }))
    await waitFor(() => expect(m.uncomplete).toHaveBeenCalledWith(3))
  })

  it("shows the blocked notice in read-only mode when progress fails to load", async () => {
    m.progress.mockResolvedValue(null)
    renderDay("3")
    await screen.findByText("Invocação")
    fireEvent.click(screen.getByRole("button", { name: /Próxima/ }))
    expect(await screen.findByText("Não consegui carregar seu progresso.")).toBeInTheDocument()
  })

})
