import { defineConfig, devices } from "@playwright/test"
import type { AuditOptions } from "./e2e/fixtures"

/*
Auditoria visual de responsividade (ver o Artifact da auditoria de UX).
NÃO substitui o vitest — o vitest continua sendo a suíte de unidade
(`npm test`). Isto aqui sobe o app de verdade num Chromium e olha o
layout em vários tamanhos de tela.

O que dá pra testar aqui: layout, breakpoints, scroll horizontal,
grid/flex, contraste, tipografia, alvos de toque, fonte grande,
prefers-reduced-motion, telas logadas.

O que NÃO dá (precisa de device real): env(safe-area-inset-*) do iPhone,
o congelamento de viewport pós navigator.share(), teclado nativo do iOS.
O modo standalone do PWA é FINGIDO (override do matchMedia) — bom o
bastante pra ver a navbar, não pra safe-area.

Uso:
  npm run e2e            # roda tudo headless
  npm run e2e:ui         # modo interativo (Playwright UI)
  npm run e2e:audit      # só o spec de auditoria, com screenshots em e2e/output/
*/

const PORT = 5199
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig<AuditOptions>({
  testDir: "./e2e",
  outputDir: "./e2e/output/.artifacts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [["list"], ["html", { outputFolder: "e2e/output/report", open: "never" }]],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  projects: [
    // 1. Loga na conta de teste uma vez e salva a sessão.
    { name: "setup", testMatch: /auth\.setup\.ts/ },

    // 2. Projetos de device. standalone:true finge o PWA instalado.
    {
      name: "iphone-se",
      use: { ...devices["iPhone SE"], storageState: "e2e/.auth/user.json", standalone: true },
      dependencies: ["setup"],
    },
    {
      name: "iphone-14",
      use: { ...devices["iPhone 14"], storageState: "e2e/.auth/user.json", standalone: true },
      dependencies: ["setup"],
    },
    {
      name: "android-360",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 360, height: 740 },
        storageState: "e2e/.auth/user.json",
        standalone: true,
      },
      dependencies: ["setup"],
    },
    {
      name: "pixel-7",
      use: { ...devices["Pixel 7"], storageState: "e2e/.auth/user.json", standalone: true },
      dependencies: ["setup"],
    },
    {
      name: "ipad",
      use: { ...devices["iPad Mini"], storageState: "e2e/.auth/user.json", standalone: true },
      dependencies: ["setup"],
    },
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
        storageState: "e2e/.auth/user.json",
        standalone: false,
      },
      dependencies: ["setup"],
    },
  ],
})
