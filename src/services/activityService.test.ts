import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("./api", () => ({
  default: { post: vi.fn() },
}))

import api from "./api"
import { sendActivityPing } from "./activityService"

const postMock = api.post as unknown as ReturnType<typeof vi.fn>

describe("sendActivityPing", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("posts to /activity/ping and returns the response body", async () => {
    postMock.mockResolvedValue({ data: { ok: true } })

    const result = await sendActivityPing()

    expect(postMock).toHaveBeenCalledWith("/activity/ping")
    expect(result).toEqual({ ok: true })
  })

})
