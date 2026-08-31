import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/rosaryService", () => ({
  getRosary: vi.fn(),
  finishRosary: vi.fn(),
  startRosary: vi.fn(),
  getRosarySession: vi.fn(),
  updateRosaryStep: vi.fn(),
}))

vi.mock("../../utils/auth", () => ({ isLoggedIn: vi.fn() }))

vi.mock("../../components/GuestGateModal/GuestGateModal", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>guest-gate</div> : null),
}))

import {
  getRosary, finishRosary, startRosary, getRosarySession, updateRosaryStep,
} from "../../services/rosaryService"
import { isLoggedIn } from "../../utils/auth"
import RosaryPage from "./RosaryPage"

const m = {
  get: getRosary as unknown as ReturnType<typeof vi.fn>,
  finish: finishRosary as unknown as ReturnType<typeof vi.fn>,
  start: startRosary as unknown as ReturnType<typeof vi.fn>,
  session: getRosarySession as unknown as ReturnType<typeof vi.fn>,
  update: updateRosaryStep as unknown as ReturnType<typeof vi.fn>,
  loggedIn: isLoggedIn as unknown as ReturnType<typeof vi.fn>,
}

const STEPS = [
  { type: "mystery", title: "Primeiro Mistério", text: "A Anunciação" },
  { type: "prayer", title: "Pai Nosso 1/1", text: "Pai nosso que estais no céu" },
  { type: "prayer", title: "Salve Rainha", text: "Salve, Rainha" },
]

function renderPage(path = "/oratio/rosary/gozosos") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/oratio/rosary/:type" element={<RosaryPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  m.get.mockResolvedValue(STEPS)
  m.session.mockResolvedValue(null)
  m.start.mockResolvedValue({ currentStep: 0, elapsedSeconds: 0 })
  m.finish.mockResolvedValue(undefined)
  m.update.mockResolvedValue(undefined)
  m.loggedIn.mockReturnValue(true)
})

describe("RosaryPage", () => {

  it("shows a skeleton while the rosary content loads", () => {
    m.get.mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByText("Voltar")).toBeInTheDocument()
    expect(screen.queryByText("Progresso")).not.toBeInTheDocument()
  })

  it("renders the first step for a guest without touching session endpoints", async () => {
    m.loggedIn.mockReturnValue(false)
    renderPage()
    expect(await screen.findByText("Primeiro Mistério")).toBeInTheDocument()
    expect(m.session).not.toHaveBeenCalled()
    expect(m.start).not.toHaveBeenCalled()
  })

  it("starts a session when a logged-in user has none", async () => {
    renderPage()
    await screen.findByText("Primeiro Mistério")
    expect(m.start).toHaveBeenCalledWith("gozosos")
  })

  it("offers to resume when the saved session is mid-rosary", async () => {
    m.session.mockResolvedValue({ currentStep: 2, elapsedSeconds: 30 })
    renderPage()
    expect(await screen.findByText("Retomar terço?")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Continuar de onde parei" }))
    await waitFor(() => expect(screen.getByText("3 / 3")).toBeInTheDocument())
  })

  it("restarts the session from zero when the user chooses to", async () => {
    m.session.mockResolvedValue({ currentStep: 2, elapsedSeconds: 30 })
    renderPage()
    await screen.findByText("Retomar terço?")
    fireEvent.click(screen.getByRole("button", { name: "Começar do zero" }))
    await waitFor(() => expect(m.start).toHaveBeenCalledWith("gozosos", true))
  })

  it("moves between steps with the Próximo / Anterior buttons", async () => {
    renderPage()
    await screen.findByText("Primeiro Mistério")
    expect(screen.getByText("1 / 3")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Próximo/ }))
    expect(await screen.findByText("Pai Nosso")).toBeInTheDocument()
    expect(screen.getByText("2 / 3")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Anterior/ }))
    expect(await screen.findByText("Primeiro Mistério")).toBeInTheDocument()
  })

  it("finishes the rosary and shows the completion overlay", async () => {
    renderPage()
    await screen.findByText("Primeiro Mistério")
    fireEvent.click(screen.getByRole("button", { name: /Próximo/ }))
    await screen.findByText("2 / 3")
    fireEvent.click(screen.getByRole("button", { name: /Próximo/ }))
    await screen.findByText("3 / 3")

    fireEvent.click(screen.getByRole("button", { name: /Concluir/ }))
    await waitFor(() => expect(m.finish).toHaveBeenCalledWith("gozosos"))
    expect(await screen.findByText("Terço concluído")).toBeInTheDocument()
  })

  it("shows the guest gate instead of finishing when not logged in", async () => {
    m.loggedIn.mockReturnValue(false)
    renderPage()
    await screen.findByText("Primeiro Mistério")
    fireEvent.click(screen.getByRole("button", { name: /Próximo/ }))
    await screen.findByText("2 / 3")
    fireEvent.click(screen.getByRole("button", { name: /Próximo/ }))
    await screen.findByText("3 / 3")

    fireEvent.click(screen.getByRole("button", { name: /Concluir/ }))
    expect(await screen.findByText("guest-gate")).toBeInTheDocument()
    expect(m.finish).not.toHaveBeenCalled()
  })

  it("shows a fallback when the rosary content is empty", async () => {
    m.get.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/Não foi possível/)).toBeInTheDocument()
  })

})
