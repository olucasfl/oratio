import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import AdminFilterSheet from "./AdminFilterSheet"

function baseProps() {
  return {
    open: true,
    onClose: vi.fn(),
    usersLoading: false,
    filterRole: "all" as const,
    setFilterRole: vi.fn(),
    filterVerif: "all" as const,
    setFilterVerif: vi.fn(),
    filterActive: "all" as const,
    setFilterActive: vi.fn(),
    onClear: vi.fn(),
    activeCount: 0,
  }
}

describe("AdminFilterSheet", () => {

  it("renders nothing when closed", () => {
    render(<AdminFilterSheet {...baseProps()} open={false} />)
    expect(screen.queryByText("Filtros")).not.toBeInTheDocument()
  })

  it("calls the matching setter for each filter group when a chip is clicked", () => {
    const props = baseProps()
    render(<AdminFilterSheet {...props} />)

    fireEvent.click(screen.getByText("Admin"))
    expect(props.setFilterRole).toHaveBeenCalledWith("admin")

    fireEvent.click(screen.getByText("Verificados"))
    expect(props.setFilterVerif).toHaveBeenCalledWith("verified")

    fireEvent.click(screen.getByText("7 dias"))
    expect(props.setFilterActive).toHaveBeenCalledWith("7d")
  })

  it("disables 'Limpar filtros' when no filter is active", () => {
    render(<AdminFilterSheet {...baseProps()} activeCount={0} />)
    expect(screen.getByText("Limpar filtros")).toBeDisabled()
  })

  it("enables 'Limpar filtros' and calls onClear when at least one filter is active", () => {
    const props = baseProps()
    render(<AdminFilterSheet {...props} activeCount={2} />)

    const clearBtn = screen.getByText("Limpar filtros")
    expect(clearBtn).not.toBeDisabled()

    fireEvent.click(clearBtn)
    expect(props.onClear).toHaveBeenCalledTimes(1)
  })

  it("'Ver resultados' and the close button both call onClose", () => {
    const props = baseProps()
    render(<AdminFilterSheet {...props} />)

    fireEvent.click(screen.getByText("Ver resultados"))
    expect(props.onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByLabelText("Fechar"))
    expect(props.onClose).toHaveBeenCalledTimes(2)
  })

  it("closes on backdrop click but not on sheet content click", () => {
    const props = baseProps()
    render(<AdminFilterSheet {...props} />)

    fireEvent.click(screen.getByText("Cargo"))
    expect(props.onClose).not.toHaveBeenCalled()
  })

})
