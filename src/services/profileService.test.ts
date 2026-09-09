import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("./api", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

import api from "./api"
import {
  getProfile,
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
  })

  it("getProfile GETs /users/me and returns the response body", async () => {
    mockedApi.get.mockResolvedValue({ data: { id: "u1", name: "Ana" } })
    const result = await getProfile()

    expect(mockedApi.get).toHaveBeenCalledWith("/users/me")
    expect(result).toEqual({ id: "u1", name: "Ana" })
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
