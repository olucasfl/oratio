import { render, screen, fireEvent, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../utils/auth", () => ({ isLoggedIn: vi.fn() }))
vi.mock("../GuestGateModal/GuestGateModal", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>guest-gate</div> : null),
}))
vi.mock("../ShareReadingButton/ShareReadingButton", () => ({
  default: ({ label }: { label: string }) => <div>share:{label}</div>,
}))

import { isLoggedIn } from "../../utils/auth"
import LiturgyReadingButtons, { formatVerses } from "./LiturgyReadingButtons"

const isLoggedInMock = isLoggedIn as unknown as ReturnType<typeof vi.fn>

const LITURGY = {
  leituras: {
    primeiraLeitura: [{ titulo: "Primeira Leitura", referencia: "Gn 1", texto: "No princípio..." }],
    salmo: [{ referencia: "Sl 22", texto: "O Senhor é meu pastor", refrao: "O Senhor é meu pastor" }],
    evangelho: [{ titulo: "Evangelho", referencia: "Jo 1", texto: "E o Verbo se fez carne" }],
    segundaLeitura: [],
    extras: [],
  },
} as never

function renderButtons(liturgy: unknown = LITURGY, path = "/oratio/home") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LiturgyReadingButtons liturgy={liturgy as never} />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  isLoggedInMock.mockReturnValue(true)
})

describe("formatVerses", () => {
  it("keeps API markup as inert text", () => {
    const { container } = render(<div>{formatVerses('<b>x</b>')}</div>)
    expect(container.querySelector("b")).toBeNull()
    expect(container.textContent).toBe("<b>x</b>")
  })
})

describe("LiturgyReadingButtons", () => {

  it("renders nothing without a liturgy", () => {
    const { container } = renderButtons(null)
    expect(container).toBeEmptyDOMElement()
  })

  it("shows the reading cards with their references", () => {
    renderButtons()
    expect(screen.getByText("Gn 1")).toBeInTheDocument()
    expect(screen.getByText("Sl 22")).toBeInTheDocument()
    expect(screen.getByText("— só domingos")).toBeInTheDocument()
  })

  it("opens a single reading straight into the modal", () => {
    renderButtons()
    fireEvent.click(screen.getByText("1ª Leitura"))
    expect(document.querySelector('[class*=modalText]')?.textContent).toContain("No princípio")
  })

  it("shows the priest/assembly response for the gospel", () => {
    renderButtons()
    fireEvent.click(screen.getByText("Evangelho"))
    expect(screen.getByText("Glória a vós, Senhor.")).toBeInTheDocument()
  })

  it("tells the user when a reading is missing for the day", () => {
    renderButtons({ leituras: { primeiraLeitura: [], salmo: [], evangelho: [], segundaLeitura: [], extras: [] } })
    fireEvent.click(screen.getByText("Salmo"))
    expect(document.querySelector('[class*=modalText]')?.textContent).toContain("Hoje não há leitura")
  })

  it("gates the full-mass link for guests and navigates for members", () => {
    isLoggedInMock.mockReturnValue(false)
    renderButtons()
    fireEvent.click(screen.getByRole("button", { name: /Ler a Missa completa/ }))
    expect(screen.getByText("guest-gate")).toBeInTheDocument()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it("navigates to the full mass for a logged-in user", () => {
    renderButtons()
    fireEvent.click(screen.getByRole("button", { name: /Ler a Missa completa/ }))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/liturgia-completa")
  })

  it("auto-opens the reading named in ?leitura=", () => {
    renderButtons(LITURGY, "/oratio/home?leitura=evangelho")
    expect(document.querySelector('[class*=modalText]')?.textContent).toContain("Verbo se fez carne")
  })

  it("offers a picker when a reading has multiple options", async () => {
    renderButtons({
      leituras: {
        primeiraLeitura: [
          { titulo: "Opção A", referencia: "Is 1", texto: "texto a" },
          { titulo: "Opção B", referencia: "Jr 2", texto: "texto b" },
        ],
        salmo: [], evangelho: [], segundaLeitura: [], extras: [],
      },
    })
    fireEvent.click(screen.getByText("1ª Leitura"))
    const picker = screen.getByText("Escolha a leitura").closest("div")!
    fireEvent.click(within(picker).getByText("Opção B"))
    await screen.findByText("Jr 2"); expect(document.querySelector('[class*=modalText]')?.textContent).toContain("texto b")
  })

})
