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
- [x] **Tarefa 4** — `profileService.ts`, `rosaryService.ts`, `homeService.ts`,
      `prayersService.ts` (thin wrappers), `readingProgressService.ts` (a única com lógica real:
      gate `isLoggedIn()` — nunca chama a API pra convidado — e best-effort — nunca deixa uma
      falha de rede subir, "leitura não pode ser prejudicada"). 19 testes novos, nenhum bug
      encontrado.
- [x] **Tarefa 5** — `quaresmaService.ts` (`getProgress()` cai pro cache local quando a rede
      falha — orações são estáticas, a tela do dia continua offline; `completeDay`/`uncompleteDay`
      propagam erro de propósito, ao contrário de `readingProgressService`, pro backend mostrar
      a mensagem específica de validação; `apiErrorMessage` com os 3 ramos), `adminService.ts`
      (`getAllUsers()` monta a query só com filtros presentes usando `!== undefined`, não
      truthiness — testado especificamente `isAdmin:false`/`emailVerified:false` continuarem na
      URL). 26 testes novos, nenhum bug encontrado.
- [x] **Tarefa 6** — `consecrationService.ts` (isolamento de cache por usuário via `sub` do JWT —
      testado indiretamente, é o que evita progresso "vazar" entre contas no mesmo aparelho;
      `preloadConsecration()` retorna na hora quando já tem cache e atualiza em background;
      `getDay()` reconsulta o cache dentro do `catch` antes de desistir — pode ter sido populado
      por um refresh em background nesse meio tempo; `resetConsecration()` limpa o cache local
      mesmo se a chamada à API falhar depois), `bibliaService.ts` (busca contra o JSON real da
      Bíblia — sem mockar dado nenhum: normalização acento/maiúscula, limite de resultados,
      `getChapter` retornando `null` vs `undefined` conforme o caso, buscas recentes com
      dedup case-insensitive e teto de 6 itens). 41 testes novos, nenhum bug encontrado.
- [x] **Tarefa 7** — `voxService.ts` (encerra a Fase 1). Os 3 branches de erro (429→
      LIMIT_EXCEEDED, sem `response`→NETWORK_ERROR, resto→AI_PROVIDER_ERROR) em `askVox` e
      `askVoxStream`; o parser SSE de `askVoxStream` — reaproveita `api`/axios com
      `onDownloadProgress` em vez de `fetch()` cru pra manter o refresh automático de token —
      incl. o caso que o comentário do código avisa explicitamente: uma linha `data:` cortada ao
      meio entre dois pacotes de rede não pode ser processada cedo demais (testado forçando o
      corte no meio de uma linha real e conferindo que só dispara `onDelta` depois de completa),
      evento `error` no meio do stream, stream que termina sem `done` (`UNKNOWN_ERROR`), linha
      JSON malformada ignorada sem lançar. 21 testes novos, nenhum bug encontrado.

## Fase 2 — Utils (funções puras)

- [x] **Tarefa 8** — `overlayCoordinator.ts` (Set de ids + notificação de listeners, dedup ao
      abrir o mesmo id duas vezes, unsubscribe para de notificar), `localCache.ts` (TTL com
      timers falsos: válido no instante antes de expirar, expirado remove a entrada do storage,
      JSON corrompido também limpa em vez de só retornar null), `fontScale.ts` (clamp de valor
      legado acima do máximo atual — opção "Muito grande" removida —, fallback pra 1 em valor
      não numérico/zero/negativo, `localStorage` indisponível não impede aplicar o scale na
      sessão atual). 22 testes novos, nenhum bug encontrado.
- [x] **Tarefa 9** — `rosaryList.ts` (`getRosaryName` — fallback pro próprio slug quando
      desconhecido, ida-e-volta de todo item do catálogo). `rosaryPrayers.ts`/`rosaryDays.ts` são
      dados estáticos sem nenhuma função — `/* v8 ignore file */` em vez de teste forçado, regra
      já prevista no plano. 3 testes novos, nenhum bug encontrado.
- [x] **Tarefa 10** — `greeting.ts` (limites exatos de hora entre manhã/tarde/noite),
      `liturgicalCelebration.ts` (`parseCelebration` com múltiplas vírgulas no nome,
      `getEasterSunday` conferido contra datas reais conhecidas de 2024/2025, `getFerialColor`
      em cada estação), `saintOfDay.ts` (`resolveSaintOfDay`, com `../data/saintsOfTheDay` e
      `../data/saintBios` mockados). **Bug real encontrado e corrigido** (não crítico pela
      política do SPEC.md — precisão de conteúdo devocional, não dado do usuário/segurança;
      correção mínima e óbvia): quando a data tinha entrada no índice local de santos mas o nome
      NÃO batia com o que a API da liturgia confirmava pra aquele dia (celebração suprimida/
      transferida naquele ano), o código mantinha o título local não confirmado em vez de cair
      pro texto cru da API — violando o contrato explícito documentado no cabeçalho de
      `saintBios.ts` ("nunca inventa, nunca mostra algo que não está de fato sendo celebrado").
      Faltava o `else` que reseta `nome` pro texto da API nesse caso. 36 testes novos.
- [x] **Tarefa 11** — `liturgyShareText.ts` (as 4 funções de montagem de texto — leitura, salmo,
      leitura rápida, evangelho —, incl. a limpeza de número de versículo colado na palavra e a
      extração da linha "Proclamação..." dentro do array `abertura`), `bibleShareText.ts`,
      `prayerShareText.ts`, `rosaryShareText.ts` (formatação simples, um teste cada). 13 testes
      novos, nenhum bug encontrado.
- [x] **Tarefa 12** — `installPrompt.ts` (dispara `beforeinstallprompt`/`appinstalled` de verdade
      via `window.dispatchEvent`, já que o estado é privado ao módulo e só muda por esses
      eventos; `promptInstall()` consome o prompt adiado e aceita/recusa), `isPwa.ts`
      (`matchMedia` stubado + `navigator.standalone` do iOS Safari), `deviceDetect.ts` (iPad
      moderno que se identifica como "Macintosh", distinguido só pelo suporte a touch). 16 testes
      novos, nenhum bug encontrado. (`pdfConfig.ts` já tinha teste parcial de antes desta
      sessão — mantido como está.)

## Fase 3 — Hooks

- [x] **Tarefa 13** — `useOffline` (eventos `online`/`offline`, listeners removidos no unmount),
      `usePullToRefresh` (o handler registrado no contexto sempre chama a versão MAIS RECENTE de
      `onRefresh` sem precisar re-registrar — via `handlerRef`), `useReadingSize` (fallback pra
      `md` em valor inválido salvo), `useLockBodyScroll` (regressão documentada no próprio
      hook: restaura usando o `scrollY` CAPTURADO, não relido do DOM depois do cleanup já ter
      zerado), `usePublishHeightVar` (`ResizeObserver` stubado globalmente, já que jsdom não
      implementa). 21 testes novos, nenhum bug encontrado.
- [x] **Tarefa 14** — `useFraseDiaria` (JSON de frases mockado pra controle total; janela de 30
      dias, reinício do histórico quando tudo já apareceu, `Math.random` mockado pra
      determinismo), `useVisualViewportOffset` (o núcleo documentado no arquivo: um gap "bugado"
      pós-compartilhar NUNCA empurra a navbar além de MAX_LIFT=96px; `resyncViewport()` para
      sozinho após ~1.2s), `useLiturgy` (cache aplicado na hora enquanto o fetch fresco ainda
      está em voo, cache ignorado se for de outro dia, JSON corrompido removido sem crashar,
      offset≠0 nunca grava cache, labels Hoje/Ontem/Amanhã). 23 testes novos, nenhum bug
      encontrado. **Fecha a Fase 3 (Hooks).**

## Fase 4 — Contexts & Guards

- [x] **Tarefa 15** — `ProtectedRoute` (redireciona pra `/login` sem `access_token`),
      `AdminRoute` (estado `loading` não renderiza nada, `getProfile()` mockado — `isAdmin:true`
      libera, `false` ou erro de rede redireciona pra `/oratio/home`, "falha fechado"). 6 testes
      novos, nenhum bug encontrado. `PullToRefreshContext.ts` é só `createContext` + tipos, sem
      lógica própria — `/* v8 ignore file */`, já exercitado indiretamente por
      `usePullToRefresh.test.tsx`. **Fecha a Fase 4 (Contexts & Guards).**

## Fase 5 — Componentes com lógica real

- [x] **Tarefa 16** — `GuestGateModal`/`GuestWelcomeModal`/`InstallAppModal` (registro em
      `overlayCoordinator`, redirects com `?redirect=` codificado), `QuaresmaNudge` (janela de
      anúncio, chave de dispensa por ano, o `blocked` que evita ganhar a corrida dos modais da
      Home — timer de 350ms só começa a contar depois de desbloqueado), `InstallAppNudge` (o
      gate combinado mais complexo do app: SKIP_ROUTES, PWA já instalado, cooldown de 3h,
      threshold de 3 telas navegadas com bypass pra "primeira tela"/"acabou de logar", e checagem
      de overlay bloqueando só no momento em que o timer dispara). 36 testes novos, nenhum bug
      encontrado — inclusive no teste multi-etapa do `InstallAppNudge` que isola cooldown,
      contagem de telas e bypass em sequência.
- [x] **Tarefa 17** — `AdminChart`/`AdminHeatmap` (seleção padrão no último ponto/pico, delta
      vs. ponto anterior, clamp de alpha em 0.16 no heatmap), `AdminFilterSheet` (chips por
      grupo de filtro, "Limpar filtros" desabilitado sem filtro ativo), `AdminNotifications`
      (validação de título/audiência antes de enviar, `getAllUsers` só carrega ao trocar pra
      "Escolher pessoas", apagar campanha/todas com `window.confirm`, toggle de regra otimista
      com reversão em falha). 28 testes novos, nenhum bug encontrado.
- [x] **Tarefa 18** — `NotificationBell` (agrupamento por dia Hoje/Ontem/Anteriores, expandir
      item não-visto marca como visto e decrementa o badge, item sem `body`/`url` não expande,
      "Ver mais" só com `nextCursor`, "Abrir" navega e fecha o painel), `NotificationNudge`
      (janela de 7 dias entre exibições, só verifica status de push se `isPushSupported()`). 17
      testes novos, nenhum bug de produção encontrado — só um problema no próprio teste
      (`vi.useFakeTimers()` sem `shouldAdvanceTime` trava o polling do `findBy`/`waitFor` do
      Testing Library, corrigido).
- [x] **Tarefa 19** — `BottomNavbar` (não renderiza fora de PWA, item ativo por
      `pathname.startsWith`, item bloqueado abre o gate em vez de navegar pra convidado),
      `MenuDrawer` (item bloqueado NÃO fecha o drawer — só o gate aparece por cima —, diferente
      do `BottomNavbar` que nem abre nada; item liberado fecha e navega). 12 testes novos,
      nenhum bug encontrado.
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
