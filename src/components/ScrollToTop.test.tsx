import { render } from "@testing-library/react"
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { useEffect } from "react"

import ScrollToTop from "./ScrollToTop"

const scrollToSpy = vi.fn()

beforeEach(() => {
  scrollToSpy.mockClear()
  window.scrollTo = scrollToSpy as unknown as typeof window.scrollTo
})

function Nav({ to }: { to: string }) {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(to)
  }, [navigate, to])
  return null
}

describe("ScrollToTop", () => {
  it("scrolls the window to the top on route change", () => {
    render(
      <MemoryRouter initialEntries={["/a"]}>
        <ScrollToTop />
        <Routes>
          <Route path="/a" element={<Nav to="/b" />} />
          <Route path="/b" element={<div>b</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(scrollToSpy).toHaveBeenCalledWith(0, 0)
  })

  it("also resets the scroll position of inner scroll containers (main / [data-scroll-reset])", () => {
    const main = document.createElement("main")
    main.scrollTop = 500
    const custom = document.createElement("div")
    custom.setAttribute("data-scroll-reset", "")
    custom.scrollTop = 300
    document.body.append(main, custom)

    render(
      <MemoryRouter initialEntries={["/a"]}>
        <ScrollToTop />
        <Routes>
          <Route path="/a" element={<Nav to="/b" />} />
          <Route path="/b" element={<div>b</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(main.scrollTop).toBe(0)
    expect(custom.scrollTop).toBe(0)

    main.remove()
    custom.remove()
  })
})
