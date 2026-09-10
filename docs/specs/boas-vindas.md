# Boas-vindas — ponteiro

> Status: **implementado, na `develop`** (2026-09-10) — falta o teste manual na tela pelos
> dois métodos (senha e Google) e a promoção pra `main`. Depende do `db push` + backfill de
> produção do backend (`oratio-api/prisma/db-scripts/2026-09-10-boas-vindas.sql`, execução
> humana) — sem a coluna, o `GET /users/me` dá 500.

A **spec mestra** vive no backend: `oratio-api/docs/specs/boas-vindas.md` (objetivo, contrato
das rotas, modelo de dados, backfill, critérios de aceite, conteúdo das 3 páginas).

## O que este repo construiu

- **Rota `/oratio/boas-vindas`** (`src/App.tsx`) — sob `<ProtectedRoute>`, tela cheia, **sem**
  bottom nav (a página não a renderiza; não há layout compartilhado — `ARCHITECTURE.md` §6).
  `lazy()`-importada; **fora** da lista de preload (é evento único, não destino provável).
- **`pages/WelcomeGuide`** — 3 páginas, navegação só pra frente ("Próximo" → "Começar"), sem
  "pular" e sem botão de saída, indicador de progresso (pontinhos + `aria-label` "Página X de
  3"). `role="dialog"` / `aria-modal`, foco no botão de avanço a cada página,
  `prefers-reduced-motion` respeitado. Ícones grandes de `lucide-react` (`Sunrise` / `Cross` /
  `BookOpen`) no vermelho da marca, tipografia serifada — sem asset novo. Conteúdo: o da spec
  mestra (versão final 2026-09-10).
- **`components/WelcomeGate`** — render-nothing no shell do `App` (ao lado de `FlashToast`). Ao
  montar autenticado e fora de rota de auth/guia, busca `GET /users/me` **uma vez**; se
  `showWelcome === true`, `navigate("/oratio/boas-vindas", { replace })`. Falha de rede → não
  redireciona, reavalia no próximo boot.
- **`services/welcomeService.markWelcomeSeen()`** → `POST /users/me/welcome-seen`.
- **`UserProfile.showWelcome?`** no `profileService`.
- **`Login.tsx` / `Register.tsx`**: cadastro novo via Google (`isNewUser`) navega direto pro
  guia — só evita o flash da Home; a visibilidade real continua sendo do `showWelcome`.
- **Sem `localStorage`** (o cleanup de `APP_VERSION` varreria a flag a cada release —
  `pwa-cache-guardrail`). Sem chave nova, sem mexer em `KEEP_ON_LOGOUT` / `CACHE_NAME`.

## Testes

Dois (a pedido do humano — "só dois"), ambos no `WelcomeGate`:
1. `showWelcome: true` → redireciona pra `/oratio/boas-vindas`.
2. `showWelcome: false` → nenhum redirect (o guia não "volta" depois do welcome-seen).

O resto dos critérios (progresso, sem pular, "Começar" → `markWelcomeSeen` + Home, reabrir na
página 1, falha de rede não bloqueia) fica pra verificação manual na tela.

## Verificação de PWA (`pwa-cache-guardrail`)

`npm run build` OK. **Falta o teste em aba anônima** (a janela normal serve o service worker
antigo). `CACHE_NAME` / `APP_VERSION` **não** foram bumpados aqui — é passo de release
(`/bump-version`, `RULES.md` §4); o chunk novo do guia entra no precache do SW no próximo bump
via `asset-manifest.json`.
