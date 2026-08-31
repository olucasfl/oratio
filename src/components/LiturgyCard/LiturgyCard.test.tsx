import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../LiturgyReadingButtons/LiturgyReadingButtons", () => ({ default: () => <div>reading-buttons</div> }))
vi.mock("../SaintOfDayCard/SaintOfDayCard", () => ({ default: () => <div>saint-card</div> }))

import LiturgyCard from "./LiturgyCard"

const baseProps = {
  liturgy: { liturgia: "São Bento, abade", cor: "branco" } as never,
  loadingLiturgy: false,
  liturgyError: null as string | null,
  dateOffset: 0,
  setDateOffset: vi.fn(),
  displayDateLabel: "Hoje",
}

beforeEach(() => vi.clearAllMocks())

describe("LiturgyCard", () => {

  it("renders the celebration name, grade and liturgical colour", () => {
    render(<LiturgyCard {...baseProps} />)
    expect(screen.getByText("São Bento, abade")).toBeInTheDocument()
    expect(screen.getByText("Tempo litúrgico · Branco")).toBeInTheDocument()
    expect(screen.getByText("reading-buttons")).toBeInTheDocument()
    expect(screen.getByText("saint-card")).toBeInTheDocument()
  })

  it("steps the day backwards and forwards", () => {
    const setDateOffset = vi.fn()
    render(<LiturgyCard {...baseProps} setDateOffset={setDateOffset} />)
    fireEvent.click(screen.getByRole("button", { name: "Dia anterior" }))
    fireEvent.click(screen.getByRole("button", { name: "Próximo dia" }))
    expect(setDateOffset).toHaveBeenCalledTimes(2)
  })

  it("disables the forward arrow at the +2 day limit", () => {
    render(<LiturgyCard {...baseProps} dateOffset={2} />)
    expect(screen.getByRole("button", { name: "Próximo dia" })).toBeDisabled()
  })

  it("offers a 'back to today' shortcut when viewing another day", () => {
    const setDateOffset = vi.fn()
    render(<LiturgyCard {...baseProps} dateOffset={-1} setDateOffset={setDateOffset} />)
    fireEvent.click(screen.getByRole("button", { name: "Voltar para hoje" }))
    expect(setDateOffset).toHaveBeenCalledWith(0)
  })

  it("shows the loading and error hints while there is no liturgy yet", () => {
    const { rerender } = render(
      <LiturgyCard {...baseProps} liturgy={null} loadingLiturgy />,
    )
    expect(screen.getByText("Carregando liturgia...")).toBeInTheDocument()

    rerender(<LiturgyCard {...baseProps} liturgy={null} liturgyError="Falha" />)
    expect(screen.getByText("Falha")).toBeInTheDocument()
  })

})
