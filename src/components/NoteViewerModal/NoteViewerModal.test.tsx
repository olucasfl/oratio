import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import NoteViewerModal from "./NoteViewerModal"

describe("NoteViewerModal", () => {

  it("renders nothing when closed", () => {
    const { container } = render(
      <NoteViewerModal open={false} reference="João 3,16" note="x" onClose={() => {}} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("shows the full note and the reference", () => {
    const long = "linha ".repeat(600)
    render(
      <NoteViewerModal open reference="João 3,16" note={long} onClose={() => {}} />,
    )
    expect(screen.getByText("João 3,16")).toBeInTheDocument()
    expect(screen.getByText(/linha linha/)).toBeInTheDocument()
  })

  it("closes on the X button", () => {
    const onClose = vi.fn()
    render(<NoteViewerModal open reference="Salmos 23,1" note="oi" onClose={onClose} />)
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }))
    expect(onClose).toHaveBeenCalled()
  })
})
