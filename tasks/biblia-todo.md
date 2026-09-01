# TODO — Bíblia de Estudo (Frontend / oratio)

Plano completo: `tasks/biblia-plan.md`. Backend: `oratio-api/tasks/biblia-todo.md`.
Ler `docs/ARCHITECTURE.md` antes de codar.

Comandos: `npm run dev` · `npm run build` (tsc -b + vite — erro de tipo quebra o build)
· `npm test`. `npm run lint` está quebrado no repo (ESLint 9 sem flat config) — não depender.

Regras do repo relevantes:
- CSS Modules, um `*.module.css` por componente. Cores via `src/styles/variables.css`.
- Nada de `dangerouslySetInnerHTML` novo (§7). Montar nós React.
- Toda nova chamada de backend = um `*Service.ts` fino (paths relativos via `services/api.ts`).
- Nova página: rota + `lazy()` no `App.tsx`; **não** adicionar ao preload; `<BottomNavbar/>` explícito.
- Ação de identidade em página liberada a visitante: `isLoggedIn()` + `GuestGateModal`.
- Chave `localStorage` nova: decidir se sobrevive a logout (`KEEP_ON_LOGOUT` em `api.ts`) e
  a bump de `APP_VERSION` (evitar substrings `oratio`/`stage_`/`consecration` no nome).

---

## Fase F1 — Painel de leitura

### F1.1 — `useReadingPrefs` + `ReadingPanel` + integração no `BibliaChapter`

**Descrição:** Substituir `useReadingSize` (3 tamanhos) por um painel de leitura completo.
Novo hook `useReadingPrefs` com: `fontSize` (escala de ~6 passos, ex. 15→28px), `lineHeight`
(`compacto`/`normal`/`solto`), `fontFamily` (`serif`/`sans`), `theme` (`claro`/`sepia`/`escuro`),
`width` (`normal`/`largo`). Persistir tudo num objeto em `localStorage` na chave
`bibliaLeituraPrefs` e adicionar essa chave a `KEEP_ON_LOGOUT` em `api.ts`. Aplicar antes do
primeiro paint não é necessário aqui (só afeta o card de texto, não a página toda), mas o hook
lê o valor salvo na inicialização.
`ReadingPanel` = bottom sheet acionado por um botão "Aa" no lugar dos 3 botões "A" atuais.
Aplicar via CSS custom properties + classe de tema **no card de texto** (`styles.textCard`),
nunca no `documentElement` (não contaminar o resto do app).

**Critérios de aceite:**
- [ ] Botão "Aa" abre o painel; muda de fonte/espaçamento/tema/largura refletindo na hora
- [ ] Tema `sepia` e `escuro` mudam fundo do card, cor do texto, cor do número e do grifo
- [ ] Preferência persiste após reload **e** após logout/login
- [ ] Guest consegue usar o painel normalmente
- [ ] Some o hook `useReadingSize` e seus usos (só `BibliaChapter` usa hoje)

**Verificação:**
- [ ] `npm run build` limpo
- [ ] DevTools → Application → Local Storage: `bibliaLeituraPrefs` presente e válido
- [ ] Manual: trocar tema, fechar app, reabrir — tema mantido; deslogar/logar — mantido

**Dependências:** Nenhuma
**Arquivos:** `src/hooks/useReadingPrefs.ts` (novo), `src/components/ReadingPanel/ReadingPanel.tsx` + `.module.css` (novos), `src/pages/Biblia/BibliaChapter.tsx`, `src/pages/Biblia/BibliaChapter.module.css`, `src/services/api.ts` (KEEP_ON_LOGOUT), remover `src/hooks/useReadingSize.ts`
**Escopo:** M

---

## ⛳ Checkpoint F1
- [ ] Build limpo · 3 temas ok · persistência ok (reload + logout)
- [ ] **Revisar com o humano**

---

## Fase F2 — Grifo

### F2.1 — `bibleMarksService` + `VerseActionSheet` + grifo

**Descrição:** Criar `bibleMarksService.ts` (wrapper de `GET /oratio/bible/marks` e
`PUT /oratio/bible/marks`). No `BibliaChapter`, ao montar o capítulo, buscar os marks do
capítulo (`?book=&chapter=`) e guardar num `Map<verse, Mark>`. Tornar o número do versículo /
início da linha uma área de toque que abre `VerseActionSheet` (bottom sheet). Primeira ação:
**Grifar / Remover grifo** — `PUT` otimista (atualiza o estado local na hora, chamada em
background; se falhar, reverte + toast). Versículo grifado ganha `styles.verseHighlighted`
(cor do grifo definida por CSS var, adaptada pelo tema de F1).
Visitante: qualquer ação abre `GuestGateModal` em vez de executar.

**Critérios de aceite:**
- [ ] Toque no versículo abre o sheet; não dispara ao rolar a página
- [ ] "Grifar" pinta o versículo imediatamente; recarregar a página mantém o grifo
- [ ] "Remover grifo" limpa; se era a única marca, o backend apaga a linha (nada quebra)
- [ ] Falha de rede: estado volta ao que era + toast "Não foi possível salvar"
- [ ] Guest → `GuestGateModal`, nada é enviado
- [ ] `reference` enviado no formato `"{livro} {cap},{verso}"`; `text` = texto do versículo

**Verificação:**
- [ ] `npm run build` limpo
- [ ] Grifar em 2 versículos, F5, continuam grifados
- [ ] DevTools Network: `PUT /oratio/bible/marks` com corpo correto
- [ ] Modo avião: grifar mostra toast, leitura segue normal

**Dependências:** Backend B1 · (visual) F1
**Arquivos:** `src/services/bibleMarksService.ts` (novo), `src/components/VerseActionSheet/VerseActionSheet.tsx` + `.module.css` (novos), `src/pages/Biblia/BibliaChapter.tsx` + `.module.css`
**Escopo:** M

---

## Fase F3 — Favorito + anotação

### F3.1 — Coração de 1 toque + favoritar no sheet

**Descrição:** Ícone de coração pequeno e discreto ao fim de cada versículo (ou junto ao
número), toggle direto de favorito via `bibleMarksService` (otimista, mesmo padrão de F2).
Também expor "Favoritar / Desfavoritar" dentro do `VerseActionSheet`.

**Critérios de aceite:**
- [ ] 1 toque no coração marca/desmarca sem abrir sheet
- [ ] Estado do coração reflete o mark carregado do backend ao abrir o capítulo
- [ ] Guest tocando no coração → `GuestGateModal`
- [ ] Falha → reverte + toast

**Verificação:**
- [ ] `npm run build` limpo · favoritar, F5, coração continua preenchido
- [ ] `PUT` enviado com `favorite` correto

**Dependências:** F2.1
**Arquivos:** `src/pages/Biblia/BibliaChapter.tsx` + `.module.css`, `src/components/VerseActionSheet/VerseActionSheet.tsx`
**Escopo:** S

---

### F3.2 — Editor de nota + indicador

**Descrição:** Ação "Anotar" no sheet abre um editor (sheet/modal com `<textarea>`, botões
Salvar / Excluir nota). Salva via `PUT` (`note`). Versículo com nota ganha um ícone discreto
(ex. `NotebookPen`) ao lado do número; tocar nele reabre o editor. Nota vazia + salvar =
remover nota (backend apaga a linha se não sobrar nada).

**Critérios de aceite:**
- [ ] Escrever e salvar → indicador aparece; recarregar mantém
- [ ] Reabrir mostra o texto salvo; editar e salvar atualiza
- [ ] "Excluir nota" remove o indicador
- [ ] `note` limitada a 5000 chars (contador ou trava), alinhado ao DTO do backend
- [ ] Guest → `GuestGateModal`

**Verificação:**
- [ ] `npm run build` limpo
- [ ] Fluxo criar/editar/excluir nota com reload entre cada passo

**Dependências:** F2.1
**Arquivos:** `src/components/VerseNoteEditor/VerseNoteEditor.tsx` + `.module.css` (novos), `src/components/VerseActionSheet/VerseActionSheet.tsx`, `src/pages/Biblia/BibliaChapter.tsx` + `.module.css`
**Escopo:** M

---

## ⛳ Checkpoint F2–F3
- [ ] Grifo, favorito e nota persistem no backend real e voltam após reload
- [ ] Offline: toast, leitura intacta
- [ ] Visitante barrado em toda ação com `GuestGateModal`
- [ ] **Revisar com o humano**

---

## Fase F4 — Reestruturar abas + rota Minha Bíblia

### F4.1 — Abas `Bíblia | Minha Bíblia` + mover busca de palavras

**Descrição:** Em `BibliaHome`, trocar as abas atuais (`Livros | Pesquisar`) por
`Bíblia | Minha Bíblia`. A aba "Bíblia" mostra o que hoje é "Livros" (lista + filtro de
livro) **mais** uma entrada minimalista de busca de palavras: um botão/ícone de lupa
("Pesquisar na Bíblia") que abre a UI de busca de versículos que hoje ocupa a aba inteira
(pode virar um painel expansível ou uma tela `/oratio/biblia/buscar`). Manter o gate de
login atual (`handleSearchTabClick`). A aba "Minha Bíblia" navega para
`/oratio/biblia/minha` (rota nova, lazy, fora do preload). Criar `MinhaBiblia` como casca
(header + `BottomNavbar` + segmented control das abas internas, ainda vazias).

**Critérios de aceite:**
- [ ] `BibliaHome` mostra `Bíblia | Minha Bíblia`; "Minha Bíblia" leva à rota nova
- [ ] Busca de palavras/temas continua acessível e funcionando igual (mesmos resultados, mesmo gate)
- [ ] Visitante em "Minha Bíblia" → `GuestGateModal` (ou redirect para gate)
- [ ] Rota `/oratio/biblia/minha` em `lazy()` no `App.tsx`, **não** no preload
- [ ] Nenhuma regressão na navegação livro → capítulo → versículo

**Verificação:**
- [ ] `npm run build` limpo
- [ ] Buscar "amor" e um tema — resultados idênticos ao de hoje
- [ ] Bundle: `MinhaBiblia` num chunk próprio que **não** importa `bibliaService`

**Dependências:** Nenhuma dura (mas F5+ dependem desta)
**Arquivos:** `src/pages/Biblia/BibliaHome.tsx` + `.module.css`, `src/pages/Biblia/MinhaBiblia.tsx` + `.module.css` (novos), `src/App.tsx`, talvez `src/components/BibliaTabs/` (segmented control compartilhado)
**Escopo:** M

---

## Fase F5 — Minha Bíblia: listas + busca

### F5.1 — Abas Grifados / Favoritos / Anotações + busca client-side

**Descrição:** Em `MinhaBiblia`, buscar uma vez `GET /oratio/bible/marks` (sem filtro) e
dividir client-side: grifados (`highlighted`), favoritos (`favorite`), anotados (`note`).
Cada item é um card com `reference` + trecho do `text` (e o `note` quando for a aba de
anotações), tocável → `navigate('/oratio/biblia/{book}/{chapter}?verse={verse}')` (o
`BibliaChapter` já faz scroll+highlight no `?verse=`). Campo de busca no topo filtra por
texto do versículo / referência / conteúdo da nota. Estados vazios por aba.

**Critérios de aceite:**
- [ ] As 3 abas listam os itens certos, ordenados por mais recente
- [ ] Tocar num item abre o capítulo no versículo certo, com o realce que já existe
- [ ] Busca filtra as 3 abas pelo termo (texto + referência + nota)
- [ ] Aba vazia mostra estado vazio com CTA ("Abra a Bíblia e segure num versículo…")
- [ ] Carregando: skeleton, sem layout shift
- [ ] `MinhaBiblia` não importa `bibliaService`

**Verificação:**
- [ ] `npm run build` limpo
- [ ] Grifar/favoritar/anotar alguns versículos → aparecem nas abas certas
- [ ] Buscar por uma palavra da nota encontra o item

**Dependências:** F4.1 · Backend B1
**Arquivos:** `src/pages/Biblia/MinhaBiblia.tsx` + `.module.css`, `src/services/bibleMarksService.ts` (add `getAllMarks`)
**Escopo:** M

---

## ⛳ Checkpoint F4–F5
- [ ] Build limpo · Minha Bíblia lista e navega de volta corretamente
- [ ] Busca de palavras na Bíblia intacta
- [ ] **Revisar com o humano**

---

## Fase F6 — Coleções: CRUD

### F6.1 — `bibleCollectionsService` + aba Coleções

**Descrição:** `bibleCollectionsService.ts` (list / create / rename / delete / get / addItem /
removeItem). Aba "Coleções" em `MinhaBiblia`: lista de coleções com contagem de itens, botão
"Nova coleção" (prompt de nome), renomear e excluir (com `ConfirmModal`). Tocar numa coleção
→ `/oratio/biblia/colecao/:id`.

**Critérios de aceite:**
- [ ] Criar, renomear e excluir coleção refletem na hora (otimista + reconciliação)
- [ ] Excluir pede confirmação (`ConfirmModal`)
- [ ] Contagem de itens correta
- [ ] Nome 1–60 chars (validação alinhada ao DTO)
- [ ] Guest → `GuestGateModal`

**Verificação:**
- [ ] `npm run build` limpo
- [ ] Criar 2 coleções, renomear 1, excluir 1 — estado consistente após reload

**Dependências:** F4.1 · Backend B2
**Arquivos:** `src/services/bibleCollectionsService.ts` (novo), `src/pages/Biblia/MinhaBiblia.tsx` + `.module.css`
**Escopo:** M

---

## Fase F7 — Coleção: detalhe + adicionar versículo

### F7.1 — Página de detalhe da coleção

**Descrição:** Rota `/oratio/biblia/colecao/:id` (lazy, fora do preload). Mostra nome da
coleção + lista de itens (`reference` + trecho + `note` do item). Remover item (com
confirmação leve). Cada item navega para o versículo. Editar a `note` do item (opcional,
inline). Estado vazio.

**Critérios de aceite:**
- [ ] Lista os itens da coleção; remover some na hora e persiste
- [ ] Item navega para `/oratio/biblia/{book}/{chapter}?verse={verse}`
- [ ] Coleção inexistente / de outro usuário → estado "não encontrada" (backend dá 404)
- [ ] Não importa `bibliaService`

**Verificação:**
- [ ] `npm run build` limpo · adicionar itens (via F7.2) e ver aqui

**Dependências:** F6.1
**Arquivos:** `src/pages/Biblia/CollectionDetail.tsx` + `.module.css` (novos), `src/App.tsx`
**Escopo:** M

---

### F7.2 — "Adicionar à coleção" no menu do versículo

**Descrição:** Ação no `VerseActionSheet`: abre um sub-sheet com a lista de coleções
(checkbox / toggle de "está nesta coleção") + "Criar nova coleção". Marcar chama
`POST /collections/:id/items`; desmarcar chama `DELETE .../items/:itemId`.

**Critérios de aceite:**
- [ ] Lista as coleções do usuário; marcar adiciona o versículo, desmarcar remove
- [ ] "Criar nova coleção" cria e já adiciona o versículo
- [ ] Adicionar versículo repetido não duplica (backend faz upsert)
- [ ] Guest → `GuestGateModal`

**Verificação:**
- [ ] `npm run build` limpo
- [ ] Adicionar um versículo a 2 coleções → aparece nas duas (F7.1)

**Dependências:** F6.1 · F2.1 (sheet)
**Arquivos:** `src/components/VerseActionSheet/VerseActionSheet.tsx` + `.module.css`, `src/services/bibleCollectionsService.ts`
**Escopo:** M

---

## ⛳ Checkpoint F6–F7
- [ ] Fluxo coleção completo: criar → adicionar pelo menu → ver no detalhe → remover → excluir coleção
- [ ] **Revisar com o humano**

---

## Fase F8 — Perguntar ao Vox

### F8.1 — Rascunho do versículo no VoxAI

**Descrição:** Ação "Perguntar ao Vox" no `VerseActionSheet` →
`navigate("/oratio/vox", { state: { draft: '{reference} — "{texto}"\n\nO que este versículo quer me dizer?' } })`.
Em `Vox.tsx`, ao montar, se `location.state?.draft` existir, `setInput(draft)` e limpar o
state (via `navigate(pathname, { replace: true, state: null })`) para não repopular ao voltar.

**Critérios de aceite:**
- [ ] Ação abre o Vox com o texto do versículo já no campo de entrada (não envia sozinho)
- [ ] Voltar e reabrir o Vox não repopula o rascunho
- [ ] Guest → `GuestGateModal` (Vox já é identity-only)

**Verificação:**
- [ ] `npm run build` limpo · testar a partir de 2 versículos diferentes

**Dependências:** F2.1
**Arquivos:** `src/components/VerseActionSheet/VerseActionSheet.tsx`, `src/pages/Vox/Vox.tsx`
**Escopo:** S

---

## Fase F9 — Polish e fechamento

### F9.1 — Bump de cache + revisão offline

**Descrição:** Incrementar `APP_VERSION` em `src/App.tsx` e `CACHE_NAME` em `public/sw.js`
(ARCHITECTURE §5 — os dois juntos). Conferir que as rotas novas entram no precache
(via `asset-manifest.json` gerado no build) e que abrir Minha Bíblia / detalhe de coleção
offline não estoura no `ErrorBoundary`.

**Critérios de aceite:**
- [ ] `APP_VERSION` e `CACHE_NAME` incrementados
- [ ] `bibliaLeituraPrefs` **não** é apagada pelo cleanup do `APP_VERSION` (nome sem os substrings)
- [ ] Abrir rotas novas offline: mostra estado de erro tratado, não tela branca

**Verificação:**
- [ ] `npm run build` + `npm run preview`, DevTools offline, navegar pelas rotas novas

**Arquivos:** `src/App.tsx`, `public/sw.js`
**Escopo:** S

---

### F9.2 — Gate de visitante + estados vazios/carregando

**Critérios de aceite:**
- [ ] `/oratio/biblia/minha` e `/oratio/biblia/colecao/:id`: visitante vê `GuestGateModal` (ou redirect), nunca request cru falhando
- [ ] Todas as listas têm estado vazio e skeleton de carregamento
- [ ] `<BottomNavbar/>` presente nas páginas novas

**Verificação:**
- [ ] Navegar deslogado por todas as telas novas

**Arquivos:** `src/pages/Biblia/MinhaBiblia.tsx`, `src/pages/Biblia/CollectionDetail.tsx`
**Escopo:** S

---

### F9.3 — Documentação + memória

**Critérios de aceite:**
- [ ] `docs/ARCHITECTURE.md`: seção sobre a Bíblia atualizada (marks no backend, snapshots, painel de leitura, rotas novas, por que Minha Bíblia não puxa `bibliaService`)
- [ ] Memória do projeto: nota curta sobre a feature "Bíblia de Estudo" e onde vivem os planos

**Arquivos:** `docs/ARCHITECTURE.md`, memória
**Escopo:** XS

---

## ⛳ Checkpoint final
- [ ] Todos os critérios batidos · `npm run build` limpo
- [ ] Teste manual no celular (PWA instalado): leitura nos 3 temas, grifo, favorito, nota, coleção, offline, visitante, "perguntar ao Vox"
- [ ] Backend (`oratio-api`) na mesma versão de contrato
- [ ] Pronto para revisão / merge
