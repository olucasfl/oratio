import { render, screen, fireEvent, act } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/bibliaService", () => ({
  getOldTestament: vi.fn(() => [{ nome: "Gênesis" }, { nome: "Êxodo" }]),
  getNewTestament: vi.fn(() => [{ nome: "Mateus" }]),
  searchVerses: vi.fn(() => []),
  searchVersesByKeywords: vi.fn(() => []),
  getRecentSearches: vi.fn(() => []),
  addRecentSearch: vi.fn(),
  clearRecentSearches: vi.fn(),
}))

vi.mock("../../utils/auth", () => ({ isLoggedIn: vi.fn() }))
vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))
vi.mock("../../components/GuestGateModal/GuestGateModal", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>guest-gate</div> : null),
}))

import { searchVerses } from "../../services/bibliaService"
import { isLoggedIn } from "../../utils/auth"
import BibliaHome from "./BibliaHome"

const searchVersesMock = searchVerses as unknown as ReturnType<typeof vi.fn>
const isLoggedInMock = isLoggedIn as unknown as ReturnType<typeof vi.fn>

function renderPage() {
  return render(<MemoryRouter><BibliaHome /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  isLoggedInMock.mockReturnValue(true)
  searchVersesMock.mockReturnValue([])
})

describe("BibliaHome", () => {

  it("lists the books of both testaments", () => {
    renderPage()
    expect(screen.getByText("Gênesis")).toBeInTheDocument()
    expect(screen.getByText("Mateus")).toBeInTheDocument()
    expect(screen.getByText("3 livros")).toBeInTheDocument()
  })

  it("filters books by an accent-insensitive search", () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText("Pesquisar livro..."), { target: { value: "exodo" } })
    expect(screen.getByText("Êxodo")).toBeInTheDocument()
    expect(screen.queryByText("Gênesis")).not.toBeInTheDocument()
  })

  it("shows an empty state when no book matches", () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText("Pesquisar livro..."), { target: { value: "zzz" } })
    expect(screen.getByText("Nenhum livro encontrado")).toBeInTheDocument()
  })

  it("opens a book on click", () => {
    renderPage()
    fireEvent.click(screen.getByText("Gênesis"))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/biblia/Gênesis")
  })

  it("navigates to Minha Bíblia when logged in", () => {
    renderPage()
    fireEvent.click(screen.getByRole("button", { name: /Minha Bíblia/ }))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/biblia/minha")
  })

  it("gates Minha Bíblia for guests", () => {
    isLoggedInMock.mockReturnValue(false)
    renderPage()
    fireEvent.click(screen.getByRole("button", { name: /Minha Bíblia/ }))
    expect(screen.getByText("guest-gate")).toBeInTheDocument()
    expect(navigateMock).not.toHaveBeenCalledWith("/oratio/biblia/minha")
  })

  it("gates the verse-search entry for guests", () => {
    isLoggedInMock.mockReturnValue(false)
    renderPage()
    fireEvent.click(screen.getByRole("button", { name: /Pesquisar/ }))
    expect(screen.getByText("guest-gate")).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/Buscar palavra ou frase/)).not.toBeInTheDocument()
  })

  it("runs a debounced verse search and lists the results", async () => {
    searchVersesMock.mockReturnValue([{ book: "João", chapter: 3, verse: 16, text: "Deus amou o mundo" }])
    renderPage()
    fireEvent.click(screen.getByRole("button", { name: /Pesquisar/ }))
    fireEvent.change(screen.getByPlaceholderText(/Buscar palavra ou frase/), { target: { value: "amor" } })

    await act(async () => { await vi.advanceTimersByTimeAsync(500) })
    expect(searchVersesMock).toHaveBeenCalledWith("amor", 200)
    expect(screen.getByText("João 3,16")).toBeInTheDocument()

    fireEvent.click(screen.getByText("João 3,16"))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/biblia/João/3?verse=16")
  })

})
