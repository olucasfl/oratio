import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../utils/auth", () => ({ isLoggedIn: () => isLoggedInReturn }))
vi.mock("../../services/bibleMarksService", () => ({
  getAllMarks: (...a: unknown[]) => getAllMarksMock(...a),
}))
vi.mock("../../services/bibleCollectionsService", () => ({
  listCollections: (...a: unknown[]) => listCollectionsMock(...a),
  createCollection: (...a: unknown[]) => createCollectionMock(...a),
}))
vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))
vi.mock("../../components/GuestGateModal/GuestGateModal", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>guest-gate</div> : null),
}))

import MinhaBiblia from "./MinhaBiblia"

const getAllMarksMock = vi.fn()
const listCollectionsMock = vi.fn()
const createCollectionMock = vi.fn()
let isLoggedInReturn = true

const longNote = "a".repeat(400)

// "João"/"Mateus" ficam sem o "São " que o JSON real usa — não importa
// aqui: o agrupamento por livro funciona igual, só a categorização
// AT/NT exata desses dois fica indefinida nesses testes (Salmos/Isaías
// são nomes reais e cobrem a ordenação AT/NT em si). João tem 2 grifados
// em capítulos diferentes de propósito, pra exercitar o bloco de
// capítulos (2º nível) — não só o de livros.
const marks = [
  { id: "1", book: "João", chapter: 3, verse: 16, reference: "João 3,16", text: "Porque Deus amou o mundo", highlighted: true, highlightColor: "green", favorite: false, note: null },
  { id: "1b", book: "João", chapter: 5, verse: 24, reference: "João 5,24", text: "Quem ouve a minha palavra", highlighted: true, highlightColor: "amber", favorite: false, note: null },
  { id: "2", book: "Salmos", chapter: 23, verse: 1, reference: "Salmos 23,1", text: "O Senhor é meu pastor", highlighted: false, favorite: true, note: null },
  { id: "3", book: "Mateus", chapter: 5, verse: 9, reference: "Mateus 5,9", text: "Bem-aventurados os pacificadores", highlighted: false, favorite: false, note: "estudar sobre paz" },
  { id: "4", book: "Isaías", chapter: 41, verse: 10, reference: "Isaías 41,10", text: "Não temas", highlighted: false, favorite: false, note: longNote },
]

function renderPage(
  initialEntry: string | { pathname: string; state?: unknown } = "/oratio/biblia/minha",
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <MinhaBiblia />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  isLoggedInReturn = true
  getAllMarksMock.mockResolvedValue(marks)
  listCollectionsMock.mockResolvedValue([])
  createCollectionMock.mockResolvedValue({ id: "c1", name: "Fé" })
})

describe("MinhaBiblia", () => {

  it("drills book → chapter → verse, and Voltar goes back up one level at a time", async () => {
    renderPage()

    // 1º nível: livro (não o capítulo nem o versículo direto)
    expect(await screen.findByText("João")).toBeInTheDocument()
    expect(screen.getByText("2 versículos")).toBeInTheDocument()
    expect(screen.queryByText("Capítulo 3")).not.toBeInTheDocument()
    expect(screen.queryByText("João 3,16")).not.toBeInTheDocument()
    // só João tem grifo — Salmos/Mateus/Isaías não aparecem nesta aba
    expect(screen.queryByText("Salmos")).not.toBeInTheDocument()

    // 2º nível: capítulos do livro, em blocos
    fireEvent.click(screen.getByRole("button", { name: /João/ }))
    expect(await screen.findByText("Capítulo 3")).toBeInTheDocument()
    expect(screen.getByText("Capítulo 5")).toBeInTheDocument()
    expect(screen.queryByText("João 3,16")).not.toBeInTheDocument()

    // 3º nível: versículos soltos daquele capítulo
    fireEvent.click(screen.getByRole("button", { name: /Capítulo 3/ }))
    expect(await screen.findByText("João 3,16")).toBeInTheDocument()
    expect(screen.queryByText("João 5,24")).not.toBeInTheDocument()

    // "voltar" sobe um nível de cada vez
    fireEvent.click(screen.getByRole("button", { name: /Capítulos/ }))
    expect(await screen.findByText("Capítulo 3")).toBeInTheDocument()
    expect(screen.queryByText("João 3,16")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Livros/ }))
    expect(await screen.findByText("João")).toBeInTheDocument()
    expect(screen.queryByText("Capítulo 3")).not.toBeInTheDocument()
  })

  it("switches to favoritos and anotações, each with their own book → chapter → verse drill-down", async () => {
    renderPage()
    await screen.findByText("João")

    fireEvent.click(screen.getByRole("button", { name: /Favoritos/ }))
    expect(await screen.findByText("Salmos")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Salmos/ }))
    fireEvent.click(await screen.findByRole("button", { name: /Capítulo 23/ }))
    expect(await screen.findByText("Salmos 23,1")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Anotações/ }))
    expect(await screen.findByText("Mateus")).toBeInTheDocument()
    expect(screen.getByText("Isaías")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Mateus/ }))
    fireEvent.click(await screen.findByRole("button", { name: /Capítulo 5/ }))
    expect(await screen.findByText("Mateus 5,9")).toBeInTheDocument()
  })

  it("shows a 'Ver anotação' button that opens the full note in a modal — same mechanic as Coleções", async () => {
    renderPage()
    await screen.findByText("João")

    fireEvent.click(screen.getByRole("button", { name: /Anotações/ }))
    fireEvent.click(await screen.findByRole("button", { name: /Isaías/ }))
    fireEvent.click(await screen.findByRole("button", { name: /Capítulo 41/ }))

    // não mostra a nota (nem truncada) direto no card — só o botão
    await screen.findByText("Isaías 41,10")
    expect(screen.queryByText(/^a+…?$/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Ver anotação/ }))
    expect(screen.getByRole("dialog", { name: /Isaías 41,10/ })).toBeInTheDocument()
  })

  it("search bypasses the book/chapter grouping and matches across every book directly", async () => {
    renderPage()
    await screen.findByText("João")

    fireEvent.change(screen.getByPlaceholderText(/Buscar nos seus/), { target: { value: "mundo" } })
    expect(await screen.findByText("João 3,16")).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/Buscar nos seus/), { target: { value: "zzz" } })
    expect(screen.getByText("Nada aqui ainda")).toBeInTheDocument()
  })

  it("opens the verse in context when its card is tapped, after drilling all the way down", async () => {
    renderPage()
    fireEvent.click(await screen.findByRole("button", { name: /João/ }))
    fireEvent.click(await screen.findByRole("button", { name: /Capítulo 3/ }))
    fireEvent.click(await screen.findByText("João 3,16"))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/biblia/Jo%C3%A3o/3?verse=16")
  })

  it("?book= alone lands on the chapter blocks, not the verses directly", async () => {
    renderPage("/oratio/biblia/minha?tab=anotacoes&book=Mateus")
    expect(await screen.findByText("Capítulo 5")).toBeInTheDocument()
    expect(screen.queryByText("Mateus 5,9")).not.toBeInTheDocument()
  })

  it("?book=&chapter= together land directly on that chapter's verses", async () => {
    renderPage("/oratio/biblia/minha?tab=anotacoes&book=Mateus&chapter=5")
    expect(await screen.findByText("Mateus 5,9")).toBeInTheDocument()
  })

  it("lists collections with name, count and a working link", async () => {
    listCollectionsMock.mockResolvedValue([
      { id: "c1", name: "Promessas de Deus", _count: { items: 3 } },
    ])
    renderPage()
    await screen.findByText("João")
    fireEvent.click(screen.getByRole("button", { name: /Coleções/ }))

    const card = screen.getByRole("button", { name: /Promessas de Deus/ })
    expect(card).toHaveTextContent("3 versículos")

    fireEvent.click(card)
    expect(navigateMock).toHaveBeenCalledWith("/oratio/biblia/colecao/c1")
  })

  it("creates a collection through the Oratio modal (no window.prompt)", async () => {
    const promptSpy = vi.spyOn(window, "prompt")
    renderPage()
    await screen.findByText("João")

    fireEvent.click(screen.getByRole("button", { name: /Coleções/ }))
    fireEvent.click(screen.getByRole("button", { name: /Nova coleção/ }))

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Promessas" } })
    fireEvent.click(screen.getByRole("button", { name: "Criar" }))

    await waitFor(() => expect(createCollectionMock).toHaveBeenCalledWith("Promessas"))
    expect(promptSpy).not.toHaveBeenCalled()
    promptSpy.mockRestore()
  })

  it("gates guests and does not call the API", async () => {
    isLoggedInReturn = false
    renderPage()
    expect(screen.getByText("guest-gate")).toBeInTheDocument()
    await waitFor(() => expect(getAllMarksMock).not.toHaveBeenCalled())
  })
})
