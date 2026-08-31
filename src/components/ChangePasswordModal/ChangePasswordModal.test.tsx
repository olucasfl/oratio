import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/profileService", () => ({ changePassword: vi.fn() }))

import { changePassword } from "../../services/profileService"
import ChangePasswordModal from "./ChangePasswordModal"

const changePasswordMock = changePassword as unknown as ReturnType<typeof vi.fn>

function fill(current: string, next: string, confirm: string) {
  fireEvent.change(screen.getByPlaceholderText("Senha atual"), { target: { value: current } })
  fireEvent.change(screen.getByPlaceholderText("Nova senha"), { target: { value: next } })
  fireEvent.change(screen.getByPlaceholderText("Confirmar nova senha"), { target: { value: confirm } })
}

beforeEach(() => vi.clearAllMocks())

describe("ChangePasswordModal", () => {

  it("renders nothing when closed", () => {
    const { container } = render(<ChangePasswordModal open={false} onClose={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("requires every field", () => {
    render(<ChangePasswordModal open onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }))
    expect(screen.getByText("Preencha todos os campos.")).toBeInTheDocument()
    expect(changePasswordMock).not.toHaveBeenCalled()
  })

  it("rejects mismatched new passwords", () => {
    render(<ChangePasswordModal open onClose={vi.fn()} />)
    fill("old", "abcd1234", "abcd9999")
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }))
    expect(screen.getByText("As senhas novas não coincidem.")).toBeInTheDocument()
  })

  it("enforces the strength rule (8 chars, letter + number)", () => {
    render(<ChangePasswordModal open onClose={vi.fn()} />)
    fill("old", "abcdefgh", "abcdefgh")
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }))
    expect(screen.getByText(/pelo menos 8 caracteres/)).toBeInTheDocument()
  })

  it("submits a valid change and shows the success state", async () => {
    changePasswordMock.mockResolvedValue(undefined)
    render(<ChangePasswordModal open onClose={vi.fn()} />)
    fill("old", "abcd1234", "abcd1234")
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }))
    await waitFor(() => expect(changePasswordMock).toHaveBeenCalledWith("old", "abcd1234"))
    expect(await screen.findByText("Senha alterada!")).toBeInTheDocument()
  })

  it("shows the translated error when the current password is wrong", async () => {
    changePasswordMock.mockRejectedValue({ response: { data: { message: "Current password is incorrect" } } })
    render(<ChangePasswordModal open onClose={vi.fn()} />)
    fill("bad", "abcd1234", "abcd1234")
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }))
    expect(await screen.findByText("Senha atual incorreta.")).toBeInTheDocument()
  })

})
