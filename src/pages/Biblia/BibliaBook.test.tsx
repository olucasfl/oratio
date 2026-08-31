import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/bibliaService", () => ({ getBook: vi.fn() }))
vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))

import { getBook } from "../../services/bibliaService"
import BibliaBook from "./BibliaBook"

const getBookMock = getBook as unknown as ReturnType<typeof vi.fn>

function renderPage(book = "Gênesis") {
  return render(
    <MemoryRouter initialEntries={[`/oratio/biblia/${book}`]}>
      <Routes>
        <Route path="/oratio/biblia/:book" element={<BibliaBook />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  getBookMock.mockReturnValue({
    nome: "Gênesis",
    capitulos: [{ capitulo: 1 }, { capitulo: 2 }, { capitulo: 3 }],
  })
})

describe("BibliaBook", () => {

  it("shows a not-found message for an unknown book", () => {
    getBookMock.mockReturnValue(undefined)
    renderPage("Nada")
    expect(screen.getByText("Livro não encontrado")).toBeInTheDocument()
  })

  it("lists the chapters", () => {
    renderPage()
    expect(screen.getByText("Gênesis")).toBeInTheDocument()
    expect(screen.getByText("3 capítulos")).toBeInTheDocument()
    expect(screen.getByText("Capítulo 2")).toBeInTheDocument()
  })

  it("filters chapters by number", () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText("Número do capítulo"), { target: { value: "3" } })
    expect(screen.getByText("Capítulo 3")).toBeInTheDocument()
    expect(screen.queryByText("Capítulo 1")).not.toBeInTheDocument()
  })

  it("opens a chapter on click", () => {
    renderPage()
    fireEvent.click(screen.getByText("Capítulo 2"))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/biblia/Gênesis/2")
  })

})
