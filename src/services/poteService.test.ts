import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("./api", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

import api from "./api"
import {
  getRoom,
  inviteUsers,
  poteErrorMessage,
  poteErrorStatus,
  round1Action,
  round2Place,
  removePlayer,
  searchUsers,
  setPaused,
  setPhase,
} from "./poteService"

const m = api as unknown as Record<"get" | "post" | "delete", ReturnType<typeof vi.fn>>

beforeEach(() => {
  vi.clearAllMocks()
  m.get.mockResolvedValue({ data: { ok: true } })
  m.post.mockResolvedValue({ data: { ok: true } })
  m.delete.mockResolvedValue({ data: { ok: true } })
})

describe("poteService — rotas e corpo", () => {
  it("getRoom manda ?since só quando há versão", async () => {
    await getRoom("1234")
    expect(m.get).toHaveBeenLastCalledWith("/oratio/pote/rooms/1234", { params: {} })
    await getRoom("1234", 7)
    expect(m.get).toHaveBeenLastCalledWith("/oratio/pote/rooms/1234", { params: { since: 7 } })
  })

  it("ações do jogador vão para as rotas certas, sem userId no corpo", async () => {
    await round1Action("1234", 3, "TAKE")
    expect(m.post).toHaveBeenLastCalledWith("/oratio/pote/rooms/1234/round1/action", { index: 3, action: "TAKE" })
    await round2Place("1234", "oracao")
    expect(m.post).toHaveBeenLastCalledWith("/oratio/pote/rooms/1234/round2/place", { itemId: "oracao" })
  })

  it("controles do líder e convites", async () => {
    await setPhase("1234", "ROUND_1")
    expect(m.post).toHaveBeenLastCalledWith("/oratio/pote/rooms/1234/phase", { to: "ROUND_1" })
    await setPaused("1234", true)
    expect(m.post).toHaveBeenLastCalledWith("/oratio/pote/rooms/1234/pause", { paused: true })
    await removePlayer("1234", "u1")
    expect(m.delete).toHaveBeenLastCalledWith("/oratio/pote/rooms/1234/players/u1")
    await inviteUsers("1234", ["a", "b"])
    expect(m.post).toHaveBeenLastCalledWith("/oratio/pote/rooms/1234/invites", { userIds: ["a", "b"] })
    await searchUsers("ana")
    expect(m.get).toHaveBeenLastCalledWith("/oratio/pote/users/search", { params: { q: "ana" } })
  })
})

describe("mensagens de erro", () => {
  it("usa o message do Nest (string ou lista) e cai num texto padrão", () => {
    expect(poteErrorMessage({ response: { data: { message: "A sala está pausada." } } })).toBe("A sala está pausada.")
    expect(poteErrorMessage({ response: { data: { message: ["primeiro", "segundo"] } } })).toBe("primeiro")
    expect(poteErrorMessage(new Error("rede"))).toBe("Algo deu errado. Tente de novo.")
    expect(poteErrorMessage({}, "outro")).toBe("outro")
  })

  it("poteErrorStatus lê o status HTTP", () => {
    expect(poteErrorStatus({ response: { status: 403 } })).toBe(403)
    expect(poteErrorStatus(new Error("x"))).toBeUndefined()
  })
})
