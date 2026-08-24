import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("./api", () => ({
  default: {
    post: vi.fn(),
    defaults: { headers: {} as Record<string, string> },
  },
  clearSession: vi.fn(),
}))

import api, { clearSession } from "./api"
import {
  login,
  register,
  logout,
  forgotPassword,
  verifyEmail,
  confirmEmailChange,
} from "./authService"

// `api` é totalmente mockado acima — `as any` evita brigar com o tipo
// real de AxiosInstance/HeadersDefaults só pra resetar um mock em teste.
const mockedApi = api as any // eslint-disable-line @typescript-eslint/no-explicit-any
const postMock = mockedApi.post as ReturnType<typeof vi.fn>
const clearSessionMock = clearSession as unknown as ReturnType<typeof vi.fn>

describe("authService", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockedApi.defaults.headers = {}
  })

  describe("login", () => {

    it("stores the token pair and sets the default Authorization header", async () => {
      postMock.mockResolvedValue({
        data: { access_token: "acc-1", refresh_token: "ref-1" },
      })

      const result = await login("user@example.com", "hunter2")

      expect(localStorage.getItem("access_token")).toBe("acc-1")
      expect(localStorage.getItem("refresh_token")).toBe("ref-1")
      expect(mockedApi.defaults.headers.Authorization).toBe("Bearer acc-1")
      expect(result).toEqual({ access_token: "acc-1", refresh_token: "ref-1" })
    })

    it("posts email and password in the request body", async () => {
      postMock.mockResolvedValue({ data: { access_token: "a", refresh_token: "r" } })

      await login("user@example.com", "hunter2")

      const [, body] = postMock.mock.calls[0]
      expect(body).toEqual({ email: "user@example.com", password: "hunter2" })
    })

  })

  describe("register", () => {

    it("posts to /users with the four registration fields and returns the response body", async () => {
      postMock.mockResolvedValue({ data: { id: "u1" } })

      const result = await register("Ana", "ana@example.com", "hunter2", "hunter2")

      expect(postMock).toHaveBeenCalledWith("/users", {
        name: "Ana",
        email: "ana@example.com",
        password: "hunter2",
        confirmPassword: "hunter2",
      })
      expect(result).toEqual({ id: "u1" })
    })

  })

  /*
  logout() é best-effort no server: revogar a sessão nunca deve impedir o
  logout local (sw.js/localStorage já limpos por clearSession).
  */
  describe("logout", () => {

    it("revokes the refresh session on the server, then clears the local session", async () => {
      localStorage.setItem("refresh_token", "ref-1")
      postMock.mockResolvedValue({ data: { ok: true } })

      await logout("/custom")

      expect(postMock).toHaveBeenCalledWith("/auth/logout", { refresh_token: "ref-1" })
      expect(clearSessionMock).toHaveBeenCalledWith("/custom")
    })

    it("still clears the local session when the server revoke call fails", async () => {
      localStorage.setItem("refresh_token", "ref-1")
      postMock.mockRejectedValue(new Error("network down"))

      await expect(logout()).resolves.toBeUndefined()

      expect(clearSessionMock).toHaveBeenCalledWith(undefined)
    })

    it("skips the server call entirely when there is no refresh_token (nothing to revoke)", async () => {
      localStorage.clear()

      await logout()

      expect(postMock).not.toHaveBeenCalled()
      expect(clearSessionMock).toHaveBeenCalledWith(undefined)
    })

  })

  describe("forgotPassword / verifyEmail / confirmEmailChange", () => {

    it("forgotPassword posts the email and returns the response body", async () => {
      postMock.mockResolvedValue({ data: { ok: true } })
      const result = await forgotPassword("user@example.com")

      expect(postMock).toHaveBeenCalledWith("/auth/forgot-password", { email: "user@example.com" })
      expect(result).toEqual({ ok: true })
    })

    it("verifyEmail posts the token and returns the response body", async () => {
      postMock.mockResolvedValue({ data: { alreadyVerified: true } })
      const result = await verifyEmail("tok-1")

      expect(postMock).toHaveBeenCalledWith("/auth/verify-email", { token: "tok-1" })
      expect(result).toEqual({ alreadyVerified: true })
    })

    it("confirmEmailChange posts the token and returns the response body", async () => {
      postMock.mockResolvedValue({ data: { alreadyConfirmed: false, email: "new@example.com" } })
      const result = await confirmEmailChange("tok-2")

      expect(postMock).toHaveBeenCalledWith("/auth/verify-email-change", { token: "tok-2" })
      expect(result).toEqual({ alreadyConfirmed: false, email: "new@example.com" })
    })

  })

})
