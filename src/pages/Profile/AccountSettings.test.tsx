import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/profileService", () => ({ getProfile: vi.fn() }))

vi.mock("../../components/ChangePasswordModal/ChangePasswordModal", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>password-modal</div> : null),
}))
vi.mock("../../components/SetPasswordModal/SetPasswordModal", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>set-password-modal</div> : null),
}))
vi.mock("../../components/ChangeEmailModal/ChangeEmailModal", () => ({
  default: ({ open, onRequested }: { open: boolean; onRequested: (e: string) => void }) =>
    open ? <button onClick={() => onRequested("novo@x.com")}>email-modal</button> : null,
}))

import { getProfile } from "../../services/profileService"
import AccountSettings from "./AccountSettings"

const getProfileMock = getProfile as unknown as ReturnType<typeof vi.fn>

function renderSettings(path = "/oratio/profile/settings") {
  return render(
    <MemoryRouter initialEntries={[path]}><AccountSettings /></MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  getProfileMock.mockResolvedValue({ hasPassword: true })
})

describe("AccountSettings", () => {

  it("shows 'Trocar senha' and opens the change-password modal when the account has a password", async () => {
    renderSettings()
    fireEvent.click(await screen.findByRole("button", { name: /Trocar senha/ }))
    expect(screen.getByText("password-modal")).toBeInTheDocument()
  })

  it("shows 'Definir senha' and opens the set-password modal for a Google-only account", async () => {
    getProfileMock.mockResolvedValue({ hasPassword: false })
    renderSettings()
    fireEvent.click(await screen.findByRole("button", { name: /Definir senha/ }))
    expect(screen.getByText("set-password-modal")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Trocar senha/ })).not.toBeInTheDocument()
  })

  it("highlights the 'Definir senha' button when arriving from the profile hint (?senha=1)", async () => {
    localStorage.setItem("oratio-profile", JSON.stringify({ hasPassword: false }))
    getProfileMock.mockResolvedValue({ hasPassword: false })
    renderSettings("/oratio/profile/settings?senha=1")
    const btn = await screen.findByRole("button", { name: /Definir senha/ })
    expect(btn.className).toMatch(/Pulse/i)
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it("falls back to 'Trocar senha' when the backend does not send hasPassword yet", async () => {
    getProfileMock.mockResolvedValue({ id: "u1" }) // sem hasPassword
    renderSettings()
    expect(await screen.findByRole("button", { name: /Trocar senha/ })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Definir senha/ })).not.toBeInTheDocument()
  })

  it("uses the cached profile to render the right button before the fetch resolves", async () => {
    localStorage.setItem("oratio-profile", JSON.stringify({ hasPassword: false }))
    renderSettings()
    expect(screen.getByRole("button", { name: /Definir senha/ })).toBeInTheDocument()
  })

  it("redirects to /login when the profile fetch returns 401", async () => {
    getProfileMock.mockRejectedValue({ response: { status: 401 } })
    renderSettings()
    await vi.waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/login"))
  })

  it("opens the change-email modal and shows the confirmation banner once requested", async () => {
    renderSettings()
    fireEvent.click(await screen.findByRole("button", { name: /Trocar email/ }))
    fireEvent.click(screen.getByText("email-modal"))
    expect(screen.getByText("Enviamos um link de confirmação para novo@x.com.")).toBeInTheDocument()
  })

  it("goes back to the profile", () => {
    renderSettings()
    fireEvent.click(screen.getAllByRole("button")[0]) // seta de voltar (só ícone)
    expect(navigateMock).toHaveBeenCalledWith("/oratio/profile")
  })

})
