import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/prayersService", () => ({ getPrayersByCategory: vi.fn() }))
vi.mock("../../components/BottomNavbar/BottomNavbar", () => ({ default: () => null }))

import { getPrayersByCategory } from "../../services/prayersService"
import CategoryPrayers from "./CategoryPrayers"

const getPrayersByCategoryMock = getPrayersByCategory as unknown as ReturnType<typeof vi.fn>

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/oratio/prayers/cura"]}>
      <Routes>
        <Route path="/oratio/prayers/:slug" element={<CategoryPrayers />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  getPrayersByCategoryMock.mockResolvedValue([
    { id: "p1", title: "Oração pela Cura" },
    { id: "p2", title: "Salmo 90" },
  ])
})

describe("CategoryPrayers", () => {

  it("lists the prayers in the category", async () => {
    renderPage()
    expect(await screen.findByText("Oração pela Cura")).toBeInTheDocument()
    expect(screen.getByText("Salmo 90")).toBeInTheDocument()
  })

  it("filters by an accent-insensitive search", async () => {
    renderPage()
    await screen.findByText("Oração pela Cura")
    fireEvent.change(screen.getByPlaceholderText("Pesquisar oração..."), { target: { value: "salmo" } })
    expect(screen.getByText("Salmo 90")).toBeInTheDocument()
    expect(screen.queryByText("Oração pela Cura")).not.toBeInTheDocument()
  })

  it("shows an empty state when nothing matches", async () => {
    renderPage()
    await screen.findByText("Oração pela Cura")
    fireEvent.change(screen.getByPlaceholderText("Pesquisar oração..."), { target: { value: "zzz" } })
    expect(screen.getByText("Nenhuma oração encontrada.")).toBeInTheDocument()
  })

  it("opens a prayer on click", async () => {
    renderPage()
    fireEvent.click(await screen.findByText("Salmo 90"))
    expect(navigateMock).toHaveBeenCalledWith("/oratio/prayer/p2")
  })

})
