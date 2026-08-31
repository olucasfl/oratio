import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/prayersService", () => ({ getPrayer: vi.fn(), completePrayer: vi.fn() }))
vi.mock("../../utils/auth", () => ({ isLoggedIn: vi.fn() }))
vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))
vi.mock("../../components/ShareReadingButton/ShareReadingButton", () => ({ default: () => <div>share</div> }))
vi.mock("../../components/GuestGateModal/GuestGateModal", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>guest-gate</div> : null),
}))

import { getPrayer, completePrayer } from "../../services/prayersService"
import { isLoggedIn } from "../../utils/auth"
import Prayers from "./Prayers"

const getPrayerMock = getPrayer as unknown as ReturnType<typeof vi.fn>
const completePrayerMock = completePrayer as unknown as ReturnType<typeof vi.fn>
const isLoggedInMock = isLoggedIn as unknown as ReturnType<typeof vi.fn>

function renderPrayer(id = "p1") {
  return render(
    <MemoryRouter initialEntries={[`/oratio/prayer/${id}`]}>
      <Routes>
        <Route path="/oratio/prayer/:id" element={<Prayers />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  isLoggedInMock.mockReturnValue(true)
  getPrayerMock.mockResolvedValue({ title: "Ave-Maria", content: "Ave Maria cheia de graça" })
  completePrayerMock.mockResolvedValue(undefined)
})

describe("Prayers", () => {

  it("shows the skeleton while loading", () => {
    getPrayerMock.mockReturnValue(new Promise(() => {}))
    const { container } = renderPrayer()
    expect(container.querySelector(".skeleton")).toBeInTheDocument()
  })

  it("renders the prayer once loaded", async () => {
    renderPrayer()
    expect(await screen.findByText("Ave-Maria")).toBeInTheDocument()
    expect(screen.getByText("Ave Maria cheia de graça")).toBeInTheDocument()
  })

  it("shows a not-found state", async () => {
    getPrayerMock.mockRejectedValue(new Error("404"))
    renderPrayer()
    expect(await screen.findByText("Oração não encontrada")).toBeInTheDocument()
  })

  it("records completion for a logged-in user", async () => {
    renderPrayer()
    await screen.findByText("Ave-Maria")
    fireEvent.click(screen.getByRole("button", { name: /Concluir oração/ }))
    await waitFor(() => expect(completePrayerMock).toHaveBeenCalled())
    expect(navigateMock).toHaveBeenCalledWith("/oratio/prayers")
  })

  it("shows the guest gate instead of completing for anonymous users", async () => {
    isLoggedInMock.mockReturnValue(false)
    renderPrayer()
    await screen.findByText("Ave-Maria")
    fireEvent.click(screen.getByRole("button", { name: /Concluir oração/ }))
    expect(await screen.findByText("guest-gate")).toBeInTheDocument()
    expect(completePrayerMock).not.toHaveBeenCalled()
  })

})
