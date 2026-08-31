import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/authService", () => ({ verifyEmail: vi.fn() }))

import { verifyEmail } from "../../services/authService"
import VerifyEmail from "./VerifyEmail"

const verifyEmailMock = verifyEmail as unknown as ReturnType<typeof vi.fn>

function renderPage(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><VerifyEmail /></MemoryRouter>)
}

beforeEach(() => vi.clearAllMocks())

describe("VerifyEmail", () => {

  it("errors immediately when the URL has no token", () => {
    renderPage("/verificar-email")
    expect(screen.getByText(/nenhum token de verificação/)).toBeInTheDocument()
    expect(verifyEmailMock).not.toHaveBeenCalled()
  })

  it("confirms the email and offers the login button", async () => {
    verifyEmailMock.mockResolvedValue(undefined)
    renderPage("/verificar-email?token=abc")
    expect(await screen.findByText(/Email confirmado com sucesso/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Ir para o login" }))
    expect(navigateMock).toHaveBeenCalledWith("/login")
  })

  it("shows the translated error for an expired token", async () => {
    verifyEmailMock.mockRejectedValue({ response: { data: { message: "Verification token expired" } } })
    renderPage("/verificar-email?token=old")
    expect(await screen.findByText("Esse link expirou. Peça um novo email de verificação.")).toBeInTheDocument()
  })

  it("only calls verifyEmail once", async () => {
    verifyEmailMock.mockResolvedValue(undefined)
    renderPage("/verificar-email?token=abc")
    await waitFor(() => expect(verifyEmailMock).toHaveBeenCalledTimes(1))
  })

})
