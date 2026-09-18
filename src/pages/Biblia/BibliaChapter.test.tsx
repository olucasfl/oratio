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
vi.mock("../../services/bibleCollectionsService", () => ({
  listCollections: (...a: unknown[]) => listCollectionsMock(...a),
  createCollection: vi.fn(),
  addCollectionItem: (...a: unknown[]) => addCollectionItemMock(...a),
  removeCollectionItem: vi.fn(),
}))

import { getChapter } from "../../services/bibliaService"
import { saveReadingProgress } from "../../services/readingProgressService"
import BibliaChapter from "./BibliaChapter"

const getChapterMock = getChapter as unknown as ReturnType<typeof vi.fn>
const saveReadingProgressMock = saveReadingProgress as unknown as ReturnType<typeof vi.fn>
const updateMock = vi.fn()
const getChapterMarksMock = vi.fn().mockResolvedValue([])
const upsertMarkMock = vi.fn()
const listCollectionsMock = vi.fn().mockResolvedValue([])
const addCollectionItemMock = vi.fn().mockResolvedValue({ id: "ci1" })
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
  listCollectionsMock.mockResolvedValue([{ id: "c1", name: "Fé", _count: { items: 0 } }])
  addCollectionItemMock.mockResolvedValue({ id: "ci1" })
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

  it("always shows a fixed shortcut to Minha Bíblia, hidden only while selecting", async () => {
    renderPage()
    fireEvent.click(screen.getByRole("button", { name: "Ir para Minha Bíblia" }))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/biblia/minha")

    fireEvent.click(screen.getByRole("button", { name: /Selecionar/ }))
    expect(screen.queryByRole("button", { name: "Ir para Minha Bíblia" })).not.toBeInTheDocument()
  })

  it("shows a 'Ver' shortcut to Minha Bíblia right after highlighting a verse", async () => {
    renderPage()
    fireEvent.click(screen.getByText(/A terra era sem forma/))
    fireEvent.click(await screen.findByRole("button", { name: "Grifar de verde" }))

    expect(await screen.findByText("Grifo salvo")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Ver" }))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/biblia/minha?tab=grifados&book=G%C3%AAnesis")
  })

  it("selects two verses and highlights both at once", async () => {
    renderPage()
    fireEvent.click(screen.getByRole("button", { name: /Selecionar/ }))

    fireEvent.click(screen.getByText(/o princípio criou Deus/))
    fireEvent.click(screen.getByText(/A terra era sem forma/))

    fireEvent.click(screen.getByRole("button", { name: /Grifar/ }))
    fireEvent.click(screen.getByRole("button", { name: "Grifar selecionados de amber" }))

    await waitFor(() => expect(upsertMarkMock).toHaveBeenCalledTimes(2))
    expect(upsertMarkMock).toHaveBeenCalledWith(
      expect.objectContaining({ verse: 1, highlighted: true, highlightColor: "amber" }),
    )
    expect(upsertMarkMock).toHaveBeenCalledWith(
      expect.objectContaining({ verse: 2, highlighted: true, highlightColor: "amber" }),
    )

    expect(await screen.findByText("2 versículos grifados")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Ver" }))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/biblia/minha?tab=grifados&book=G%C3%AAnesis")

    // sai do modo de seleção depois da ação em lote
    expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument()
  })

  it("selects two verses and applies the same note text to both", async () => {
    renderPage()
    fireEvent.click(screen.getByRole("button", { name: /Selecionar/ }))
    fireEvent.click(screen.getByText(/o princípio criou Deus/))
    fireEvent.click(screen.getByText(/A terra era sem forma/))

    fireEvent.click(screen.getByRole("button", { name: /Anotar/ }))
    fireEvent.change(
      screen.getByPlaceholderText(/Escreva o que este versículo/),
      { target: { value: "Criação do mundo" } },
    )
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }))

    await waitFor(() => expect(upsertMarkMock).toHaveBeenCalledTimes(2))
    expect(upsertMarkMock).toHaveBeenCalledWith(expect.objectContaining({ verse: 1, note: "Criação do mundo" }))
    expect(upsertMarkMock).toHaveBeenCalledWith(expect.objectContaining({ verse: 2, note: "Criação do mundo" }))

    expect(await screen.findByText("2 versículos anotados")).toBeInTheDocument()
  })

  it("selects two verses and adds both to a chosen collection", async () => {
    renderPage()
    fireEvent.click(screen.getByRole("button", { name: /Selecionar/ }))
    fireEvent.click(screen.getByText(/o princípio criou Deus/))
    fireEvent.click(screen.getByText(/A terra era sem forma/))

    fireEvent.click(screen.getByRole("button", { name: /Coleção/ }))
    fireEvent.click(await screen.findByRole("button", { name: /Fé/ }))

    await waitFor(() => expect(addCollectionItemMock).toHaveBeenCalledTimes(2))
    expect(addCollectionItemMock).toHaveBeenCalledWith("c1", expect.objectContaining({ verse: 1 }))
    expect(addCollectionItemMock).toHaveBeenCalledWith("c1", expect.objectContaining({ verse: 2 }))
  })

})
