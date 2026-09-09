import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/profileService", () => ({ setPassword: vi.fn() }))

import { setPassword } from "../../services/profileService"
import SetPasswordModal from "./SetPasswordModal"

const setPasswordMock = setPassword as unknown as ReturnType<typeof vi.fn>

function fill(next: string, confirm: string) {
  fireEvent.change(screen.getByPlaceholderText("Nova senha"), { target: { value: next } })
  fireEvent.change(screen.getByPlaceholderText("Confirmar nova senha"), { target: { value: confirm } })
}

beforeEach(() => vi.clearAllMocks())

describe("SetPasswordModal", () => {

  it("renders nothing when closed", () => {
    const { container } = render(<SetPasswordModal open={false} onClose={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("has no 'current password' field (that is the change-password flow)", () => {
    render(<SetPasswordModal open onClose={vi.fn()} />)
    expect(screen.queryByPlaceholderText("Senha atual")).not.toBeInTheDocument()
  })

  it("requires both fields", () => {
    render(<SetPasswordModal open onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: "Definir senha" }))
    expect(screen.getByText("Preencha os dois campos.")).toBeInTheDocument()
    expect(setPasswordMock).not.toHaveBeenCalled()
  })

  it("rejects mismatched passwords", () => {
    render(<SetPasswordModal open onClose={vi.fn()} />)
    fill("abcd1234", "abcd9999")
    fireEvent.click(screen.getByRole("button", { name: "Definir senha" }))
    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument()
    expect(setPasswordMock).not.toHaveBeenCalled()
  })

  it("enforces the strength rule (8 chars, letter + number)", () => {
    render(<SetPasswordModal open onClose={vi.fn()} />)
    fill("abcdefgh", "abcdefgh")
    fireEvent.click(screen.getByRole("button", { name: "Definir senha" }))
    expect(screen.getByText(/pelo menos 8 caracteres/)).toBeInTheDocument()
    expect(setPasswordMock).not.toHaveBeenCalled()
  })

  it("submits a valid password, shows the success state, and calls onDefined", async () => {
    setPasswordMock.mockResolvedValue({ message: "Senha definida." })
    const onDefined = vi.fn()
    render(<SetPasswordModal open onClose={vi.fn()} onDefined={onDefined} />)
    fill("abcd1234", "abcd1234")
    fireEvent.click(screen.getByRole("button", { name: "Definir senha" }))
    await waitFor(() => expect(setPasswordMock).toHaveBeenCalledWith("abcd1234", "abcd1234"))
    expect(await screen.findByText("Senha definida!")).toBeInTheDocument()
    expect(onDefined).toHaveBeenCalled()
  })

  it("shows the backend message when the account already has a password (409)", async () => {
    setPasswordMock.mockRejectedValue({
      response: {
        data: {
          message:
            'Esta conta já tem uma senha. Use "Trocar senha" nas configurações (é preciso informar a senha atual).',
        },
      },
    })
    render(<SetPasswordModal open onClose={vi.fn()} />)
    fill("abcd1234", "abcd1234")
    fireEvent.click(screen.getByRole("button", { name: "Definir senha" }))
    expect(await screen.findByText(/Esta conta já tem uma senha/)).toBeInTheDocument()
  })

})
