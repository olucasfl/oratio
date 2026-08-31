import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../utils/isPwa", () => ({ isPWA: vi.fn(() => true) }))
vi.mock("../../utils/auth", () => ({ isLoggedIn: vi.fn() }))
vi.mock("../../services/authService", () => ({ logout: vi.fn() }))
vi.mock("../../services/consecrationService", () => ({
  preloadConsecration: vi.fn(),
  getProgress: vi.fn(),
}))
vi.mock("../../services/profileService", () => ({ getProfile: vi.fn() }))
vi.mock("../../services/homeService", () => ({ getHomeFeed: vi.fn() }))
vi.mock("../../hooks/useLiturgy", () => ({
  useLiturgy: () => ({
    liturgy: null, loadingLiturgy: false, liturgyError: null,
    dateOffset: 0, setDateOffset: vi.fn(), displayDateLabel: "Hoje", reloadLiturgy: vi.fn(),
  }),
}))

vi.mock("../../components/MenuDrawer/MenuDrawer", () => ({ default: () => <div>menu</div> }))
vi.mock("../../components/NotificationBell/NotificationBell", () => ({ default: () => <div>bell</div> }))
vi.mock("../../components/NotificationNudge/NotificationNudge", () => ({ default: () => <div>nudge</div> }))
vi.mock("../../components/QuaresmaNudge/QuaresmaNudge", () => ({ default: () => <div>q-nudge</div> }))
vi.mock("../../components/QuaresmaCard/QuaresmaCard", () => ({ default: () => <div>q-card</div> }))
vi.mock("../../components/LiturgyCard/LiturgyCard", () => ({ default: () => <div>liturgy-card</div> }))
vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => <div>navbar</div> }))
vi.mock("../../components/FraseDiaria/FraseDiaria", () => ({ FraseDiaria: () => <div>frase</div> }))
vi.mock("../../components/GuestWelcomeModal/GuestWelcomeModal", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>welcome-modal</div> : null),
}))
vi.mock("../../components/GuestGateModal/GuestGateModal", () => ({
  default: ({ open, message }: { open: boolean; message: string }) => (open ? <div>gate:{message}</div> : null),
}))

import { isPWA } from "../../utils/isPwa"
import { isLoggedIn } from "../../utils/auth"

const isPWAMock = isPWA as unknown as ReturnType<typeof vi.fn>
import { logout } from "../../services/authService"
import { getProgress } from "../../services/consecrationService"
import { getProfile } from "../../services/profileService"
import { getHomeFeed } from "../../services/homeService"
import Home from "./Home"

const isLoggedInMock = isLoggedIn as unknown as ReturnType<typeof vi.fn>
const logoutMock = logout as unknown as ReturnType<typeof vi.fn>
const getProgressMock = getProgress as unknown as ReturnType<typeof vi.fn>
const getProfileMock = getProfile as unknown as ReturnType<typeof vi.fn>
const getHomeFeedMock = getHomeFeed as unknown as ReturnType<typeof vi.fn>

function renderHome() {
  return render(<MemoryRouter><Home /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  isLoggedInMock.mockReturnValue(true)
  getProgressMock.mockResolvedValue(null)
  getProfileMock.mockResolvedValue({ name: "Ana" })
  getHomeFeedMock.mockResolvedValue({ suggestions: [] })
})

describe("Home", () => {

  it("greets a guest with the welcome modal and shortcut gate", () => {
    isLoggedInMock.mockReturnValue(false)
    renderHome()
    expect(screen.getByText("welcome-modal")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Consagração" }))
    expect(screen.getByText(/^gate:Crie uma conta para iniciar a Consagração/)).toBeInTheDocument()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it("navigates straight to an unlocked shortcut", () => {
    renderHome()
    fireEvent.click(screen.getByRole("button", { name: "Liturgia" }))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/liturgia-completa")
  })

  it("loads the member's data and shows 'continue where you left off'", async () => {
    getProgressMock.mockResolvedValue({ currentDay: 7, completedDays: 6 })
    renderHome()
    await waitFor(() => expect(getProfileMock).toHaveBeenCalled())
    expect(await screen.findByText("Continue de onde parou")).toBeInTheDocument()
    fireEvent.click(screen.getByText("Continue de onde parou").closest("button")!)
    expect(navigateMock).toHaveBeenCalledWith("/oratio/consecration/day/7")
  })

  it("renders the 'for you today' suggestions", async () => {
    getHomeFeedMock.mockResolvedValue({
      suggestions: [{ id: "s1", kind: "rosary", title: "Reze o terço", subtitle: "Gozosos", why: "Devoção", icon: "rosary", path: "/oratio/rosary" }],
    })
    renderHome()
    expect(await screen.findByText("Reze o terço")).toBeInTheDocument()
  })

  it("logs out from the top button", async () => {
    isPWAMock.mockReturnValue(false) // os botões do topo só aparecem fora do PWA
    logoutMock.mockReturnValue(new Promise(() => {}))
    renderHome()
    fireEvent.click(screen.getByRole("button", { name: "Sair da conta" }))
    await waitFor(() => expect(logoutMock).toHaveBeenCalledWith("/oratio/home"))
  })

})
