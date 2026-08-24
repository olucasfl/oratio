import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("./api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

import api from "./api"
import {
  sendNotification,
  listCampaigns,
  getSubscribers,
  getRules,
  updateRule,
  createRule,
  deleteRule,
  deleteCampaign,
  deleteAllCampaigns,
} from "./adminNotificationsService"

const mockedApi = api as any // eslint-disable-line @typescript-eslint/no-explicit-any

describe("adminNotificationsService", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("sendNotification posts the campaign payload and returns the created campaign", async () => {
    const campaign = { id: "c1", title: "Oi", targeted: 10 }
    mockedApi.post.mockResolvedValue({ data: campaign })

    const input = { title: "Oi", audience: "ALL" as const }
    const result = await sendNotification(input)

    expect(mockedApi.post).toHaveBeenCalledWith("/oratio/admin/notifications", input)
    expect(result).toEqual(campaign)
  })

  it("listCampaigns GETs the collection endpoint", async () => {
    mockedApi.get.mockResolvedValue({ data: [{ id: "c1" }] })
    const result = await listCampaigns()

    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/admin/notifications")
    expect(result).toEqual([{ id: "c1" }])
  })

  it("getSubscribers GETs the subscriber counts", async () => {
    mockedApi.get.mockResolvedValue({ data: { totalUsers: 100, subscribedUsers: 40 } })
    const result = await getSubscribers()

    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/admin/notifications/subscribers")
    expect(result).toEqual({ totalUsers: 100, subscribedUsers: 40 })
  })

  it("getRules GETs the automatic-rule catalog", async () => {
    mockedApi.get.mockResolvedValue({ data: [{ key: "ROSARY_UNFINISHED" }] })
    const result = await getRules()

    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/admin/notifications/rules")
    expect(result).toEqual([{ key: "ROSARY_UNFINISHED" }])
  })

  it("updateRule PATCHes only the given key with the patch body", async () => {
    mockedApi.patch.mockResolvedValue({ data: { key: "ROSARY_UNFINISHED", enabled: false } })

    const result = await updateRule("ROSARY_UNFINISHED", { enabled: false })

    expect(mockedApi.patch).toHaveBeenCalledWith(
      "/oratio/admin/notifications/rules/ROSARY_UNFINISHED",
      { enabled: false },
    )
    expect(result).toEqual({ key: "ROSARY_UNFINISHED", enabled: false })
  })

  it("createRule posts a new custom rule", async () => {
    mockedApi.post.mockResolvedValue({ data: { key: "CUSTOM_1" } })

    const input = { title: "Novo aviso", hour: 10 }
    const result = await createRule(input)

    expect(mockedApi.post).toHaveBeenCalledWith("/oratio/admin/notifications/rules", input)
    expect(result).toEqual({ key: "CUSTOM_1" })
  })

  it("deleteRule DELETEs by key", async () => {
    mockedApi.delete.mockResolvedValue({ data: { ok: true } })
    await deleteRule("CUSTOM_1")
    expect(mockedApi.delete).toHaveBeenCalledWith("/oratio/admin/notifications/rules/CUSTOM_1")
  })

  it("deleteCampaign DELETEs by id", async () => {
    mockedApi.delete.mockResolvedValue({ data: { ok: true } })
    await deleteCampaign("c1")
    expect(mockedApi.delete).toHaveBeenCalledWith("/oratio/admin/notifications/c1")
  })

  it("deleteAllCampaigns DELETEs the bulk endpoint", async () => {
    mockedApi.delete.mockResolvedValue({ data: { ok: true } })
    await deleteAllCampaigns()
    expect(mockedApi.delete).toHaveBeenCalledWith("/oratio/admin/notifications/all")
  })

})
