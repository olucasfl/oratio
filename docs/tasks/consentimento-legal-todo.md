# Todo: consentimento-legal — implementação (parcial, 2026-09-11)

> Spec: `docs/specs/consentimento-privacidade.md` (frontend) ·
> `oratio-api/docs/specs/consentimento-privacidade.md` (backend, mestre)
> Branch (os dois repos): `feat/consentimento-legal`, a partir de `origin/develop`.
> **NÃO mergear em `develop` até os dois lados (backend + frontend) estarem prontos.**

## Estado no fim desta sessão

**Backend (`oratio-api`) — commitado, branch `feat/consentimento-legal` (`fed10bb`), pushed.**
Implementação completa: schema (`legalTermsAcceptedAt`/`legalTermsVersion`, aditivo, SEM
backfill), `legal-terms-version.ts` (`LEGAL_TERMS_VERSION = "2026-09-11"`),
`CreateUserDto.legalTermsAccepted` (`@Equals(true)`), `GET /users/me` com `legalTermsAccepted`,
`POST /users/me/legal-terms-accepted` novo, `auth.service.ts` intocado, script de `db push`
`prisma/db-scripts/2026-09-11-consentimento-privacidade.sql` (SEM BACKFILL em destaque). 874
testes passando, build limpo. **Não tem `/review-pr` ainda.**

**Frontend (`oratio`) — commitado como WIP nesta sessão, branch `feat/consentimento-legal`,
pushed. `npx tsc -b` FALHA — ver "Bloqueios conhecidos" abaixo.** Arquivos novos/alterados:

- `src/services/profileService.ts` — `UserProfile.legalTermsAccepted?: boolean`,
  `acceptLegalTerms()` (`POST /users/me/legal-terms-accepted`, sem corpo).
- `src/services/authService.ts` — `register()` ganhou o 5º parâmetro
  `legalTermsAccepted: boolean`, obrigatório, incluído no corpo.
- `src/services/profileService.test.ts` / `authService.test.ts` — testes atualizados.
- `src/utils/legalContent.tsx` — modelo de bloco (`LegalBlock`: `h2`/`h3`/`p`/`ul`/`quote`/
  `table`) + `renderLegalBlocks()`/`renderInline()`. **Nunca `dangerouslySetInnerHTML`**
  (RULES.md §4) — mesmo espírito de `formatVerses()` (`LiturgiaFull.tsx`). `renderInline` só
  entende `**negrito**` (não é parser de Markdown genérico — decisão deliberada, o conteúdo é
  fixo, não input de usuário).
- `src/components/TermsOfUseContent/` (+ `.module.css`) e
  `src/components/PrivacyPolicyContent/` (+ `.module.css`) — texto REAL transcrito
  (não placeholder) a partir de `docs/legal/2026-09-11-termos-de-uso.md` e
  `docs/legal/2026-09-11-politica-de-privacidade.md`. Exportam `TERMS_OF_USE_VERSION` /
  `PRIVACY_POLICY_VERSION = "2026-09-11"`.
- `src/components/LegalTermsGate/` (+ `.test.tsx`) — espelha `WelcomeGate`; redireciona pra
  `/oratio/consentimento` quando `legalTermsAccepted !== true`; lista de exceção já inclui
  `/oratio/consentimento`, `/termos-de-uso`, `/politica-de-privacidade`, `/login`, `/register`,
  `/verificar-email`, `/confirmar-troca-email`.
- `src/components/LegalConsentGate/` (+ `.test.tsx`, `.module.css`) — os dois modos
  (`pre-account`/`post-account`), duas caixas independentes (nascem desmarcadas, botão
  desabilitado até as duas marcarem), troca de **view interna** (`consent`/`terms`/`privacy` —
  nunca navegação de rota, então as caixas nunca desmontam e "Voltar" preserva o estado sem
  esforço), `mode="post-account"` integra `DeleteAccountModal` já existente.
- `src/utils/legalDocs.test.ts` — compara a versão dos dois `.md` de `docs/legal/` entre si e
  com as constantes exportadas pelos dois componentes de conteúdo. **Não compila** (ver
  "Bloqueios conhecidos").
- `src/pages/TermsOfUse/` (+ `.module.css`) — rota pública, só leitura, botão voltar
  (`navigate(-1)`).
- `src/pages/PrivacyPolicy/` — rota pública, reusa `TermsOfUse.module.css` (mesmo padrão de
  `Tratado.tsx` reusando o CSS de `Catecismo`).

## Bloqueios conhecidos (encontrados rodando `npx tsc -b` nesta sessão)

1. **`src/utils/legalDocs.test.ts` não compila.** `node:fs`, `node:path` e `process` não
   resolvem — `tsconfig.app.json` (`"types": ["vite/client", "@testing-library/jest-dom"]`,
   sem `"node"`) restringe deliberadamente os globals de Node no app inteiro, e `tsc -b`
   tipa os `.test.ts` sob o mesmo `include: ["src"]`. `@types/node` **já está** em
   `package.json` — o problema é só não estar na lista `types` desse tsconfig.
   **Caminho recomendado (evita mexer no tsconfig do app inteiro):** trocar
   `readFileSync`/`node:path` por import Vite `?raw` — `import termosRaw from
   "../../../docs/legal/2026-09-11-termos-de-uso.md?raw"` — que funciona em Vitest (mesmo
   pipeline do Vite) sem precisar de tipos de Node. Precisa então de um `declare module
   "*.md?raw"` em algum `.d.ts` do projeto (ver como `vite-env.d.ts` já faz para outros
   assets, se fizer). Alternativa (não escolhida): adicionar `"node"` a `types` no
   `tsconfig.app.json` — afeta o app inteiro, não só o teste; avaliar com cuidado antes.
2. **`src/pages/Register/Register.tsx:84`** — `register(name,email,password,confirmPassword)`
   ainda não foi atualizado pro 5º argumento `legalTermsAccepted`. É o wiring pendente abaixo,
   não um bug separado.

## O que falta (nesta ordem)

1. **`src/pages/LegalConsent/`** (+ `.module.css`) — página nova, rota protegida
   `/oratio/consentimento`. Busca o próprio perfil (`getProfile()` de `profileService.ts`) pra
   alimentar `hasPassword`/`hasGoogle`/`userEmail` do `LegalConsentGate` (`mode="post-account"`).
   Ao `onAccept`, `navigate("/oratio/home", { replace: true })` (mesma simplicidade do
   `WelcomeGuide` — não tenta voltar pra onde a pessoa ia).

2. **Wiring em `src/App.tsx`:**
   - `<LegalTermsGate/>` **antes** de `<WelcomeGate/>` no JSX (mesma ordem do "Comportamento
     esperado" da spec — consentimento vem antes do guia de boas-vindas).
   - três rotas novas: `/termos-de-uso` (pública, `<TermsOfUse/>`), `/politica-de-privacidade`
     (pública, `<PrivacyPolicy/>`), `/oratio/consentimento` (dentro de `<ProtectedRoute>`,
     `<LegalConsent/>`) — seguir o padrão `lazy()` das demais páginas.

3. **Wiring em `src/pages/Register/Register.tsx`:**
   - estado local `legalTermsAccepted` (`useState(false)`) + estado do gate (`gateOpen`).
   - `handleSubmit`: se `!legalTermsAccepted`, abre o `LegalConsentGate` (`mode="pre-account"`)
     **em vez de** chamar `register()` direto; só chama `register(name,email,password,
     confirmPassword, true)` depois que `onAccept` do gate rodar (o gate seta
     `legalTermsAccepted=true` e fecha; o clique original de "Criar conta" some — a pessoa
     precisa clicar "Criar conta" de novo, OU o `onAccept` já dispara o submit sozinho: **decisão
     de UX em aberto, não fechada nesta sessão** — ver spec, critério de aceite "abre antes de
     qualquer chamada a register()").
   - overlay sobre `<GoogleSignInButton/>`: envolver num `<div style={{position:"relative"}}>`
     (mesma técnica `.blocker` que `GoogleSignInButton` já usa internamente pro estado
     `disabled` — ver `GoogleSignInButton.module.css`), com um botão transparente
     `position:absolute; inset:0` que abre o gate (`mode="pre-account"`) enquanto
     `!legalTermsAccepted`, escondido depois de aceitar.
   - `handleGoogleCredential`: depois que `loginWithGoogle` devolve os tokens e
     `persistSession()` roda, chamar `acceptLegalTerms()` (de `profileService.ts`) **antes** de
     `navigate("/oratio/boas-vindas")` — só no caminho `isNewUser: true` (cadastro novo; login
     recorrente não passa por aqui, é pego pelo `LegalTermsGate` na porta 4).
   - `Register.test.tsx` precisa de testes novos pra tudo isso (não escritos ainda).

4. **Testes/build/lint no frontend** — rodar depois do wiring acima:
   `npx vitest run` → `npx tsc -b` (**tem que passar limpo**, incluindo o bloqueio #1 acima) →
   `npx eslint <arquivos tocados>` → `npm run test:cov` → `npm run build`.

5. **`/review-pr`** nos dois repos, sobre o diff completo de `feat/consentimento-legal` contra
   `develop` (backend já pronto pra revisão; frontend só depois do item 4).

6. **Merge `--no-ff` de `feat/consentimento-legal` em `develop` + push — nos dois repos, na
   mesma janela** (a entrega só fecha com os dois lados; subir só um deixa `GET /users/me`
   devolvendo `legalTermsAccepted` sem ninguém no frontend saber ler, ou vice-versa). Depois do
   merge, atualizar `docs/specs/INDEX.md` dos dois repos (status da linha
   "Consentimento de privacidade" e, quando aplicável, "Pendências de execução humana" pro
   `db push` do script `2026-09-11-consentimento-privacidade.sql`).

## Decisões tomadas nesta sessão que NÃO estão na spec

- **`LegalConsentGate` sempre usa `createPortal(..., document.body)`**, nos dois modos — não só
  no overlay de `pre-account`. Em `post-account` isso funciona porque `/oratio/consentimento` é
  tela cheia sem mais nada por trás; não há necessidade de um modo "inline".
- **Sem botão de volta na view "declined"** (`post-account`, depois de clicar "Recusar"): só
  "Sair do app" e "Excluir minha conta" — bate com a leitura literal da spec ("troca o conteúdo
  do mesmo overlay por duas saídas lado a lado"), mas é uma leitura, não algo que a spec deixa
  inequívoco. Se Lucas achar duro demais, é fácil adicionar um "Voltar" no meio das duas.
- **"Sair do app" chama `logout()` de `authService.ts`** (revoga a sessão no servidor + limpa
  local), não só `clearSession()` direto — a spec dizia "`logout()`/`clearSession()` que já
  existe" sem decidir qual dos dois; escolhi `logout()` por ser mais correto (revoga de verdade).
- **`LegalBlock` ganhou um tipo `h3`** além dos previstos na spec (`h2`/`p`/`ul`/`quote`/
  `table`) — necessário pras subseções da Política (3.1–3.5, "Como exercer"), que são `###` no
  `.md` fonte, um nível abaixo de `##`.
- **Os dois componentes de conteúdo têm o texto TRANSCRITO como JSX, não lido de
  `docs/legal/*.md` em runtime** — bate com o que você pediu ("o texto... passa a viver no
  componente — uma fonte só"), registrado aqui só pra deixar explícito: os `.md` em
  `docs/legal/` **não são importados por código nenhum**, exceto o teste de acoplamento
  (`legalDocs.test.ts`, hoje quebrado — bloqueio #1).
- **CSS novo usa os tokens já existentes** (`--oratio-primary`, `--oratio-card-bg`, `--z-modal`,
  `--oratio-radius-lg`, `--oratio-shadow-strong`) em vez de valores soltos — não é uma decisão
  de design nova, só segue `src/styles/variables.css`.

## Registro do que passou/falhou nesta sessão

- Backend: `npm test` → 874 passando. `npm run build` → limpo. `npx prisma generate` → ok.
  `npm run lint` → **quebrado por config, pré-existente, não relacionado a esta tarefa**
  (`eslint.config.mjs` ignora os globs passados — mesmo erro rodando `npm run lint` puro, sem
  nenhuma mudança minha).
- Frontend: `npx tsc -b` → **falha** (bloqueios #1 e #2 acima). Nenhum `vitest run` completo foi
  rodado ainda nesta sessão para o frontend (fazer isso só depois do wiring, junto do item 4).
