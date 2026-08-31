import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import ForgotPasswordModal from "./ForgotPasswordModal"

describe("ForgotPasswordModal", () => {

  it("renders nothing when closed", () => {
    const { container } = render(
      <ForgotPasswordModal open={false} onClose={vi.fn()} onSubmit={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("does not submit an empty email", () => {
    const onSubmit = vi.fn()
    render(<ForgotPasswordModal open onClose={vi.fn()} onSubmit={onSubmit} />)
    fireEvent.click(screen.getByRole("button", { name: "Enviar email" }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("submits the typed email", () => {
    const onSubmit = vi.fn()
    render(<ForgotPasswordModal open onClose={vi.fn()} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByPlaceholderText("Digite seu email"), {
      target: { value: "a@b.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Enviar email" }))
    expect(onSubmit).toHaveBeenCalledWith("a@b.com")
  })

  it("closes on cancel", () => {
    const onClose = vi.fn()
    render(<ForgotPasswordModal open onClose={onClose} onSubmit={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    expect(onClose).toHaveBeenCalled()
  })

})
