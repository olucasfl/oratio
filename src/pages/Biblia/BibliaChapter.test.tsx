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
vi.mock("../../hooks/useReadingPrefs", () => ({
  useReadingPrefs: () => ({
    prefs: { fontSize: 19, spacing: "normal", font: "serif", theme: "claro", width: "normal" },
    update: updateMock,
    lineHeight: 2,
    fontFamily: "var(--oratio-font-text)",
  }),
  FONT_MIN: 15,
  FONT_MAX: 30,
  FONT_STEP: 2,
}))
vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))
vi.mock("../../components/ShareReadingButton/ShareReadingButton", () => ({ default: () => <div>share</div> }))
vi.mock("../../utils/auth", () => ({ isLoggedIn: () => isLoggedInReturn }))
vi.mock("../../services/bibleMarksService", () => ({
  getChapterMarks: (...a: unknown[]) => getChapterMarksMock(...a),
  upsertMark: (...a: unknown[]) => upsertMarkMock(...a),
  isDeleted: (r: { deleted?: boolean }) => r?.deleted === true,
  HIGHLIGHT_COLORS: ["amber", "green", "blue", "pink", "purple"],
}))

import { getChapter } from "../../services/bibliaService"
import { saveReadingProgress } from "../../services/readingProgressService"
import BibliaChapter from "./BibliaChapter"

const getChapterMock = getChapter as unknown as ReturnType<typeof vi.fn>
const saveReadingProgressMock = saveReadingProgress as unknown as ReturnType<typeof vi.fn>
const updateMock = vi.fn()
const getChapterMarksMock = vi.fn().mockResolvedValue([])
const upsertMarkMock = vi.fn()
let isLoggedInReturn = true

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
  isLoggedInReturn = true
  getChapterMarksMock.mockResolvedValue([])
  upsertMarkMock.mockResolvedValue({ id: "m1", verse: 2, highlighted: true, highlightColor: "green", favorite: false, note: null })
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

  it("opens the reading panel and adjusts the font size", () => {
    renderPage()
    fireEvent.click(screen.getByRole("button", { name: "Ajustes de leitura" }))
    fireEvent.click(screen.getByRole("button", { name: "Aumentar fonte" }))
    expect(updateMock).toHaveBeenCalledWith({ fontSize: 21 })
  })

  it("highlights a verse with a chosen colour through the action sheet", async () => {
    renderPage()
    fireEvent.click(screen.getByText(/A terra era sem forma/))
    fireEvent.click(await screen.findByRole("button", { name: "Grifar de verde" }))
    await waitFor(() =>
      expect(upsertMarkMock).toHaveBeenCalledWith(
        expect.objectContaining({
          verse: 2,
          reference: "Gênesis 1,2",
          highlighted: true,
          highlightColor: "green",
        }),
      ),
    )
  })

  it("favorites a verse with the one-tap heart", async () => {
    renderPage()
    fireEvent.click(screen.getAllByRole("button", { name: "Favoritar versículo" })[1])
    await waitFor(() =>
      expect(upsertMarkMock).toHaveBeenCalledWith(
        expect.objectContaining({ verse: 2, favorite: true }),
      ),
    )
  })

  it("gates verse actions for a guest", async () => {
    isLoggedInReturn = false
    renderPage()
    fireEvent.click(screen.getByText(/A terra era sem forma/))
    expect(screen.queryByRole("button", { name: "Grifar de verde" })).not.toBeInTheDocument()
    expect(upsertMarkMock).not.toHaveBeenCalled()
  })

})
