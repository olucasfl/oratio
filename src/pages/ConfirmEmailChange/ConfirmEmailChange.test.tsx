import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/authService", () => ({ confirmEmailChange: vi.fn() }))

import { confirmEmailChange } from "../../services/authService"
import ConfirmEmailChange from "./ConfirmEmailChange"

const confirmEmailChangeMock = confirmEmailChange as unknown as ReturnType<typeof vi.fn>

function renderPage(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><ConfirmEmailChange /></MemoryRouter>)
}

beforeEach(() => vi.clearAllMocks())

describe("ConfirmEmailChange", () => {

  it("errors when there is no token", () => {
    renderPage("/confirmar-troca-email")
    expect(screen.getByText(/nenhum token de confirmação/)).toBeInTheDocument()
    expect(confirmEmailChangeMock).not.toHaveBeenCalled()
  })

  it("confirms the new email on success", async () => {
    confirmEmailChangeMock.mockResolvedValue({ email: "novo@x.com" })
    renderPage("/confirmar-troca-email?token=abc")
    expect(await screen.findByText("novo@x.com")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Ir para o login" }))
    expect(navigateMock).toHaveBeenCalledWith("/login")
  })

  it("shows the translated error for an invalid token", async () => {
    confirmEmailChangeMock.mockRejectedValue({ response: { data: { message: "Invalid confirmation token" } } })
    renderPage("/confirmar-troca-email?token=bad")
    expect(await screen.findByText("Esse link não é mais válido.")).toBeInTheDocument()
  })

})
