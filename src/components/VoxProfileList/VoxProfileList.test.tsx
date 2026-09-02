import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

import VoxProfileList from "./VoxProfileList"

const PROFILES = [
  { key: "DEFAULT", label: "Padrão", short: "Equilibrado.", details: "", examples: [] },
  { key: "STUDY", label: "Profundo", short: "Estudo a fundo.", details: "", examples: [] },
]

describe("VoxProfileList", () => {
  it("marks the selected profile and calls onSelect on click", () => {
    const onSelect = vi.fn()
    render(
      <VoxProfileList
        profiles={PROFILES}
        selected="DEFAULT"
        onSelect={onSelect}
        onOpenDetails={vi.fn()}
      />,
    )

    const radios = screen.getAllByRole("radio")
    expect(radios[0]).toHaveAttribute("aria-checked", "true")
    expect(radios[1]).toHaveAttribute("aria-checked", "false")

    fireEvent.click(screen.getByText("Profundo"))
    expect(onSelect).toHaveBeenCalledWith("STUDY")
  })

  it("opens details without also selecting the card", () => {
    const onSelect = vi.fn()
    const onOpenDetails = vi.fn()
    render(
      <VoxProfileList
        profiles={PROFILES}
        selected="DEFAULT"
        onSelect={onSelect}
        onOpenDetails={onOpenDetails}
      />,
    )

    fireEvent.click(screen.getAllByRole("button", { name: "Ver em detalhes" })[1])
    expect(onOpenDetails).toHaveBeenCalledWith("STUDY")
    expect(onSelect).not.toHaveBeenCalled()
  })
})
