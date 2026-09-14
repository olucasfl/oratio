import { render, screen, act } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, beforeEach, vi } from "vitest"

import FlashToast from "./FlashToast"
import { setFlash } from "../../utils/flash"

function renderToast() {
  return render(<MemoryRouter><FlashToast /></MemoryRouter>)
}

beforeEach(() => {
  sessionStorage.clear()
  vi.useRealTimers()
})

describe("FlashToast", () => {

  it("renders nothing when there is no pending flash", () => {
    const { container } = renderToast()
    expect(container).toBeEmptyDOMElement()
  })

  it("shows the pending flash message and consumes it", async () => {
    setFlash("Sua conta Google foi conectada à sua conta Oratio.")
    renderToast()
    expect(
      await screen.findByText("Sua conta Google foi conectada à sua conta Oratio."),
    ).toBeInTheDocument()
    // consumida do sessionStorage assim que o effect roda
    expect(sessionStorage.getItem("oratio_flash")).toBeNull()
  })

  it("auto-dismisses after 4s", () => {
    vi.useFakeTimers()
    setFlash("mensagem")
    renderToast()
    act(() => { vi.advanceTimersByTime(0) })   // microtask do "show"
    expect(screen.getByText("mensagem")).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(4000) })
    expect(screen.queryByText("mensagem")).not.toBeInTheDocument()
  })

})
