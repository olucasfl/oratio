import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/pushService", () => ({
  isPushSupported: vi.fn(),
  getPushStatus: vi.fn(),
}))

import { isPushSupported, getPushStatus } from "../../services/pushService"
import NotificationNudge from "./NotificationNudge"

const isSupportedMock = isPushSupported as unknown as ReturnType<typeof vi.fn>
const getStatusMock = getPushStatus as unknown as ReturnType<typeof vi.fn>

const KEY = "notif_nudge_last"
const EVERY_MS = 7 * 24 * 60 * 60 * 1000

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}{location.search}</div>
}

function renderNudge() {
  return render(
    <MemoryRouter>
      <NotificationNudge />
      <LocationDisplay />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  isSupportedMock.mockReturnValue(true)
  getStatusMock.mockResolvedValue(false)
})

describe("NotificationNudge", () => {

  it("does not check push status (or show anything) when push isn't supported at all", async () => {
    isSupportedMock.mockReturnValue(false)
    renderNudge()

    await new Promise((r) => setTimeout(r, 0))
    expect(getStatusMock).not.toHaveBeenCalled()
    expect(screen.queryByText("Quer ser lembrado de rezar?")).not.toBeInTheDocument()
  })

  it("shows the nudge when push is supported but not yet enabled", async () => {
    renderNudge()
    expect(await screen.findByText("Quer ser lembrado de rezar?")).toBeInTheDocument()
  })

  it("does not show the nudge when push is already enabled", async () => {
    getStatusMock.mockResolvedValue(true)
    renderNudge()

    await waitFor(() => expect(getStatusMock).toHaveBeenCalled())
    expect(screen.queryByText("Quer ser lembrado de rezar?")).not.toBeInTheDocument()
  })

  it("does not show again within 7 days of a previous dismissal", async () => {
    localStorage.setItem(KEY, String(Date.now() - 1000))
    renderNudge()

    await new Promise((r) => setTimeout(r, 0))
    expect(getStatusMock).not.toHaveBeenCalled()
    expect(screen.queryByText("Quer ser lembrado de rezar?")).not.toBeInTheDocument()
  })

  it("shows again once the 7-day window has passed", async () => {
    localStorage.setItem(KEY, String(Date.now() - EVERY_MS - 1000))
    renderNudge()

    expect(await screen.findByText("Quer ser lembrado de rezar?")).toBeInTheDocument()
  })

  it("dismissing records the timestamp and hides the nudge", async () => {
    renderNudge()
    await screen.findByText("Quer ser lembrado de rezar?")

    fireEvent.click(screen.getByText("Agora não"))

    expect(screen.queryByText("Quer ser lembrado de rezar?")).not.toBeInTheDocument()
    expect(localStorage.getItem(KEY)).not.toBeNull()
  })

  it("activating records the timestamp, hides the nudge, and navigates to the profile with ?notif=1", async () => {
    renderNudge()
    await screen.findByText("Quer ser lembrado de rezar?")

    fireEvent.click(screen.getByText("Ativar"))

    expect(screen.getByTestId("location").textContent).toBe("/oratio/profile?notif=1")
    expect(localStorage.getItem(KEY)).not.toBeNull()
  })

})
