import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import PromptModal from "./PromptModal"

function setup(props: Partial<Parameters<typeof PromptModal>[0]> = {}) {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  render(
    <PromptModal
      open
      title="Nova coleção"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  )
  return { onConfirm, onCancel }
}

describe("PromptModal", () => {

  it("renders nothing when closed", () => {
    const { container } = render(
      <PromptModal open={false} title="x" onConfirm={() => {}} onCancel={() => {}} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("disables confirm until there is non-blank text", () => {
    setup()
    const confirm = screen.getByRole("button", { name: "Salvar" })
    expect(confirm).toBeDisabled()

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "   " } })
    expect(confirm).toBeDisabled()

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Fé" } })
    expect(confirm).toBeEnabled()
  })

  it("confirms with the trimmed value", () => {
    const { onConfirm } = setup()
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "  Promessas  " } })
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }))
    expect(onConfirm).toHaveBeenCalledWith("Promessas")
  })

  it("submits on Enter and cancels on Escape", () => {
    const { onConfirm, onCancel } = setup()
    const input = screen.getByRole("textbox")

    fireEvent.change(input, { target: { value: "Esperança" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onConfirm).toHaveBeenCalledWith("Esperança")

    fireEvent.keyDown(input, { key: "Escape" })
    expect(onCancel).toHaveBeenCalled()
  })

  it("prefills the initial value (rename case)", () => {
    setup({ initialValue: "Antigo nome" })
    expect(screen.getByRole("textbox")).toHaveValue("Antigo nome")
  })
})
