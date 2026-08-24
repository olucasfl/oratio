import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("./api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

import api from "./api"
import {
  getPrayerCategories,
  getPrayersByCategory,
  getPrayer,
  completePrayer,
} from "./prayersService"

const mockedApi = api as any // eslint-disable-line @typescript-eslint/no-explicit-any

describe("prayersService", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getPrayerCategories GETs the category list", async () => {
    mockedApi.get.mockResolvedValue({ data: [{ slug: "manha" }] })
    const result = await getPrayerCategories()

    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/prayers/categories")
    expect(result).toEqual([{ slug: "manha" }])
  })

  it("getPrayersByCategory GETs prayers filtered by category slug", async () => {
    mockedApi.get.mockResolvedValue({ data: [{ id: "p1" }] })
    const result = await getPrayersByCategory("manha")

    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/prayers?category=manha")
    expect(result).toEqual([{ id: "p1" }])
  })

  it("getPrayer GETs a single prayer by id", async () => {
    mockedApi.get.mockResolvedValue({ data: { id: "p1", title: "Pai Nosso" } })
    const result = await getPrayer("p1")

    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/prayers/p1")
    expect(result).toEqual({ id: "p1", title: "Pai Nosso" })
  })

  it("completePrayer posts to the completion endpoint with no body", async () => {
    mockedApi.post.mockResolvedValue({ data: { ok: true } })
    await completePrayer()

    expect(mockedApi.post).toHaveBeenCalledWith("/oratio/prayers/complete")
  })

})
