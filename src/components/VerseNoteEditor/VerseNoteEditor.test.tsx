import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import VerseNoteEditor from "./VerseNoteEditor"

function setup(props: Partial<Parameters<typeof VerseNoteEditor>[0]> = {}) {
  const onSave = vi.fn()
  const onDelete = vi.fn()
  const onClose = vi.fn()
  render(
    <VerseNoteEditor
      open
      reference="João 3,16"
      initialNote=""
      saving={false}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      {...props}
    />,
  )
  return { onSave, onDelete, onClose }
}

describe("VerseNoteEditor", () => {

  it("renders nothing when closed", () => {
    const { container } = render(
      <VerseNoteEditor
        open={false}
        reference="João 3,16"
        initialNote=""
        saving={false}
        onClose={() => {}}
        onSave={() => {}}
        onDelete={() => {}}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("keeps Save disabled until the text actually changes", () => {
    setup({ initialNote: "nota antiga" })
    const save = screen.getByRole("button", { name: "Salvar" })
    expect(save).toBeDisabled()

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "nota nova" } })
    expect(save).toBeEnabled()
  })

  it("saves the trimmed text", () => {
    const { onSave } = setup()
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "  refletir  " } })
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }))
    expect(onSave).toHaveBeenCalledWith("refletir")
  })

  it("only offers Delete when there is an existing note", () => {
    setup({ initialNote: "" })
    expect(screen.queryByRole("button", { name: /Excluir/ })).not.toBeInTheDocument()
  })

  it("offers Delete for an existing note", () => {
    const { onDelete } = setup({ initialNote: "algo" })
    fireEvent.click(screen.getByRole("button", { name: /Excluir/ }))
    expect(onDelete).toHaveBeenCalled()
  })
})
