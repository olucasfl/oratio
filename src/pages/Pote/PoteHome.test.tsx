import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../../services/poteService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../services/poteService")>()
  return {
    ...actual,
    createRoom: vi.fn(),
    listMyRooms: vi.fn(),
    searchUsers: vi.fn(),
    inviteUsers: vi.fn(),
  }
})

import * as svc from "../../services/poteService"
import InvitePanel from "./components/InvitePanel"
import PoteHome from "./PoteHome"

const m = svc as unknown as Record<string, ReturnType<typeof vi.fn>>

beforeEach(() => {
  vi.clearAllMocks()
})

function renderHome() {
  return render(
    <MemoryRouter initialEntries={["/oratio/dinamicas"]}>
      <Routes>
        <Route path="/oratio/dinamicas" element={<PoteHome />} />
        <Route path="/oratio/dinamicas/pote/:code/lider" element={<p>painel-do-lider</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("PoteHome", () => {
  it("criar sala leva ao painel do líder da nova sala", async () => {
    m.listMyRooms.mockResolvedValue([])
    m.createRoom.mockResolvedValue({ code: "4321" })
    renderHome()
    fireEvent.click(await screen.findByText("Criar sala"))
    expect(await screen.findByText("painel-do-lider")).toBeInTheDocument()
  })

  it("lista as salas ativas e abre uma", async () => {
    m.listMyRooms.mockResolvedValue([{ code: "1111", phase: "ROUND_1", createdAt: "2026-10-02", invited: 3 }])
    renderHome()
    expect(await screen.findByText(/Rodada 1 · 3 convidados/)).toBeInTheDocument()
    fireEvent.click(screen.getByText("Abrir"))
    expect(await screen.findByText("painel-do-lider")).toBeInTheDocument()
  })

  it("mostra o erro do servidor se não conseguir criar", async () => {
    m.listMyRooms.mockResolvedValue([])
    m.createRoom.mockRejectedValue({ response: { data: { message: "Só admin." } } })
    renderHome()
    fireEvent.click(await screen.findByText("Criar sala"))
    expect(await screen.findByRole("alert")).toHaveTextContent("Só admin.")
  })
})

describe("InvitePanel", () => {
  it("busca com 2+ caracteres, seleciona e envia o convite", async () => {
    m.searchUsers.mockResolvedValue([
      { id: "u1", name: "Ana Souza", email: "ana@exemplo.com" },
      { id: "u2", name: "Bia Lima", email: "bia@exemplo.com" },
    ])
    m.inviteUsers.mockResolvedValue({ invited: 2, alreadyInvited: 0 })
    const onInvited = vi.fn()
    render(<InvitePanel code="1234" onInvited={onInvited} />)

    const input = screen.getByLabelText("Buscar pessoa")
    fireEvent.change(input, { target: { value: "a" } })
    expect(m.searchUsers).not.toHaveBeenCalled() // 1 caractere: nem busca

    fireEvent.change(input, { target: { value: "an" } })
    expect(await screen.findByText(/Ana Souza/)).toBeInTheDocument()
    expect(m.searchUsers).toHaveBeenCalledWith("an")

    const send = screen.getByRole("button", { name: /Enviar convite/ })
    expect(send).toBeDisabled()

    fireEvent.click(screen.getByLabelText(/Ana Souza/))
    fireEvent.click(screen.getByLabelText(/Bia Lima/))
    fireEvent.click(screen.getByRole("button", { name: /Enviar convites/ }))

    await waitFor(() => expect(m.inviteUsers).toHaveBeenCalledWith("1234", ["u1", "u2"]))
    expect(await screen.findByText("Convite enviado a 2 pessoas.")).toBeInTheDocument()
    expect(onInvited).toHaveBeenCalled()
  })

  it("avisa quando ninguém é encontrado", async () => {
    m.searchUsers.mockResolvedValue([])
    render(<InvitePanel code="1234" />)
    fireEvent.change(screen.getByLabelText("Buscar pessoa"), { target: { value: "zzz" } })
    expect(await screen.findByText("Ninguém encontrado.")).toBeInTheDocument()
  })
})
