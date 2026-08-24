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
  preloadConsecration,
  getAllDays,
  getProgress,
  getCachedProgress,
  startConsecration,
  getDay,
  completeDay,
  uncompleteDay,
  updateStartDate,
  finishConsecration,
  resetConsecration,
  apiErrorMessage,
} from "./consecrationService"

const mockedApi = api as any // eslint-disable-line @typescript-eslint/no-explicit-any
const saveLocalMock = saveLocal as unknown as ReturnType<typeof vi.fn>
const getLocalMock = getLocal as unknown as ReturnType<typeof vi.fn>

function makeToken(sub: string) {
  const json = JSON.stringify({ sub })
  const b64url = btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  return `header.${b64url}.signature`
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

/*
Namespace de cache por usuário (currentUserId()/progressKey(), não
exportadas diretamente): sem isolar por `sub` do JWT, o progresso de uma
conta "vazava" pra outra no mesmo aparelho quando a leitura online falhava
e caía no cache local. Testado indiretamente via getCachedProgress().
*/
describe("per-user cache key isolation", () => {

  it("keys the cache by the logged-in user's JWT sub", () => {
    localStorage.setItem("access_token", makeToken("user-a"))
    getCachedProgress()
    expect(getLocalMock).toHaveBeenCalledWith("oratio_consecration_progress_user-a")

    localStorage.setItem("access_token", makeToken("user-b"))
    getCachedProgress()
    expect(getLocalMock).toHaveBeenLastCalledWith("oratio_consecration_progress_user-b")
  })

  it("falls back to an 'anon' key when there is no token or it's malformed", () => {
    getCachedProgress()
    expect(getLocalMock).toHaveBeenLastCalledWith("oratio_consecration_progress_anon")

    localStorage.setItem("access_token", "not-a-real-jwt")
    getCachedProgress()
    expect(getLocalMock).toHaveBeenLastCalledWith("oratio_consecration_progress_anon")
  })

})

describe("preloadConsecration", () => {

  it("returns immediately when a cache already exists, refreshing in the background", async () => {
    getLocalMock.mockReturnValue([{ dayNumber: 1 }])
    let resolveGet!: (v: unknown) => void
    mockedApi.get.mockReturnValue(new Promise((resolve) => { resolveGet = resolve }))

    // se isso não resolver antes do resolveGet ser chamado, o código está
    // (incorretamente) esperando a rede em vez de devolver na hora.
    await preloadConsecration()

    resolveGet({ data: [{ dayNumber: 1 }, { dayNumber: 2 }] })
    await Promise.resolve()
    await Promise.resolve()

    expect(saveLocalMock).toHaveBeenCalledWith(
      "oratio_consecration_all_days",
      [{ dayNumber: 1 }, { dayNumber: 2 }],
      60,
    )
  })

  it("awaits the network and caches all days (+ per-day entries) when there is no cache yet", async () => {
    getLocalMock.mockReturnValue(null)
    mockedApi.get.mockResolvedValue({ data: [{ dayNumber: 1 }] })

    await preloadConsecration()

    expect(saveLocalMock).toHaveBeenCalledWith("oratio_consecration_all_days", [{ dayNumber: 1 }], 60)
    expect(saveLocalMock).toHaveBeenCalledWith("oratio_consecration_days_1", { dayNumber: 1 }, 60)
  })

  it("silently continues when there is no cache and the network also fails", async () => {
    getLocalMock.mockReturnValue(null)
    mockedApi.get.mockRejectedValue(new Error("network down"))

    await expect(preloadConsecration()).resolves.toBeUndefined()
  })

})

describe("getAllDays", () => {

  it("returns the cached days without touching the network when cached", async () => {
    getLocalMock.mockReturnValue([{ dayNumber: 1 }])
    const result = await getAllDays()

    expect(result).toEqual([{ dayNumber: 1 }])
    expect(mockedApi.get).not.toHaveBeenCalled()
  })

  it("fetches and caches when there is no cache", async () => {
    getLocalMock.mockReturnValue(null)
    mockedApi.get.mockResolvedValue({ data: [{ dayNumber: 1 }] })

    const result = await getAllDays()

    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/consecration/all-days")
    expect(saveLocalMock).toHaveBeenCalledWith("oratio_consecration_all_days", [{ dayNumber: 1 }], 60)
    expect(result).toEqual([{ dayNumber: 1 }])
  })

})

describe("getProgress", () => {

  it("fetches, caches under the user-scoped key with a 5-minute TTL, and returns it", async () => {
    localStorage.setItem("access_token", makeToken("user-a"))
    mockedApi.get.mockResolvedValue({ data: { started: true, currentDay: 5 } })

    const result = await getProgress()

    expect(saveLocalMock).toHaveBeenCalledWith(
      "oratio_consecration_progress_user-a",
      { started: true, currentDay: 5 },
      5,
    )
    expect(result).toEqual({ started: true, currentDay: 5 })
  })

  it("falls back to the cached progress when the network fails", async () => {
    mockedApi.get.mockRejectedValue(new Error("down"))
    getLocalMock.mockReturnValue({ started: true, currentDay: 3 })

    await expect(getProgress()).resolves.toEqual({ started: true, currentDay: 3 })
  })

})

describe("getDay", () => {

  it("returns the cached day without hitting the network when cached", async () => {
    getLocalMock.mockReturnValue({ dayNumber: 5 })
    const result = await getDay(5)

    expect(result).toEqual({ dayNumber: 5 })
    expect(mockedApi.get).not.toHaveBeenCalled()
  })

  it("fetches and caches the day when not cached", async () => {
    getLocalMock.mockReturnValue(null)
    mockedApi.get.mockResolvedValue({ data: { dayNumber: 7 } })

    const result = await getDay(7)

    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/consecration/day/7")
    expect(saveLocalMock).toHaveBeenCalledWith("oratio_consecration_days_7", { dayNumber: 7 }, 60)
    expect(result).toEqual({ dayNumber: 7 })
  })

  it("re-checks the cache on failure (a background refresh may have just populated it) before giving up", async () => {
    getLocalMock.mockReturnValueOnce(null).mockReturnValueOnce({ dayNumber: 9, stale: true })
    mockedApi.get.mockRejectedValue(new Error("down"))

    await expect(getDay(9)).resolves.toEqual({ dayNumber: 9, stale: true })
  })

  it("throws a connection error when there is no cache at all and the network fails", async () => {
    getLocalMock.mockReturnValue(null)
    mockedApi.get.mockRejectedValue(new Error("down"))

    await expect(getDay(9)).rejects.toThrow("Sem conexão")
  })

})

it("startConsecration posts the chosen date", async () => {
  mockedApi.post.mockResolvedValue({ data: {} })
  await startConsecration("2026-09-01")
  expect(mockedApi.post).toHaveBeenCalledWith("/oratio/consecration/start", { consecrationDate: "2026-09-01" })
})

it("completeDay posts to the per-day completion endpoint", async () => {
  mockedApi.post.mockResolvedValue({ data: {} })
  await completeDay(5)
  expect(mockedApi.post).toHaveBeenCalledWith("/oratio/consecration/complete/5")
})

it("uncompleteDay deletes the per-day completion", async () => {
  mockedApi.delete.mockResolvedValue({ data: {} })
  await uncompleteDay(5)
  expect(mockedApi.delete).toHaveBeenCalledWith("/oratio/consecration/complete/5")
})

it("updateStartDate PUTs the new consecration date", async () => {
  mockedApi.put.mockResolvedValue({ data: {} })
  await updateStartDate("2026-10-01")
  expect(mockedApi.put).toHaveBeenCalledWith("/oratio/consecration/consecration-date", { consecrationDate: "2026-10-01" })
})

it("finishConsecration posts to the finish endpoint", async () => {
  mockedApi.post.mockResolvedValue({ data: {} })
  await finishConsecration()
  expect(mockedApi.post).toHaveBeenCalledWith("/oratio/consecration/finish")
})

describe("resetConsecration", () => {

  it("clears the user-scoped local cache even when the API call subsequently fails", async () => {
    localStorage.setItem("access_token", makeToken("user-a"))
    localStorage.setItem("oratio_consecration_progress_user-a", "stale-cache")
    mockedApi.post.mockRejectedValue(new Error("down"))

    await expect(resetConsecration()).rejects.toThrow("down")

    expect(localStorage.getItem("oratio_consecration_progress_user-a")).toBeNull()
  })

  it("posts the reset request after clearing the cache", async () => {
    localStorage.setItem("access_token", makeToken("user-a"))
    mockedApi.post.mockResolvedValue({ data: {} })

    await resetConsecration()

    expect(mockedApi.post).toHaveBeenCalledWith("/oratio/consecration/reset")
  })

})

describe("apiErrorMessage", () => {

  it("takes the first element when message is an array", () => {
    expect(apiErrorMessage({ response: { data: { message: ["primeiro", "segundo"] } } }, "fallback"))
      .toBe("primeiro")
  })

  it("returns the message string as-is", () => {
    expect(apiErrorMessage({ response: { data: { message: "erro específico" } } }, "fallback"))
      .toBe("erro específico")
  })

  it("falls back when there is no usable message", () => {
    expect(apiErrorMessage({}, "fallback")).toBe("fallback")
  })

})
