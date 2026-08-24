import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import axios from "axios"
import api, { clearSession } from "./api"

/*
axios não expõe os interceptors publicamente pra teste — pegamos a função
registrada direto de `handlers[0]` (InterceptorManager interno do axios,
ver node_modules/axios/lib/core/InterceptorManager.js). Evita adicionar
uma lib de mock de HTTP só pra isso; a estrutura {fulfilled, rejected} é
estável há várias major versions do axios.
*/
function getRequestFulfilled() {
  return (api.interceptors.request as any).handlers[0].fulfilled
}
function getResponseRejected() {
  return (api.interceptors.response as any).handlers[0].rejected
}

/*
clearSession() é a base do logout e do fluxo de refresh (api.ts, §4 do
ARCHITECTURE.md): ela apaga toda chave do localStorage EXCETO uma
allowlist fixa (app_version, last_ping). Esse teste trava esse contrato —
se alguém trocar a allowlist por engano, ou inverter a lógica, o pior
cenário é derrubar sessões de todo mundo no próximo deploy sem que
ninguém perceba até o campo se encher de reclamações.
*/
describe("clearSession", () => {

  beforeEach(() => {
    localStorage.clear()

    // clearSession navega via window.location.href — não é o que este
    // teste verifica, então troca por um objeto inofensivo.
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "" },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("removes every user-data key from localStorage", () => {

    localStorage.setItem("access_token", "abc")
    localStorage.setItem("refresh_token", "def")
    localStorage.setItem("oratio_some_cache", "1")

    clearSession()

    expect(localStorage.getItem("access_token")).toBeNull()
    expect(localStorage.getItem("refresh_token")).toBeNull()
    expect(localStorage.getItem("oratio_some_cache")).toBeNull()

  })

  it("keeps app_version and last_ping through logout", () => {

    localStorage.setItem("app_version", "v8")
    localStorage.setItem("last_ping", "123456")
    localStorage.setItem("access_token", "abc")

    clearSession()

    expect(localStorage.getItem("app_version")).toBe("v8")
    expect(localStorage.getItem("last_ping")).toBe("123456")

  })

  it("redirects to the given path (defaults to /login)", () => {

    clearSession()
    expect(window.location.href).toBe("/login")

    clearSession("/custom")
    expect(window.location.href).toBe("/custom")

  })

})

describe("request interceptor", () => {

  beforeEach(() => {
    localStorage.clear()
  })

  it("attaches Authorization from the stored access_token", () => {
    localStorage.setItem("access_token", "tok-123")
    const fulfilled = getRequestFulfilled()

    const config: any = { headers: {} }
    const result = fulfilled(config)

    expect(result.headers.Authorization).toBe("Bearer tok-123")
  })

  it("leaves Authorization unset when there is no access_token (guest request)", () => {
    const fulfilled = getRequestFulfilled()

    const config: any = { headers: {} }
    const result = fulfilled(config)

    expect(result.headers.Authorization).toBeUndefined()
  })

})

/*
Fluxo 401 -> refresh -> retry (api.ts §REQUEST/RESPONSE INTERCEPTOR,
ARCHITECTURE.md §4). É o trecho mais arriscado do arquivo: uma regressão
aqui desloga usuários à toa, ou pior, deixa de deslogar quando devia
(sessão "zumbi"). Testado direto contra a função registrada no
interceptor — sem mocks de rede além do adapter/axios.post.
*/
describe("response interceptor — 401 refresh flow", () => {

  const originalAdapter = api.defaults.adapter

  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "" },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    api.defaults.adapter = originalAdapter
  })

  it("passes through an error that has no config at all", async () => {
    const rejected = getResponseRejected()
    const err = { message: "network error" }

    await expect(rejected(err)).rejects.toBe(err)
  })

  it("passes through non-401 errors untouched", async () => {
    const rejected = getResponseRejected()
    const err = { response: { status: 500 }, config: { url: "/oratio/home", headers: {} } }

    await expect(rejected(err)).rejects.toBe(err)
  })

  it("does not retry a request that already went through the refresh flow once", async () => {
    localStorage.setItem("access_token", "tok")
    localStorage.setItem("refresh_token", "rtok")
    const postSpy = vi.spyOn(axios, "post")
    const rejected = getResponseRejected()
    const err = { response: { status: 401 }, config: { url: "/oratio/home", headers: {}, _retry: true } }

    await expect(rejected(err)).rejects.toBe(err)
    expect(postSpy).not.toHaveBeenCalled()
  })

  it("never attempts refresh for a 401 on a public auth path (e.g. wrong password on login)", async () => {
    localStorage.setItem("access_token", "tok")
    localStorage.setItem("refresh_token", "rtok")
    const postSpy = vi.spyOn(axios, "post")
    const rejected = getResponseRejected()
    const err = { response: { status: 401 }, config: { url: "/auth/login", headers: {} } }

    await expect(rejected(err)).rejects.toBe(err)
    expect(postSpy).not.toHaveBeenCalled()
  })

  it("passes a 401 straight through with no logout for a guest with no session at all", async () => {
    const rejected = getResponseRejected()
    const err = { response: { status: 401 }, config: { url: "/oratio/prayers/complete", headers: {} } }

    await expect(rejected(err)).rejects.toBe(err)
    expect(window.location.href).toBe("")
  })

  it("logs out (no redirect loop) when there was an access_token but no refresh_token", async () => {
    localStorage.setItem("access_token", "stale-access")
    const rejected = getResponseRejected()
    const err = { response: { status: 401 }, config: { url: "/oratio/home", headers: {} } }

    await expect(rejected(err)).rejects.toBe(err)
    expect(window.location.href).toBe("/login")
    expect(localStorage.getItem("access_token")).toBeNull()
  })

  it("refreshes the token pair, stores it, and retries the original request with the new Authorization header", async () => {
    localStorage.setItem("access_token", "old-access")
    localStorage.setItem("refresh_token", "old-refresh")

    vi.spyOn(axios, "post").mockResolvedValue({
      data: { access_token: "new-access", refresh_token: "new-refresh" },
    } as any)

    const fakeResponse = { data: { ok: true } }
    const adapter = vi.fn().mockResolvedValue(fakeResponse)
    api.defaults.adapter = adapter as any

    const rejected = getResponseRejected()
    const originalRequest: any = { url: "/oratio/rosary", headers: {} }
    const err = { response: { status: 401 }, config: originalRequest }

    const result = await rejected(err)

    expect(result).toBe(fakeResponse)
    expect(localStorage.getItem("access_token")).toBe("new-access")
    expect(localStorage.getItem("refresh_token")).toBe("new-refresh")
    expect(originalRequest.headers.Authorization).toBe("Bearer new-access")
    expect(originalRequest._retry).toBe(true)
    expect(adapter).toHaveBeenCalledTimes(1)
  })

  it("queues a second concurrent 401 instead of firing a second refresh call, then replays both", async () => {
    localStorage.setItem("access_token", "old-access")
    localStorage.setItem("refresh_token", "old-refresh")

    let resolveRefresh!: (v: any) => void
    const refreshPromise = new Promise((resolve) => { resolveRefresh = resolve })
    vi.spyOn(axios, "post").mockReturnValue(refreshPromise as any)

    // Responde por URL, não por ordem de chamada: quem dispara o refresh
    // (req1) e quem fica na fila (req2) são retentados em ordens diferentes
    // dependendo de detalhe de implementação (processQueue roda antes do
    // retry do próprio req1) — não é contrato que valha travar aqui.
    const fakeResponse1 = { data: "first" }
    const fakeResponse2 = { data: "second" }
    const adapter = vi.fn((config: any) => {
      if (config.url === "/a") return Promise.resolve(fakeResponse1)
      if (config.url === "/b") return Promise.resolve(fakeResponse2)
      return Promise.reject(new Error(`unexpected adapter call: ${config.url}`))
    })
    api.defaults.adapter = adapter as any

    const rejected = getResponseRejected()
    const req1: any = { url: "/a", headers: {} }
    const req2: any = { url: "/b", headers: {} }

    const p1 = rejected({ response: { status: 401 }, config: req1 })
    const p2 = rejected({ response: { status: 401 }, config: req2 })

    // um único 401 concorrente já deixa isRefreshing=true antes do segundo
    // chegar (tudo síncrono até o primeiro `await axios.post`) — só UMA
    // chamada de refresh pros dois 401s.
    expect(axios.post).toHaveBeenCalledTimes(1)

    resolveRefresh({ data: { access_token: "new-access", refresh_token: "new-refresh" } })

    const [r1, r2] = await Promise.all([p1, p2])

    expect(r1).toBe(fakeResponse1)
    expect(r2).toBe(fakeResponse2)
    expect(req1.headers.Authorization).toBe("Bearer new-access")
    expect(req2.headers.Authorization).toBe("Bearer new-access")
  })

  it("rejects the whole queue and logs out when the refresh call itself fails", async () => {
    localStorage.setItem("access_token", "old-access")
    localStorage.setItem("refresh_token", "old-refresh")

    const refreshErr = new Error("refresh failed")
    vi.spyOn(axios, "post").mockRejectedValue(refreshErr)

    const rejected = getResponseRejected()
    const originalRequest: any = { url: "/oratio/rosary", headers: {} }
    const err = { response: { status: 401 }, config: originalRequest }

    await expect(rejected(err)).rejects.toBe(refreshErr)
    expect(window.location.href).toBe("/login")
  })

})
