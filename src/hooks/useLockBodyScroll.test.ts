import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { useLockBodyScroll } from "./useLockBodyScroll"

afterEach(() => {
  document.body.style.cssText = ""
  vi.restoreAllMocks()
})

describe("useLockBodyScroll", () => {

  it("does nothing when locked is false", () => {
    renderHook(() => useLockBodyScroll(false))
    expect(document.body.style.position).toBe("")
  })

  it("fixes the body in place at the current scroll position when locked", () => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: 240 })
    vi.spyOn(window, "scrollTo").mockImplementation(() => {})

    renderHook(() => useLockBodyScroll(true))

    expect(document.body.style.position).toBe("fixed")
    expect(document.body.style.top).toBe("-240px")
    expect(document.body.style.overflow).toBe("hidden")
  })

  /*
  Regressão documentada no próprio hook: a restauração precisa usar o
  scrollY CAPTURADO no momento em que travou, não reler do DOM depois --
  senão o cleanup do efeito anterior já tinha zerado esse valor, e a
  rolagem nunca voltava de fato.
  */
  it("restores the original styles and scroll position on unlock, using the captured scrollY", () => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: 500 })
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {})

    const { rerender } = renderHook(
      ({ locked }) => useLockBodyScroll(locked),
      { initialProps: { locked: true } },
    )

    rerender({ locked: false })

    expect(document.body.style.position).toBe("")
    expect(document.body.style.overflow).toBe("")
    expect(scrollToSpy).toHaveBeenCalledWith(0, 500)
  })

  it("restores on unmount too, not just on locked flipping to false", () => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: 100 })
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {})

    const { unmount } = renderHook(() => useLockBodyScroll(true))
    unmount()

    expect(document.body.style.position).toBe("")
    expect(scrollToSpy).toHaveBeenCalledWith(0, 100)
  })

})
