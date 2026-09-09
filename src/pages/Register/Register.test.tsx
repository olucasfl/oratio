import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/authService", () => ({
  register: vi.fn(),
  loginWithGoogle: vi.fn(),
  discardGoogleSession: vi.fn(),
}))

vi.mock("../../services/api", () => ({ persistSession: vi.fn() }))

// O modal de verificação faz polling contra a API — stub aqui.
vi.mock("../../components/VerifyEmailModal/VerifyEmailModal", () => ({
  default: ({ open, email }: { open: boolean; email: string }) =>
    open ? <div>verify-modal:{email}</div> : null,
}))

vi.mock("../../components/GoogleSignInButton/GoogleSignInButton", () => ({
  default: ({ onCredential, disabled }: { onCredential: (c: string) => void; disabled?: boolean }) => (
    <button disabled={disabled} onClick={() => onCredential("fake-google-credential")}>
      google-signin
    </button>
  ),
}))

import { register, loginWithGoogle, discardGoogleSession } from "../../services/authService"
import { persistSession } from "../../services/api"
import Register from "./Register"

const registerMock = register as unknown as ReturnType<typeof vi.fn>
const loginWithGoogleMock = loginWithGoogle as unknown as ReturnType<typeof vi.fn>
const discardGoogleSessionMock = discardGoogleSession as unknown as ReturnType<typeof vi.fn>
const persistSessionMock = persistSession as unknown as ReturnType<typeof vi.fn>

const NEW_USER = { access_token: "a", refresh_token: "r", isNewUser: true, googleLinkedNow: false }
const EXISTING = { access_token: "a", refresh_token: "r", isNewUser: false, googleLinkedNow: false }
const AUTO_LINKED = { access_token: "a", refresh_token: "r", isNewUser: false, googleLinkedNow: true }

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

  it("signs up a NEW account with Google and goes straight to home (no verify step)", async () => {
    loginWithGoogleMock.mockResolvedValue(NEW_USER)
    renderRegister("/register?redirect=/oratio/biblia")

    fireEvent.click(screen.getByText("google-signin"))

    await waitFor(() =>
      expect(loginWithGoogleMock).toHaveBeenCalledWith("fake-google-credential"),
    )
    expect(persistSessionMock).toHaveBeenCalledWith("a", "r")
    expect(discardGoogleSessionMock).not.toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith("/oratio/biblia")
    expect(screen.queryByText(/verify-modal/)).not.toBeInTheDocument()
  })

  it("E3 — an EXISTING account via /register: discards the session and routes to login", async () => {
    loginWithGoogleMock.mockResolvedValue(EXISTING)
    renderRegister("/register?redirect=/oratio/biblia")

    fireEvent.click(screen.getByText("google-signin"))

    // sessão órfã revogada, tokens NÃO adotados
    await waitFor(() => expect(discardGoogleSessionMock).toHaveBeenCalledWith("r"))
    expect(persistSessionMock).not.toHaveBeenCalled()

    // aviso + caminho pro login
    expect(
      await screen.findByText("Você já tem conta no Oratio. Entre pela tela de login."),
    ).toBeInTheDocument()
    expect(navigateMock).not.toHaveBeenCalledWith("/oratio/biblia")

    fireEvent.click(screen.getByRole("button", { name: "OK" }))
    expect(navigateMock).toHaveBeenCalledWith("/login?redirect=%2Foratio%2Fbiblia")
  })

  it("E3+E4 — auto-link via /register: tells the user it linked, then routes to login", async () => {
    loginWithGoogleMock.mockResolvedValue(AUTO_LINKED)
    renderRegister()

    fireEvent.click(screen.getByText("google-signin"))

    await waitFor(() => expect(discardGoogleSessionMock).toHaveBeenCalledWith("r"))
    expect(persistSessionMock).not.toHaveBeenCalled()
    expect(
      await screen.findByText(/Conectamos sua conta Google à sua conta Oratio/i),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "OK" }))
    expect(navigateMock).toHaveBeenCalledWith("/login")
  })

  it("shows an alert when the Google sign-up fails", async () => {
    loginWithGoogleMock.mockRejectedValue({ response: { status: 503 } })
    renderRegister()

    fireEvent.click(screen.getByText("google-signin"))

    expect(await screen.findByText(/Não foi possível entrar com o Google/i)).toBeInTheDocument()
  })

})
