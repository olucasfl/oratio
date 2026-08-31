import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("../../services/api", () => ({ default: { post: vi.fn() } }))

import api from "../../services/api"
import ResetPasswordModal from "./ResetPasswordModal"

const postMock = (api as unknown as { post: ReturnType<typeof vi.fn> }).post

const origLocation = window.location

beforeEach(() => {
  vi.clearAllMocks()
  Object.defineProperty(window, "location", { writable: true, value: { href: "" } })
})

afterEach(() => {
  Object.defineProperty(window, "location", { writable: true, value: origLocation })
})

function fill(pw: string, confirm: string) {
  fireEvent.change(screen.getByPlaceholderText("Nova senha"), { target: { value: pw } })
  fireEvent.change(screen.getByPlaceholderText("Confirmar senha"), { target: { value: confirm } })
}

describe("ResetPasswordModal", () => {

  it("requires both fields to be filled", () => {
    render(<ResetPasswordModal token="t1" />)
    fireEvent.click(screen.getByRole("button", { name: "Atualizar senha" }))
    expect(screen.getByText("Preencha todos os campos")).toBeInTheDocument()
    expect(postMock).not.toHaveBeenCalled()
  })

  it("rejects mismatched passwords", () => {
    render(<ResetPasswordModal token="t1" />)
    fill("abc12345", "different")
    fireEvent.click(screen.getByRole("button", { name: "Atualizar senha" }))
    expect(screen.getByText("Senhas não coincidem")).toBeInTheDocument()
    expect(postMock).not.toHaveBeenCalled()
  })

  it("posts the new password and redirects to /login after the success alert", async () => {
    postMock.mockResolvedValue({})
    render(<ResetPasswordModal token="t1" />)
    fill("abc12345", "abc12345")
    fireEvent.click(screen.getByRole("button", { name: "Atualizar senha" }))

    await waitFor(() =>
      expect(postMock).toHaveBeenCalledWith("/auth/reset-password", { token: "t1", password: "abc12345" }),
    )
    expect(await screen.findByText("Senha alterada com sucesso!")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "OK" }))
    expect(window.location.href).toBe("/login")
  })

  it("shows the server error message and does not redirect", async () => {
    postMock.mockRejectedValue({ response: { data: { message: "Invalid or expired token" } } })
    render(<ResetPasswordModal token="t1" />)
    fill("abc12345", "abc12345")
    fireEvent.click(screen.getByRole("button", { name: "Atualizar senha" }))

    expect(await screen.findByText("Esse link de redefinição de senha expirou. Peça um novo.")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "OK" }))
    expect(window.location.href).toBe("")
  })

})
