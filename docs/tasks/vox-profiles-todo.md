# TODO — Perfis de resposta do VoxAI (Frontend / oratio)

Plano completo: `oratio-api/docs/tasks/vox-profiles-plan.md` (plano-mestre).
Backend: `oratio-api/docs/tasks/vox-profiles-todo.md`. Ponteiro:
`docs/tasks/vox-profiles.md`. Ler `docs/ARCHITECTURE.md` antes de codar.

Comandos: `npm run dev` · `npm run build` (tsc -b + vite — erro de tipo quebra o
build) · `npm test`. `npm run lint` está quebrado no repo — não depender.

Regras do repo relevantes:
- CSS Modules, um `*.module.css` por componente. Cores via `src/styles/variables.css`.
- Nada de `dangerouslySetInnerHTML` novo (§7). A renderização de markdown das
  respostas de exemplo usa o mesmo `ReactMarkdown` + `remarkGfm` do `Vox.tsx`.
- Toda nova chamada de backend = função fina em `src/services/voxService.ts`
  (paths relativos via `services/api.ts`).
- Chave `localStorage` nova (se usada): decidir `KEEP_ON_LOGOUT` e evitar
  substrings `oratio`/`stage_`/`consecration` no nome.

Pré-requisito: **Fase B2 do backend no ar na `develop`** (`getBootstrap` retorna
`profile`, `GET /profiles` e `PATCH /profile` existem).

Commits na `develop` (nunca `main`). Rodapé de commit conforme a sessão.

---

## Fase F1 — Serviço + tipos

### F1.1 — `voxService`: `getVoxProfiles`, `setVoxProfile`, `dismissVoxIntro`

**Descrição:** Funções finas espelhando os endpoints novos, no padrão das
existentes no arquivo (try/catch, retorno de erro tratado).

**Critérios de aceite:**
- [x] `getVoxProfiles()` → `GET /oratio/voxai/profiles`; erro → retorna `[]` (ou `{ error }` no padrão do arquivo)
- [x] `setVoxProfile(key: string)` → `PATCH /oratio/voxai/profile` com `{ profile: key }`
- [x] `dismissVoxIntro()` → `POST /oratio/voxai/profile/intro-seen`
- [x] Tipo `VoxProfileMeta = { key; label; short; details; examples: { question; answer }[] }` exportado
- [x] Tipo de retorno de `getBootstrap` inclui `profile: string | null` e `showVoxIntro: boolean`

**Verificação:** [x] `npm run build` limpo · [x] `npm test -- voxService` verde
**Dependências:** backend B2 · **Arquivos:** `src/services/voxService.ts`,
`src/services/voxService.test.ts` · **Escopo:** S

---

## Fase F2 — Componentes compartilhados

### F2.1 — `VoxProfileList`

**Descrição:** Lista de cards de perfil em estilo seleção (radio). Recebe
`profiles`, `selected` (chave), `onSelect(key)`, `onOpenDetails(key)`. Usado pelo
painel de configurações **e** pelo onboarding.

**Critérios de aceite:**
- [x] Um card por perfil: `label` em destaque, `short` abaixo, indicador de selecionado
- [x] `selected` marca o card certo; clicar num card chama `onSelect`
- [x] Botão/link "Ver em detalhes" por card → `onOpenDetails(key)`
- [x] Acessível: `role="radiogroup"` / `radio`, navegável por teclado, `aria-checked`
- [x] CSS Module próprio, cores de `variables.css`

**Verificação:** [x] `npm run build` limpo · [x] teste de render + clique
**Dependências:** F1.1 · **Arquivos:** `src/components/VoxProfileList/VoxProfileList.tsx`
+ `.module.css` · **Escopo:** M

---

### F2.2 — `VoxProfileDetailsModal`

**Descrição:** Modal com a explicação completa de **um** perfil: `label`,
`details` (markdown) e o `example` renderizado. Aberto a partir de um card da
`VoxProfileList`.

**Critérios de aceite:**
- [x] Recebe um `VoxProfileMeta`; título = `label`
- [x] `details` renderizado com `ReactMarkdown` + `remarkGfm`
- [x] O exemplo: a `question` no visual do balão do usuário; a `answer` via
      `VoxMarkdown` (mesmos overrides de parágrafo/lista/blockquote do `Vox.tsx`,
      extraídos para o componente compartilhado)
- [x] Fecha por backdrop, botão X e `Esc`; foco preso enquanto aberto
- [x] Reusa o padrão de modal existente (mesmo esqueleto do `ConfirmModal`/rename)

**Verificação:** [x] `npm run build` limpo · [x] render com exemplo fake mostra
pergunta + resposta formatada
**Dependências:** F2.1 · **Arquivos:**
`src/components/VoxProfileDetailsModal/*`, `src/components/VoxMarkdown/*` (novo,
extraído do `Vox.tsx`) · **Escopo:** M

---

### F2.3 — `Vox.tsx` passa a usar `VoxMarkdown`

**Descrição:** Trocar o bloco inline de `ReactMarkdown` do `Vox.tsx` pelo
componente extraído, sem mudança visual.

**Critérios de aceite:**
- [x] Render das mensagens do assistente idêntico ao atual
- [x] `Vox.test.tsx` continua verde

**Verificação:** [x] `npm run build` + `npm test -- Vox` verdes · diff visual nulo
**Dependências:** F2.2 · **Arquivos:** `src/pages/Vox/Vox.tsx` · **Escopo:** S

---

## ⛳ Checkpoint F2

- [x] `npm run build` + `npm test` verdes
- [x] Storybook/tela de teste manual: `VoxProfileList` seleciona;
      `VoxProfileDetailsModal` mostra descrição + exemplos formatados
- [x] Render do chat inalterado

---

## Fase F3 — Engrenagem + painel de configurações

### F3.1 — `VoxSettingsPanel`

**Descrição:** Bottom sheet "Configurações do Vox". Cabeçalho + `VoxProfileList` +
espaço para configs futuras. Troca **otimista**.

**Critérios de aceite:**
- [x] Abre/fecha por engrenagem e por backdrop/`Esc`; trava o scroll do body como o `menuOpen` já faz
- [x] Lista carregada de `getVoxProfiles()` (1ª abertura); cacheada em estado; loading com skeleton/spinner
- [x] Selecionar um perfil: atualiza o marcado na hora + chama `setVoxProfile`;
      falha → reverte o marcado + mensagem de erro (padrão `errorBox` do Vox)
- [x] `selected` = `voxProfile ?? 'DEFAULT'`
- [x] "Ver em detalhes" abre `VoxProfileDetailsModal` por cima do painel
- [x] Seção estruturada para aceitar mais itens depois (comentário + layout)

**Verificação:**
- [x] `npm run build` limpo
- [ ] `npm run dev`: trocar perfil → recarregar a página → perfil segue o escolhido
- [x] Simular erro do `PATCH` (devtools offline) → marcado volta ao anterior + erro

**Dependências:** F2 · **Arquivos:** `src/components/VoxSettingsPanel/*` · **Escopo:** M

---

### F3.2 — Engrenagem no header do `Vox.tsx` + fio de estado

**Descrição:** Ícone `Settings`/`SlidersHorizontal` (lucide) em
`styles.headerActions`. Estado `voxProfile` e `profiles` no `Vox`.

**Critérios de aceite:**
- [x] `voxProfile` inicializado do `getBootstrap().profile` no `init()`
- [x] Botão de engrenagem com `aria-label`; abre `VoxSettingsPanel`
- [x] Trocar de perfil no painel atualiza o `voxProfile` do `Vox`
- [x] **Marcador de troca no chat:** se a conversa atual já tem mensagens, trocar
      de perfil insere um item local `{ role: 'system-note', content: 'Perfil
      alterado para <label>' }` na lista de mensagens — renderizado como linha
      discreta (separador), **não** persiste e **não** entra no histórico enviado
      à IA. Sem mensagens na conversa → não insere nada.
- [x] Não interfere no menu lateral, no envio nem no streaming
- [ ] (Opcional, NÃO feito) espelho em `localStorage` chave `voxProfile` (em
      `KEEP_ON_LOGOUT`) para marcar o card certo antes do bootstrap resolver

**Verificação:**
- [x] `npm run build` + `npm test -- Vox` verdes
- [ ] `dev`: fluxo completo abrir → trocar → linha "Perfil alterado para…" aparece
      → enviar pergunta → resposta muda de estilo (com backend B2/B3)

**Dependências:** F3.1 · **Arquivos:** `src/pages/Vox/Vox.tsx`,
`src/pages/Vox/Vox.module.css` · **Escopo:** M

---

## ⛳ Checkpoint F3

- [x] `npm run build` + `npm test` verdes
- [ ] No device (com backend na develop): trocar perfil persiste no reload;
      linha "Perfil alterado para X" aparece no chat; próxima resposta muda de
      estilo; erro de rede reverte o marcado
- [ ] **Revisar com o humano antes de seguir**

---

## Fase F4 — Onboarding primeira vez

### F4.1 — `VoxProfilesIntroModal`

**Descrição:** Modal "Novidade: os perfis do Vox chegaram". Pitch curto +
`VoxProfileList` embutida + ações.

**Critérios de aceite:**
- [x] Texto curto explicando que agora dá pra escolher como o Vox responde
- [x] `VoxProfileList` embutida (mesma dos outros lugares), com o Padrão já marcado
- [x] Botões: **Escolher agora** (grava o card marcado via `setVoxProfile`) e
      **Depois** (chama `dismissVoxIntro`). "Ver em detalhes" de um card abre o
      `VoxProfileDetailsModal`.
- [x] Os **dois** caminhos encerram o onboarding pra sempre (`showVoxIntro` volta
      `false` no próximo bootstrap): escolher grava perfil + carimba no backend;
      "Depois" só carimba
- [x] Acessível (foco preso, `Esc` = "Depois")

**Verificação:** [x] `npm run build` limpo · [x] teste: "Depois" chama
`dismissVoxIntro` (não `setVoxProfile`); "Escolher agora" chama `setVoxProfile`
com a chave marcada
**Dependências:** F2, F3.1 · **Arquivos:** `src/components/VoxProfilesIntroModal/*`
**Escopo:** M

---

### F4.2 — Disparo no `Vox.tsx`

**Descrição:** Depois do `init()`, se `bootstrap.showVoxIntro === true`, abrir o
`VoxProfilesIntroModal`.

**Critérios de aceite:**
- [x] `showVoxIntro === true` → modal abre uma vez, depois que o `init` termina
      (não durante o skeleton)
- [x] `showVoxIntro === false` → modal nunca abre
- [x] Escolher ou "Depois" fecha o modal e não reabre na sessão; nas próximas
      cargas do Vox o backend já manda `showVoxIntro: false`
- [x] Não colide com o modal de rename nem com o `ConfirmModal` de delete

**Verificação:**
- [x] `Vox.test.tsx`: `showVoxIntro:true` → intro aparece; `false` → não aparece;
      "Depois" chama `dismissVoxIntro`
- [ ] `dev` com conta nova (ou os dois campos nulados no banco): modal aparece;
      "Depois" → recarregar → **não** aparece de novo; escolher → recarregar → não aparece

**Dependências:** F4.1 · **Arquivos:** `src/pages/Vox/Vox.tsx`,
`src/pages/Vox/Vox.test.tsx` · **Escopo:** S

---

## ⛳ Checkpoint F4

- [x] `npm run build` + `npm test` verdes
- [ ] Conta nova: onboarding aparece **uma vez**; "Depois" **não** reaparece no
      reload; escolher encerra
- [ ] **Revisar com o humano antes de seguir**

---

## Fase F-Fechamento

### FF.1 — Docs

**Critérios de aceite:**
- [x] `docs/ARCHITECTURE.md`: seção do Vox descreve o estado `voxProfile`, a
      engrenagem/painel "Configurações do Vox", o onboarding por
      `bootstrap.showVoxIntro`, o marcador de troca no chat, os componentes novos
      (`VoxProfileList`, `VoxProfileDetailsModal`, `VoxSettingsPanel`,
      `VoxProfilesIntroModal`, `VoxMarkdown`)
- [x] Tabela `docs/tasks/` do `CLAUDE.md` (raiz) ganha a linha desta feature
- [x] `docs/tasks/vox-profiles.md` (ponteiro) conferido

**Dependências:** F1–F4 · **Arquivos:** `docs/ARCHITECTURE.md`, `CLAUDE.md`,
`docs/tasks/vox-profiles.md` · **Escopo:** XS

---

### FF.2 — Regressão

**Critérios de aceite:**
- [x] `npm run build` verde · `npm test` verde (111 arquivos / 749 testes) — a
      suíte cobre enviar/editar/retry/nova conversa/deletar/renomear/streaming
- [ ] Smoke em device (com backend no ar + `prisma db push` aplicado)

**Dependências:** tudo · **Escopo:** S

---

## ⛳ Checkpoint final frontend

- [x] Build verde · testes verdes (749) · cobertura mantida
- [x] Contrato conferido com `oratio-api` (`GET /profiles`, `PATCH /profile`,
      `POST /profile/intro-seen`, `bootstrap.profile` + `showVoxIntro`)
- [x] Docs atualizados nos dois repos
- [ ] Smoke em device
