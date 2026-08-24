import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../utils/isPwa", () => ({ isPWA: vi.fn() }))
vi.mock("../../utils/auth", () => ({ isLoggedIn: vi.fn() }))

import { isPWA } from "../../utils/isPwa"
import { isLoggedIn } from "../../utils/auth"
import BottomNavbar from "./BottomNavbar"

const isPWAMock = isPWA as unknown as ReturnType<typeof vi.fn>
const isLoggedInMock = isLoggedIn as unknown as ReturnType<typeof vi.fn>

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderNavbar(initialPath = "/oratio/home") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <BottomNavbar />
      <LocationDisplay />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  isPWAMock.mockReturnValue(true)
  isLoggedInMock.mockReturnValue(false)
})

describe("BottomNavbar", () => {

  it("renders nothing outside of PWA/standalone mode", () => {
    isPWAMock.mockReturnValue(false)
    const { container } = renderNavbar()
    expect(container.querySelector("nav")).toBeNull()
  })

  it("marks the current section's item active based on the URL", () => {
    renderNavbar("/oratio/biblia/genesis")
    expect(screen.getByLabelText("Abrir Bíblia").className).toMatch(/active/)
    expect(screen.getByLabelText("Abrir início").className).not.toMatch(/centerActive/)
  })

  it("navigates directly for an unlocked item, even as a guest", () => {
    renderNavbar()
    fireEvent.click(screen.getByLabelText("Abrir Bíblia"))
    expect(screen.getByTestId("location").textContent).toBe("/oratio/biblia")
  })

  it("blocks a locked item for a guest with the account-gate modal instead of navigating", () => {
    renderNavbar()
    fireEvent.click(screen.getByLabelText("Abrir Perfil"))

    expect(screen.getByText(/acessar seu perfil/)).toBeInTheDocument()
    expect(screen.getByTestId("location").textContent).toBe("/oratio/home")
  })

  it("navigates a locked item directly once logged in", () => {
    isLoggedInMock.mockReturnValue(true)
    renderNavbar()
    fireEvent.click(screen.getByLabelText("Abrir Perfil"))

    expect(screen.getByTestId("location").textContent).toBe("/oratio/profile")
  })

  it("the center button always goes to Home", () => {
    renderNavbar("/oratio/biblia")
    fireEvent.click(screen.getByLabelText("Abrir início"))
    expect(screen.getByTestId("location").textContent).toBe("/oratio/home")
  })

})
