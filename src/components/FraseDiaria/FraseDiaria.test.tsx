import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../hooks/useFraseDiaria", () => ({ useFraseDiaria: vi.fn() }))
vi.mock("../../utils/auth", () => ({ isLoggedIn: vi.fn() }))
vi.mock("../GuestGateModal/GuestGateModal", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>guest-gate</div> : null),
}))

import { useFraseDiaria } from "../../hooks/useFraseDiaria"
import { isLoggedIn } from "../../utils/auth"
import { FraseDiaria } from "./FraseDiaria"

const useFraseDiariaMock = useFraseDiaria as unknown as ReturnType<typeof vi.fn>
const isLoggedInMock = isLoggedIn as unknown as ReturnType<typeof vi.fn>

const FRASE = { texto: "Reze sempre", autor: "São Paulo", referencia: "1 Ts 5,17" }

beforeEach(() => {
  vi.clearAllMocks()
  isLoggedInMock.mockReturnValue(true)
})

describe("FraseDiaria", () => {

  it("renders nothing until there is a phrase", () => {
    useFraseDiariaMock.mockReturnValue({ frase: null, resgatada: false, resgatar: vi.fn() })
    const { container } = render(<FraseDiaria />)
    expect(container).toBeEmptyDOMElement()
  })

  it("opens the phrase and marks it retrieved on first open of the day", () => {
    const resgatar = vi.fn()
    useFraseDiariaMock.mockReturnValue({ frase: FRASE, resgatada: false, resgatar })
    render(<FraseDiaria />)
    fireEvent.click(screen.getByRole("button", { name: "Ver a frase do dia" }))
    expect(resgatar).toHaveBeenCalled()
    expect(screen.getByText("Reze sempre")).toBeInTheDocument()
    expect(screen.getByText("— São Paulo, 1 Ts 5,17")).toBeInTheDocument()
  })

  it("does not call resgatar again once retrieved", () => {
    const resgatar = vi.fn()
    useFraseDiariaMock.mockReturnValue({ frase: FRASE, resgatada: true, resgatar })
    render(<FraseDiaria />)
    fireEvent.click(screen.getByRole("button", { name: "Ver a frase do dia" }))
    expect(resgatar).not.toHaveBeenCalled()
  })

  it("shows the guest gate for anonymous visitors", () => {
    useFraseDiariaMock.mockReturnValue({ frase: FRASE, resgatada: false, resgatar: vi.fn() })
    isLoggedInMock.mockReturnValue(false)
    render(<FraseDiaria />)
    fireEvent.click(screen.getByRole("button", { name: "Ver a frase do dia" }))
    expect(screen.getByText("guest-gate")).toBeInTheDocument()
    expect(screen.queryByText("Reze sempre")).not.toBeInTheDocument()
  })

})
