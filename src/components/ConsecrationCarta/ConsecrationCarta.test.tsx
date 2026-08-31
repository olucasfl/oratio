import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useEffect, useRef } from "react"
import type { ReactNode } from "react"

type DocProps = { children: ReactNode; onLoadSuccess?: () => void }

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../utils/pdfConfig", () => ({}))
vi.mock("../../hooks/usePublishHeightVar", () => ({ usePublishHeightVar: () => {} }))
vi.mock("react-pdf", () => ({
  Document: ({ children, onLoadSuccess }: DocProps) => {
    const cb = useRef(onLoadSuccess)
    cb.current = onLoadSuccess
    useEffect(() => { cb.current?.() }, [])
    return <div>{children}</div>
  },
  Page: ({ pageNumber }: { pageNumber: number }) => <div>carta-page-{pageNumber}</div>,
}))

import ConsecrationCarta from "./ConsecrationCarta"

function renderPage() {
  return render(<MemoryRouter><ConsecrationCarta /></MemoryRouter>)
}

beforeEach(() => vi.clearAllMocks())

describe("ConsecrationCarta", () => {

  it("renders the letter viewer", () => {
    renderPage()
    expect(screen.getByText("Carta de Consagração")).toBeInTheDocument()
    expect(screen.getByText("carta-page-1")).toBeInTheDocument()
  })

  it("zooms in, out and resets", () => {
    renderPage()
    expect(screen.getByText("100%")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "+" }))
    expect(screen.getByText("125%")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "−" }))
    fireEvent.click(screen.getByRole("button", { name: "−" }))
    expect(screen.getByText("75%")).toBeInTheDocument()
    fireEvent.click(screen.getByText("75%"))
    expect(screen.getByText("100%")).toBeInTheDocument()
  })

  it("goes back to the finalization page", () => {
    renderPage()
    fireEvent.click(screen.getByRole("button", { name: "←" }))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/consecration/finalizacao")
  })

})
