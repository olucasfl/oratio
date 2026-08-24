import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("./api", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn(), put: vi.fn() },
}))

vi.mock("../utils/localCache", () => ({
  saveLocal: vi.fn(),
  getLocal: vi.fn(),
}))

import api from "./api"
import { saveLocal, getLocal } from "../utils/localCache"
import {
  getProgress,
  getCachedProgress,
  completeDay,
  uncompleteDay,
  savePenance,
  apiErrorMessage,
} from "./quaresmaService"

const mockedApi = api as any // eslint-disable-line @typescript-eslint/no-explicit-any
const saveLocalMock = saveLocal as unknown as ReturnType<typeof vi.fn>
const getLocalMock = getLocal as unknown as ReturnType<typeof vi.fn>

describe("quaresmaService", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  /*
  getProgress() é o único ponto com lógica de verdade neste arquivo: as
  orações da Quaresma são estáticas, então a tela do dia precisa continuar
  funcionando offline — daí o fallback pro cache local quando a rede falha.
  */
  describe("getProgress", () => {

    it("fetches from the API, caches it for 24h, and returns it", async () => {
      const progress = { year: 2026, currentDay: 5 } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      mockedApi.get.mockResolvedValue({ data: progress })

      const result = await getProgress()

      expect(mockedApi.get).toHaveBeenCalledWith("/oratio/quaresma/progress")
      expect(saveLocalMock).toHaveBeenCalledWith("oratio_quaresma_progress", progress, 60 * 24)
      expect(result).toBe(progress)
    })

    it("falls back to the cached progress when the network call fails (offline)", async () => {
      mockedApi.get.mockRejectedValue(new Error("network down"))
      const cached = { year: 2026, currentDay: 3 }
      getLocalMock.mockReturnValue(cached)

      const result = await getProgress()

      expect(result).toBe(cached)
      expect(saveLocalMock).not.toHaveBeenCalled()
    })

    it("returns null when the network fails and there is no cache either", async () => {
      mockedApi.get.mockRejectedValue(new Error("network down"))
      getLocalMock.mockReturnValue(null)

      await expect(getProgress()).resolves.toBeNull()
    })

  })

  it("getCachedProgress reads the cache directly, without touching the network", () => {
    getLocalMock.mockReturnValue({ year: 2026 })
    const result = getCachedProgress()

    expect(result).toEqual({ year: 2026 })
    expect(mockedApi.get).not.toHaveBeenCalled()
  })

  /*
  completeDay/uncompleteDay não engolem erro (diferente de
  readingProgressService) -- o comentário no código explica por quê: o
  backend valida ordem/data e a tela precisa mostrar a mensagem específica
  dele. Confirma que o erro realmente propaga.
  */
  it("completeDay posts to the per-day endpoint and lets a validation error propagate", async () => {
    mockedApi.post.mockResolvedValue({ data: {} })
    await completeDay(5)
    expect(mockedApi.post).toHaveBeenCalledWith("/oratio/quaresma/complete/5")

    const err = new Error("Conclua os dias anteriores primeiro")
    mockedApi.post.mockRejectedValue(err)
    await expect(completeDay(6)).rejects.toBe(err)
  })

  it("uncompleteDay deletes the per-day completion", async () => {
    mockedApi.delete.mockResolvedValue({ data: {} })
    await uncompleteDay(5)
    expect(mockedApi.delete).toHaveBeenCalledWith("/oratio/quaresma/complete/5")
  })

  it("savePenance PUTs the content and returns the saved penance", async () => {
    mockedApi.put.mockResolvedValue({ data: { content: "Jejum às sextas", updatedAt: "2026-08-24" } })

    const result = await savePenance("Jejum às sextas")

    expect(mockedApi.put).toHaveBeenCalledWith("/oratio/quaresma/penance", { content: "Jejum às sextas" })
    expect(result).toEqual({ content: "Jejum às sextas", updatedAt: "2026-08-24" })
  })

  describe("apiErrorMessage", () => {

    it("takes the first element when message is an array", () => {
      const msg = apiErrorMessage({ response: { data: { message: ["primeiro", "segundo"] } } }, "fallback")
      expect(msg).toBe("primeiro")
    })

    it("returns the message string as-is", () => {
      const msg = apiErrorMessage({ response: { data: { message: "Dia ainda não disponível" } } }, "fallback")
      expect(msg).toBe("Dia ainda não disponível")
    })

    it("falls back when there is no usable message", () => {
      expect(apiErrorMessage({}, "fallback")).toBe("fallback")
      expect(apiErrorMessage({ response: { data: {} } }, "fallback")).toBe("fallback")
    })

  })

})
