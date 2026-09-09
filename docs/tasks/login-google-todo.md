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
| **B** | Script GIS (`https://accounts.google.com/gsi/client`) em `/login` e `/register`; `google.accounts.id.initialize({ client_id: VITE_GOOGLE_CLIENT_ID, callback, use_fedcm_for_button: true, itp_support: true, ux_mode: "popup" })` + `renderButton`. **Nunca** `ux_mode: "redirect"`/`login_uri` (PWA iOS). `authService.loginWithGoogle(credential)` → `POST /auth/google` (path relativo via `services/api.ts`, `x-app` já embutido); no 200 grava `access_token`/`refresh_token` e navega `/oratio/home`. Texto fixo e incondicional abaixo da área de erro do login: *"Já entrou com Google antes? Experimente o botão Entrar com Google."* | ✅ na `develop`. Falta o **teste manual no navegador** (precisa do cliente OAuth + `VITE_GOOGLE_CLIENT_ID`). |
| **C** | `profileService.setPassword()` → `POST /users/me/set-password`; `UserProfile.hasPassword` (novo campo do `GET /users/me`, backend C1); `SetPasswordModal` (= `ChangePasswordModal` sem "senha atual"); "Configurações da conta" busca o perfil e mostra **"Definir senha"** (`hasPassword: false`) **ou** "Trocar senha" (`true`), nunca os dois — lê o cache `oratio-profile` pra não piscar. `forgot`→`reset` já está acessível pela tela `/login` (Fase B). | ✅ na `develop` |
| **D** | `vercel.json` bloco `headers` — CSP ganha os directives do GIS (ver "Fase D — CSP" abaixo). `VITE_GOOGLE_CLIENT_ID` na Vercel (humano). ~~`db push` de produção~~ **feito 2026-09-09** (Supabase). Cliente OAuth + origens de produção no Google Cloud Console (humano). Smoke iPhone PWA instalado (humano). Confirmar `ALLOWED_ORIGINS` do backend inalterado. | ✅ CSP mergeada na `develop` (`946cfac`); resto é humano |
| **E** | Mensageria + sinais de resultado + correções — ver "Fase E" abaixo. `authService.loginWithGoogle` retorna `{ tokens, isNewUser, googleLinkedNow }` **sem persistir**; texto fixo do `/login` removido; `/register` bloqueia conta existente; toast de auto-ligação; rótulo do botão; loading state; exclusão de conta só-Google. | ✅ na branch `feat/login-google-fase-e` |

## Critérios de aceite (frontend — BDD)

- [x] ~~**Dado** `/login` carregada, **então** o texto fixo *"Já entrou com Google antes? ..."*
      aparece sempre~~ — **revertido na Fase E (E1a): o texto foi removido.** O botão do Google
      renderiza quando há `VITE_GOOGLE_CLIENT_ID` (`GoogleSignInButton` — teste próprio +
      `Login.test.tsx`) segue valendo.
- [x] **Dado** o callback do GIS entrega um `credential`, **quando** conclui, **então**
      `authService.loginWithGoogle` faz `POST /auth/google` com `{ credential }` (`./api`
      mockado, asserção do corpo) e navega pro destino. **Fase E (E2/E3):** `loginWithGoogle`
      agora **retorna** os tokens sem gravar; a **tela** decide (`Login.tsx` grava sempre,
      `Register.tsx` descarta se `isNewUser: false`).
- [x] **Dado** `POST /auth/google` responde 401/503, **quando** o usuário tenta, **então**
      mensagem legível aparece e **nenhum** token é gravado, sem navegação.
- [x] **Dado** um 401 de `/auth/google`, **então** o interceptor do `api.ts` **não** dispara
      refresh+logout (`/auth/google` em `PUBLIC_AUTH_PATHS` — `api.test.ts`).
- [ ] **Manual (humano):** clicar o botão real no navegador (`npm run dev`) e completar o login.
      Precisa do cliente OAuth criado + `VITE_GOOGLE_CLIENT_ID` no `.env` + backend Fase A no ar.

### Fase C — definir senha (UI)

- [x] **Dado** `GET /users/me` com `hasPassword: false`, **quando** abro "Configurações da conta",
      **então** aparece o botão **"Definir senha"** (não "Trocar senha"); com `hasPassword: true`,
      o contrário (`AccountSettings.test.tsx`).
- [x] **Dado** o cache `oratio-profile` já tem `hasPassword`, **então** o botão certo renderiza
      antes do fetch responder (sem flash) — e um 401 no fetch redireciona pra `/login`.
- [x] **Dado** "Definir senha" aberto e senhas válidas iguais, **quando** confirmo, **então**
      `profileService.setPassword` faz `POST /users/me/set-password` com `{ password, confirmPassword }`
      (`./api` mockado, corpo verificado), mostra o estado de sucesso e chama `onDefined`
      (`SetPasswordModal.test.tsx`, `profileService.test.ts`).
- [x] **Dado** a conta já tem senha (backend responde 409), **então** a mensagem do backend
      aparece no modal e nada é gravado.
- [x] `SetPasswordModal` **não** tem campo "senha atual" e **não** menciona sessões revogadas
      (o backend não revoga nesse fluxo).

### Fase D — CSP, deploy, PWA

**A CSP é a única mudança de código da fase.** `vercel.json` → directive por directive
(valores da doc oficial do Google, `get-google-api-clientid` → seção CSP; conferido 2026-09-09):

| Directive | Adicionado | Como fica |
|---|---|---|
| `script-src` | `https://accounts.google.com/gsi/client` | `'self' 'wasm-unsafe-eval' https://accounts.google.com/gsi/client` |
| `style-src` | `https://accounts.google.com/gsi/style` | `'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com/gsi/style` |
| `connect-src` | `https://accounts.google.com/gsi/` | `'self' https://*.onrender.com https://accounts.google.com/gsi/` |
| `frame-src` | `https://accounts.google.com/gsi/` (directive nova — antes caía no `default-src 'self'`) | `'self' https://accounts.google.com/gsi/` |

Usar sempre a **URL-pai** `https://accounts.google.com/gsi/` em `connect-src`/`frame-src`
(recomendação do Google — listar URLs individuais quebra quando o GIS muda de endpoint).

- [x] `vercel.json` alterado exatamente como a tabela acima. Sem `report-uri` novo.
- [x] `ALLOWED_ORIGINS` do backend (`oratio-api` `main.ts`) **não** muda — o `POST /auth/google`
      sai da mesma origem de frontend que já está na allowlist; nenhuma origem nova.
- [ ] `npm run build` limpo (a CSP não afeta o build; só garantir que o JSON é válido).

**⚠️ A CSP não é testável localmente** — `vite preview` e `npm run dev` **não aplicam**
`vercel.json`; só a Vercel aplica, e ela **falha fechada** (`RULES.md` §4; já quebrou o PDF e as
fontes antes). Por isso o plano de verificação é **pós-deploy** e **obrigatório**:

**Plano de verificação pós-deploy (humano, logo após o deploy da Vercel):**
1. Abrir `https://oratio-phi.vercel.app/login` numa aba anônima, DevTools → Console aberto.
2. **Nenhuma** violação de CSP no console (`Refused to load…`, `Refused to connect…`,
   `Refused to frame…`). Conferir também a aba Network: `gsi/client` carrega `200`.
3. O botão "Entrar com Google" **renderiza** (não fica um espaço em branco).
4. Clicar o botão → o popup do Google abre (não é bloqueado por `frame-src`/`connect-src`).
5. Concluir o login com uma conta de teste → volta pro app, `POST /auth/google` responde `200`
   na aba Network, navega pra `/oratio/home`.
6. Repetir os passos 1–3 no **PWA instalado no iPhone** (Safari → Adicionar à Tela de Início):
   o popup abre **dentro** do app e volta pra ele — **não** joga pro Safari.
7. Regressão: abrir uma página com PDF (liturgia/consagração) e confirmar que o PDF ainda
   abre — a mudança de CSP não pode ter afetado `worker-src`/`blob:`.
8. Se **qualquer** passo falhar: reverter o `vercel.json` (o deploy anterior volta a CSP antiga),
   e revisar o directive culpado contra a doc do Google antes de tentar de novo.

**Pendências humanas da fase (não são código):**
- [ ] `VITE_GOOGLE_CLIENT_ID` nas env vars da Vercel (= `GOOGLE_CLIENT_ID` do Render).
- [ ] `GOOGLE_CLIENT_ID` nas env vars do Render.
- [x] `npx prisma db push` em produção (`oratio-api`) — **feito 2026-09-09** (Supabase;
      `LinkedAccount` + `password` nullable aplicados). Script
      `oratio-api/prisma/db-scripts/2026-09-08-login-google.sql`.
- [ ] Google Cloud Console: cliente OAuth "Web application" com *Authorized JavaScript origins*
      `http://localhost:5173` + `https://oratio-phi.vercel.app`; tela de consentimento (scopes
      `openid`/`email`/`profile`, não-sensíveis). Detalhe em `oratio-api/docs/specs/login-google.md`
      → "Notas de ambiente".
- [ ] Executar o plano de verificação pós-deploy acima.

---

Testes: Vitest + RTL, `./api`/`loadGsi` mockados, toda asserção com corpo verificado.

Arquivos Fase B: `src/services/api.ts`, `src/services/authService.ts`, `src/utils/loadGsi.ts`,
`src/components/GoogleSignInButton/*`, `src/pages/Login/*`, `src/pages/Register/*`,
`.env_example` (`VITE_GOOGLE_CLIENT_ID`).
Arquivos Fase C: `src/services/profileService.ts`, `src/components/SetPasswordModal/*`,
`src/pages/Profile/AccountSettings.tsx`.
Arquivos Fase D: `vercel.json` (CSP).

---

## Fase E — mensageria, sinais de resultado, correções (branch `feat/login-google-fase-e`)

Spec: `oratio-api/docs/specs/login-google.md` → "## Fase E". Backend pareado:
`oratio-api` branch `feat/login-google-fase-e` (E1 mensagem do 401, E2 os flags).

- [x] **E1a** — `Login.tsx`: removido o `<p>` fixo *"Já entrou com Google antes?…"* + CSS
      órfão. `Login.test.tsx`: texto ausente **+** a mensagem específica do 401 (E1) é exibida
      (`getAuthErrorMessage` repassa mensagem desconhecida verbatim).
- [x] **E2-consumo + E3** — `authService.loginWithGoogle` retorna `{ tokens, isNewUser,
      googleLinkedNow }` e **não persiste** (comentário sobre a assimetria com `login()`, que
      NÃO foi refatorado). `api.ts`: helpers `persistSession` / `clearAuthHeader`.
      `authService.discardGoogleSession` (revoga a sessão órfã, timeout 3s, best-effort).
      `Login.tsx`: os 3 desfechos entram → `persistSession` + navega. `Register.tsx`:
      `isNewUser:false` → `discardGoogleSession` + `AlertModal` "Você já tem conta no Oratio.
      Entre pela tela de login." → `/login`; `isNewUser:true` → `persistSession` + Home.
- [x] **E4** — `utils/flash.ts` + `<FlashToast/>` (montado no App, sobrevive ao `navigate`).
      `googleLinkedNow` → toast "Sua conta Google foi conectada à sua conta Oratio." (na
      `/register`, vira a mensagem do `AlertModal` do ramo E3).
- [x] **E1b** — aviso "Defina uma senha" **no Perfil**, de vez em quando (cooldown de 7 dias,
      `localStorage set_password_hint_last`), quando a pessoa abre o Perfil e `hasPassword:
      false`: a engrenagem de **Configurações da conta** pulsa e um balão aponta pra ela
      ("Definir senha" leva a `/oratio/profile/settings?senha=1`; "Agora não" fecha). Chegando
      em Configurações com `?senha=1`, o botão **"Definir senha"** rola até a vista e pulsa.
      Não é modal. (Substitui o `<SetPasswordNudge/>` app-level da 1ª versão.)
- [x] **E5 + E6** — `GoogleSignInButton`: prop `disabled` (camada que intercepta clique +
      spinner). `Login.tsx`/`Register.tsx` removem `text=` (default `continue_with`) e passam
      `disabled={loading}`.
- [x] **E7-frontend** — `profileService.deleteAccount({ password? , googleCredential? })`.
      `DeleteAccountModal` prop `hasPassword`: `true` → campo de senha; `false` → botão de
      reautenticação no Google depois que o e-mail confere. `Profile.tsx` passa
      `hasPassword={profile.hasPassword ?? true}`. Testes: 2 caminhos + 2 falhas.
- [x] **Docs** — este arquivo (Fase E + premissa do `db push` corrigida) · ponteiro
      `docs/specs/login-google.md` · `docs/ARCHITECTURE.md`.

### Checkpoint E — teste manual (humano)

- [ ] `/register` com uma conta que já existe → aviso "Você já tem conta…" → `/login` (e a
      sessão órfã não aparece em "Sessões ativas").
- [ ] `/register` com uma conta Google nova → entra direto.
- [ ] Login por senha numa conta só-Google → 401 "Esta conta entra com o Google…".
- [ ] Exclusão de conta só-Google: mesma conta Google → apaga; outra conta Google → 400,
      continua logado.
- [ ] Toast "Sua conta Google foi conectada…" ao auto-ligar.
