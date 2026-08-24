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

- [ ] **Tarefa 1** — `src/services/api.ts`: interceptors (request auth header, 401→refresh→retry,
      fila de requisições concorrentes, guest-401-passthrough, `PUBLIC_AUTH_PATHS`). Zero
      cobertura hoje; é o trecho que o ARCHITECTURE.md chama de "least obvious part of the
      codebase". `clearSession()` já está coberto — não retestar.
- [ ] Tarefa 2 — `authService.ts`, `utils/authErrors.ts`, `utils/authRedirect.ts`
- [ ] Tarefa 3 — `pushService.ts`, `notificationsService.ts`, `adminNotificationsService.ts`,
      `activityService.ts`
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

## Processo

Cada tarefa: RED (teste que expõe o comportamento esperado) → GREEN → suíte completa →
`npm run build` → commit próprio. Bug real encontrado durante o teste: se for crítico (afeta
dado do usuário, segurança, ou comportamento já reportado por ele), **parar e perguntar antes de
corrigir** — não corrigir silenciosamente dentro de uma tarefa de cobertura.
