import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../utils/overlayCoordinator", () => ({
  markOverlayOpen: vi.fn(),
  markOverlayClosed: vi.fn(),
}))

import { markOverlayOpen, markOverlayClosed } from "../../utils/overlayCoordinator"
import GuestWelcomeModal from "./GuestWelcomeModal"

const markOpenMock = markOverlayOpen as unknown as ReturnType<typeof vi.fn>
const markClosedMock = markOverlayClosed as unknown as ReturnType<typeof vi.fn>

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("GuestWelcomeModal", () => {

  it("renders nothing when closed", () => {
    render(<MemoryRouter><GuestWelcomeModal open={false} onClose={vi.fn()} /></MemoryRouter>)
    expect(screen.queryByText("Bem-vindo ao Oratio")).not.toBeInTheDocument()
  })

  it("marks the overlay open while shown, and closed on unmount", () => {
    const { unmount } = render(<MemoryRouter><GuestWelcomeModal open onClose={vi.fn()} /></MemoryRouter>)
    expect(markOpenMock).toHaveBeenCalledWith("guest-welcome")

    unmount()
    expect(markClosedMock).toHaveBeenCalledWith("guest-welcome")
  })

  it("lists every benefit item", () => {
    render(<MemoryRouter><GuestWelcomeModal open onClose={vi.fn()} /></MemoryRouter>)
    expect(screen.getByText("Frase do dia e detalhes do Santo do Dia")).toBeInTheDocument()
    expect(screen.getByText("Pesquisar qualquer palavra ou tema na Bíblia")).toBeInTheDocument()
  })

  it("calls onClose when choosing to keep exploring", () => {
    const onClose = vi.fn()
    render(<MemoryRouter><GuestWelcomeModal open onClose={onClose} /></MemoryRouter>)

    fireEvent.click(screen.getByText("Continuar explorando"))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("navigates to /register when choosing to create an account", () => {
    render(
      <MemoryRouter initialEntries={["/oratio/home"]}>
        <GuestWelcomeModal open onClose={vi.fn()} />
        <LocationDisplay />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText("Criar conta"))
    expect(screen.getByTestId("location").textContent).toBe("/register")
  })

})
