import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/consecrationService", () => ({
  getDay: vi.fn(),
  getProgress: vi.fn(),
  getCachedProgress: vi.fn(() => null),
  completeDay: vi.fn(),
  uncompleteDay: vi.fn(),
  apiErrorMessage: (_e: unknown, fallback: string) => fallback,
}))

import {
  getDay, getProgress, getCachedProgress, completeDay, uncompleteDay,
} from "../../services/consecrationService"
import ConsecrationDay from "./ConsecrationDay"

const m = {
  day: getDay as unknown as ReturnType<typeof vi.fn>,
  progress: getProgress as unknown as ReturnType<typeof vi.fn>,
  cached: getCachedProgress as unknown as ReturnType<typeof vi.fn>,
  complete: completeDay as unknown as ReturnType<typeof vi.fn>,
  uncomplete: uncompleteDay as unknown as ReturnType<typeof vi.fn>,
}

const DAY_DATA = {
  title: "A humildade",
  stage: { title: "Conhecimento de si mesmo" },
  prayers: [
    { id: "p1", prayer: { title: "Vinde Espírito Santo", content: "Vinde..." } },
    { id: "p2", prayer: { title: "Ave-Maria", content: "Ave Maria cheia de graça" } },
  ],
}

function renderDay(day = "1") {
  return render(
    <MemoryRouter initialEntries={[`/oratio/consecration/day/${day}`]}>
      <Routes>
        <Route path="/oratio/consecration/day/:day" element={<ConsecrationDay />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  m.cached.mockReturnValue(null)
  m.day.mockResolvedValue(DAY_DATA)
  m.progress.mockResolvedValue({ completedDays: [], currentDay: 1 })
  m.complete.mockResolvedValue(undefined)
  m.uncomplete.mockResolvedValue(undefined)
})

describe("ConsecrationDay", () => {

  it("shows a skeleton until the day content resolves", () => {
    m.day.mockReturnValue(new Promise(() => {}))
    renderDay()
    expect(screen.getByText("Jornada")).toBeInTheDocument()
    expect(screen.queryByText("A humildade")).not.toBeInTheDocument()
  })

  it("renders the day header and first prayer", async () => {
    renderDay()
    expect(await screen.findByText("A humildade")).toBeInTheDocument()
    expect(screen.getByText("Conhecimento de si mesmo")).toBeInTheDocument()
    expect(screen.getByText("Vinde...")).toBeInTheDocument()
    expect(screen.getByText("Oração 1 de 2")).toBeInTheDocument()
  })

  it("steps through the prayers", async () => {
    renderDay()
    await screen.findByText("A humildade")
    fireEvent.click(screen.getByRole("button", { name: /Próxima/ }))
    expect(await screen.findByText("Ave Maria cheia de graça")).toBeInTheDocument()
    expect(screen.getByText("Oração 2 de 2")).toBeInTheDocument()
  })

  it("completes the day when it is the actionable one", async () => {
    renderDay()
    await screen.findByText("A humildade")
    fireEvent.click(screen.getByRole("button", { name: /Próxima/ }))
    fireEvent.click(await screen.findByRole("button", { name: /Concluir dia/ }))
    await waitFor(() => expect(m.complete).toHaveBeenCalledWith(1))
    expect(await screen.findByText("Dia 1 concluído")).toBeInTheDocument()
  })

  it("explains why a future day cannot be completed yet", async () => {
    m.progress.mockResolvedValue({ completedDays: [], currentDay: 0 })
    renderDay("3")
    await screen.findByText("A humildade")
    fireEvent.click(screen.getByRole("button", { name: /Próxima/ }))
    expect(await screen.findByText(/Este dia ainda não chegou/)).toBeInTheDocument()
  })

  it("undoes the last completed day", async () => {
    m.progress.mockResolvedValue({ completedDays: [1], currentDay: 2 })
    renderDay("1")
    await screen.findByText("A humildade")
    fireEvent.click(screen.getByRole("button", { name: /Próxima/ }))
    fireEvent.click(await screen.findByRole("button", { name: "Desmarcar conclusão" }))
    await waitFor(() => expect(m.uncomplete).toHaveBeenCalledWith(1))
  })

  it("shows a fallback when the day cannot be loaded", async () => {
    m.day.mockResolvedValue(null)
    renderDay()
    expect(await screen.findByText("Não foi possível carregar este dia.")).toBeInTheDocument()
  })

})
