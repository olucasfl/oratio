import { render, screen, fireEvent, act } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

import BibliaStudyNudge from "./BibliaStudyNudge"
import { markOverlayOpen, markOverlayClosed } from "../../utils/overlayCoordinator"

const KEY = "biblia_estudo_nudge_v1"

function renderNudge(blocked = false) {
  return render(
    <MemoryRouter>
      <BibliaStudyNudge blocked={blocked} />
    </MemoryRouter>,
  )
}

async function advance(ms: number) {
  await act(async () => { await vi.advanceTimersByTimeAsync(ms) })
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

describe("BibliaStudyNudge", () => {

  it("appears once, after a short delay, when never seen and nothing else is open", async () => {
    renderNudge()
    expect(screen.queryByText(/estudar a Bíblia/i)).not.toBeInTheDocument()
    await advance(500)
    expect(screen.getByText(/estudar a Bíblia/i)).toBeInTheDocument()
  })

  it("never shows again once dismissed (writes the flag)", async () => {
    const { unmount } = renderNudge()
    await advance(500)
    fireEvent.click(screen.getByRole("button", { name: "Agora não" }))
    expect(localStorage.getItem(KEY)).toBeTruthy()

    unmount()
    renderNudge()
    await advance(600)
    expect(screen.queryByText(/estudar a Bíblia/i)).not.toBeInTheDocument()
  })

  it("does not show while a blocking modal is up (blocked prop)", async () => {
    renderNudge(true)
    await advance(600)
    expect(screen.queryByText(/estudar a Bíblia/i)).not.toBeInTheDocument()
  })

  it("waits for another overlay to close before appearing", async () => {
    markOverlayOpen("some-modal")
    renderNudge()
    await advance(600)
    expect(screen.queryByText(/estudar a Bíblia/i)).not.toBeInTheDocument()

    act(() => markOverlayClosed("some-modal"))
    await advance(600)
    expect(screen.getByText(/estudar a Bíblia/i)).toBeInTheDocument()
  })

  it("'Explorar a Bíblia' navigates to the Bible and marks it seen", async () => {
    renderNudge()
    await advance(500)
    fireEvent.click(screen.getByRole("button", { name: /Explorar a Bíblia/ }))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/biblia")
    expect(localStorage.getItem(KEY)).toBeTruthy()
  })
})
