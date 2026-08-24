import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import AdminChart from "./AdminChart"

const DATA = [
  { period: "2026-01", label: "Jan", count: 10 },
  { period: "2026-02", label: "Fev", count: 25 },
  { period: "2026-03", label: "Mar", count: 20 },
]

describe("AdminChart", () => {

  it("renders nothing when there is no data", () => {
    const { container } = render(<AdminChart data={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("selects the last point by default", () => {
    render(<AdminChart data={DATA} />)
    expect(screen.getByText("Mar", { selector: "strong" })).toBeInTheDocument()
    expect(screen.getByText("20")).toBeInTheDocument()
    expect(screen.getByLabelText("Mar: 20")).toHaveAttribute("aria-pressed", "true")
  })

  it("shows the delta vs. the previous point for the default (last) selection", () => {
    render(<AdminChart data={DATA} />)
    // Mar (20) vs Fev (25) => -5
    expect(screen.getByText(/-5 vs\. Fev/)).toBeInTheDocument()
  })

  it("shows no delta when the very first point is selected", () => {
    render(<AdminChart data={DATA} />)
    fireEvent.click(screen.getByLabelText("Jan: 10"))

    expect(screen.getByText("10")).toBeInTheDocument()
    expect(screen.queryByText(/vs\./)).not.toBeInTheDocument()
  })

  it("shows a '+' prefixed delta when the count increased", () => {
    render(<AdminChart data={DATA} />)
    fireEvent.click(screen.getByLabelText("Fev: 25"))

    expect(screen.getByText(/\+15 vs\. Jan/)).toBeInTheDocument()
  })

  it("clicking a bar marks it as the pressed/selected one", () => {
    render(<AdminChart data={DATA} />)
    const janBtn = screen.getByLabelText("Jan: 10")

    fireEvent.click(janBtn)

    expect(janBtn).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByLabelText("Mar: 20")).toHaveAttribute("aria-pressed", "false")
  })

})
