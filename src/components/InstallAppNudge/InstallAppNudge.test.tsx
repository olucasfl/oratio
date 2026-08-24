import { render, screen, fireEvent, act } from "@testing-library/react"
import { MemoryRouter, useNavigate } from "react-router-dom"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("../InstallAppModal/InstallAppModal", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>NUDGE_OPEN</div> : null),
}))

vi.mock("../../utils/isPwa", () => ({ isPWA: vi.fn() }))
vi.mock("../../utils/installPrompt", () => ({ wasInstalled: vi.fn() }))
vi.mock("../../utils/overlayCoordinator", () => ({ isOverlayBlocking: vi.fn() }))

import { isPWA } from "../../utils/isPwa"
import { wasInstalled } from "../../utils/installPrompt"
import { isOverlayBlocking } from "../../utils/overlayCoordinator"
import InstallAppNudge from "./InstallAppNudge"

const isPWAMock = isPWA as unknown as ReturnType<typeof vi.fn>
const wasInstalledMock = wasInstalled as unknown as ReturnType<typeof vi.fn>
const isBlockingMock = isOverlayBlocking as unknown as ReturnType<typeof vi.fn>

const SHOW_DELAY_MS = 4000
const COOLDOWN_MS = 3 * 60 * 60 * 1000

function NavTo({ path, label }: { path: string; label: string }) {
  const navigate = useNavigate()
  return <button onClick={() => navigate(path)}>{label}</button>
}

function Harness({ initialPath }: { initialPath: string }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <InstallAppNudge />
      <NavTo path="/oratio/home" label="go:home" />
      <NavTo path="/oratio/rosary" label="go:rosary" />
      <NavTo path="/oratio/prayers" label="go:prayers" />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  isPWAMock.mockReturnValue(false)
  wasInstalledMock.mockReturnValue(false)
  isBlockingMock.mockReturnValue(false)
  vi.useFakeTimers()
  vi.setSystemTime(new Date("2026-01-01T10:00:00Z"))
})

afterEach(() => {
  vi.useRealTimers()
})

describe("InstallAppNudge", () => {

  it("never opens on a SKIP_ROUTES page (login/register/verify screens)", () => {
    render(<Harness initialPath="/login" />)
    act(() => { vi.advanceTimersByTime(SHOW_DELAY_MS) })

    expect(screen.queryByText("NUDGE_OPEN")).not.toBeInTheDocument()
  })

  it("never opens when already running as an installed PWA", () => {
    isPWAMock.mockReturnValue(true)
    render(<Harness initialPath="/oratio/home" />)
    act(() => { vi.advanceTimersByTime(SHOW_DELAY_MS) })

    expect(screen.queryByText("NUDGE_OPEN")).not.toBeInTheDocument()
  })

  it("never opens once the app was already installed", () => {
    wasInstalledMock.mockReturnValue(true)
    render(<Harness initialPath="/oratio/home" />)
    act(() => { vi.advanceTimersByTime(SHOW_DELAY_MS) })

    expect(screen.queryByText("NUDGE_OPEN")).not.toBeInTheDocument()
  })

  it("opens on the very first screen of a fresh app load, bypassing the screens-visited threshold", () => {
    render(<Harness initialPath="/oratio/home" />)
    act(() => { vi.advanceTimersByTime(SHOW_DELAY_MS) })

    expect(screen.getByText("NUDGE_OPEN")).toBeInTheDocument()
  })

  it("does not open if another overlay is blocking the screen when the timer fires", () => {
    isBlockingMock.mockReturnValue(true)
    render(<Harness initialPath="/oratio/home" />)
    act(() => { vi.advanceTimersByTime(SHOW_DELAY_MS) })

    expect(screen.queryByText("NUDGE_OPEN")).not.toBeInTheDocument()
  })

  /*
  Neutraliza o bypass de "primeira tela" segurando o cooldown (lastShown
  = agora) no primeiro render -- assim dá pra isolar só a exigência de
  "navegou pelo menos 3 telas" sem o freshAppOpen mascarar o resultado.
  */
  it("requires 3 navigated screens (not counting the fresh-open one) before opening, once cooldown allows it again", () => {
    localStorage.setItem("install_nudge_last_shown_at", String(Date.now()))
    render(<Harness initialPath="/oratio/home" />)
    act(() => { vi.advanceTimersByTime(SHOW_DELAY_MS) })
    expect(screen.queryByText("NUDGE_OPEN")).not.toBeInTheDocument() // cooldown ainda valendo

    vi.setSystemTime(new Date(Date.now() + COOLDOWN_MS + 1))

    fireEvent.click(screen.getByText("go:rosary")) // 2ª tela
    act(() => { vi.advanceTimersByTime(SHOW_DELAY_MS) })
    expect(screen.queryByText("NUDGE_OPEN")).not.toBeInTheDocument() // só 2 telas ainda

    fireEvent.click(screen.getByText("go:prayers")) // 3ª tela
    act(() => { vi.advanceTimersByTime(SHOW_DELAY_MS) })
    expect(screen.getByText("NUDGE_OPEN")).toBeInTheDocument()
  })

  it("bypasses the screens threshold right after coming from /login (just authenticated)", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <InstallAppNudge />
        <NavTo path="/oratio/home" label="go:home" />
      </MemoryRouter>,
    )
    // consome o "fresh open" na tela de login (SKIP_ROUTES, não abre nada)
    act(() => { vi.advanceTimersByTime(SHOW_DELAY_MS) })

    fireEvent.click(screen.getByText("go:home")) // saiu do /login agora
    act(() => { vi.advanceTimersByTime(SHOW_DELAY_MS) })

    expect(screen.getByText("NUDGE_OPEN")).toBeInTheDocument()
  })

})
