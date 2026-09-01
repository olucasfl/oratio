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
vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))
vi.mock("../../components/GuestGateModal/GuestGateModal", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>guest-gate</div> : null),
}))

import MinhaBiblia from "./MinhaBiblia"

const getAllMarksMock = vi.fn()
let isLoggedInReturn = true

const marks = [
  { id: "1", book: "João", chapter: 3, verse: 16, reference: "João 3,16", text: "Porque Deus amou o mundo", highlighted: true, highlightColor: "green", favorite: false, note: null },
  { id: "2", book: "Salmos", chapter: 23, verse: 1, reference: "Salmos 23,1", text: "O Senhor é meu pastor", highlighted: false, favorite: true, note: null },
  { id: "3", book: "Mateus", chapter: 5, verse: 9, reference: "Mateus 5,9", text: "Bem-aventurados os pacificadores", highlighted: false, favorite: false, note: "estudar sobre paz" },
]

function renderPage() {
  return render(<MemoryRouter><MinhaBiblia /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  isLoggedInReturn = true
  getAllMarksMock.mockResolvedValue(marks)
})

describe("MinhaBiblia", () => {

  it("shows highlighted verses on the default tab", async () => {
    renderPage()
    expect(await screen.findByText("João 3,16")).toBeInTheDocument()
    expect(screen.queryByText("Salmos 23,1")).not.toBeInTheDocument()
  })

  it("switches to favourites and to notes", async () => {
    renderPage()
    await screen.findByText("João 3,16")

    fireEvent.click(screen.getByRole("button", { name: /Favoritos/ }))
    expect(screen.getByText("Salmos 23,1")).toBeInTheDocument()
    expect(screen.queryByText("João 3,16")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Anotações/ }))
    expect(screen.getByText("Mateus 5,9")).toBeInTheDocument()
    expect(screen.getByText(/estudar sobre paz/)).toBeInTheDocument()
  })

  it("filters the list by the search box (text, reference or note)", async () => {
    renderPage()
    await screen.findByText("João 3,16")

    fireEvent.change(screen.getByPlaceholderText(/Buscar nos seus/), { target: { value: "mundo" } })
    expect(screen.getByText("João 3,16")).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/Buscar nos seus/), { target: { value: "zzz" } })
    expect(screen.getByText("Nada aqui ainda")).toBeInTheDocument()
  })

  it("opens the verse in context when a card is tapped", async () => {
    renderPage()
    fireEvent.click(await screen.findByText("João 3,16"))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/biblia/Jo%C3%A3o/3?verse=16")
  })

  it("gates guests and does not call the API", async () => {
    isLoggedInReturn = false
    renderPage()
    expect(screen.getByText("guest-gate")).toBeInTheDocument()
    await waitFor(() => expect(getAllMarksMock).not.toHaveBeenCalled())
  })
})
