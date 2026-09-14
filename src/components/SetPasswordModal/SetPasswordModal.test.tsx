import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/profileService", () => ({ setPassword: vi.fn() }))

// O botão real do Google carrega o GIS — stub: um <button> que dispara
// onCredential com um id_token fake (mesmo padrão do DeleteAccountModal.test).
vi.mock("../GoogleSignInButton/GoogleSignInButton", () => ({
  default: ({ onCredential }: { onCredential: (c: string) => void }) => (
    <button onClick={() => onCredential("fresh-google-id-token")}>reauth-google</button>
  ),
}))

import { setPassword } from "../../services/profileService"
import SetPasswordModal from "./SetPasswordModal"

const setPasswordMock = setPassword as unknown as ReturnType<typeof vi.fn>

function fill(next: string, confirm: string) {
  fireEvent.change(screen.getByPlaceholderText("Nova senha"), { target: { value: next } })
  fireEvent.change(screen.getByPlaceholderText("Confirmar nova senha"), { target: { value: confirm } })
}

function continueToGoogle() {
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }))
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
    continueToGoogle()
    expect(screen.getByText("Preencha os dois campos.")).toBeInTheDocument()
    expect(screen.queryByText("reauth-google")).not.toBeInTheDocument()
  })

  it("rejects mismatched passwords", () => {
    render(<SetPasswordModal open onClose={vi.fn()} />)
    fill("abcd1234", "abcd9999")
    continueToGoogle()
    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument()
    expect(screen.queryByText("reauth-google")).not.toBeInTheDocument()
  })

  it("enforces the strength rule (8 chars, letter + number)", () => {
    render(<SetPasswordModal open onClose={vi.fn()} />)
    fill("abcdefgh", "abcdefgh")
    continueToGoogle()
    expect(screen.getByText(/pelo menos 8 caracteres/)).toBeInTheDocument()
    expect(screen.queryByText("reauth-google")).not.toBeInTheDocument()
  })

  it("after valid passwords asks for Google confirmation and does not call setPassword yet", () => {
    render(<SetPasswordModal open onClose={vi.fn()} />)
    fill("abcd1234", "abcd1234")
    continueToGoogle()
    expect(screen.getByText(/confirmar que é você/)).toBeInTheDocument()
    expect(screen.getByText("reauth-google")).toBeInTheDocument()
    expect(setPasswordMock).not.toHaveBeenCalled()
  })

  it("calls setPassword with the typed passwords and the fresh Google credential, then shows success", async () => {
    setPasswordMock.mockResolvedValue({ message: "Senha definida." })
    const onDefined = vi.fn()
    render(<SetPasswordModal open onClose={vi.fn()} onDefined={onDefined} />)
    fill("abcd1234", "abcd1234")
    continueToGoogle()
    fireEvent.click(screen.getByText("reauth-google"))
    await waitFor(() =>
      expect(setPasswordMock).toHaveBeenCalledWith("abcd1234", "abcd1234", "fresh-google-id-token"),
    )
    expect(await screen.findByText("Senha definida!")).toBeInTheDocument()
    expect(onDefined).toHaveBeenCalled()
  })

  it("400 from another Google account: shows the message and keeps the modal open", async () => {
    setPasswordMock.mockRejectedValue({
      response: { status: 400, data: { message: "Não foi possível confirmar sua identidade." } },
    })
    const onClose = vi.fn()
    const onDefined = vi.fn()
    render(<SetPasswordModal open onClose={onClose} onDefined={onDefined} />)
    fill("abcd1234", "abcd1234")
    continueToGoogle()
    fireEvent.click(screen.getByText("reauth-google"))
    expect(await screen.findByText("Não foi possível confirmar sua identidade.")).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    expect(onDefined).not.toHaveBeenCalled()
    expect(screen.queryByText("Senha definida!")).not.toBeInTheDocument()
    // pode tentar de novo com outra conta Google
    expect(screen.getByText("reauth-google")).toBeInTheDocument()
  })

  it("401 (invalid or expired credential): asks to confirm with Google again", async () => {
    setPasswordMock.mockRejectedValue({ response: { status: 401, data: { message: "Unauthorized" } } })
    render(<SetPasswordModal open onClose={vi.fn()} />)
    fill("abcd1234", "abcd1234")
    continueToGoogle()
    fireEvent.click(screen.getByText("reauth-google"))
    expect(await screen.findByText(/Não foi possível confirmar com o Google/)).toBeInTheDocument()
    expect(screen.getByText("reauth-google")).toBeInTheDocument()
  })

  it("shows the backend message when the account already has a password (409)", async () => {
    setPasswordMock.mockRejectedValue({
      response: {
        status: 409,
        data: {
          message:
            'Esta conta já tem uma senha. Use "Trocar senha" nas configurações (é preciso informar a senha atual).',
        },
      },
    })
    render(<SetPasswordModal open onClose={vi.fn()} />)
    fill("abcd1234", "abcd1234")
    continueToGoogle()
    fireEvent.click(screen.getByText("reauth-google"))
    expect(await screen.findByText(/Esta conta já tem uma senha/)).toBeInTheDocument()
  })

  it("'Voltar' returns to the password fields keeping what was typed", () => {
    render(<SetPasswordModal open onClose={vi.fn()} />)
    fill("abcd1234", "abcd1234")
    continueToGoogle()
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }))
    expect(screen.getByPlaceholderText("Nova senha")).toHaveValue("abcd1234")
    expect(screen.queryByText("reauth-google")).not.toBeInTheDocument()
  })

})
