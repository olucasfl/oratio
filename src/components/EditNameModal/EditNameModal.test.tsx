import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/profileService", () => ({ updateName: vi.fn() }))

import { updateName } from "../../services/profileService"
import EditNameModal from "./EditNameModal"

const updateNameMock = updateName as unknown as ReturnType<typeof vi.fn>

beforeEach(() => vi.clearAllMocks())

describe("EditNameModal", () => {

  it("renders nothing when closed", () => {
    const { container } = render(
      <EditNameModal open={false} name="Maria" onClose={vi.fn()} onSaved={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("pre-fills the field with the current name", () => {
    render(<EditNameModal open name="Maria" onClose={vi.fn()} onSaved={vi.fn()} />)
    expect(screen.getByPlaceholderText("Seu nome")).toHaveValue("Maria")
  })

  it("rejects a name shorter than 2 characters without calling the service", () => {
    render(<EditNameModal open name="Maria" onClose={vi.fn()} onSaved={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { value: "A" } })
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }))
    expect(screen.getByText("O nome deve ter entre 2 e 80 caracteres.")).toBeInTheDocument()
    expect(updateNameMock).not.toHaveBeenCalled()
  })

  it("saves the trimmed name, notifies the parent, and closes the modal", async () => {
    updateNameMock.mockResolvedValue({ id: "u1", name: "Maria Nova" })
    const onSaved = vi.fn()
    const onClose = vi.fn()

    render(<EditNameModal open name="Maria" onClose={onClose} onSaved={onSaved} />)
    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { value: "  Maria Nova  " } })
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }))

    await waitFor(() => expect(updateNameMock).toHaveBeenCalledWith("Maria Nova"))
    expect(onSaved).toHaveBeenCalledWith("Maria Nova")
    expect(onClose).toHaveBeenCalled()
  })

  it("shows an error and keeps the modal open when the save fails", async () => {
    updateNameMock.mockRejectedValue({ response: { status: 500, data: {} } })
    const onClose = vi.fn()

    render(<EditNameModal open name="Maria" onClose={onClose} onSaved={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }))

    expect(await screen.findByText("Não foi possível salvar o nome. Tente novamente.")).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

})
