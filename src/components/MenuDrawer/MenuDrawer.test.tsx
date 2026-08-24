import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../utils/auth", () => ({ isLoggedIn: vi.fn() }))

import { isLoggedIn } from "../../utils/auth"
import MenuDrawer from "./MenuDrawer"

const isLoggedInMock = isLoggedIn as unknown as ReturnType<typeof vi.fn>

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderDrawer() {
  return render(
    <MemoryRouter>
      <MenuDrawer />
      <LocationDisplay />
    </MemoryRouter>,
  )
}

function openDrawer() {
  fireEvent.click(screen.getByLabelText("Abrir menu do aplicativo"))
}

beforeEach(() => {
  vi.clearAllMocks()
  isLoggedInMock.mockReturnValue(false)
})

describe("MenuDrawer", () => {

  it("opens via the FAB and closes via the close button", () => {
    renderDrawer()
    openDrawer()

    expect(screen.getByLabelText("Menu do aplicativo")).toHaveAttribute("aria-hidden", "false")

    fireEvent.click(screen.getByLabelText("Fechar menu"))
    expect(screen.getByLabelText("Menu do aplicativo")).toHaveAttribute("aria-hidden", "true")
  })

  it("closes on backdrop click", () => {
    renderDrawer()
    openDrawer()

    const overlay = document.querySelector('div[class*="overlay"]')
    expect(overlay).not.toBeNull()
    fireEvent.click(overlay as Element)

    expect(screen.getByLabelText("Menu do aplicativo")).toHaveAttribute("aria-hidden", "true")
  })

  it("navigates and closes the drawer for an unlocked item", () => {
    renderDrawer()
    openDrawer()

    fireEvent.click(screen.getByText("Terço & Rosário"))

    expect(screen.getByTestId("location").textContent).toBe("/oratio/rosary")
    expect(screen.getByLabelText("Menu do aplicativo")).toHaveAttribute("aria-hidden", "true")
  })

  it("blocks a locked item for a guest, keeping the drawer open behind the gate modal", () => {
    renderDrawer()
    openDrawer()

    fireEvent.click(screen.getByText("Consagração · 33 dias"))

    expect(screen.getByText(/iniciar a Consagração/)).toBeInTheDocument()
    // não navegou nem fechou o drawer -- só o gate apareceu por cima
    expect(screen.getByTestId("location").textContent).toBe("/")
    expect(screen.getByLabelText("Menu do aplicativo")).toHaveAttribute("aria-hidden", "false")
  })

  it("navigates a locked item directly once logged in", () => {
    isLoggedInMock.mockReturnValue(true)
    renderDrawer()
    openDrawer()

    fireEvent.click(screen.getByText("Consagração · 33 dias"))

    expect(screen.getByTestId("location").textContent).toBe("/oratio/consecration")
  })

  it("the featured VoxAI button uses its own gate message when blocked", () => {
    renderDrawer()
    openDrawer()

    fireEvent.click(screen.getByText("VoxAI"))

    expect(screen.getByText(/conversar com o VoxAI/)).toBeInTheDocument()
  })

})
