import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("./api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

import api from "./api"
import {
  getRosary,
  startRosary,
  updateRosaryStep,
  finishRosary,
  getRosarySession,
  getRosaryProgress,
} from "./rosaryService"

const mockedApi = api as any // eslint-disable-line @typescript-eslint/no-explicit-any

describe("rosaryService", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getRosary GETs the step content for a given type", async () => {
    mockedApi.get.mockResolvedValue({ data: [{ step: 1 }] })
    const result = await getRosary("gozosos")

    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/rosary/gozosos")
    expect(result).toEqual([{ step: 1 }])
  })

  it("startRosary posts the type and restart flag", async () => {
    mockedApi.post.mockResolvedValue({ data: { id: "s1" } })
    await startRosary("dolorosos", true)

    expect(mockedApi.post).toHaveBeenCalledWith("/oratio/rosary/start", {
      type: "dolorosos",
      restart: true,
    })
  })

  it("updateRosaryStep posts the current step and elapsed time", async () => {
    mockedApi.post.mockResolvedValue({ data: { ok: true } })
    await updateRosaryStep("gozosos", 3, 120)

    expect(mockedApi.post).toHaveBeenCalledWith("/oratio/rosary/step", {
      type: "gozosos",
      step: 3,
      elapsedSeconds: 120,
    })
  })

  it("finishRosary posts the type being completed", async () => {
    mockedApi.post.mockResolvedValue({ data: { success: true } })
    await finishRosary("gloriosos")

    expect(mockedApi.post).toHaveBeenCalledWith("/oratio/rosary/finish", { type: "gloriosos" })
  })

  it("getRosarySession GETs the session for a type via query param", async () => {
    mockedApi.get.mockResolvedValue({ data: { currentStep: 2 } })
    const result = await getRosarySession("gozosos")

    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/rosary/session", {
      params: { type: "gozosos" },
    })
    expect(result).toEqual({ currentStep: 2 })
  })

  it("getRosaryProgress GETs the in-progress list across types", async () => {
    mockedApi.get.mockResolvedValue({ data: [{ type: "gozosos", currentStep: 2, totalSteps: 20 }] })
    const result = await getRosaryProgress()

    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/rosary/progress")
    expect(result).toEqual([{ type: "gozosos", currentStep: 2, totalSteps: 20 }])
  })

})
