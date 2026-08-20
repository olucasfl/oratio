import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { clearSession } from "./api"

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
