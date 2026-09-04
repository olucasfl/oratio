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
  getAllMarks: () => Promise.resolve([]),
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
let offline = false
let isLoggedInReturn = true

beforeEach(() => {
  vi.clearAllMocks()
  offline = false
  isLoggedInReturn = true
  getMock.mockResolvedValue({
    id: "c1",
    name: "Promessas de Deus",
    items: [
      { id: "i1", book: "João", chapter: 3, verse: 16, reference: "João 3,16", text: "Deus amou o mundo", note: null },
    ],
  })
  removeItemMock.mockResolvedValue(undefined)
  deleteMock.mockResolvedValue(undefined)
})

function renderPage() {
  return render(<MemoryRouter><CollectionDetail /></MemoryRouter>)
}

describe("CollectionDetail", () => {

  it("shows the collection name and its items", async () => {
    renderPage()
    expect(await screen.findByText("Promessas de Deus")).toBeInTheDocument()
    expect(screen.getByText("João 3,16")).toBeInTheDocument()
  })

  it("opens the verse in context on tap", async () => {
    renderPage()
    fireEvent.click(await screen.findByText("João 3,16"))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/biblia/Jo%C3%A3o/3?verse=16")
  })

  it("removes an item only after confirming", async () => {
    renderPage()
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
