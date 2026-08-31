import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useEffect, useRef } from "react"
import type { ReactNode } from "react"

type DocProps = { children: ReactNode; onLoadSuccess?: (doc: { numPages: number }) => void }

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../utils/pdfConfig", () => ({}))
vi.mock("../../hooks/usePublishHeightVar", () => ({ usePublishHeightVar: () => {} }))

// react-pdf não roda em jsdom — stub que dispara onLoadSuccess com um
// documento de 10 páginas, o suficiente pra exercitar a navegação.
vi.mock("react-pdf", () => ({
  Document: ({ children, onLoadSuccess }: DocProps) => {
    // onLoadSuccess é recriado a cada render do componente pai — guardar
    // numa ref e disparar só na montagem evita loop de render.
    const cb = useRef(onLoadSuccess)
    cb.current = onLoadSuccess
    useEffect(() => { cb.current?.({ numPages: 10 }) }, [])
    return <div data-testid="pdf-doc">{children}</div>
  },
  Page: ({ pageNumber }: { pageNumber: number }) => <div>pdf-page-{pageNumber}</div>,
}))

import Tratado from "./Tratado"

function renderTratado() {
  return render(<MemoryRouter><Tratado /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe("Tratado", () => {

  it("renders the viewer and reports the page count after the PDF loads", () => {
    renderTratado()
    expect(screen.getByText("Tratado da Verdadeira Devoção")).toBeInTheDocument()
    expect(screen.getByText("1 / 10")).toBeInTheDocument()
  })

  it("navigates pages with the footer arrows and clamps at the edges", () => {
    renderTratado()
    const [prev, next] = screen.getAllByRole("button").filter(b =>
      b.className.includes("navBtn"),
    )
    expect(prev).toBeDisabled()

    fireEvent.click(next)
    expect(screen.getByText("2 / 10")).toBeInTheDocument()
    expect(prev).not.toBeDisabled()
  })

  it("jumps to a valid page typed into the go-to-page field", () => {
    renderTratado()
    fireEvent.change(screen.getByPlaceholderText("Ir para página..."), { target: { value: "7" } })
    fireEvent.click(screen.getByRole("button", { name: "Ir" }))
    expect(screen.getByText("7 / 10")).toBeInTheDocument()
  })

  it("ignores an out-of-range page number", () => {
    renderTratado()
    fireEvent.change(screen.getByPlaceholderText("Ir para página..."), { target: { value: "99" } })
    fireEvent.click(screen.getByRole("button", { name: "Ir" }))
    expect(screen.getByText("1 / 10")).toBeInTheDocument()
  })

  it("zooms in and out and resets to 100%", () => {
    renderTratado()
    expect(screen.getByText("100%")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "+" }))
    expect(screen.getByText("125%")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "−" }))
    fireEvent.click(screen.getByRole("button", { name: "−" }))
    expect(screen.getByText("75%")).toBeInTheDocument()
    fireEvent.click(screen.getByText("75%")) // reset
    expect(screen.getByText("100%")).toBeInTheDocument()
  })

  it("persists the current page to localStorage once loaded", () => {
    renderTratado()
    const next = screen.getAllByRole("button").filter(b => b.className.includes("navBtn"))[1]
    fireEvent.click(next)
    expect(localStorage.getItem("tratado_page")).toBe("2")
  })

  it("restores the saved page on next mount", () => {
    localStorage.setItem("tratado_page", "5")
    renderTratado()
    expect(screen.getByText("5 / 10")).toBeInTheDocument()
  })

})
