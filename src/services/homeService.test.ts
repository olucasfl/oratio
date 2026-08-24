import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("./api", () => ({
  default: { get: vi.fn() },
}))

import api from "./api"
import { getHomeFeed } from "./homeService"

const getMock = api.get as unknown as ReturnType<typeof vi.fn>

describe("getHomeFeed", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("GETs the home feed and returns the suggestions body", async () => {
    const body = { suggestions: [{ id: "s1", kind: "rosary", title: "Continue" }] }
    getMock.mockResolvedValue({ data: body })

    const result = await getHomeFeed()

    expect(getMock).toHaveBeenCalledWith("/oratio/home/feed")
    expect(result).toEqual(body)
  })

})
