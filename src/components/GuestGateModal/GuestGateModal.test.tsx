import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../utils/overlayCoordinator", () => ({
  markOverlayOpen: vi.fn(),
  markOverlayClosed: vi.fn(),
}))

import { markOverlayOpen, markOverlayClosed } from "../../utils/overlayCoordinator"
import GuestGateModal from "./GuestGateModal"

const markOpenMock = markOverlayOpen as unknown as ReturnType<typeof vi.fn>
const markClosedMock = markOverlayClosed as unknown as ReturnType<typeof vi.fn>

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}{location.search}</div>
}

function renderModal(props: Partial<Parameters<typeof GuestGateModal>[0]> = {}, initialPath = "/oratio/rosary?step=2") {
  const onClose = vi.fn()
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <GuestGateModal open message="Crie sua conta para salvar seu progresso." onClose={onClose} {...props} />
      <LocationDisplay />
    </MemoryRouter>,
  )
  return { onClose }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("GuestGateModal", () => {

  it("renders nothing when closed", () => {
    render(
      <MemoryRouter>
        <GuestGateModal open={false} message="msg" onClose={vi.fn()} />
      </MemoryRouter>,
    )
    expect(screen.queryByText("Crie sua conta")).not.toBeInTheDocument()
  })

  it("marks the overlay open while shown, and closed on unmount", () => {
    const { unmount } = render(
      <MemoryRouter>
        <GuestGateModal open message="msg" onClose={vi.fn()} />
      </MemoryRouter>,
    )
    expect(markOpenMock).toHaveBeenCalledWith("guest-gate")

    unmount()
    expect(markClosedMock).toHaveBeenCalledWith("guest-gate")
  })

  it("navigates to /register with the current path as redirect", () => {
    renderModal()
    fireEvent.click(screen.getByText("Criar conta"))
    expect(screen.getByTestId("location").textContent).toBe(
      "/register?redirect=%2Foratio%2Frosary%3Fstep%3D2",
    )
  })

  it("navigates to /login with the current path as redirect", () => {
    renderModal()
    fireEvent.click(screen.getByText("Já tenho conta — Entrar"))
    expect(screen.getByTestId("location").textContent).toBe(
      "/login?redirect=%2Foratio%2Frosary%3Fstep%3D2",
    )
  })

  it("uses the explicit redirectPath override instead of the current location", () => {
    renderModal({ redirectPath: "/oratio/rosary/gozosos?step=5" })
    fireEvent.click(screen.getByText("Criar conta"))
    expect(screen.getByTestId("location").textContent).toBe(
      "/register?redirect=%2Foratio%2Frosary%2Fgozosos%3Fstep%3D5",
    )
  })

  it("calls onClose when dismissed, and when clicking the backdrop", () => {
    const { onClose } = renderModal()
    fireEvent.click(screen.getByText("Agora não"))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("does not close when clicking inside the modal content", () => {
    const { onClose } = renderModal()
    fireEvent.click(screen.getByText("Crie sua conta"))
    expect(onClose).not.toHaveBeenCalled()
  })

})
