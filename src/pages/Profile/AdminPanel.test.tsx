import { render, screen, fireEvent, waitFor, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/adminService", () => ({
  getAdminStats: vi.fn(),
  getAllUsers: vi.fn(),
  setAdminStatus: vi.fn(),
  getUserDetail: vi.fn(),
  deleteUser: vi.fn(),
  getUserActivity: vi.fn(),
  getAdminTimeseries: vi.fn(),
  getSystemHealth: vi.fn(),
  getSystemStatus: vi.fn(),
  getActivityHeatmap: vi.fn(),
}))

vi.mock("../../services/profileService", () => ({ getProfile: vi.fn() }))

// Filhos com cobertura própria — stub pra isolar a lógica do painel.
vi.mock("../../components/AdminChart/AdminChart", () => ({ default: () => <div>chart-stub</div> }))
vi.mock("../../components/AdminHeatmap/AdminHeatmap", () => ({ default: () => <div>heatmap-stub</div> }))
vi.mock("../../components/AdminNotifications/AdminNotifications", () => ({ default: () => <div>notif-stub</div> }))
vi.mock("../../components/AdminFilterSheet/AdminFilterSheet", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>filter-sheet</div> : null),
}))

import {
  getAdminStats, getAllUsers, setAdminStatus, getUserDetail,
  deleteUser, getUserActivity, getAdminTimeseries, getSystemHealth,
  getSystemStatus,
} from "../../services/adminService"
import { getProfile } from "../../services/profileService"
import AdminPanel from "./AdminPanel"

const m = {
  stats: getAdminStats as unknown as ReturnType<typeof vi.fn>,
  users: getAllUsers as unknown as ReturnType<typeof vi.fn>,
  setAdmin: setAdminStatus as unknown as ReturnType<typeof vi.fn>,
  detail: getUserDetail as unknown as ReturnType<typeof vi.fn>,
  del: deleteUser as unknown as ReturnType<typeof vi.fn>,
  activity: getUserActivity as unknown as ReturnType<typeof vi.fn>,
  timeseries: getAdminTimeseries as unknown as ReturnType<typeof vi.fn>,
  health: getSystemHealth as unknown as ReturnType<typeof vi.fn>,
  system: getSystemStatus as unknown as ReturnType<typeof vi.fn>,
  profile: getProfile as unknown as ReturnType<typeof vi.fn>,
}

const USER_A = {
  id: "a", name: "Alice", email: "alice@x.com", isAdmin: false, emailVerified: true,
  createdAt: "2025-06-01T00:00:00.000Z",
  spiritualStats: { prayerStreak: 3, prayersPrayed: 10, rosariesPrayed: 2 },
}
const USER_B = {
  id: "b", name: "Bob", email: "bob@x.com", isAdmin: true, emailVerified: false,
  createdAt: "2025-01-01T00:00:00.000Z",
  spiritualStats: { prayerStreak: 40, prayersPrayed: 1, rosariesPrayed: 99 },
}

const STATS = {
  totalUsers: 12, totalVerified: 9, prayersPrayed: 100, rosariesPrayed: 30,
  consecrationStarted: 4, consecrationCompleted: 1,
  thisWeek: { newUsers: 2, prayers: 5, rosaries: 1, logins: 20 },
}

function renderPanel() {
  return render(<MemoryRouter><AdminPanel /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  m.profile.mockResolvedValue({ id: "me" })
  m.stats.mockResolvedValue(STATS)
  m.users.mockResolvedValue([USER_A, USER_B])
  m.health.mockResolvedValue({ status: "OK", database: "up" })
  m.system.mockResolvedValue(null)
})

describe("AdminPanel", () => {

  it("shows a skeleton until the initial loads settle", async () => {
    m.stats.mockReturnValue(new Promise(() => {}))
    const { container } = renderPanel()
    expect(container.querySelector("header")).toBeInTheDocument()
    expect(screen.queryByText("Visão Geral")).not.toBeInTheDocument()
  })

  it("renders overview stats and the health pill once loaded", async () => {
    renderPanel()
    expect(await screen.findByRole("heading", { name: "Visão Geral" })).toBeInTheDocument()
    expect(screen.getByText("12")).toBeInTheDocument()
    expect(screen.getByText("Sistema operacional")).toBeInTheDocument()
    expect(screen.getByText("de 12 · 75%")).toBeInTheDocument()
  })

  it("flags the system as down when the health check fails", async () => {
    m.health.mockRejectedValue(new Error("no"))
    renderPanel()
    expect(await screen.findByText("Sistema indisponível")).toBeInTheDocument()
  })

  it("lists users on the Usuários tab with a result count", async () => {
    renderPanel()
    await screen.findByRole("heading", { name: "Visão Geral" })
    fireEvent.click(screen.getByRole("button", { name: "Usuários" }))
    expect(await screen.findByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("2 encontrados")).toBeInTheDocument()
  })

  it("debounces a search into a filtered getAllUsers call", async () => {
    renderPanel()
    await screen.findByRole("heading", { name: "Visão Geral" })
    fireEvent.click(screen.getByRole("button", { name: "Usuários" }))
    await screen.findByText("Alice")
    m.users.mockClear()

    fireEvent.change(screen.getByPlaceholderText("Buscar por nome ou e-mail…"), {
      target: { value: "ali" },
    })
    await waitFor(() =>
      expect(m.users).toHaveBeenCalledWith(expect.objectContaining({ search: "ali" })),
    )
  })

  it("loads the chart when switching to the Gráficos tab", async () => {
    m.timeseries.mockResolvedValue({ data: [{ label: "Jan", value: 1 }] })
    renderPanel()
    await screen.findByRole("heading", { name: "Visão Geral" })
    fireEvent.click(screen.getByRole("button", { name: "Gráficos" }))
    await waitFor(() => expect(m.timeseries).toHaveBeenCalled())
    expect(await screen.findByText("chart-stub")).toBeInTheDocument()
  })

  it("loads and renders system status on the Sistema tab", async () => {
    m.system.mockResolvedValue({
      database: "up", uptimeSeconds: 3700, nodeVersion: "v20", environment: "production",
      memory: { rssMB: 120, heapUsedMB: 50, heapTotalMB: 80 }, recentErrors: [],
    })
    renderPanel()
    await screen.findByRole("heading", { name: "Visão Geral" })
    fireEvent.click(screen.getByRole("button", { name: "Sistema" }))
    expect(await screen.findByText("Conectado")).toBeInTheDocument()
    expect(screen.getByText("Nenhum erro registrado desde o último deploy.")).toBeInTheDocument()
  })

  it("opens the detail modal with the user's activity", async () => {
    m.detail.mockResolvedValue({ ...USER_A })
    m.activity.mockResolvedValue({
      activities: [{ type: "PRAYER", action: "Rezou o terço", timestamp: new Date().toISOString() }],
    })
    renderPanel()
    await screen.findByRole("heading", { name: "Visão Geral" })
    fireEvent.click(screen.getByRole("button", { name: "Usuários" }))
    await screen.findByText("Alice")

    fireEvent.click(screen.getAllByTitle("Ver detalhes")[0])
    expect(await screen.findByText("Atividades recentes")).toBeInTheDocument()
    expect(screen.getByText("Rezou o terço")).toBeInTheDocument()
  })

  it("deletes a user through the confirmation modal", async () => {
    m.del.mockResolvedValue(undefined)
    renderPanel()
    await screen.findByRole("heading", { name: "Visão Geral" })
    fireEvent.click(screen.getByRole("button", { name: "Usuários" }))
    await screen.findByText("Bob")

    // Só usuários que não sejam o "eu" têm botão de deletar; nenhum aqui é "me".
    fireEvent.click(screen.getAllByTitle("Deletar")[0])
    const modal = (await screen.findByText("Deletar usuário?")).closest("div")!
    fireEvent.click(within(modal).getByRole("button", { name: "Deletar" }))
    await waitFor(() => expect(m.del).toHaveBeenCalledWith("a"))
    await waitFor(() => expect(screen.queryByText("Alice")).not.toBeInTheDocument())
  })

  it("requires the admin password before toggling a user's admin flag", async () => {
    m.setAdmin.mockResolvedValue(undefined)
    renderPanel()
    await screen.findByRole("heading", { name: "Visão Geral" })
    fireEvent.click(screen.getByRole("button", { name: "Usuários" }))
    await screen.findByText("Alice")

    fireEvent.click(screen.getAllByTitle("Tornar admin")[0])
    const input = await screen.findByPlaceholderText("Senha admin")
    fireEvent.change(input, { target: { value: "s3cret" } })
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }))
    await waitFor(() => expect(m.setAdmin).toHaveBeenCalledWith("a", true, "s3cret"))
  })

  it("shows an error box when loading users fails", async () => {
    renderPanel()
    await screen.findByRole("heading", { name: "Visão Geral" })
    m.users.mockRejectedValueOnce({ response: { data: { message: "sem permissão" } } })
    fireEvent.click(screen.getByRole("button", { name: "Usuários" }))
    expect(await screen.findByText("sem permissão")).toBeInTheDocument()
  })

  it("clears filters from the empty state when nothing matches", async () => {
    renderPanel()
    await screen.findByRole("heading", { name: "Visão Geral" })
    fireEvent.click(screen.getByRole("button", { name: "Usuários" }))
    await screen.findByText("Alice")

    m.users.mockResolvedValue([])
    fireEvent.change(screen.getByPlaceholderText("Buscar por nome ou e-mail…"), {
      target: { value: "zzz" },
    })
    const empty = await screen.findByText("Nenhum resultado com esses filtros.")
    expect(empty).toBeInTheDocument()

    m.users.mockResolvedValue([USER_A, USER_B])
    fireEvent.click(screen.getByRole("button", { name: /Limpar filtros/ }))
    expect(await screen.findByText("Alice")).toBeInTheDocument()
  })

  it("sorts users by name when the Nome sort is toggled", async () => {
    m.users.mockResolvedValue([USER_B, USER_A])
    renderPanel()
    await screen.findByRole("heading", { name: "Visão Geral" })
    fireEvent.click(screen.getByRole("button", { name: "Usuários" }))
    await screen.findByText("Alice")

    fireEvent.click(screen.getByRole("button", { name: /Nome/ }))
    const names = screen.getAllByText(/Alice|Bob/).map(n => n.textContent)
    expect(names[0]).toContain("Bob") // desc: B antes de A
  })

})
