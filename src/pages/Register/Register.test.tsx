import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/authService", () => ({ register: vi.fn() }))

// O modal de verificação faz polling contra a API — stub aqui.
vi.mock("../../components/VerifyEmailModal/VerifyEmailModal", () => ({
  default: ({ open, email }: { open: boolean; email: string }) =>
    open ? <div>verify-modal:{email}</div> : null,
}))

import { register } from "../../services/authService"
import Register from "./Register"

const registerMock = register as unknown as ReturnType<typeof vi.fn>

function fillForm() {
  fireEvent.change(screen.getByPlaceholderText("Nome"), { target: { value: "Ana" } })
  fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "ana@x.com" } })
  fireEvent.change(screen.getByPlaceholderText("Senha"), { target: { value: "pw123456" } })
  fireEvent.change(screen.getByPlaceholderText("Confirmar senha"), { target: { value: "pw123456" } })
}

function renderRegister(path = "/register") {
  return render(<MemoryRouter initialEntries={[path]}><Register /></MemoryRouter>)
}

beforeEach(() => vi.clearAllMocks())

describe("Register", () => {

  it("registers and opens the verify-email modal on success", async () => {
    registerMock.mockResolvedValue({ emailSent: true })
    renderRegister()
    fillForm()
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }))
    await waitFor(() =>
      expect(registerMock).toHaveBeenCalledWith("Ana", "ana@x.com", "pw123456", "pw123456"),
    )
    expect(await screen.findByText("verify-modal:ana@x.com")).toBeInTheDocument()
  })

  it("warns via AlertModal when the verification email could not be sent, then opens verify", async () => {
    registerMock.mockResolvedValue({ emailSent: false })
    renderRegister()
    fillForm()
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }))

    expect(await screen.findByText(/não conseguimos enviar o email de verificação/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "OK" }))
    expect(await screen.findByText("verify-modal:ana@x.com")).toBeInTheDocument()
  })

  it("shows the translated error message when registration fails", async () => {
    registerMock.mockRejectedValue({ response: { data: { message: "Email already registered" } } })
    renderRegister()
    fillForm()
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }))
    expect(await screen.findByText("Esse email já está cadastrado.")).toBeInTheDocument()
  })

  it("navigates to /login (with redirect) from the 'Entrar' link", () => {
    renderRegister("/register?redirect=/oratio/prayers")
    fireEvent.click(screen.getByText("Entrar"))
    expect(navigateMock).toHaveBeenCalledWith("/login?redirect=%2Foratio%2Fprayers")
  })

})
