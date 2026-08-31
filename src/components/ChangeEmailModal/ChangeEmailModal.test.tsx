import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/profileService", () => ({ requestEmailChange: vi.fn() }))

import { requestEmailChange } from "../../services/profileService"
import ChangeEmailModal from "./ChangeEmailModal"

const requestEmailChangeMock = requestEmailChange as unknown as ReturnType<typeof vi.fn>

beforeEach(() => vi.clearAllMocks())

describe("ChangeEmailModal", () => {

  it("renders nothing when closed", () => {
    const { container } = render(
      <ChangeEmailModal open={false} onClose={vi.fn()} onRequested={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("requires an email address", () => {
    render(<ChangeEmailModal open onClose={vi.fn()} onRequested={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: "Enviar confirmação" }))
    expect(screen.getByText("Digite o novo email.")).toBeInTheDocument()
    expect(requestEmailChangeMock).not.toHaveBeenCalled()
  })

  it("reports the pending email on success", async () => {
    const onRequested = vi.fn()
    requestEmailChangeMock.mockResolvedValue({ pendingEmail: "novo@x.com" })
    render(<ChangeEmailModal open onClose={vi.fn()} onRequested={onRequested} />)
    fireEvent.change(screen.getByPlaceholderText("Novo email"), { target: { value: "novo@x.com" } })
    fireEvent.click(screen.getByRole("button", { name: "Enviar confirmação" }))
    await waitFor(() => expect(onRequested).toHaveBeenCalledWith("novo@x.com"))
  })

  it("shows the translated error when the email is already in use", async () => {
    requestEmailChangeMock.mockRejectedValue({ response: { data: { message: "Email already in use" } } })
    render(<ChangeEmailModal open onClose={vi.fn()} onRequested={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText("Novo email"), { target: { value: "taken@x.com" } })
    fireEvent.click(screen.getByRole("button", { name: "Enviar confirmação" }))
    expect(await screen.findByText("Esse email já está em uso por outra conta.")).toBeInTheDocument()
  })

})
