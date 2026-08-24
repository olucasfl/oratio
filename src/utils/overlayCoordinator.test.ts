import { describe, it, expect, afterEach, vi } from "vitest"
import {
  markOverlayOpen,
  markOverlayClosed,
  isOverlayBlocking,
  subscribeOverlay,
} from "./overlayCoordinator"

// Estado é um módulo-level Set, não resetável — cada teste fecha o que abriu.
afterEach(() => {
  markOverlayClosed("modal-a")
  markOverlayClosed("modal-b")
})

describe("overlayCoordinator", () => {

  it("is not blocking when nothing is open", () => {
    expect(isOverlayBlocking()).toBe(false)
  })

  it("becomes blocking once an overlay opens, and stops once it closes", () => {
    markOverlayOpen("modal-a")
    expect(isOverlayBlocking()).toBe(true)

    markOverlayClosed("modal-a")
    expect(isOverlayBlocking()).toBe(false)
  })

  it("stays blocking while at least one of several overlays remains open", () => {
    markOverlayOpen("modal-a")
    markOverlayOpen("modal-b")
    markOverlayClosed("modal-a")

    expect(isOverlayBlocking()).toBe(true)

    markOverlayClosed("modal-b")
    expect(isOverlayBlocking()).toBe(false)
  })

  it("opening the same id twice still only needs one close (Set dedups ids)", () => {
    markOverlayOpen("modal-a")
    markOverlayOpen("modal-a")
    markOverlayClosed("modal-a")

    expect(isOverlayBlocking()).toBe(false)
  })

  it("notifies subscribers on both open and close", () => {
    const fn = vi.fn()
    const unsubscribe = subscribeOverlay(fn)

    markOverlayOpen("modal-a")
    expect(fn).toHaveBeenCalledTimes(1)

    markOverlayClosed("modal-a")
    expect(fn).toHaveBeenCalledTimes(2)

    unsubscribe()
  })

  it("stops notifying once unsubscribed", () => {
    const fn = vi.fn()
    const unsubscribe = subscribeOverlay(fn)
    unsubscribe()

    markOverlayOpen("modal-a")

    expect(fn).not.toHaveBeenCalled()
  })

})
