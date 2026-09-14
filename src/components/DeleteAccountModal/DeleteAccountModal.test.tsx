import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/profileService", () => ({ deleteAccount: vi.fn() }))
vi.mock("../../services/api", () => ({ clearSession: vi.fn(), default: {} }))

// O botão real do Google carrega o GIS — stub: um <button> que dispara
// onCredential com um id_token fake.
vi.mock("../GoogleSignInButton/GoogleSignInButton", () => ({
  default: ({ onCredential }: { onCredential: (c: string) => void }) => (
    <button onClick={() => onCredential("fresh-google-id-token")}>reauth-google</button>
  ),
}))

import { deleteAccount } from "../../services/profileService"
import { clearSession } from "../../services/api"
import DeleteAccountModal from "./DeleteAccountModal"

const deleteAccountMock = deleteAccount as unknown as ReturnType<typeof vi.fn>
const clearSessionMock = clearSession as unknown as ReturnType<typeof vi.fn>

const EMAIL = "user@x.com"

beforeEach(() => vi.clearAllMocks())

describe("DeleteAccountModal", () => {

  it("renders nothing when closed", () => {
    const { container } = render(
      <DeleteAccountModal open={false} userEmail={EMAIL} hasPassword onClose={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  // ---- conta com senha ----

  it("keeps the delete button disabled until the email matches and a password is typed", () => {
    render(<DeleteAccountModal open userEmail={EMAIL} hasPassword onClose={vi.fn()} />)
    const btn = screen.getByRole("button", { name: "Excluir minha conta" })
    expect(btn).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText("Digite seu email"), { target: { value: EMAIL } })
    expect(btn).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText("Sua senha"), { target: { value: "pw" } })
    expect(btn).not.toBeDisabled()
  })

  it("deletes with { password } and clears the session", async () => {
    deleteAccountMock.mockResolvedValue(undefined)
    render(<DeleteAccountModal open userEmail={EMAIL} hasPassword onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText("Digite seu email"), { target: { value: "USER@X.COM" } })
    fireEvent.change(screen.getByPlaceholderText("Sua senha"), { target: { value: "pw" } })
    fireEvent.click(screen.getByRole("button", { name: "Excluir minha conta" }))
    await waitFor(() => expect(deleteAccountMock).toHaveBeenCalledWith({ password: "pw" }))
    expect(clearSessionMock).toHaveBeenCalled()
  })

  it("shows the translated error and does not clear the session when the password is wrong", async () => {
    deleteAccountMock.mockRejectedValue({ response: { data: { message: "Invalid credentials" } } })
    render(<DeleteAccountModal open userEmail={EMAIL} hasPassword onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText("Digite seu email"), { target: { value: EMAIL } })
    fireEvent.change(screen.getByPlaceholderText("Sua senha"), { target: { value: "bad" } })
    fireEvent.click(screen.getByRole("button", { name: "Excluir minha conta" }))
    expect(await screen.findByText("Email ou senha incorretos.")).toBeInTheDocument()
    expect(clearSessionMock).not.toHaveBeenCalled()
  })

  // ---- conta só-Google (E7) ----

  it("shows a Google re-auth button instead of the password field", () => {
    render(<DeleteAccountModal open userEmail={EMAIL} hasPassword={false} onClose={vi.fn()} />)
    expect(screen.queryByPlaceholderText("Sua senha")).not.toBeInTheDocument()
    // só aparece o botão do Google depois que o email bate
    expect(screen.queryByText("reauth-google")).not.toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText("Digite seu email"), { target: { value: EMAIL } })
    expect(screen.getByText("reauth-google")).toBeInTheDocument()
  })

  it("deletes with { googleCredential } after re-auth and clears the session", async () => {
    deleteAccountMock.mockResolvedValue(undefined)
    render(<DeleteAccountModal open userEmail={EMAIL} hasPassword={false} onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText("Digite seu email"), { target: { value: EMAIL } })
    fireEvent.click(screen.getByText("reauth-google"))
    await waitFor(() =>
      expect(deleteAccountMock).toHaveBeenCalledWith({ googleCredential: "fresh-google-id-token" }),
    )
    expect(clearSessionMock).toHaveBeenCalled()
  })

  it("shows an error and does NOT clear the session when the Google account is not this user's (400)", async () => {
    deleteAccountMock.mockRejectedValue({
      response: {
        status: 400,
        data: { message: "Não foi possível confirmar sua identidade para excluir a conta." },
      },
    })
    render(<DeleteAccountModal open userEmail={EMAIL} hasPassword={false} onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText("Digite seu email"), { target: { value: EMAIL } })
    fireEvent.click(screen.getByText("reauth-google"))
    expect(
      await screen.findByText(/Não foi possível confirmar sua identidade/i),
    ).toBeInTheDocument()
    expect(clearSessionMock).not.toHaveBeenCalled()
  })

})
