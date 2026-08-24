import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("./api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

import api from "./api"
import { getInbox, getUnseenCount, markSeen, markAllSeen } from "./notificationsService"

const mockedApi = api as any // eslint-disable-line @typescript-eslint/no-explicit-any

describe("notificationsService", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getInbox", () => {

    it("defaults to limit=10 and no cursor, returning the response body as-is", async () => {
      const body = { items: [{ id: "n1" }], nextCursor: null }
      mockedApi.get.mockResolvedValue({ data: body })

      const result = await getInbox()

      expect(mockedApi.get).toHaveBeenCalledWith("/oratio/notifications/inbox", {
        params: { cursor: undefined, limit: 10 },
      })
      expect(result).toEqual(body)
    })

    it("forwards a given cursor and limit", async () => {
      mockedApi.get.mockResolvedValue({ data: { items: [], nextCursor: null } })

      await getInbox("cursor-abc", 5)

      expect(mockedApi.get).toHaveBeenCalledWith("/oratio/notifications/inbox", {
        params: { cursor: "cursor-abc", limit: 5 },
      })
    })

  })

  describe("getUnseenCount", () => {

    it("returns the count from the response", async () => {
      mockedApi.get.mockResolvedValue({ data: { count: 3 } })
      await expect(getUnseenCount()).resolves.toBe(3)
    })

    it("defaults to 0 when the backend omits count", async () => {
      mockedApi.get.mockResolvedValue({ data: {} })
      await expect(getUnseenCount()).resolves.toBe(0)
    })

  })

  describe("markSeen", () => {

    it("posts to the per-notification seen endpoint", async () => {
      mockedApi.post.mockResolvedValue({ data: { ok: true } })
      await markSeen("n1")
      expect(mockedApi.post).toHaveBeenCalledWith("/oratio/notifications/n1/seen")
    })

  })

  describe("markAllSeen", () => {

    it("posts to the seen-all endpoint", async () => {
      mockedApi.post.mockResolvedValue({ data: { ok: true } })
      await markAllSeen()
      expect(mockedApi.post).toHaveBeenCalledWith("/oratio/notifications/seen-all")
    })

  })

})
