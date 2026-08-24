import { render, screen, fireEvent, act } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("../../data/quaresmaSaoMiguel", () => ({
  getQuaresmaWindow: vi.fn(),
}))

vi.mock("../../utils/overlayCoordinator", () => ({
  markOverlayOpen: vi.fn(),
  markOverlayClosed: vi.fn(),
}))

import { getQuaresmaWindow } from "../../data/quaresmaSaoMiguel"
import { markOverlayOpen, markOverlayClosed } from "../../utils/overlayCoordinator"
import QuaresmaNudge from "./QuaresmaNudge"

const getWindowMock = getQuaresmaWindow as unknown as ReturnType<typeof vi.fn>
const markOpenMock = markOverlayOpen as unknown as ReturnType<typeof vi.fn>
const markClosedMock = markOverlayClosed as unknown as ReturnType<typeof vi.fn>

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}{location.search}</div>
}

function renderNudge(props: Partial<Parameters<typeof QuaresmaNudge>[0]> = {}) {
  return render(
    <MemoryRouter>
      <QuaresmaNudge guest={false} {...props} />
      <LocationDisplay />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  localStorage.clear()
  getWindowMock.mockReturnValue({ year: 2026, isAnnouncement: true })
})

afterEach(() => {
  vi.useRealTimers()
})

describe("QuaresmaNudge", () => {

  it("never shows outside the announcement window", () => {
    getWindowMock.mockReturnValue({ year: 2026, isAnnouncement: false })
    renderNudge()

    act(() => { vi.advanceTimersByTime(1000) })

    expect(screen.queryByText("A Quaresma de São Miguel")).not.toBeInTheDocument()
  })

  it("shows after the 350ms delay once in the announcement window", () => {
    renderNudge()

    expect(screen.queryByText("A Quaresma de São Miguel")).not.toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(350) })

    expect(screen.getByText("A Quaresma de São Miguel")).toBeInTheDocument()
    expect(markOpenMock).toHaveBeenCalledWith("quaresma-nudge")
  })

  it("never shows again once dismissed for the year (localStorage key)", () => {
    localStorage.setItem("oratio_quaresma_nudge_2026", "123456")
    renderNudge()

    act(() => { vi.advanceTimersByTime(1000) })

    expect(screen.queryByText("A Quaresma de São Miguel")).not.toBeInTheDocument()
  })

  /*
  `blocked` existe pra não ganhar a corrida com os modais da Home (que
  nascem open=false e só se registram no overlayCoordinator depois) --
  enquanto blocked=true, nem o timer de 350ms começa a contar.
  */
  it("does not schedule itself while blocked, then appears once unblocked", () => {
    const { rerender } = render(
      <MemoryRouter>
        <QuaresmaNudge guest={false} blocked />
        <LocationDisplay />
      </MemoryRouter>,
    )

    act(() => { vi.advanceTimersByTime(1000) })
    expect(screen.queryByText("A Quaresma de São Miguel")).not.toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <QuaresmaNudge guest={false} blocked={false} />
        <LocationDisplay />
      </MemoryRouter>,
    )
    act(() => { vi.advanceTimersByTime(350) })

    expect(screen.getByText("A Quaresma de São Miguel")).toBeInTheDocument()
  })

  it("dismissing persists the per-year key and hides the nudge for good", () => {
    renderNudge()
    act(() => { vi.advanceTimersByTime(350) })

    fireEvent.click(screen.getByText("Agora não"))

    expect(screen.queryByText("A Quaresma de São Miguel")).not.toBeInTheDocument()
    expect(localStorage.getItem("oratio_quaresma_nudge_2026")).not.toBeNull()
    expect(markClosedMock).toHaveBeenCalledWith("quaresma-nudge")
  })

  it("guest=false navigates straight to the Quaresma screen", () => {
    renderNudge({ guest: false })
    act(() => { vi.advanceTimersByTime(350) })

    fireEvent.click(screen.getByText("Conhecer a Quaresma"))

    expect(screen.getByTestId("location").textContent).toBe("/oratio/quaresma")
  })

  it("guest=true routes through registration first, redirecting back to Quaresma", () => {
    renderNudge({ guest: true })
    act(() => { vi.advanceTimersByTime(350) })

    fireEvent.click(screen.getByText("Conhecer a Quaresma"))

    expect(screen.getByTestId("location").textContent).toBe(
      "/register?redirect=%2Foratio%2Fquaresma",
    )
  })

})
