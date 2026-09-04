import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/profileService", () => ({
  getProfile: vi.fn(),
  cancelEmailChange: vi.fn(),
}))

vi.mock("../../services/authService", () => ({
  logout: vi.fn(),
}))

vi.mock("../../services/pushService", () => ({
  isPushSupported: vi.fn(() => true),
  getPushStatus: vi.fn(() => Promise.resolve(false)),
  enablePush: vi.fn(() => Promise.resolve()),
  disablePush: vi.fn(() => Promise.resolve()),
}))

// Barra de navegação e modal de exclusão têm cobertura própria — aqui só
// atrapalhariam (isPWA/matchMedia, portais) sem exercitar nada de Profile.
vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))
vi.mock("../../components/DeleteAccountModal/DeleteAccountModal", () => ({ default: () => null }))

import { getProfile, cancelEmailChange } from "../../services/profileService"
import { logout as authLogout } from "../../services/authService"
import { isPushSupported, getPushStatus, enablePush, disablePush } from "../../services/pushService"
import Profile from "./Profile"

const getProfileMock = getProfile as unknown as ReturnType<typeof vi.fn>
const cancelEmailChangeMock = cancelEmailChange as unknown as ReturnType<typeof vi.fn>
const authLogoutMock = authLogout as unknown as ReturnType<typeof vi.fn>
const isPushSupportedMock = isPushSupported as unknown as ReturnType<typeof vi.fn>
const getPushStatusMock = getPushStatus as unknown as ReturnType<typeof vi.fn>
const enablePushMock = enablePush as unknown as ReturnType<typeof vi.fn>
const disablePushMock = disablePush as unknown as ReturnType<typeof vi.fn>

const BASE_PROFILE = {
  id: "user-1",
  name: "Ana Maria",
  email: "ana@example.com",
  createdAt: "2025-01-10T10:00:00.000Z",
  isAdmin: false,
  pendingEmail: null,
  spiritualProgress: {
    daysCompleted: 10,
    prayersPrayed: 42,
    rosariesPrayed: 7,
    prayerStreak: 5,
    lastPrayerDate: "2026-02-01T09:00:00.000Z",
    consecrationStarted: true,
  },
}

function renderProfile() {
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  localStorage.setItem("access_token", "tok")
  isPushSupportedMock.mockReturnValue(true)
  getPushStatusMock.mockResolvedValue(false)
  getProfileMock.mockResolvedValue(BASE_PROFILE)
})

describe("Profile", () => {

  it("shows a loading state before the profile resolves", () => {
    getProfileMock.mockReturnValue(new Promise(() => {}))
    renderProfile()
    expect(screen.getByText("Carregando perfil...")).toBeInTheDocument()
  })

  it("renders the profile data and caches it once loaded", async () => {
    renderProfile()
    expect(await screen.findByText("Ana Maria")).toBeInTheDocument()
    expect(screen.getByText("ana@example.com")).toBeInTheDocument()
    expect(screen.getByText("42")).toBeInTheDocument()
    expect(screen.getByText("7")).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem("oratio-profile")!).name).toBe("Ana Maria")
  })

  it("redirects to /login when there is no token", async () => {
    localStorage.removeItem("access_token")
    renderProfile()
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/login"))
    expect(getProfileMock).not.toHaveBeenCalled()
  })

  it("redirects to /login on a 401 response", async () => {
    getProfileMock.mockRejectedValue({ response: { status: 401 } })
    renderProfile()
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/login"))
  })

  it("shows a fallback message when the profile cannot be loaded", async () => {
    getProfileMock.mockRejectedValue(new Error("boom"))
    renderProfile()
    expect(await screen.findByText("Não foi possível carregar o perfil")).toBeInTheDocument()
  })

  it("shows the admin card only for admins", async () => {
    getProfileMock.mockResolvedValue({ ...BASE_PROFILE, isAdmin: true })
    renderProfile()
    expect(await screen.findByText("Painel Administrador")).toBeInTheDocument()
  })

  it("labels the prayer streak band from the streak count", async () => {
    getProfileMock.mockResolvedValue({
      ...BASE_PROFILE,
      spiritualProgress: { ...BASE_PROFILE.spiritualProgress, prayerStreak: 12 },
    })
    renderProfile()
    expect(await screen.findByText("Fiel Perseverante")).toBeInTheDocument()
  })

  it("persists a new font scale when an option is picked", async () => {
    renderProfile()
    await screen.findByText("Ana Maria")
    fireEvent.click(screen.getByText("Grande"))
    await waitFor(() =>
      expect(screen.getByText("Grande").closest("button")!.className).toMatch(/Active/),
    )
  })

  it("asks for confirmation before enabling push, then calls enablePush", async () => {
    renderProfile()
    await screen.findByText("Ana Maria")
    fireEvent.click(screen.getByRole("switch", { name: /Ativar notificações/ }))
    fireEvent.click(await screen.findByRole("button", { name: "Ativar" }))
    await waitFor(() => expect(enablePushMock).toHaveBeenCalled())
  })

  it("shows an error message when enabling push is denied", async () => {
    enablePushMock.mockRejectedValue(new Error("denied"))
    renderProfile()
    await screen.findByText("Ana Maria")
    fireEvent.click(screen.getByRole("switch", { name: /Ativar notificações/ }))
    fireEvent.click(await screen.findByRole("button", { name: "Ativar" }))
    expect(await screen.findByText(/Permissão negada/)).toBeInTheDocument()
  })

  it("confirms and calls disablePush when push is already on", async () => {
    getPushStatusMock.mockResolvedValue(true)
    renderProfile()
    await screen.findByText("Ana Maria")
    await waitFor(() =>
      expect(screen.getByRole("switch", { name: /Notificações ativadas/ })).toHaveAttribute(
        "aria-checked",
        "true",
      ),
    )
    fireEvent.click(screen.getByRole("switch", { name: /Notificações ativadas/ }))
    fireEvent.click(await screen.findByRole("button", { name: "Desativar" }))
    await waitFor(() => expect(disablePushMock).toHaveBeenCalled())
  })

  it("tells the user when push is unsupported on this device", async () => {
    isPushSupportedMock.mockReturnValue(false)
    renderProfile()
    expect(await screen.findByText(/Este aparelho não suporta notificações/)).toBeInTheDocument()
  })

  it("shows the pending-email banner and cancels the change", async () => {
    cancelEmailChangeMock.mockResolvedValue(undefined)
    getProfileMock.mockResolvedValue({ ...BASE_PROFILE, pendingEmail: "novo@example.com" })
    renderProfile()
    expect(await screen.findByText("novo@example.com")).toBeInTheDocument()
    fireEvent.click(screen.getByText("Cancelar"))
    await waitFor(() => expect(cancelEmailChangeMock).toHaveBeenCalled())
  })

  it("logs out through authService when 'Sair da conta' is pressed", async () => {
    authLogoutMock.mockReturnValue(new Promise(() => {}))
    renderProfile()
    await screen.findByText("Ana Maria")
    fireEvent.click(screen.getByText("Sair da conta"))
    await waitFor(() => expect(authLogoutMock).toHaveBeenCalledWith("/oratio/home"))
  })

})
