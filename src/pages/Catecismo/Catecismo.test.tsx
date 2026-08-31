import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
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
vi.mock("../../services/readingProgressService", () => ({ saveReadingProgress: vi.fn() }))

// pdf de 20 páginas, com getPage/getTextContent para a busca por artigo.
vi.mock("react-pdf", () => ({
  Document: ({ children, onLoadSuccess }: DocProps) => {
    const cb = useRef(onLoadSuccess)
    cb.current = onLoadSuccess
    useEffect(() => {
      cb.current?.(Object.assign(
        { numPages: 20 },
        {
          getPage: async (n: number) => ({
            getTextContent: async () => ({
              items: n === 7 ? [{ str: "1210. Texto do artigo mil duzentos e dez." }] : [{ str: "outra pág" }],
            }),
          }),
        },
      ) as unknown as { numPages: number })
    }, [])
    return <div>{children}</div>
  },
  Page: ({ pageNumber }: { pageNumber: number }) => <div>page-{pageNumber}</div>,
}))

import { saveReadingProgress } from "../../services/readingProgressService"
import Catecismo from "./Catecismo"

const saveReadingProgressMock = saveReadingProgress as unknown as ReturnType<typeof vi.fn>

function renderPage(path = "/oratio/catecismo") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/oratio/catecismo" element={<Catecismo />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  localStorage.clear()
})

describe("Catecismo", () => {

  it("reports the page count once the PDF loads", () => {
    renderPage()
    expect(screen.getByText("Catecismo da Igreja")).toBeInTheDocument()
    expect(screen.getByText("1 / 20")).toBeInTheDocument()
  })

  it("honours a ?page= query on open", () => {
    renderPage("/oratio/catecismo?page=12")
    expect(screen.getByText("12 / 20")).toBeInTheDocument()
  })

  it("jumps to a page typed into the page field", () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText("Página"), { target: { value: "9" } })
    fireEvent.click(screen.getByRole("button", { name: "Ir" }))
    expect(screen.getByText("9 / 20")).toBeInTheDocument()
  })

  it("finds an article and jumps to the single matching page", async () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText("Artigo (ex: 1210)"), { target: { value: "1210" } })
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }))
    await waitFor(() => expect(screen.getByText("7 / 20")).toBeInTheDocument())
  })

  it("persists reading progress to the backend after a debounce", async () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText("Página"), { target: { value: "5" } })
    fireEvent.click(screen.getByRole("button", { name: "Ir" }))
    await act(async () => { await vi.advanceTimersByTimeAsync(1600) })
    expect(saveReadingProgressMock).toHaveBeenCalledWith("CATECHISM", "5", "Catecismo · pág. 5")
  })

  it("zooms and resets", () => {
    renderPage()
    fireEvent.click(screen.getByRole("button", { name: "+" }))
    expect(screen.getByText("125%")).toBeInTheDocument()
    fireEvent.click(screen.getByText("125%"))
    expect(screen.getByText("100%")).toBeInTheDocument()
  })

})
