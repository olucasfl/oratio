# Índice de specs — Oratio Web

Mapa único de `spec ↔ plano ↔ checklist ↔ status`. **Este arquivo é a fonte da verdade sobre o
que existe**; não confie em adivinhar nome de arquivo. Quem fecha uma fase atualiza esta tabela
no mesmo commit — e `/docs-sync` confere se ela bate com a realidade.

| Feature | Spec | Plano | Checklist | Backend pareado | Status |
|---|---|---|---|---|---|
| Cobertura de testes + lint | `specs/cobertura-testes.md` | `tasks/plan.md` | (no próprio plano) | n/a | ⚠️ **parcial** — cobertura ✅, lint ❌ (47 problemas / 26 erros, medido 2026-09-08) |
| Bíblia de Estudo | — *(não precisa: já entregue)* | `tasks/biblia-plan.md` | `tasks/biblia-todo.md` | `oratio-api/docs/tasks/biblia-*.md` | ✅ **em produção** (F1–F9 na `main`) |
| Perfis de resposta do VoxAI | — *(não precisa: já entregue)* | `tasks/vox-profiles.md` (ponteiro) | `tasks/vox-profiles-todo.md` | `oratio-api/docs/tasks/vox-profiles-plan.md` (mestre) | ✅ **em produção** (F1–F4 na `main`; backend idem) |
| Reformulação das notificações | — | `tasks/notifications.md` (ponteiro) | — | `oratio-api/docs/tasks/notifications-*.md` (mestre) | ✅ concluída |
| Biografias do Santo do Dia | — | `tasks/santos-plan.md` | `tasks/santos-todo.md` | n/a | ✅ concluída (20/out–13/dez) |
| Entrar com Google | `specs/login-google.md` (ponteiro) | `tasks/login-google-todo.md` | — | `oratio-api/docs/specs/login-google.md` (mestre) | 🚧 **Fases A–E na `develop`** (Fase D CSP mergeada `946cfac`; Fase E 2026-09-09: `loginWithGoogle` não persiste, `/register` bloqueia conta existente, toast de auto-ligação, `disabled` no botão, exclusão de conta só-Google, aviso "Defina uma senha" no Perfil). **✅ BUG-E1 corrigido** (balão "Defina uma senha" via `<Portal/>`, commit `23b0d78`, na `develop` pelo merge `4401808`) **e verificado nas 3 configurações no Checkpoint E (2026-09-10, os 7 cenários OK).** **Sem bloqueio de código pra `main`** — falta só pendência humana: `VITE_GOOGLE_CLIENT_ID` na Vercel + `GOOGLE_CLIENT_ID` no Render + publicar o app OAuth (Política de Privacidade) + verificação pós-deploy da CSP + smoke iPhone PWA. |
| Boas-vindas (guia de primeira entrada) | `specs/boas-vindas.md` (ponteiro) | — *(sem plano: mudança pequena)* | — | `oratio-api/docs/specs/boas-vindas.md` (mestre) | 🚧 **na `develop` dos dois repos** (2026-09-10) — **`main` não tem nada**. Guia de 3 páginas na 1ª entrada (senha e Google), 1x só. Rota `/oratio/boas-vindas` tela cheia (fora de bottom nav), `WelcomeGuide` (3 páginas, progresso, sem pular/sair) — **animado desde 2026-09-10**: texto que se digita (`useTypewriter.ts`, espelha o Vox), transição real entre páginas, ícone com movimento próprio, tocar completa o texto e arrastar avança; `prefers-reduced-motion` = texto inteiro e instantâneo, camada da página que sai nem monta; copy expandida (desvio registrado na spec mestra). `WelcomeGate` no shell redireciona por `showWelcome` do `GET /users/me` — **reavalia a cada troca de rota** (2026-09-10: cadastro por senha caía na Home porque o efeito só rodava no boot), `checked` ref ainda garante 1 busca por sessão. `welcomeService.markWelcomeSeen` → `POST /users/me/welcome-seen`. Sem `localStorage`, sem rota nova de auth. 11 testes (3 `WelcomeGate` + 8 `WelcomeGuide`). **Backend na `develop` do `oratio-api`** (`welcomeSeenAt` + `showWelcome` + rota idempotente). **Bloqueio pra `main`:** `db push` + backfill de produção pendentes (execução humana, `oratio-api/prisma/db-scripts/2026-09-10-boas-vindas.sql`) — sem a coluna, `GET /users/me` dá 500. Falta também o teste manual na tela. |
| Prova de identidade (reautenticação p/ operações sensíveis) | `specs/prova-identidade.md` (ponteiro) | — *(sem plano: mudança pequena)* | — | `oratio-api/docs/specs/prova-identidade.md` (mestre) | 🚧 **na `develop`** (2026-09-10) — spawned do teste da Fase E. O app tratava a senha como prova única → (1) não dava pra excluir conta com o Google se você tem senha (LGPD), (2) não havia "esqueci minha senha atual" dentro do app. **Frontend:** `DeleteAccountModal` em 3 modos (só senha / só Google / os dois com link "Não lembro minha senha" → botão Google) + `hasGoogle` no `profileService`/`Profile`; link "Não lembro minha senha atual" no `ChangePasswordModal` → `forgotPassword(email)` + confirmação deixando claro que o reset se conclui pelo e-mail, fora do app (rota pública reusada, **sem rota nova**). **Backend** (`oratio-api` develop): `assertFreshProof` + `hasGoogle` no `GET /users/me` + 2 testes. Sem schema, sem `db push`. Falta: teste manual na tela + promoção pra `main`. |

## Dívidas conhecidas (medidas em 2026-09-04)

Não são specs; são gaps reais que a auditoria encontrou e que precisam de dono.

- **Fase Lint em aberto.** `npx eslint .` → 47 problemas (26 erros / 21 avisos), medido em
  2026-09-08 (baseline da spec: 148 = 128/20). O backlog recuou bastante, mas "0 erros" ainda não
  foi atingido. `tasks/plan.md` L2–L11 registram o que falta.
- ~~**Serviços da Bíblia sem cobertura.**~~ ✅ Resolvido em 2026-09-04: os dois foram a **100%**
  (29 testes novos). Ver `tasks/plan.md`, Tarefa 1-bis.
- ~~**`CollectionDetail.test.tsx` sem asserção de visitante.**~~ ✅ Resolvido em 2026-09-04. A
  tela redireciona visitante para `/oratio/biblia` em vez de abrir o `GuestGateModal` — o teste
  agora prova o redirect **e** que a coleção nunca é pedida ao backend antes dele.
- ~~**`useLiturgy.ts` com URL de produção hardcodada.**~~ ✅ Resolvido em 2026-09-04: passa pelo
  `liturgiaService` → `api.ts` → `VITE_API_URL`. Dev local deixa de bater em produção.

## Legenda de status

| Status | Significa |
|---|---|
| 📝 rascunho | spec escrita, ainda não aprovada pelo humano |
| ✅ aprovada | aprovada, implementação não começou |
| 🚧 em andamento | tem plano e checklist abertos em `docs/tasks/` |
| ✅ implementada | todos os critérios de aceite verificados por `/qa-verify` |
| 🗑️ obsoleta | superada por outra spec — diga qual |

## Como usar

- **Feature nova:** `/criar-spec <nome>` → gera `specs/<nome>.md` a partir de `_template.md` e
  adiciona a linha aqui.
- **Implementar:** `/implement-story specs/<nome>.md`.
- **Provar que está pronto:** `/qa-verify specs/<nome>.md` — critério a critério, com evidência.
- **Requisito mudou:** edite **só a spec** e rode `/spec-sync specs/<nome>.md`. O agente compara
  desejado × implementado × testes e reporta a divergência. Não reexplique o contexto em conversa
  nova — a spec é o único lugar onde "o que deveria acontecer" está escrito.

## Por que não há spec para as features existentes

Todas as features desta tabela foram construídas direto no par plano+checklist, sem spec — e
**não vale a pena escrever spec retroativa para elas**. Spec é contrato antes do código: quando o
código já existe e funciona, o que sobra é documentação, e isso o `docs/ARCHITECTURE.md` já faz.
Um terceiro arquivo dizendo o mesmo só cria mais uma coisa para manter em sincronia.

O template e os comandos (`/criar-spec`, `/qa-verify`, `/spec-sync`) valem para a **próxima**
feature — a que ainda não existe. Aí a spec é contrato de verdade, e mudar um requisito vira
editar um arquivo em vez de reexplicar contexto numa conversa nova.
