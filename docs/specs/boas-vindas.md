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
  3"). `role="dialog"` / `aria-modal` / `aria-labelledby`, foco no botão de avanço a cada página.
  Ícones grandes de `lucide-react` (`Sunrise` / `Cross` / `BookOpen`) no vermelho da marca,
  tipografia serifada — sem asset novo.
  - **Animado (2026-09-10):** título e corpo se *digitam* em tempos escalonados
    (`useTypewriter.ts` — hook local que espelha o typewriter das sugestões do Vox: `setTimeout`
    em pedaços, timer num `ref`, sem abstração compartilhada); a página que sai desliza pra
    esquerda enquanto a que entra vem da direita; o ícone tem movimento próprio lento. Tocar na
    tela completa o texto em curso; arrastar pra esquerda avança (o botão segue como controle
    principal e alvo do foco). Só `transform`/`opacity`, tudo sob
    `@media (prefers-reduced-motion: no-preference)`.
  - **`prefers-reduced-motion: reduce`** é caminho de primeira classe: todo texto completo e
    instantâneo, zero animação de entrada/transição, e a camada da página que sai nem é montada.
    A camada que se digita é `aria-hidden`; o texto completo mora numa cópia `.srOnly` desde o
    início (o nome acessível do diálogo é sempre o título inteiro). Sem `aria-live`.
  - Conteúdo: **desvio de 2026-09-10** — a copy foi expandida (mais do que o app oferece, sem
    prometer o que não existe) e a estrutura ganhou vida. Registro na spec mestra
    (`oratio-api/docs/specs/boas-vindas.md`, bloco "Desvio de conteúdo/comportamento"). Continua
    dentro do contrato: 3 telas, sem pular, sem sair, progresso sempre visível, `markWelcomeSeen`
    só no "Começar", a11y mantida.
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

`WelcomeGate` (3): `showWelcome: true` → redireciona; `showWelcome: false` → nenhum redirect;
**monta deslogado em `/login`, loga, a navegação SPA dispara o redirect** (regressão do bug de
2026-09-10 — o efeito só rodava no boot).

`WelcomeGuide` (8, criados junto com a animação): avança as 3 páginas e conclui na última
(`markWelcomeSeen` + `navigate` pra `/oratio/home`); falha do `markWelcomeSeen` navega mesmo
assim; `prefers-reduced-motion` → texto completo e instantâneo, sem caret; com movimento o corpo
se digita aos poucos (fake timers); a transição mantém as duas páginas no DOM por um instante;
tocar completa o texto; arrastar pra esquerda avança e pra direita não; sem controle de
pular/sair.

O restante (reabrir na página 1 ao fechar no meio, os dois métodos de primeira entrada) fica
pra verificação manual na tela.

## Verificação de PWA (`pwa-cache-guardrail`)

`npm run build` OK. **Falta o teste em aba anônima** (a janela normal serve o service worker
antigo). `CACHE_NAME` / `APP_VERSION` **não** foram bumpados aqui — é passo de release
(`/bump-version`, `RULES.md` §4); o chunk novo do guia entra no precache do SW no próximo bump
via `asset-manifest.json`.
