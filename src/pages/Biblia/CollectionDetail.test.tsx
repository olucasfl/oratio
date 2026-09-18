import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
  useParams: () => ({ id: "c1" }),
}))

vi.mock("../../utils/auth", () => ({ isLoggedIn: () => isLoggedInReturn }))
vi.mock("../../hooks/useOffline", () => ({ useOffline: () => offline }))
vi.mock("../../services/bibleMarksService", () => ({
  getAllMarks: (...a: unknown[]) => getAllMarksMock(...a),
}))
vi.mock("../../services/bibleCollectionsService", () => ({
  getCollection: (...a: unknown[]) => getMock(...a),
  renameCollection: vi.fn(),
  deleteCollection: (...a: unknown[]) => deleteMock(...a),
  removeCollectionItem: (...a: unknown[]) => removeItemMock(...a),
}))
vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))

import CollectionDetail from "./CollectionDetail"

const getMock = vi.fn()
const deleteMock = vi.fn()
const removeItemMock = vi.fn()
const getAllMarksMock = vi.fn()
let offline = false
let isLoggedInReturn = true

// João tem 2 itens em capítulos diferentes de propósito, pra exercitar
// o bloco de capítulos (2º nível) — não só o de livros.
const items = [
  { id: "i1", book: "João", chapter: 3, verse: 16, reference: "João 3,16", text: "Deus amou o mundo", note: null },
  { id: "i2", book: "João", chapter: 5, verse: 24, reference: "João 5,24", text: "Quem ouve a minha palavra", note: null },
]

beforeEach(() => {
  vi.clearAllMocks()
  offline = false
  isLoggedInReturn = true
  getMock.mockResolvedValue({
    id: "c1",
    name: "Promessas de Deus",
    items,
  })
  removeItemMock.mockResolvedValue(undefined)
  deleteMock.mockResolvedValue(undefined)
  getAllMarksMock.mockResolvedValue([])
})

function renderPage() {
  return render(<MemoryRouter><CollectionDetail /></MemoryRouter>)
}

describe("CollectionDetail", () => {

  it("shows the collection name and its books (not the verses directly)", async () => {
    renderPage()
    expect(await screen.findByText("Promessas de Deus")).toBeInTheDocument()
    expect(await screen.findByText("João")).toBeInTheDocument()
    expect(screen.queryByText("João 3,16")).not.toBeInTheDocument()
    // "2 versículos" aparece duas vezes de propósito neste fixture: no
    // total da coleção (hero) e na contagem do único livro (bloco)
    expect(screen.getAllByText("2 versículos")).toHaveLength(2)
  })

  it("drills book → chapter → verse, and Voltar goes back up one level at a time", async () => {
    renderPage()
    fireEvent.click(await screen.findByRole("button", { name: /João/ }))

    expect(await screen.findByText("Capítulo 3")).toBeInTheDocument()
    expect(screen.getByText("Capítulo 5")).toBeInTheDocument()
    expect(screen.queryByText("João 3,16")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Capítulo 3/ }))
    expect(await screen.findByText("João 3,16")).toBeInTheDocument()
    expect(screen.queryByText("João 5,24")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Capítulos/ }))
    expect(await screen.findByText("Capítulo 3")).toBeInTheDocument()
    expect(screen.queryByText("João 3,16")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Livros/ }))
    expect(await screen.findByText("João")).toBeInTheDocument()
    expect(screen.queryByText("Capítulo 3")).not.toBeInTheDocument()
  })

  it("groups books under Antigo/Novo Testamento headers, in canonical order", async () => {
    getMock.mockResolvedValue({
      id: "c1",
      name: "Estudo",
      items: [
        { id: "i1", book: "Efésios", chapter: 2, verse: 8, reference: "Efésios 2,8", text: "Pela graça sois salvos", note: null },
        { id: "i2", book: "Salmos", chapter: 23, verse: 1, reference: "Salmos 23,1", text: "O Senhor é meu pastor", note: null },
      ],
    })
    renderPage()

    expect(await screen.findByText("Antigo Testamento")).toBeInTheDocument()
    expect(screen.getByText("Novo Testamento")).toBeInTheDocument()
    const testamentOrder = screen.getAllByText(/Testamento$/).map((el) => el.textContent)
    expect(testamentOrder).toEqual(["Antigo Testamento", "Novo Testamento"])
    expect(screen.getByText("Salmos")).toBeInTheDocument()
    expect(screen.getByText("Efésios")).toBeInTheDocument()
  })

  it("shows a 'Ver anotação' button per verse (note from the global mark) and opens it in a modal", async () => {
    getMock.mockResolvedValue({
      id: "c1",
      name: "Estudo",
      items: [
        { id: "i1", book: "João", chapter: 3, verse: 16, reference: "João 3,16", text: "Deus amou o mundo", note: null },
      ],
    })
    // a nota exibida vem da marcação global do versículo (getAllMarks),
    // não do campo `note` do item da coleção — ver ARCHITECTURE.md
    getAllMarksMock.mockResolvedValue([
      { book: "João", chapter: 3, verse: 16, note: "grande promessa" },
    ])
    renderPage()
    fireEvent.click(await screen.findByRole("button", { name: /João/ }))
    fireEvent.click(await screen.findByRole("button", { name: /Capítulo 3/ }))
    await screen.findByText("João 3,16")

    fireEvent.click(screen.getByRole("button", { name: /Ver anotação/ }))
    expect(screen.getByRole("dialog", { name: /João 3,16/ })).toBeInTheDocument()
    expect(screen.getByText("grande promessa")).toBeInTheDocument()
  })

  it("opens the verse in context on tap", async () => {
    renderPage()
    fireEvent.click(await screen.findByRole("button", { name: /João/ }))
    fireEvent.click(await screen.findByRole("button", { name: /Capítulo 3/ }))
    fireEvent.click(await screen.findByText("João 3,16"))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/biblia/Jo%C3%A3o/3?verse=16")
  })

  it("removes an item only after confirming", async () => {
    renderPage()
    fireEvent.click(await screen.findByRole("button", { name: /João/ }))
    fireEvent.click(await screen.findByRole("button", { name: /Capítulo 3/ }))
    await screen.findByText("João 3,16")

    fireEvent.click(screen.getByRole("button", { name: "Remover da coleção" }))
    expect(removeItemMock).not.toHaveBeenCalled()

    fireEvent.click(await screen.findByRole("button", { name: "Remover" }))
    await waitFor(() => expect(removeItemMock).toHaveBeenCalledWith("c1", "i1"))
    expect(screen.queryByText("João 3,16")).not.toBeInTheDocument()
  })

  it("shows an offline message instead of 'not found' when the fetch fails offline", async () => {
    offline = true
    getMock.mockResolvedValue(null)
    renderPage()
    expect(await screen.findByText(/sem conex/i)).toBeInTheDocument()
    expect(screen.queryByText(/não encontrada/i)).not.toBeInTheDocument()
  })

  it("still says 'not found' when online and the collection is missing", async () => {
    getMock.mockResolvedValue(null)
    renderPage()
    expect(await screen.findByText(/não encontrada/i)).toBeInTheDocument()
  })

  it("shows rename/delete actions only at the top level (book list), not while drilled in", async () => {
    renderPage()
    await screen.findByText("Promessas de Deus")
    expect(screen.getByRole("button", { name: /Excluir/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /João/ }))
    await screen.findByText("Capítulo 3")
    expect(screen.queryByRole("button", { name: /Excluir/ })).not.toBeInTheDocument()
  })

  it("deletes the collection after confirmation and returns to Minha Bíblia", async () => {
    renderPage()
    await screen.findByText("Promessas de Deus")
    fireEvent.click(screen.getByRole("button", { name: /Excluir/ }))
    const confirmBtns = await screen.findAllByRole("button", { name: "Excluir" })
    fireEvent.click(confirmBtns[confirmBtns.length - 1])
    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith("c1"))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/biblia/minha")
  })

  /*
   Esta tela trata visitante de forma diferente da MinhaBiblia: em vez de abrir
   o GuestGateModal, ela redireciona pra /oratio/biblia — uma coleção é sempre
   de alguém, então não há nada pra mostrar a quem não está logado. O que não
   pode acontecer é a página pedir a coleção antes de redirecionar.
  */
  it("sends a visitor back to the bible home without ever asking the backend for the collection", async () => {
    isLoggedInReturn = false

    renderPage()

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/oratio/biblia"))
    expect(getMock).not.toHaveBeenCalled()
    expect(screen.queryByText("Promessas de Deus")).not.toBeInTheDocument()
  })
})
