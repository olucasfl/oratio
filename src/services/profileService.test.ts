import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("./api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

import api from "./api"
import {
  getProfile,
  invalidateProfile,
  acceptLegalTerms,
  updateName,
  changePassword,
  setPassword,
  requestEmailChange,
  cancelEmailChange,
  deleteAccount,
} from "./profileService"

const mockedApi = api as any // eslint-disable-line @typescript-eslint/no-explicit-any

describe("profileService", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    // dedupe/memo de getProfile() vive em estado de módulo (fora do mock do
    // axios) — sem isto, o cache de um teste vazaria pro próximo.
    invalidateProfile()
  })

  it("getProfile GETs /users/me and returns the response body", async () => {
    mockedApi.get.mockResolvedValue({ data: { id: "u1", name: "Ana" } })
    const result = await getProfile()

    expect(mockedApi.get).toHaveBeenCalledWith("/users/me")
    expect(result).toEqual({ id: "u1", name: "Ana" })
  })

  it("getProfile dedupes concurrent calls into a single fetch (LegalTermsGate + WelcomeGate na mesma navegação)", async () => {
    let resolveGet!: (value: { data: unknown }) => void
    mockedApi.get.mockReturnValue(
      new Promise((resolve) => { resolveGet = resolve }),
    )

    const p1 = getProfile()
    const p2 = getProfile()

    resolveGet({ data: { id: "u1", legalTermsAccepted: true } })

    const [r1, r2] = await Promise.all([p1, p2])

    expect(mockedApi.get).toHaveBeenCalledTimes(1)
    expect(r1).toEqual({ id: "u1", legalTermsAccepted: true })
    expect(r2).toEqual({ id: "u1", legalTermsAccepted: true })
  })

  it("invalidateProfile força a próxima chamada a ir na rede (sem invalidar, o memo serviria a mesma resposta)", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { id: "u1" } })
    await getProfile()
    expect(mockedApi.get).toHaveBeenCalledTimes(1)

    // dentro da janela do memo, sem invalidar: nenhum fetch novo
    const cached = await getProfile()
    expect(mockedApi.get).toHaveBeenCalledTimes(1)
    expect(cached).toEqual({ id: "u1" })

    mockedApi.get.mockResolvedValueOnce({ data: { id: "u1", legalTermsAccepted: true } })
    invalidateProfile()
    const fresh = await getProfile()

    expect(mockedApi.get).toHaveBeenCalledTimes(2)
    expect(fresh).toEqual({ id: "u1", legalTermsAccepted: true })
  })

  it("acceptLegalTerms POSTs /users/me/legal-terms-accepted with no body and returns the response body", async () => {
    mockedApi.post.mockResolvedValue({ data: { ok: true } })
    const result = await acceptLegalTerms()

    expect(mockedApi.post).toHaveBeenCalledWith("/users/me/legal-terms-accepted")
    expect(result).toEqual({ ok: true })
  })

  it("updateName PATCHes /users/me with the new name and returns the response body", async () => {
    mockedApi.patch.mockResolvedValue({ data: { id: "u1", name: "Maria Nova" } })
    const result = await updateName("Maria Nova")

    expect(mockedApi.patch).toHaveBeenCalledWith("/users/me", { name: "Maria Nova" })
    expect(result).toEqual({ id: "u1", name: "Maria Nova" })
  })

  it("changePassword posts current and new password", async () => {
    mockedApi.post.mockResolvedValue({ data: { ok: true } })
    await changePassword("old-pw", "new-pw")

    expect(mockedApi.post).toHaveBeenCalledWith("/users/me/change-password", {
      currentPassword: "old-pw",
      newPassword: "new-pw",
    })
  })

  it("setPassword posts the new password and its confirmation to /users/me/set-password", async () => {
    mockedApi.post.mockResolvedValue({ data: { message: "Senha definida." } })
    await setPassword("abcd1234", "abcd1234")

    expect(mockedApi.post).toHaveBeenCalledWith("/users/me/set-password", {
      password: "abcd1234",
      confirmPassword: "abcd1234",
    })
  })

  it("requestEmailChange posts the new email and returns the pending-change body", async () => {
    mockedApi.post.mockResolvedValue({
      data: { emailChangePending: true, pendingEmail: "new@example.com" },
    })
    const result = await requestEmailChange("new@example.com")

    expect(mockedApi.post).toHaveBeenCalledWith("/users/me/email", { email: "new@example.com" })
    expect(result).toEqual({ emailChangePending: true, pendingEmail: "new@example.com" })
  })

  it("cancelEmailChange posts to the cancel endpoint", async () => {
    mockedApi.post.mockResolvedValue({ data: { ok: true } })
    await cancelEmailChange()

    expect(mockedApi.post).toHaveBeenCalledWith("/users/me/email/cancel")
  })

  it("deleteAccount sends the proof object as the DELETE body (password or googleCredential)", async () => {
    mockedApi.delete.mockResolvedValue({ data: { ok: true } })

    await deleteAccount({ password: "hunter2" })
    expect(mockedApi.delete).toHaveBeenLastCalledWith("/users/me", { data: { password: "hunter2" } })

    await deleteAccount({ googleCredential: "fresh.id.token" })
    expect(mockedApi.delete).toHaveBeenLastCalledWith("/users/me", {
      data: { googleCredential: "fresh.id.token" },
    })
  })

})
