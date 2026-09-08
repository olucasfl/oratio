import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/authService", () => ({
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
  forgotPassword: vi.fn(),
}))

// Isola o Login — o modal de reset tem teste próprio e fala com a API.
vi.mock("../../components/ResetPasswordModal/ResetPasswordModal", () => ({
  default: ({ token }: { token: string }) => <div>reset-modal:{token}</div>,
}))

// Test double do botão do Google: um <button> que dispara onCredential.
// O componente real carrega o script do GIS e tem teste próprio.
vi.mock("../../components/GoogleSignInButton/GoogleSignInButton", () => ({
  default: ({ onCredential }: { onCredential: (c: string) => void }) => (
    <button onClick={() => onCredential("fake-google-credential")}>google-signin</button>
  ),
}))

import { login, loginWithGoogle, forgotPassword } from "../../services/authService"
import Login from "./Login"

const loginMock = login as unknown as ReturnType<typeof vi.fn>
const loginWithGoogleMock = loginWithGoogle as unknown as ReturnType<typeof vi.fn>
const forgotPasswordMock = forgotPassword as unknown as ReturnType<typeof vi.fn>

function renderLogin(path = "/login") {
  return render(<MemoryRouter initialEntries={[path]}><Login /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe("Login", () => {

  it("redirects to the destination when already logged in", () => {
    localStorage.setItem("access_token", "tok")
    renderLogin("/login?redirect=/oratio/prayers")
    expect(navigateMock).toHaveBeenCalledWith("/oratio/prayers")
  })

  it("logs in and navigates to the default destination", async () => {
    loginMock.mockResolvedValue({})
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "a@b.com" } })
    fireEvent.change(screen.getByPlaceholderText("Senha"), { target: { value: "pw" } })
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }))
    await waitFor(() => expect(loginMock).toHaveBeenCalledWith("a@b.com", "pw"))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/home")
  })

  it("shows a friendly error when login fails", async () => {
    loginMock.mockRejectedValue({ response: { status: 401, data: { message: "Invalid credentials" } } })
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "a@b.com" } })
    fireEvent.change(screen.getByPlaceholderText("Senha"), { target: { value: "bad" } })
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }))
    expect(await screen.findByText(/Email ou senha/i)).toBeInTheDocument()
  })

  it("sends a password-reset email through the forgot-password modal", async () => {
    forgotPasswordMock.mockResolvedValue({})
    renderLogin()
    fireEvent.click(screen.getByText("Esqueci minha senha"))
    fireEvent.change(screen.getByPlaceholderText("Digite seu email"), {
      target: { value: "a@b.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Enviar email" }))
    await waitFor(() => expect(forgotPasswordMock).toHaveBeenCalledWith("a@b.com"))
    expect(await screen.findByText(/Enviaremos um email/)).toBeInTheDocument()
  })

  it("surfaces an error when the reset email cannot be sent", async () => {
    forgotPasswordMock.mockRejectedValue({ response: { status: 429 } })
    renderLogin()
    fireEvent.click(screen.getByText("Esqueci minha senha"))
    fireEvent.change(screen.getByPlaceholderText("Digite seu email"), {
      target: { value: "a@b.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Enviar email" }))
    expect(await screen.findByText(/Muitas tentativas|Tente novamente/i)).toBeInTheDocument()
  })

  it("renders the reset-password modal when the URL carries a resetToken", () => {
    renderLogin("/login?resetToken=abc123")
    expect(screen.getByText("reset-modal:abc123")).toBeInTheDocument()
  })

  it("goes to /register, keeping the redirect param", () => {
    renderLogin("/login?redirect=/oratio/prayers")
    fireEvent.click(screen.getByText("Criar conta"))
    expect(navigateMock).toHaveBeenCalledWith("/register?redirect=%2Foratio%2Fprayers")
  })

  it("always shows the fixed Google hint text, with no error on screen", () => {
    renderLogin()
    expect(
      screen.getByText("Já entrou com Google antes? Experimente o botão Entrar com Google."),
    ).toBeInTheDocument()
    expect(screen.queryByText(/incorret/i)).not.toBeInTheDocument()
  })

  it("signs in with a Google credential and navigates to the destination", async () => {
    loginWithGoogleMock.mockResolvedValue({})
    renderLogin("/login?redirect=/oratio/vox")

    fireEvent.click(screen.getByText("google-signin"))

    await waitFor(() =>
      expect(loginWithGoogleMock).toHaveBeenCalledWith("fake-google-credential"),
    )
    expect(navigateMock).toHaveBeenCalledWith("/oratio/vox")
  })

  it("shows a friendly error and does not navigate when the Google sign-in fails", async () => {
    loginWithGoogleMock.mockRejectedValue({
      response: { status: 401, data: { message: "Seu e-mail no Google não está verificado. ..." } },
    })
    renderLogin()

    fireEvent.click(screen.getByText("google-signin"))

    expect(await screen.findByText(/e-mail no Google não está verificado/i)).toBeInTheDocument()
    expect(navigateMock).not.toHaveBeenCalled()
  })

})
