# "Entrar com Google" — parte frontend

O **plano-mestre** cross-repo e o checklist executável ficam no backend:

- Plano: `oratio-api/docs/tasks/login-google-plan.md`
- Checklist backend: `oratio-api/docs/tasks/login-google-todo.md`
- Spec mestra: `oratio-api/docs/specs/login-google.md` · ponteiro: `docs/specs/login-google.md`

Leia os dois. **A Fase A (backend) vem primeiro** e fecha sozinha; este repo só entra na
Fase B. Antes de codar aqui: `docs/ARCHITECTURE.md` §3 (boot), §4 (api/auth), §7 (CSP);
`.claude/rules/RULES.md` §4 (CSP falha fechada, `dangerouslySetInnerHTML`) e §5 (LGPD).

Comandos: `npm run dev` · `npm run build` (tsc -b + vite — erro de tipo quebra o build) ·
`npm test`. Commits na `develop` (nunca `main`), branch a partir de `develop` (`/nova-branch`).

## Pré-requisitos (do backend / humano)

- Fase A no ar na `develop`: `POST /auth/google` e `POST /users/me/set-password` existem.
- Cliente OAuth "Web application" criado no Google Cloud Console (valores na spec →
  "Notas de ambiente"); `VITE_GOOGLE_CLIENT_ID` no `.env` local e na Vercel.

## O que toca este repo

| Fase | O que muda aqui | Status |
|---|---|---|
| **B** | Script GIS (`https://accounts.google.com/gsi/client`) em `/login` e `/register`; `google.accounts.id.initialize({ client_id: VITE_GOOGLE_CLIENT_ID, callback, use_fedcm_for_button: true, itp_support: true, ux_mode: "popup" })` + `renderButton`. **Nunca** `ux_mode: "redirect"`/`login_uri` (PWA iOS). `authService.loginWithGoogle(credential)` → `POST /auth/google` (path relativo via `services/api.ts`, `x-app` já embutido); no 200 grava `access_token`/`refresh_token` e navega `/oratio/home`. Texto fixo e incondicional abaixo da área de erro do login: *"Já entrou com Google antes? Experimente o botão Entrar com Google."* | ✅ código na `develop` (branch `feat/login-google-fase-b`). Falta o **teste manual no navegador** (precisa do cliente OAuth + `VITE_GOOGLE_CLIENT_ID`). |
| **C** | "Definir senha" nas configurações (só quando a conta não tem senha) → `POST /users/me/set-password`; mensagens acionáveis do backend renderizadas; `forgot`→`reset` acessível para quem entrou só com Google. | ⏳ |
| **D** | `vercel.json` bloco `headers` — adicionar aos directives da CSP: `script-src https://accounts.google.com/gsi/client` · `style-src https://accounts.google.com/gsi/style` · `frame-src https://accounts.google.com/gsi/` · `connect-src https://accounts.google.com/gsi/`. **Plano de verificação pós-deploy obrigatório na tarefa** (CSP falha fechada, `vite preview` não aplica — `RULES.md` §4). `VITE_GOOGLE_CLIENT_ID` na Vercel (humano). Smoke iPhone PWA instalado (humano). Confirmar `ALLOWED_ORIGINS` do backend inalterado (nenhuma origem nova). | ⏳ |

## Critérios de aceite (frontend — BDD)

- [x] **Dado** `/login` carregada, **então** o texto fixo *"Já entrou com Google antes? ..."*
      aparece sempre (mesmo sem erro), e o botão do Google renderiza quando há
      `VITE_GOOGLE_CLIENT_ID` (`GoogleSignInButton` — teste próprio + `Login.test.tsx`).
- [x] **Dado** o callback do GIS entrega um `credential`, **quando** conclui, **então**
      `authService.loginWithGoogle` faz `POST /auth/google` com `{ credential }` (`./api`
      mockado, asserção do corpo), grava os tokens e navega pro destino (`authService.test.ts`,
      `Login.test.tsx`, `Register.test.tsx`).
- [x] **Dado** `POST /auth/google` responde 401/503, **quando** o usuário tenta, **então**
      mensagem legível aparece e **nenhum** token é gravado, sem navegação.
- [x] **Dado** um 401 de `/auth/google`, **então** o interceptor do `api.ts` **não** dispara
      refresh+logout (`/auth/google` em `PUBLIC_AUTH_PATHS` — `api.test.ts`).
- [ ] **Manual (humano):** clicar o botão real no navegador (`npm run dev`) e completar o login.
      Precisa do cliente OAuth criado + `VITE_GOOGLE_CLIENT_ID` no `.env` + backend Fase A no ar.

Testes: Vitest + RTL, `./api`/`loadGsi` mockados, toda asserção com corpo verificado.

Arquivos: `src/services/api.ts`, `src/services/authService.ts`, `src/utils/loadGsi.ts`,
`src/components/GoogleSignInButton/*`, `src/pages/Login/*`, `src/pages/Register/*`,
`.env_example` (`VITE_GOOGLE_CLIENT_ID`). Fase D: `vercel.json` (CSP).
