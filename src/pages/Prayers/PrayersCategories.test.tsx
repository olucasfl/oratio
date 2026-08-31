import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/prayersService", () => ({ getPrayerCategories: vi.fn() }))
vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))

import { getPrayerCategories } from "../../services/prayersService"
import PrayersCategories from "./PrayersCategories"

const getPrayerCategoriesMock = getPrayerCategories as unknown as ReturnType<typeof vi.fn>

function renderPage() {
  return render(<MemoryRouter><PrayersCategories /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  getPrayerCategoriesMock.mockResolvedValue([
    { id: "c1", name: "Orações de Cura", slug: "cura" },
    { id: "c2", name: "Terços", slug: "tercos" },
  ])
})

describe("PrayersCategories", () => {

  it("shows skeletons while loading", () => {
    getPrayerCategoriesMock.mockReturnValue(new Promise(() => {}))
    const { container } = renderPage()
    expect(container.querySelector(".skeleton")).toBeInTheDocument()
  })

  it("lists the categories once loaded", async () => {
    renderPage()
    expect(await screen.findByText("Orações de Cura")).toBeInTheDocument()
    expect(screen.getByText("Terços")).toBeInTheDocument()
  })

  it("shows an empty state when there are no categories", async () => {
    getPrayerCategoriesMock.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText("Nenhuma categoria disponível.")).toBeInTheDocument()
  })

  it("routes a normal category to its prayer list", async () => {
    renderPage()
    fireEvent.click(await screen.findByText("Orações de Cura"))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/prayers/cura")
  })

  it("routes the 'tercos' category straight to the rosary hub", async () => {
    renderPage()
    fireEvent.click(await screen.findByText("Terços"))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/rosary")
  })

})
