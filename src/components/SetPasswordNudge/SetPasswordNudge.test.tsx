import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, beforeEach, vi } from "vitest"

const navigateMock = vi.fn()
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/profileService", () => ({ getProfile: vi.fn() }))

import { getProfile } from "../../services/profileService"
import SetPasswordNudge from "./SetPasswordNudge"

const getProfileMock = getProfile as unknown as ReturnType<typeof vi.fn>

function renderNudge(path = "/oratio/home") {
  return render(<MemoryRouter initialEntries={[path]}><SetPasswordNudge /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
})

describe("SetPasswordNudge", () => {

  it("does nothing when there is no session (no token)", () => {
    renderNudge()
    expect(getProfileMock).not.toHaveBeenCalled()
  })

  it("does not show for an account that already has a password", async () => {
    localStorage.setItem("access_token", "t")
    getProfileMock.mockResolvedValue({ hasPassword: true })
    const { container } = renderNudge()
    await waitFor(() => expect(getProfileMock).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })

  it("shows for a Google-only account and routes to settings on 'Definir senha'", async () => {
    localStorage.setItem("access_token", "t")
    getProfileMock.mockResolvedValue({ hasPassword: false })
    renderNudge()

    expect(
      await screen.findByText("Defina uma senha para também entrar sem o Google."),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Definir senha" }))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/profile/settings")
    expect(sessionStorage.getItem("set_password_nudge_dismissed")).toBe("1")
  })

  it("stays dismissed for the session after the x", async () => {
    localStorage.setItem("access_token", "t")
    getProfileMock.mockResolvedValue({ hasPassword: false })
    const { unmount } = renderNudge()

    fireEvent.click(await screen.findByRole("button", { name: "Dispensar" }))
    expect(screen.queryByText(/Defina uma senha/)).not.toBeInTheDocument()

    unmount()
    renderNudge()
    // dispensado nesta sessão → nem busca o perfil de novo
    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1))
    expect(screen.queryByText(/Defina uma senha/)).not.toBeInTheDocument()
  })

  it("is hidden on auth routes even if it would otherwise show", async () => {
    localStorage.setItem("access_token", "t")
    getProfileMock.mockResolvedValue({ hasPassword: false })
    renderNudge("/login")
    await waitFor(() => expect(getProfileMock).toHaveBeenCalled())
    expect(screen.queryByText(/Defina uma senha/)).not.toBeInTheDocument()
  })

})
