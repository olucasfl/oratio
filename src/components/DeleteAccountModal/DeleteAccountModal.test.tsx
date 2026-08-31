import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/profileService", () => ({ deleteAccount: vi.fn() }))
vi.mock("../../services/api", () => ({ clearSession: vi.fn(), default: {} }))

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
      <DeleteAccountModal open={false} userEmail={EMAIL} onClose={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("keeps the delete button disabled until the email matches and a password is typed", () => {
    render(<DeleteAccountModal open userEmail={EMAIL} onClose={vi.fn()} />)
    const btn = screen.getByRole("button", { name: "Excluir minha conta" })
    expect(btn).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText("Digite seu email"), { target: { value: EMAIL } })
    expect(btn).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText("Sua senha"), { target: { value: "pw" } })
    expect(btn).not.toBeDisabled()
  })

  it("deletes the account and clears the session", async () => {
    deleteAccountMock.mockResolvedValue(undefined)
    render(<DeleteAccountModal open userEmail={EMAIL} onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText("Digite seu email"), { target: { value: "USER@X.COM" } })
    fireEvent.change(screen.getByPlaceholderText("Sua senha"), { target: { value: "pw" } })
    fireEvent.click(screen.getByRole("button", { name: "Excluir minha conta" }))
    await waitFor(() => expect(deleteAccountMock).toHaveBeenCalledWith("pw"))
    expect(clearSessionMock).toHaveBeenCalled()
  })

  it("shows the translated error and does not clear the session on failure", async () => {
    deleteAccountMock.mockRejectedValue({ response: { data: { message: "Invalid credentials" } } })
    render(<DeleteAccountModal open userEmail={EMAIL} onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText("Digite seu email"), { target: { value: EMAIL } })
    fireEvent.change(screen.getByPlaceholderText("Sua senha"), { target: { value: "bad" } })
    fireEvent.click(screen.getByRole("button", { name: "Excluir minha conta" }))
    expect(await screen.findByText("Email ou senha incorretos.")).toBeInTheDocument()
    expect(clearSessionMock).not.toHaveBeenCalled()
  })

})
