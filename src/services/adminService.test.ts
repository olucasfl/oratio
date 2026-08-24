import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("./api", () => ({
  default: { get: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

import api from "./api"
import {
  getAdminStats,
  getAllUsers,
  setAdminStatus,
  getUserDetail,
  deleteUser,
  getUserActivity,
  getSystemHealth,
  getSystemStatus,
  getAdminTimeseries,
  getActivityHeatmap,
} from "./adminService"

const mockedApi = api as any // eslint-disable-line @typescript-eslint/no-explicit-any

describe("adminService", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockedApi.get.mockResolvedValue({ data: {} })
  })

  it("getAdminStats GETs the stats endpoint", async () => {
    mockedApi.get.mockResolvedValue({ data: { totalUsers: 10 } })
    const result = await getAdminStats()

    expect(mockedApi.get).toHaveBeenCalledWith("/users/admin/stats")
    expect(result).toEqual({ totalUsers: 10 })
  })

  /*
  getAllUsers() é o único ponto com lógica de verdade: monta a query
  string só com os filtros presentes. O detalhe que importa é usar
  `!== undefined` (não truthiness) -- um filtro booleano `false` (ex.:
  isAdmin=false, "só usuários normais") precisa continuar indo pra URL,
  não sumir como sumiria com `if(filters?.isAdmin)`.
  */
  describe("getAllUsers", () => {

    it("hits the base URL with no query string when no filters are given", async () => {
      await getAllUsers()
      expect(mockedApi.get).toHaveBeenCalledWith("/users/admin/users")
    })

    it("hits the base URL when an empty filters object is given", async () => {
      await getAllUsers({})
      expect(mockedApi.get).toHaveBeenCalledWith("/users/admin/users")
    })

    it("includes isAdmin=false explicitly, not omitting it as a falsy value", async () => {
      await getAllUsers({ isAdmin: false })
      expect(mockedApi.get).toHaveBeenCalledWith("/users/admin/users?isAdmin=false")
    })

    it("includes emailVerified=false explicitly", async () => {
      await getAllUsers({ emailVerified: false })
      expect(mockedApi.get).toHaveBeenCalledWith("/users/admin/users?emailVerified=false")
    })

    it("combines every filter into one query string", async () => {
      await getAllUsers({
        search: "ana",
        isAdmin: true,
        emailVerified: true,
        activeLastDays: 30,
      })

      const [url] = mockedApi.get.mock.calls[0]
      const query = new URLSearchParams(url.split("?")[1])
      expect(query.get("search")).toBe("ana")
      expect(query.get("isAdmin")).toBe("true")
      expect(query.get("emailVerified")).toBe("true")
      expect(query.get("activeLastDays")).toBe("30")
    })

  })

  it("setAdminStatus PATCHes isAdmin and the confirmation password", async () => {
    mockedApi.patch.mockResolvedValue({ data: { ok: true } })
    await setAdminStatus("u1", true, "adminpw")

    expect(mockedApi.patch).toHaveBeenCalledWith("/users/admin/users/u1", {
      isAdmin: true,
      adminPassword: "adminpw",
    })
  })

  it("getUserDetail GETs a single user by id", async () => {
    mockedApi.get.mockResolvedValue({ data: { id: "u1" } })
    const result = await getUserDetail("u1")

    expect(mockedApi.get).toHaveBeenCalledWith("/users/admin/users/u1")
    expect(result).toEqual({ id: "u1" })
  })

  it("deleteUser DELETEs a user by id", async () => {
    mockedApi.delete.mockResolvedValue({ data: { ok: true } })
    await deleteUser("u1")

    expect(mockedApi.delete).toHaveBeenCalledWith("/users/admin/users/u1")
  })

  it("getUserActivity GETs a user's activity log", async () => {
    mockedApi.get.mockResolvedValue({ data: [{ type: "LOGIN" }] })
    const result = await getUserActivity("u1")

    expect(mockedApi.get).toHaveBeenCalledWith("/users/admin/users/u1/activity")
    expect(result).toEqual([{ type: "LOGIN" }])
  })

  it("getSystemHealth GETs /health", async () => {
    mockedApi.get.mockResolvedValue({ data: { status: "OK" } })
    const result = await getSystemHealth()

    expect(mockedApi.get).toHaveBeenCalledWith("/health")
    expect(result).toEqual({ status: "OK" })
  })

  it("getSystemStatus GETs /admin/system", async () => {
    mockedApi.get.mockResolvedValue({ data: { uptime: 123 } })
    const result = await getSystemStatus()

    expect(mockedApi.get).toHaveBeenCalledWith("/admin/system")
    expect(result).toEqual({ uptime: 123 })
  })

  it("getAdminTimeseries defaults range to 6m and interpolates metric/range in the URL", async () => {
    await getAdminTimeseries("logins")
    expect(mockedApi.get).toHaveBeenCalledWith("/users/admin/stats/timeseries?metric=logins&range=6m")
  })

  it("getAdminTimeseries uses an explicit range when given", async () => {
    await getAdminTimeseries("prayers", "7d")
    expect(mockedApi.get).toHaveBeenCalledWith("/users/admin/stats/timeseries?metric=prayers&range=7d")
  })

  it("getActivityHeatmap defaults days to 90", async () => {
    await getActivityHeatmap("rosaries")
    expect(mockedApi.get).toHaveBeenCalledWith("/users/admin/stats/heatmap?metric=rosaries&days=90")
  })

  it("getActivityHeatmap uses an explicit day window when given", async () => {
    await getActivityHeatmap("rosaries", 30)
    expect(mockedApi.get).toHaveBeenCalledWith("/users/admin/stats/heatmap?metric=rosaries&days=30")
  })

})
