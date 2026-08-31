import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../utils/saintOfDay", () => ({ resolveSaintOfDay: vi.fn() }))
vi.mock("../../utils/auth", () => ({ isLoggedIn: vi.fn() }))
vi.mock("../GuestGateModal/GuestGateModal", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>guest-gate</div> : null),
}))

import { resolveSaintOfDay } from "../../utils/saintOfDay"
import { isLoggedIn } from "../../utils/auth"
import SaintOfDayCard from "./SaintOfDayCard"

const resolveMock = resolveSaintOfDay as unknown as ReturnType<typeof vi.fn>
const isLoggedInMock = isLoggedIn as unknown as ReturnType<typeof vi.fn>

const INFO = { nome: "São Bento", grau: "Memória", cor: "branco", corHex: "#fff" }

function renderCard(dateOffset = 0) {
  return render(
    <MemoryRouter>
      <SaintOfDayCard liturgy={null} dateOffset={dateOffset} />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  resolveMock.mockReturnValue(INFO)
  isLoggedInMock.mockReturnValue(true)
})

describe("SaintOfDayCard", () => {

  it("renders nothing when there is no saint resolved", () => {
    resolveMock.mockReturnValue(null)
    const { container } = renderCard()
    expect(container).toBeEmptyDOMElement()
  })

  it("shows the saint's name, grade and colour", () => {
    renderCard()
    expect(screen.getByText("São Bento")).toBeInTheDocument()
    expect(screen.getByText("Memória · Branco")).toBeInTheDocument()
    expect(screen.getByText("Hoje é dia de")).toBeInTheDocument()
  })

  it("adapts the intro to the date offset", () => {
    renderCard(1)
    expect(screen.getByText("Amanhã é dia de")).toBeInTheDocument()
  })

  it("navigates to the details page for a logged-in user", () => {
    renderCard()
    fireEvent.click(screen.getByRole("button"))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/santo-do-dia", expect.objectContaining({
      state: expect.objectContaining({ dateOffset: 0 }),
    }))
  })

  it("shows the guest gate instead when not logged in", () => {
    isLoggedInMock.mockReturnValue(false)
    renderCard()
    fireEvent.click(screen.getByRole("button", { name: /Ver detalhes/ }))
    expect(screen.getByText("guest-gate")).toBeInTheDocument()
    expect(navigateMock).not.toHaveBeenCalled()
  })

})
