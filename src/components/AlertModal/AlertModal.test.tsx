import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import AlertModal from "./AlertModal"

describe("AlertModal", () => {

  it("renders nothing when closed", () => {
    const { container } = render(<AlertModal open={false} message="oi" onClose={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("shows the title and message and closes on OK", () => {
    const onClose = vi.fn()
    render(<AlertModal open title="Erro" message="Algo falhou" onClose={onClose} />)
    expect(screen.getByText("Erro")).toBeInTheDocument()
    expect(screen.getByText("Algo falhou")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "OK" }))
    expect(onClose).toHaveBeenCalled()
  })

  it("defaults the title to 'Aviso'", () => {
    render(<AlertModal open message="x" onClose={vi.fn()} />)
    expect(screen.getByText("Aviso")).toBeInTheDocument()
  })

})
