import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

import VoxProfileDetailsModal from "./VoxProfileDetailsModal"

const PROFILE = {
  key: "STUDY",
  label: "Profundo",
  short: "Estudo a fundo.",
  details: "- usa seções\n- traz Escritura e Catecismo",
  examples: [{ question: "Por que confessar a um padre?", answer: "# A confissão\n\nÉ um sacramento." }],
}

describe("VoxProfileDetailsModal", () => {
  it("renders nothing when no profile is given", () => {
    const { container } = render(<VoxProfileDetailsModal profile={null} onClose={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("shows the label, the details and the example", () => {
    render(<VoxProfileDetailsModal profile={PROFILE} onClose={vi.fn()} />)

    expect(screen.getByRole("dialog", { name: "Perfil Profundo" })).toBeInTheDocument()
    expect(screen.getByText("traz Escritura e Catecismo")).toBeInTheDocument()
    expect(screen.getByText("Por que confessar a um padre?")).toBeInTheDocument()
    expect(screen.getByText("É um sacramento.")).toBeInTheDocument()
  })

  it("falls back to the short description when details are empty", () => {
    render(
      <VoxProfileDetailsModal
        profile={{ ...PROFILE, details: "", examples: [] }}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText("Estudo a fundo.")).toBeInTheDocument()
    expect(screen.queryByText("Exemplo")).not.toBeInTheDocument()
  })

  it("closes on the X button and on Escape", () => {
    const onClose = vi.fn()
    render(<VoxProfileDetailsModal profile={PROFILE} onClose={onClose} />)

    fireEvent.click(screen.getByRole("button", { name: "Fechar" }))
    fireEvent.keyDown(document, { key: "Escape" })
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
