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
| **B** | Script GIS (`https://accounts.google.com/gsi/client`) em `/login` e `/register`; `google.accounts.id.initialize({ client_id: VITE_GOOGLE_CLIENT_ID, callback, use_fedcm_for_button: true, itp_support: true, ux_mode: "popup" })` + `renderButton`. **Nunca** `ux_mode: "redirect"`/`login_uri` (PWA iOS). `authService.loginWithGoogle(credential)` → `POST /auth/google` (path relativo via `services/api.ts`, `x-app` já embutido); no 200 grava `access_token`/`refresh_token` e navega `/oratio/home`. Texto fixo e incondicional abaixo da área de erro do login: *"Já entrou com Google antes? Experimente o botão Entrar com Google."* | ⏳ |
| **C** | "Definir senha" nas configurações (só quando a conta não tem senha) → `POST /users/me/set-password`; mensagens acionáveis do backend renderizadas; `forgot`→`reset` acessível para quem entrou só com Google. | ⏳ |
| **D** | `vercel.json` bloco `headers` — adicionar aos directives da CSP: `script-src https://accounts.google.com/gsi/client` · `style-src https://accounts.google.com/gsi/style` · `frame-src https://accounts.google.com/gsi/` · `connect-src https://accounts.google.com/gsi/`. **Plano de verificação pós-deploy obrigatório na tarefa** (CSP falha fechada, `vite preview` não aplica — `RULES.md` §4). `VITE_GOOGLE_CLIENT_ID` na Vercel (humano). Smoke iPhone PWA instalado (humano). Confirmar `ALLOWED_ORIGINS` do backend inalterado (nenhuma origem nova). | ⏳ |

## Critérios de aceite (frontend — BDD)

- [ ] **Dado** `/login` carregada, **então** o botão "Entrar com Google" renderiza e o texto
      fixo aparece abaixo da área de erro (sempre, mesmo sem erro).
- [ ] **Dado** o callback do GIS entrega um `credential`, **quando** conclui, **então**
      `authService.loginWithGoogle` faz `POST /auth/google` com `{ credential }` (`./api`
      mockado, asserção do corpo), e no 200 os tokens são gravados e navega `/oratio/home`.
- [ ] **Dado** `POST /auth/google` responde 401, **quando** o usuário tenta, **então** mensagem
      legível aparece e **nenhum** token é gravado.

Testes: Vitest + RTL, `./api` sempre mockado, toda asserção com corpo verificado.

Arquivos prováveis: `src/services/authService.ts` (ou `api.ts`), `src/pages/Login/*`,
`src/pages/Register/*`, um `GoogleSignInButton` em `src/components/`, `vercel.json` (Fase D),
`.env`/`.env_example` (`VITE_GOOGLE_CLIENT_ID`).
