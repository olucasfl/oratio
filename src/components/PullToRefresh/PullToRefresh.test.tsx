import { render, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import PullToRefresh from "./PullToRefresh"
import { usePullToRefresh } from "../../hooks/usePullToRefresh"

const ACTIVATE_DRAG_PX = 4
const MAX_REFRESH_MS = 15_000

function TestChild({ onRefresh }: { onRefresh: () => Promise<void> }) {
  usePullToRefresh(onRefresh)
  return <div style={{ height: 2000 }}>conteúdo</div>
}

function dispatchTouch(target: Element, type: string, clientY: number) {
  const event = new Event(type, { bubbles: true, cancelable: type === "touchmove" })
  Object.defineProperty(event, "touches", { value: [{ clientY }], configurable: true })
  act(() => { target.dispatchEvent(event) })
}

function setScrollTop(value: number) {
  Object.defineProperty(document, "scrollingElement", { configurable: true, value: { scrollTop: value } })
}

function renderWithHandler(onRefresh: () => Promise<void> = vi.fn().mockResolvedValue(undefined)) {
  const utils = render(
    <PullToRefresh>
      <TestChild onRefresh={onRefresh} />
    </PullToRefresh>,
  )
  const root = utils.container.firstElementChild as HTMLElement
  const indicator = root.firstElementChild as HTMLElement
  return { ...utils, onRefresh, root, indicator }
}

beforeEach(() => {
  setScrollTop(0)
})

afterEach(() => {
  Object.defineProperty(document, "scrollingElement", { configurable: true, value: document.documentElement })
  vi.useRealTimers()
})

describe("PullToRefresh", () => {

  it("does nothing when no screen has registered a refresh handler", () => {
    const { container } = render(<PullToRefresh><div>sem handler</div></PullToRefresh>)
    const root = container.firstElementChild as HTMLElement
    const indicator = root.firstElementChild as HTMLElement

    dispatchTouch(root, "touchstart", 0)
    dispatchTouch(root, "touchmove", 100)
    dispatchTouch(root, "touchend", 100)

    expect(indicator.style.height).toBe("0px")
  })

  it("does not activate the gesture when the page is already scrolled down", () => {
    setScrollTop(50)
    const { root, indicator } = renderWithHandler()

    dispatchTouch(root, "touchstart", 0)
    dispatchTouch(root, "touchmove", 100)

    expect(indicator.style.height).toBe("0px")
  })

  it("ignores drags smaller than the activation threshold", () => {
    const { root, indicator } = renderWithHandler()

    dispatchTouch(root, "touchstart", 0)
    dispatchTouch(root, "touchmove", ACTIVATE_DRAG_PX - 1)

    expect(indicator.style.height).toBe("0px")
  })

  it("grows the indicator (damped) once the drag passes the activation threshold", () => {
    const { root, indicator } = renderWithHandler()

    dispatchTouch(root, "touchstart", 0)
    dispatchTouch(root, "touchmove", 40)

    const height = parseFloat(indicator.style.height)
    expect(height).toBeGreaterThan(0)
    expect(height).toBeLessThan(40) // curva elástica nunca acompanha 1:1 o dedo
  })

  it("releasing before reaching the threshold resets without calling the handler", () => {
    const { root, indicator, onRefresh } = renderWithHandler()

    dispatchTouch(root, "touchstart", 0)
    dispatchTouch(root, "touchmove", 20) // bem abaixo do THRESHOLD de 64
    dispatchTouch(root, "touchend", 20)

    expect(indicator.style.height).toBe("0px")
    expect(onRefresh).not.toHaveBeenCalled()
  })

  it("releasing past the threshold triggers the refresh and pins the indicator, then resets on success", async () => {
    let resolveRefresh!: () => void
    const onRefresh = vi.fn(() => new Promise<void>((r) => { resolveRefresh = r }))
    const { root, indicator } = renderWithHandler(onRefresh)

    dispatchTouch(root, "touchstart", 0)
    dispatchTouch(root, "touchmove", 200) // bem além do THRESHOLD
    dispatchTouch(root, "touchend", 200)

    expect(onRefresh).toHaveBeenCalledTimes(1)
    expect(indicator.style.height).toBe("56px") // REFRESH_PIN_HEIGHT

    await act(async () => { resolveRefresh() })

    expect(indicator.style.height).toBe("0px")
  })

  it("still resets even when the handler rejects (error is swallowed, spinner never sticks)", async () => {
    const onRefresh = vi.fn().mockRejectedValue(new Error("falhou"))
    const { root, indicator } = renderWithHandler(onRefresh)

    dispatchTouch(root, "touchstart", 0)
    dispatchTouch(root, "touchmove", 200)
    dispatchTouch(root, "touchend", 200)

    await act(async () => { await Promise.resolve() })

    expect(indicator.style.height).toBe("0px")
  })

  it("has a safety timeout so a handler that never resolves doesn't spin forever", () => {
    vi.useFakeTimers()
    const onRefresh = vi.fn(() => new Promise<void>(() => {})) // nunca resolve
    const { root, indicator } = renderWithHandler(onRefresh)

    dispatchTouch(root, "touchstart", 0)
    dispatchTouch(root, "touchmove", 200)
    dispatchTouch(root, "touchend", 200)

    expect(indicator.style.height).toBe("56px")

    act(() => { vi.advanceTimersByTime(MAX_REFRESH_MS) })

    expect(indicator.style.height).toBe("0px")
  })

  it("touchcancel resets an in-progress drag without triggering a refresh", () => {
    const { root, indicator, onRefresh } = renderWithHandler()

    dispatchTouch(root, "touchstart", 0)
    dispatchTouch(root, "touchmove", 200)
    dispatchTouch(root, "touchcancel", 200)

    expect(indicator.style.height).toBe("0px")
    expect(onRefresh).not.toHaveBeenCalled()
  })

})
