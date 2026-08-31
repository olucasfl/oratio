import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../data/quaresmaSaoMiguel", () => ({
  getQuaresmaWindow: vi.fn(),
  countLateDays: vi.fn(() => 0),
}))

vi.mock("../../services/quaresmaService", () => ({
  getProgress: vi.fn(),
  getCachedProgress: vi.fn(() => null),
}))

import { getQuaresmaWindow } from "../../data/quaresmaSaoMiguel"
import { getProgress } from "../../services/quaresmaService"
import QuaresmaCard from "./QuaresmaCard"

const windowMock = getQuaresmaWindow as unknown as ReturnType<typeof vi.fn>
const getProgressMock = getProgress as unknown as ReturnType<typeof vi.fn>

const ACTIVE_WINDOW = {
  active: true, total: 40, currentDay: 5, todayIsPrayerDay: true, isRestDay: false,
}

function renderCard(guest = false) {
  return render(
    <MemoryRouter>
      <QuaresmaCard guest={guest} onGuestClick={onGuestClick} />
    </MemoryRouter>,
  )
}

const onGuestClick = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  windowMock.mockReturnValue(ACTIVE_WINDOW)
  getProgressMock.mockResolvedValue({ completedDays: [1, 2] })
})

describe("QuaresmaCard", () => {

  it("renders nothing outside the devotion window", () => {
    windowMock.mockReturnValue({ active: false })
    const { container } = renderCard()
    expect(container).toBeEmptyDOMElement()
  })

  it("shows the devotion name and current-day state for a member", async () => {
    renderCard(false)
    expect(screen.getByText("Quaresma de São Miguel")).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText("dia 3 de 40")).toBeInTheDocument())
  })

  it("navigates to the devotion for a member", async () => {
    renderCard(false)
    fireEvent.click(screen.getByRole("button"))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/quaresma")
  })

  it("calls onGuestClick instead of navigating for a guest", () => {
    renderCard(true)
    fireEvent.click(screen.getByRole("button"))
    expect(onGuestClick).toHaveBeenCalled()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it("shows 'concluída' when all days are done", async () => {
    getProgressMock.mockResolvedValue({ completedDays: Array.from({ length: 40 }, (_, i) => i + 1) })
    renderCard(false)
    expect(await screen.findByText("concluída")).toBeInTheDocument()
  })

})
