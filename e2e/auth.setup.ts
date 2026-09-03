import { test as setup, expect } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"

/*
Loga na conta de teste QA uma vez e salva a sessão (tokens no
localStorage) em e2e/.auth/user.json. Os projetos de device carregam
esse storageState e já entram logados.

Conta: fornecida pelo dono do projeto, só pra testes (isAdmin:false,
e-mail já verificado). Sobrescreva com as env vars E2E_EMAIL /
E2E_PASSWORD se precisar.
*/

const API = process.env.VITE_API_URL || "https://finance-api-y0ol.onrender.com"
const EMAIL = process.env.E2E_EMAIL || "claude-test-qa@example.com"
const PASSWORD = process.env.E2E_PASSWORD || "ClaudeTestQA-2026"

const AUTH_FILE = path.join(__dirname, ".auth", "user.json")

setup("authenticate", async ({ request, baseURL }) => {
  const res = await request.post(`${API}/auth/login`, {
    headers: { "x-app": "oratio" },
    data: { email: EMAIL, password: PASSWORD },
  })

  expect(
    res.ok(),
    `login falhou (${res.status()}): ${await res.text()}`,
  ).toBeTruthy()

  const { access_token, refresh_token } = await res.json()
  expect(access_token, "resposta do login sem access_token").toBeTruthy()

  const origin = new URL(baseURL!).origin
  const storageState = {
    cookies: [],
    origins: [
      {
        origin,
        localStorage: [
          { name: "access_token", value: access_token },
          { name: "refresh_token", value: refresh_token },
        ],
      },
    ],
  }

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })
  fs.writeFileSync(AUTH_FILE, JSON.stringify(storageState, null, 2))
})
