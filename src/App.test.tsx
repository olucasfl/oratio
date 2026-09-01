import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

/*
App.tsx lazy-importa ~28 páginas reais. Pra testar só a lógica de boot
(versionamento de cache + correção de URL) sem puxar os efeitos colaterais
de cada página real (chamadas de API não mockadas, o bibliaService de
~5MB etc.), toda página vira um stub minúsculo identificável pelo nome.
*/
function stubPage(name: string) {
  return { default: () => <div>{name}</div> }
}

vi.mock("./pages/Login/Login", () => stubPage("Login"))
vi.mock("./pages/Register/Register", () => stubPage("Register"))
vi.mock("./pages/VerifyEmail/VerifyEmail", () => stubPage("VerifyEmail"))
vi.mock("./pages/ConfirmEmailChange/ConfirmEmailChange", () => stubPage("ConfirmEmailChange"))
vi.mock("./pages/Home/Home", () => stubPage("Home"))
vi.mock("./pages/Consecration/ConsecrationHome", () => stubPage("ConsecrationHome"))
vi.mock("./pages/Consecration/ConsecrationDay", () => stubPage("ConsecrationDay"))
vi.mock("./pages/Consecration/ConsecrationFinal", () => stubPage("ConsecrationFinal"))
vi.mock("./components/ConsecrationCarta/ConsecrationCarta", () => stubPage("ConsecrationCarta"))
vi.mock("./pages/Consecration/Tratado", () => stubPage("Tratado"))
vi.mock("./pages/Biblia/BibliaHome", () => stubPage("BibliaHome"))
vi.mock("./pages/Biblia/BibliaBook", () => stubPage("BibliaBook"))
vi.mock("./pages/Biblia/BibliaChapter", () => stubPage("BibliaChapter"))
vi.mock("./pages/Vox/Vox", () => stubPage("Vox"))
vi.mock("./pages/Profile/Profile", () => stubPage("Profile"))
vi.mock("./pages/Profile/AccountSettings", () => stubPage("AccountSettings"))
vi.mock("./pages/Profile/AdminPanel", () => stubPage("AdminPanel"))
vi.mock("./pages/Prayers/PrayersCategories", () => stubPage("PrayersCategories"))
vi.mock("./pages/Prayers/CategoryPrayers", () => stubPage("CategoryPrayers"))
vi.mock("./pages/Prayers/Prayers", () => stubPage("Prayers"))
vi.mock("./pages/Prayers/RosaryHome", () => stubPage("RosaryHome"))
vi.mock("./pages/Prayers/RosaryPage", () => stubPage("RosaryPage"))
vi.mock("./pages/Catecismo/Catecismo", () => stubPage("Catecismo"))
vi.mock("./pages/Liturgia/LiturgiaFull", () => stubPage("LiturgiaFull"))
vi.mock("./pages/SantoDoDia/SantoDoDia", () => stubPage("SantoDoDia"))
vi.mock("./pages/Confissao/Confissao", () => stubPage("Confissao"))
vi.mock("./pages/Quaresma/Quaresma", () => stubPage("Quaresma"))
vi.mock("./pages/Quaresma/QuaresmaDia", () => stubPage("QuaresmaDia"))

vi.mock("./services/consecrationService", () => ({
  preloadConsecration: vi.fn().mockResolvedValue(undefined),
  getProgress: vi.fn().mockResolvedValue(null),
}))
vi.mock("./services/activityService", () => ({
  sendActivityPing: vi.fn().mockResolvedValue(undefined),
}))
vi.mock("./services/pushService", () => ({
  syncPushTimezone: vi.fn().mockResolvedValue(undefined),
}))

import { preloadConsecration, getProgress } from "./services/consecrationService"
import { sendActivityPing } from "./services/activityService"
import { syncPushTimezone } from "./services/pushService"
import App from "./App"

const preloadMock = preloadConsecration as unknown as ReturnType<typeof vi.fn>
const getProgressMock = getProgress as unknown as ReturnType<typeof vi.fn>
const pingMock = sendActivityPing as unknown as ReturnType<typeof vi.fn>
const syncTzMock = syncPushTimezone as unknown as ReturnType<typeof vi.fn>

function renderAppAt(path: string) {
  window.history.pushState({}, "", path)
  return render(<BrowserRouter><App /></BrowserRouter>)
}

// InstallAppNudge (montado de verdade dentro de App) chama isPWA(), que usa
// matchMedia -- jsdom não implementa por padrão. Fixo pro arquivo inteiro
// (não stub/unstub por teste): com 17 testes montando/desmontando a árvore
// real do App repetidamente, um efeito remanescente de um teste anterior
// podia disparar depois do afterEach já ter removido o stub, derrubando o
// teste seguinte por uma corrida de teste, não por bug de produção.
if (!window.matchMedia) {
  window.matchMedia = (() => ({ matches: false })) as typeof window.matchMedia
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe("App boot sequence", () => {

  describe("cache-version bump", () => {

    it("clears oratio/stage_/consecration keys and bumps app_version when the saved version is stale", async () => {
      localStorage.setItem("app_version", "v7")
      localStorage.setItem("oratio_some_cache", "old")
      localStorage.setItem("stage_progress", "old")
      localStorage.setItem("consecration_day_3", "old")
      localStorage.setItem("unrelated_key", "keep-me")
      localStorage.setItem("access_token", "tok")

      renderAppAt("/oratio/home")
      await screen.findByText("Home")

      expect(localStorage.getItem("app_version")).toBe("v9")
      expect(localStorage.getItem("oratio_some_cache")).toBeNull()
      expect(localStorage.getItem("stage_progress")).toBeNull()
      expect(localStorage.getItem("consecration_day_3")).toBeNull()
      expect(localStorage.getItem("unrelated_key")).toBe("keep-me")
    })

    it("never sweeps a Quaresma 'already saw this' flag, even on a version bump", async () => {
      localStorage.setItem("app_version", "v7")
      localStorage.setItem("oratio_quaresma_nudge_2026", "123456")
      localStorage.setItem("access_token", "tok")

      renderAppAt("/oratio/home")
      await screen.findByText("Home")

      expect(localStorage.getItem("oratio_quaresma_nudge_2026")).toBe("123456")
    })

    it("keeps the Bible reading preferences through a version bump (key has no swept substring)", async () => {
      localStorage.setItem("app_version", "v7")
      localStorage.setItem("bibliaLeituraPrefs", '{"theme":"escuro"}')
      localStorage.setItem("access_token", "tok")

      renderAppAt("/oratio/home")
      await screen.findByText("Home")

      expect(localStorage.getItem("bibliaLeituraPrefs")).toBe('{"theme":"escuro"}')
    })

    it("does not touch any keys when the app_version already matches", async () => {
      localStorage.setItem("app_version", "v9")
      localStorage.setItem("oratio_some_cache", "still-here")
      localStorage.setItem("access_token", "tok")

      renderAppAt("/oratio/home")
      await screen.findByText("Home")

      expect(localStorage.getItem("oratio_some_cache")).toBe("still-here")
    })

  })

  describe("boot loader (logged-in only)", () => {

    it("preloads consecration data and syncs the push timezone when a token exists", async () => {
      localStorage.setItem("access_token", "tok")
      renderAppAt("/oratio/home")
      await screen.findByText("Home")

      expect(preloadMock).toHaveBeenCalled()
      expect(getProgressMock).toHaveBeenCalled()
      expect(syncTzMock).toHaveBeenCalled()
    })

    it("does none of the logged-in boot work for a guest (no token)", async () => {
      renderAppAt("/oratio/home")
      await screen.findByText("Home")

      expect(preloadMock).not.toHaveBeenCalled()
      expect(getProgressMock).not.toHaveBeenCalled()
      expect(pingMock).not.toHaveBeenCalled()
      expect(syncTzMock).not.toHaveBeenCalled()
    })

    it("sends the activity ping when there is no recent last_ping", async () => {
      localStorage.setItem("access_token", "tok")
      renderAppAt("/oratio/home")
      await screen.findByText("Home")

      expect(pingMock).toHaveBeenCalled()
      expect(Number(localStorage.getItem("last_ping"))).toBeGreaterThan(0)
    })

    it("skips the activity ping when the last one was less than 10 minutes ago", async () => {
      localStorage.setItem("access_token", "tok")
      localStorage.setItem("last_ping", String(Date.now() - 5 * 60 * 1000))
      renderAppAt("/oratio/home")
      await screen.findByText("Home")

      expect(pingMock).not.toHaveBeenCalled()
    })

    it("sends the activity ping again once 10 minutes have passed", async () => {
      localStorage.setItem("access_token", "tok")
      localStorage.setItem("last_ping", String(Date.now() - 11 * 60 * 1000))
      renderAppAt("/oratio/home")
      await screen.findByText("Home")

      expect(pingMock).toHaveBeenCalled()
    })

  })

  describe("URL correction before first paint", () => {

    it("sends a guest at / to the public Home", async () => {
      renderAppAt("/")
      await screen.findByText("Home")
      expect(window.location.pathname).toBe("/oratio/home")
    })

    it("forces a guest at a fully-gated route to /login", async () => {
      renderAppAt("/oratio/profile")
      await screen.findByText("Login")
      expect(window.location.pathname).toBe("/login")
    })

    it("leaves a guest at a guest-allowed route untouched", async () => {
      renderAppAt("/oratio/rosary")
      await screen.findByText("RosaryHome")
      expect(window.location.pathname).toBe("/oratio/rosary")
    })

    it("leaves a guest at a guest-allowed nested route (prefix match) untouched", async () => {
      renderAppAt("/oratio/prayer/123")
      await screen.findByText("Prayers")
      expect(window.location.pathname).toBe("/oratio/prayer/123")
    })

    it("leaves a guest on a public auth path untouched", async () => {
      renderAppAt("/verificar-email")
      await screen.findByText("VerifyEmail")
      expect(window.location.pathname).toBe("/verificar-email")
    })

    it("sends a logged-in user away from / to Home", async () => {
      localStorage.setItem("access_token", "tok")
      renderAppAt("/")
      await screen.findByText("Home")
      expect(window.location.pathname).toBe("/oratio/home")
    })

    it("sends a logged-in user away from /login to Home", async () => {
      localStorage.setItem("access_token", "tok")
      renderAppAt("/login")
      await screen.findByText("Home")
      expect(window.location.pathname).toBe("/oratio/home")
    })

    it("does NOT redirect a logged-in user away from /login when a ?resetToken= is present", async () => {
      localStorage.setItem("access_token", "tok")
      renderAppAt("/login?resetToken=abc123")
      await screen.findByText("Login")
      expect(window.location.pathname).toBe("/login")
    })

    it("leaves a logged-in user on any other authenticated route untouched", async () => {
      localStorage.setItem("access_token", "tok")
      renderAppAt("/oratio/profile")
      await screen.findByText("Profile")
      expect(window.location.pathname).toBe("/oratio/profile")
    })

  })

})
