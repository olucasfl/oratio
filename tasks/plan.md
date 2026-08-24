# Plano — Cobertura de testes do frontend (mínimo 80%)

Contexto: backend tem ~96% de cobertura com testes reais (ver `oratio-api/docs/ARCHITECTURE.md`
§2). Frontend começou esta sessão em **1.2% statements / 0.62% branches** (4.394 statements no
total, medidos com `coverage.all: true` — todo arquivo de `src/` conta, tocado ou não). Meta:
80% lines/statements/functions, 70% branches (branches naturalmente ficam atrás — mesmo padrão
observado no backend).

Regra de ouro: só escrever teste que verifica comportamento real (efeito colateral, valor de
retorno, chamada a dependência mockada). Nada de `expect(true).toBe(true)` ou "renders without
crashing" sem asserção. Arquivo sem nada testável (puro markup, sem branch, sem lógica) ganha
`/* v8 ignore file */` em vez de teste forçado — decisão por arquivo, na hora de tocar nele, não
uma lista pré-definida.

Excluído do denominador (`vitest.config.ts`): `src/data/**` (conteúdo estático), `src/main.tsx`
(boot puro), `*.d.ts`.

## Fase 0 — Fundação [CONCLUÍDA]

- [x] Corrigir ambiente: `jsdom@30`/`@testing-library/jest-dom@7` exigem Node ≥22; máquina roda
      Node 20.19 → suíte inteira não rodava. Pinado para `jsdom@^29.1.1` /
      `@testing-library/jest-dom@^6.9.1` (últimas versões compatíveis com Node 20.19).
- [x] `@vitest/coverage-v8@4.1.11` instalado, `vitest.config.ts` com `coverage.all: true` +
      `include`/`exclude`/`thresholds` (80/70/80/80).
- [x] `npm run test:cov` adicionado (espelha o `test:cov` do backend).

## Fase 1 — Services (maior densidade de lógica, melhor ROI)

- [x] **Tarefa 1** — `src/services/api.ts`: interceptors (request auth header, 401→refresh→retry,
      fila de requisições concorrentes, guest-401-passthrough, `PUBLIC_AUTH_PATHS`,
      `_retry` já setado, erro sem `config`, não-401). 14 testes novos em `api.test.ts`, direto
      contra `interceptors.{request,response}.handlers[0]` (sem lib de mock de HTTP — ver
      comentário no arquivo). Nenhum bug encontrado: o fluxo se comportou como o
      ARCHITECTURE.md descreve em todos os cenários testados.
- [x] **Tarefa 2** — `authService.ts` (login/register/logout/forgotPassword/verifyEmail/
      confirmEmailChange, `./api` mockado — logout best-effort mesmo com falha no revoke do
      servidor, mesmo sem revoke quando não há refresh_token), `utils/authErrors.ts` (8 cenários:
      sem response, 429, mensagem conhecida traduzida, array do class-validator, mensagem
      desconhecida repassada, fallback, fallback customizado, string vazia), `utils/
      authRedirect.ts` (encoding do `?redirect=`). 20 testes novos, nenhum bug encontrado.
- [x] **Tarefa 3** — `pushService.ts` (jsdom não implementa a Push API — cada teste liga/desliga
      `serviceWorker`/`PushManager`/`Notification` via stub global; cobre `isPushSupported`,
      `getPermission`, `getPushStatus` incl. erro engolido, `enablePush` incl. os 3 erros
      nomeados e a conversão base64url→`Uint8Array` da VAPID key, `disablePush` incl. resiliência
      a falha do backend, `sendTestPush`, `syncPushTimezone` — o fix de boot desta sessão, com
      teste específico pro caso "push desligado = no-op"), `notificationsService.ts`,
      `adminNotificationsService.ts`, `activityService.ts` (todos thin wrappers sobre `./api`
      mockado). 56 testes novos, nenhum bug encontrado.
- [ ] Tarefa 4 — `profileService.ts`, `rosaryService.ts`, `readingProgressService.ts`,
      `prayersService.ts`, `homeService.ts`
- [ ] Tarefa 5 — `quaresmaService.ts`, `adminService.ts`
- [ ] Tarefa 6 — `consecrationService.ts`, `bibliaService.ts`
- [ ] Tarefa 7 — `voxService.ts`

## Fase 2 — Utils (funções puras)

- [ ] Tarefa 8 — `overlayCoordinator.ts`, `localCache.ts`, `fontScale.ts`
- [ ] Tarefa 9 — `rosaryList.ts`, `rosaryPrayers.ts`, `rosaryDays.ts`
- [ ] Tarefa 10 — `greeting.ts`, `saintOfDay.ts`, `liturgicalCelebration.ts`
- [ ] Tarefa 11 — `liturgyShareText.ts`, `bibleShareText.ts`, `prayerShareText.ts`,
      `rosaryShareText.ts`
- [ ] Tarefa 12 — `installPrompt.ts`, `isPwa.ts`, `deviceDetect.ts` (`pdfConfig.ts` já parcial)

## Fase 3 — Hooks

- [ ] Tarefa 13 — `useOffline`, `usePullToRefresh`, `useReadingSize`, `useLockBodyScroll`,
      `usePublishHeightVar`
- [ ] Tarefa 14 — `useFraseDiaria`, `useVisualViewportOffset`, `useLiturgy`

## Fase 4 — Contexts & Guards

- [ ] Tarefa 15 — `PullToRefreshContext`, `ProtectedRoute`, `AdminRoute`

## Fase 5 — Componentes com lógica real

- [ ] Tarefa 16 — `GuestGateModal`, `GuestWelcomeModal`, demais modais que registram em
      `overlayCoordinator`
- [ ] Tarefa 17 — `AdminNotifications`, `AdminChart`/`AdminHeatmap`/`AdminFilterSheet`
- [ ] Tarefa 18 — `NotificationBell`, `NotificationNudge`
- [ ] Tarefa 19 — `BottomNavbar`, `MenuDrawer` (estado ativo por rota)
- [ ] Tarefa 20 — `InstallAppNudge`/`InstallAppModal`, `PullToRefresh`

## Fase 6 — Páginas com lógica real

- [ ] Tarefa 21 — `App.tsx`: boot sequence (cache-version bump, correção de URL antes do
      primeiro paint, redirecionamento guest) — alto risco, alto valor
- [ ] Tarefa 22 — `Profile.tsx` (cálculo/exibição de sequência — ligado aos bugs de notificação
      já corrigidos no backend), `AdminPanel.tsx`
- [ ] Tarefa 23 — Login/Register/ForgotPassword/ResetPassword (validação client-side, tratamento
      de erro)
- [ ] Tarefa 24 — `RosaryPage`, `LiturgiaFull` (expandir teste existente), páginas de Consagração
- [ ] Tarefa 25 — páginas restantes, só o suficiente pra fechar o gap até 80% — sem forçar teste
      em página puramente visual

## Fase Lint — limpar `npm run lint` (148 problemas, 128 erros / 20 avisos)

`npm run lint` estava 100% quebrado (sem `eslint.config.js`) — corrigido, e com ele rodando de
verdade apareceram 148 problemas reais. Regra: nenhuma correção pode mudar comportamento
observável pro usuário — prioriza reordenação/tipagem sobre reescrever lógica, e qualquer
`useEffect`/dependência é tratado com cautela extra (adicionar uma dependência errada pode
causar loop de re-fetch — ver nota na Tarefa L2).

- [x] **Tarefa L1** — Erros estruturais seguros, sem digitação de tipos: 2 casos de "variável
      acessada antes de declarada" (`LiturgiaFull.tsx`, `RosaryHome.tsx` — reordenação pura de
      `function` já hoisted, zero mudança de comportamento) + 5 blocos `catch{}` vazios
      (`AdminPanel.tsx` x3, `consecrationService.ts`, `VerifyEmailModal.tsx` — `no-empty` ignora
      bloco com comentário, então só documentar a intenção já resolve sem tocar em lógica).
      148 → 143 problemas.
- [ ] Tarefa L2 — `react-hooks/set-state-in-effect` (6 arquivos: `OfflineBanner.tsx`,
      `useFraseDiaria.ts`, `BibliaHome.tsx` x2, `ConfirmEmailChange.tsx`, `VerifyEmail.tsx`) —
      setState síncrono dentro de effect. Cuidado: cada caso precisa da técnica certa (estado
      inicial preguiçoso via `useState(() => ...)` quando o valor não depende de nada externo
      assíncrono; manter o padrão atual quando há uma chamada assíncrona real no meio).
- [ ] Tarefa L3 — `no-explicit-any` em `services/` e `utils/` (api.ts, api.test.ts,
      bibliaService.ts, consecrationService.ts, quaresmaService.ts, voxService.ts,
      authErrors.ts, isPwa.ts, liturgyShareText.ts, localCache.ts, rosaryDays.ts,
      rosaryPrayers.ts) — tipar contra o shape real que a `oratio-api` devolve, não `unknown`
      genérico onde dá pra saber o formato.
- [ ] Tarefa L4 — `no-explicit-any` em `components/` (AdminNotifications, ChangeEmailModal,
      ChangePasswordModal, DeleteAccountModal, ResetPasswordModal, ShareReadingButton)
- [ ] Tarefa L5 — `no-explicit-any` em `pages/` cluster 1 (Biblia: BibliaBook, BibliaChapter,
      BibliaHome; Catecismo)
- [ ] Tarefa L6 — `no-explicit-any` em `pages/` cluster 2 (Consecration: ConsecrationDay,
      ConsecrationHome, Tratado; ConfirmEmailChange; Home.tsx)
- [ ] Tarefa L7 — `no-explicit-any` em `pages/Liturgia/LiturgiaFull.tsx` (9 ocorrências, arquivo
      isolado por volume) + `LiturgiaFull.test.tsx`
- [ ] Tarefa L8 — `no-explicit-any` em `pages/` cluster 3 (Login, Register, Prayers: Prayers,
      CategoryPrayers, RosaryHome*, RosaryPage; SantoDoDia; VerifyEmail)
- [ ] Tarefa L9 — `no-explicit-any` em `pages/Profile/AdminPanel.tsx` (17 ocorrências, arquivo
      isolado por volume) + `Profile.tsx`
- [ ] Tarefa L10 — `react-hooks/exhaustive-deps` (13 avisos restantes) — caso a caso: só
      adicionar a dependência quando a função referenciada for estável (`useCallback` com deps
      corretas) ou o efeito for genuinely "rodar quando X mudar"; do contrário, comentário
      `eslint-disable-next-line` explicando por que é intencional (mesmo padrão de "roda uma vez
      na montagem" já usado no boot do `App.tsx`).
- [ ] Tarefa L11 — sobras: `QuaresmaCard.tsx` (eslint-disable não usado, remover),
      `ConsecrationHome.tsx` (mover `stages` pra dentro do `useMemo`), 2 avisos
      `react-refresh/only-export-components` (avaliar se vale separar constante/função em outro
      arquivo ou é aceitável como está)

## Processo

Cada tarefa: RED (teste que expõe o comportamento esperado) → GREEN → suíte completa →
`npm run build` → commit próprio. Bug real encontrado durante o teste: se for crítico (afeta
dado do usuário, segurança, ou comportamento já reportado por ele), **parar e perguntar antes de
corrigir** — não corrigir silenciosamente dentro de uma tarefa de cobertura.
