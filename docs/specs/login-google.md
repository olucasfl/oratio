# Entrar com Google — ponteiro

> Status: aprovada (2026-09-08)

A **spec mestra** desta feature vive no backend:
`oratio-api/docs/specs/login-google.md` (objetivo, contrato das rotas, modelo de
dados, critérios de aceite, fases, notas de ambiente).

Checklists executáveis (a criar):
- Backend: `oratio-api/docs/tasks/login-google-todo.md`
- Frontend: `oratio/docs/tasks/login-google-todo.md`

## O que o frontend constrói

- **Script GIS** (`https://accounts.google.com/gsi/client`) carregado nas telas
  `/login` e `/register`. Lib atual do Google — **não** usar `gapi.auth2`
  (descontinuada).
- `google.accounts.id.initialize({ client_id: VITE_GOOGLE_CLIENT_ID, callback,
  use_fedcm_for_button: true, itp_support: true, ux_mode: "popup" })` +
  `renderButton`. **Nunca** `ux_mode: "redirect"` / `login_uri` — num PWA
  instalado no iOS isso joga a pessoa pro Safari e perde o contexto.
- `authService.loginWithGoogle(credential)` → `POST /auth/google` pelo
  `api` compartilhado (`x-app: oratio` já embutido). **Fase E:** retorna
  `{ access_token, refresh_token, isNewUser, googleLinkedNow }` e **não grava
  nada** — a tela decide (`Login.tsx` grava e navega; `Register.tsx` descarta a
  sessão se `isNewUser: false` e vai pro `/login`).
- ~~**Texto fixo** *"Já entrou com Google antes?…"* abaixo da área de erro do
  login~~ — **removido na Fase E (E1a):** com a mensagem específica do backend
  (E1), virou ruído permanente pros ~99% que entram por senha.
- **Definir senha** nas configurações (para quem entrou só com Google): chama
  `POST /users/me/set-password`. Aparece só quando a conta não tem senha.

## Fase E — mensageria + correções (branch `feat/login-google-fase-e`)

Detalhe na spec mestra `oratio-api/docs/specs/login-google.md` → "## Fase E".

- **E2/E3** — `loginWithGoogle` não persiste (ver acima). `Register.tsx` bloqueia
  quem já tem conta: descarta os tokens, revoga a sessão órfã
  (`authService.discardGoogleSession` → `POST /auth/logout`), aviso → `/login`.
- **E4** — `utils/flash.ts` + `<FlashToast/>` (montado no App, sobrevive ao
  `navigate`): toast "Sua conta Google foi conectada à sua conta Oratio." quando
  `googleLinkedNow`.
- **E1b** — aviso "Defina uma senha" **no Perfil**, de vez em quando (cooldown
  de 7 dias) quando `hasPassword: false`: a engrenagem de Configurações pulsa +
  balão apontando; em `AccountSettings` com `?senha=1` o botão "Definir senha"
  rola até a vista e pulsa. Nunca modal.
- **E5/E6** — `GoogleSignInButton` com rótulo `continue_with` (default) e prop
  `disabled` (bloqueia o clique + spinner durante o fluxo).
- **E7** — `DeleteAccountModal` por `hasPassword`: conta só-Google reautentica
  pelo Google; `profileService.deleteAccount({ password? , googleCredential? })`.

## Mudanças de infra que são deste repo

- **CSP no `vercel.json`** (`RULES.md` §4 — perguntar antes, falha fechada, só a
  Vercel aplica, precisa de plano de verificação pós-deploy):
  - `script-src`: `https://accounts.google.com/gsi/client`
  - `style-src`: `https://accounts.google.com/gsi/style`
  - `frame-src`: `https://accounts.google.com/gsi/`
  - `connect-src`: `https://accounts.google.com/gsi/`
- **`VITE_GOOGLE_CLIENT_ID`** (Vercel) — mesmo valor do `GOOGLE_CLIENT_ID` do
  backend.

## Decisões já tomadas (detalhe na spec mestra)

| Tema | Decisão |
|---|---|
| Ligação de contas | Auto-ligar **só** quando o Google retorna `email_verified: true`. `false` → recusa com mensagem acionável, nunca cria 2ª conta. |
| Senha | `User.password` vira opcional. Conta Google nasce sem senha. "Esqueci minha senha" é a recuperação universal. |
| Login por senha em conta só-Google | 401 genérico (`Invalid credentials`) — não vaza o tipo da conta. |
| Desvincular | Fora de escopo no v1. |
| Foto | Descartada, não persistida. |
| Nome | Do Google só na criação; nunca sobrescrito depois. |
| Apple | Só o formato (`LinkedAccount`) comporta; nada da Apple agora. |

## Testes (frontend)

`./api` sempre mockado, toda asserção com corpo verificado (`oratio-testing` /
convenção Vitest da casa). Cobrir: botão renderiza + texto fixo presente;
callback → `POST /auth/google` com `{ credential }` → tokens gravados + navegação;
401 → mensagem legível, nenhum token gravado.
