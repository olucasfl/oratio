import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/bibliaService", () => ({ getChapter: vi.fn() }))
vi.mock("../../services/readingProgressService", () => ({ saveReadingProgress: vi.fn() }))
vi.mock("../../hooks/useReadingSize", () => ({
  useReadingSize: () => ({ size: "md", fontSize: 18, setSize: setSizeMock }),
}))
vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))
vi.mock("../../components/ShareReadingButton/ShareReadingButton", () => ({ default: () => <div>share</div> }))

import { getChapter } from "../../services/bibliaService"
import { saveReadingProgress } from "../../services/readingProgressService"
import BibliaChapter from "./BibliaChapter"

const getChapterMock = getChapter as unknown as ReturnType<typeof vi.fn>
const saveReadingProgressMock = saveReadingProgress as unknown as ReturnType<typeof vi.fn>
const setSizeMock = vi.fn()

function renderPage(path = "/oratio/biblia/Gênesis/1") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/oratio/biblia/:book/:chapter" element={<BibliaChapter />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  getChapterMock.mockReturnValue({
    versiculos: [
      { versiculo: 1, texto: "No princípio criou Deus os céus e a terra." },
      { versiculo: 2, texto: "A terra era sem forma e vazia." },
    ],
  })
})

describe("BibliaChapter", () => {

  it("shows a not-found message when the chapter is missing", () => {
    getChapterMock.mockReturnValue(undefined)
    renderPage()
    expect(screen.getByText("Capítulo não encontrado")).toBeInTheDocument()
  })

  it("renders the verses and the chapter header", () => {
    renderPage()
    expect(screen.getByText("Capítulo 1")).toBeInTheDocument()
    expect(screen.getByText(/A terra era sem forma/)).toBeInTheDocument()
  })

  it("records reading progress for a valid chapter", async () => {
    renderPage()
    await waitFor(() =>
      expect(saveReadingProgressMock).toHaveBeenCalledWith("BIBLE", "G%C3%AAnesis/1", "Gênesis 1"),
    )
  })

  it("changes the reading font size", () => {
    renderPage()
    fireEvent.click(screen.getByRole("button", { name: "Fonte grande" }))
    expect(setSizeMock).toHaveBeenCalledWith("lg")
  })

})
