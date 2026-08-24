import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import AdminHeatmap from "./AdminHeatmap"

function buildMatrix(): number[][] {
  // 7 dias x 24 horas, tudo zero exceto um pico em (dia 2 / hora 9)
  const matrix = Array.from({ length: 7 }, () => Array(24).fill(0))
  matrix[2][9] = 42
  matrix[4][18] = 10
  return matrix
}

describe("AdminHeatmap", () => {

  it("selects the peak cell (highest count) by default", () => {
    render(<AdminHeatmap matrix={buildMatrix()} maxCount={42} />)

    expect(screen.getByText("Ter · 9h")).toBeInTheDocument()
    expect(screen.getByText("42")).toBeInTheDocument()
  })

  it("clicking a different cell updates the selected detail", () => {
    render(<AdminHeatmap matrix={buildMatrix()} maxCount={42} />)

    fireEvent.click(screen.getByLabelText("Qui 18h: 10"))

    expect(screen.getByText("Qui · 18h")).toBeInTheDocument()
    expect(screen.getByText("10")).toBeInTheDocument()
  })

  it("only labels hour ticks at the fixed 3-hour marks, not every column", () => {
    render(<AdminHeatmap matrix={buildMatrix()} maxCount={42} />)

    expect(screen.getByText("0h")).toBeInTheDocument()
    expect(screen.getByText("9h")).toBeInTheDocument()
    expect(screen.queryByText("1h")).not.toBeInTheDocument()
    expect(screen.queryByText("10h")).not.toBeInTheDocument()
  })

  it("gives an empty (zero-count) cell no background style", () => {
    render(<AdminHeatmap matrix={buildMatrix()} maxCount={42} />)

    const emptyCell = screen.getByLabelText("Dom 0h: 0")
    expect(emptyCell.style.background).toBe("")
  })

  it("gives a nonzero cell a background whose alpha is clamped to at least 0.16", () => {
    const matrix = buildMatrix()
    matrix[1][5] = 1 // valor bem baixo relativo ao maxCount
    render(<AdminHeatmap matrix={matrix} maxCount={42} />)

    const cell = screen.getByLabelText("Seg 5h: 1")
    expect(cell.style.background).toBe("rgba(176, 24, 26, 0.16)")
  })

})
