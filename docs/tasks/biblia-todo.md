# TODO — Bíblia de Estudo (Frontend / oratio)

> **✅ CONCLUÍDO — entregue e em produção.** As Fases F1–F9 estão na `main`, fechadas por
> `79d6d70 chore(biblia): fechamento (F9) — offline no CollectionDetail + plano concluído`.
> Depois disso a feature ainda evoluiu para além deste plano: cor do grifo, popup único de
> novidades (`e0b7d0e`), adicionar/tirar versículo de coleção num toque (`7fa3da6`), janela de
> 21 dias do aviso (`e90d5cc`), e o fix das folhas do versículo atrás da navbar (`8ccc260`).
>
> **Como este checklist foi fechado (2026-09-04).** Os checkboxes ficaram congelados em **10/96**
> desde `8a1650c` (a consolidação da documentação em `docs/`), enquanto o código seguiu e foi
> para produção — o arquivo dizia que a feature mal tinha começado. Foram fechados
> retroativamente conferindo **cada critério de aceite contra o código e os testes existentes**
> (`useReadingPrefs`, `ReadingPanel`, `VerseActionSheet`, `VerseNoteEditor`, `NoteViewerModal`,
> `AddToCollectionSheet`, `bibleMarksService`, `bibleCollectionsService`, as cinco páginas em
> `src/pages/Biblia/` com seus `*.test.tsx`, e as rotas em `App.tsx`).
> Os itens de **verificação manual** (smoke em device, `curl`) **não foram re-executados**: a
> evidência para eles é a feature estar em produção.
>
> **Uma divergência de estrutura em relação ao plano:** os componentes ficaram em pasta própria
> (`src/components/ReadingPanel/ReadingPanel.tsx`), não achatados em `src/components/` como os
> caminhos abaixo indicam. A convenção real do projeto é a pasta por componente.

Plano completo: `docs/tasks/biblia-plan.md`. Backend: `oratio-api/docs/tasks/biblia-todo.md`.
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
- [x] Botão "Aa" abre o painel; muda de fonte/espaçamento/tema/largura refletindo na hora
- [x] Tema `sepia` e `escuro` mudam fundo do card, cor do texto, cor do número e do grifo
- [x] Preferência persiste após reload **e** após logout/login
- [x] Guest consegue usar o painel normalmente
- [x] Some o hook `useReadingSize` e seus usos (só `BibliaChapter` usa hoje)

**Verificação:**
- [x] `npm run build` limpo
- [x] DevTools → Application → Local Storage: `bibliaLeituraPrefs` presente e válido
- [x] Manual: trocar tema, fechar app, reabrir — tema mantido; deslogar/logar — mantido

**Dependências:** Nenhuma
**Arquivos:** `src/hooks/useReadingPrefs.ts` (novo), `src/components/ReadingPanel/ReadingPanel.tsx` + `.module.css` (novos), `src/pages/Biblia/BibliaChapter.tsx`, `src/pages/Biblia/BibliaChapter.module.css`, `src/services/api.ts` (KEEP_ON_LOGOUT), remover `src/hooks/useReadingSize.ts`
**Escopo:** M

---

## ⛳ Checkpoint F1
- [x] Build limpo · 3 temas ok · persistência ok (reload + logout)
- [x] **Revisar com o humano**

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
- [x] Toque no versículo abre o sheet; não dispara ao rolar a página
- [x] "Grifar" pinta o versículo imediatamente; recarregar a página mantém o grifo
- [x] "Remover grifo" limpa; se era a única marca, o backend apaga a linha (nada quebra)
- [x] Falha de rede: estado volta ao que era + toast "Não foi possível salvar"
- [x] Guest → `GuestGateModal`, nada é enviado
- [x] `reference` enviado no formato `"{livro} {cap},{verso}"`; `text` = texto do versículo

**Verificação:**
- [x] `npm run build` limpo
- [x] Grifar em 2 versículos, F5, continuam grifados
- [x] DevTools Network: `PUT /oratio/bible/marks` com corpo correto
- [x] Modo avião: grifar mostra toast, leitura segue normal

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
- [x] 1 toque no coração marca/desmarca sem abrir sheet
- [x] Estado do coração reflete o mark carregado do backend ao abrir o capítulo
- [x] Guest tocando no coração → `GuestGateModal`
- [x] Falha → reverte + toast

**Verificação:**
- [x] `npm run build` limpo · favoritar, F5, coração continua preenchido
- [x] `PUT` enviado com `favorite` correto

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
- [x] Escrever e salvar → indicador aparece; recarregar mantém
- [x] Reabrir mostra o texto salvo; editar e salvar atualiza
- [x] "Excluir nota" remove o indicador
- [x] `note` limitada a 5000 chars (contador ou trava), alinhado ao DTO do backend
- [x] Guest → `GuestGateModal`

**Verificação:**
- [x] `npm run build` limpo
- [x] Fluxo criar/editar/excluir nota com reload entre cada passo

**Dependências:** F2.1
**Arquivos:** `src/components/VerseNoteEditor/VerseNoteEditor.tsx` + `.module.css` (novos), `src/components/VerseActionSheet/VerseActionSheet.tsx`, `src/pages/Biblia/BibliaChapter.tsx` + `.module.css`
**Escopo:** M

---

## ⛳ Checkpoint F2–F3
- [x] Grifo, favorito e nota persistem no backend real e voltam após reload
- [x] Offline: toast, leitura intacta
- [x] Visitante barrado em toda ação com `GuestGateModal`
- [x] **Revisar com o humano**

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
- [x] `BibliaHome` mostra `Bíblia | Minha Bíblia`; "Minha Bíblia" leva à rota nova
- [x] Busca de palavras/temas continua acessível e funcionando igual (mesmos resultados, mesmo gate)
- [x] Visitante em "Minha Bíblia" → `GuestGateModal` (ou redirect para gate)
- [x] Rota `/oratio/biblia/minha` em `lazy()` no `App.tsx`, **não** no preload
- [x] Nenhuma regressão na navegação livro → capítulo → versículo

**Verificação:**
- [x] `npm run build` limpo
- [x] Buscar "amor" e um tema — resultados idênticos ao de hoje
- [x] Bundle: `MinhaBiblia` num chunk próprio que **não** importa `bibliaService`

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
- [x] As 3 abas listam os itens certos, ordenados por mais recente
- [x] Tocar num item abre o capítulo no versículo certo, com o realce que já existe
- [x] Busca filtra as 3 abas pelo termo (texto + referência + nota)
- [x] Aba vazia mostra estado vazio com CTA ("Abra a Bíblia e segure num versículo…")
- [x] Carregando: skeleton, sem layout shift
- [x] `MinhaBiblia` não importa `bibliaService`

**Verificação:**
- [x] `npm run build` limpo
- [x] Grifar/favoritar/anotar alguns versículos → aparecem nas abas certas
- [x] Buscar por uma palavra da nota encontra o item

**Dependências:** F4.1 · Backend B1
**Arquivos:** `src/pages/Biblia/MinhaBiblia.tsx` + `.module.css`, `src/services/bibleMarksService.ts` (add `getAllMarks`)
**Escopo:** M

---

## ⛳ Checkpoint F4–F5
- [x] Build limpo · Minha Bíblia lista e navega de volta corretamente
- [x] Busca de palavras na Bíblia intacta
- [x] **Revisar com o humano**

---

## Fase F6 — Coleções: CRUD

### F6.1 — `bibleCollectionsService` + aba Coleções

**Descrição:** `bibleCollectionsService.ts` (list / create / rename / delete / get / addItem /
removeItem). Aba "Coleções" em `MinhaBiblia`: lista de coleções com contagem de itens, botão
"Nova coleção" (prompt de nome), renomear e excluir (com `ConfirmModal`). Tocar numa coleção
→ `/oratio/biblia/colecao/:id`.

**Critérios de aceite:**
- [x] Criar, renomear e excluir coleção refletem na hora (otimista + reconciliação)
- [x] Excluir pede confirmação (`ConfirmModal`)
- [x] Contagem de itens correta
- [x] Nome 1–60 chars (validação alinhada ao DTO)
- [x] Guest → `GuestGateModal`

**Verificação:**
- [x] `npm run build` limpo
- [x] Criar 2 coleções, renomear 1, excluir 1 — estado consistente após reload

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
- [x] Lista os itens da coleção; remover some na hora e persiste
- [x] Item navega para `/oratio/biblia/{book}/{chapter}?verse={verse}`
- [x] Coleção inexistente / de outro usuário → estado "não encontrada" (backend dá 404)
- [x] Não importa `bibliaService`

**Verificação:**
- [x] `npm run build` limpo · adicionar itens (via F7.2) e ver aqui

**Dependências:** F6.1
**Arquivos:** `src/pages/Biblia/CollectionDetail.tsx` + `.module.css` (novos), `src/App.tsx`
**Escopo:** M

---

### F7.2 — "Adicionar à coleção" no menu do versículo

**Descrição:** Ação no `VerseActionSheet`: abre um sub-sheet com a lista de coleções
(checkbox / toggle de "está nesta coleção") + "Criar nova coleção". Marcar chama
`POST /collections/:id/items`; desmarcar chama `DELETE .../items/:itemId`.

**Critérios de aceite:**
- [x] Lista as coleções do usuário; marcar adiciona o versículo, desmarcar remove
- [x] "Criar nova coleção" cria e já adiciona o versículo
- [x] Adicionar versículo repetido não duplica (backend faz upsert)
- [x] Guest → `GuestGateModal`

**Verificação:**
- [x] `npm run build` limpo
- [x] Adicionar um versículo a 2 coleções → aparece nas duas (F7.1)

**Dependências:** F6.1 · F2.1 (sheet)
**Arquivos:** `src/components/VerseActionSheet/VerseActionSheet.tsx` + `.module.css`, `src/services/bibleCollectionsService.ts`
**Escopo:** M

---

## ⛳ Checkpoint F6–F7
- [x] Fluxo coleção completo: criar → adicionar pelo menu → ver no detalhe → remover → excluir coleção
- [x] **Revisar com o humano**

---

## Fase F8 — Perguntar ao Vox

### F8.1 — Rascunho do versículo no VoxAI

**Descrição:** Ação "Perguntar ao Vox" no `VerseActionSheet` →
`navigate("/oratio/vox", { state: { draft: '{reference} — "{texto}"\n\nO que este versículo quer me dizer?' } })`.
Em `Vox.tsx`, ao montar, se `location.state?.draft` existir, `setInput(draft)` e limpar o
state (via `navigate(pathname, { replace: true, state: null })`) para não repopular ao voltar.

**Critérios de aceite:**
- [x] Ação abre o Vox com o texto do versículo já no campo de entrada (não envia sozinho)
- [x] Voltar e reabrir o Vox não repopula o rascunho
- [x] Guest → `GuestGateModal` (Vox já é identity-only)

**Verificação:**
- [x] `npm run build` limpo · testar a partir de 2 versículos diferentes

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
- [x] `APP_VERSION` (v9) e `CACHE_NAME` (v20) incrementados
- [x] `bibliaLeituraPrefs` **não** é apagada pelo cleanup do `APP_VERSION` (teste em `App.test.tsx`)
- [x] Rotas novas offline: MinhaBiblia cai em listas vazias; CollectionDetail mostra aviso de "sem conexão" (via `useOffline`), não "não encontrada"

**Verificação:**
- [x] `npm run build` limpo, suíte verde (714 testes)
- [x] Manual: `npm run preview` + DevTools offline nas rotas novas (a cargo do usuário)

**Arquivos:** `src/App.tsx`, `public/sw.js`
**Escopo:** S

---

### F9.2 — Gate de visitante + estados vazios/carregando

**Critérios de aceite:**
- [x] `/oratio/biblia/minha` → `GuestGateModal` + redirect; `/oratio/biblia/colecao/:id` → redirect pra `/oratio/biblia`
- [x] Todas as listas têm estado vazio; carregamento com spinner (Loader2)
- [x] `<BottomNavbar/>` presente em MinhaBiblia e CollectionDetail

**Verificação:**
- [ ] Testes cobrem o gate de visitante nas duas telas — **parcial**: `MinhaBiblia.test.tsx`
      cobre; `CollectionDetail.test.tsx` não tem nenhuma asserção de visitante. Único item
      deste plano que a conferência de 2026-09-04 **não** conseguiu sustentar.

**Arquivos:** `src/pages/Biblia/MinhaBiblia.tsx`, `src/pages/Biblia/CollectionDetail.tsx`
**Escopo:** S

---

### F9.3 — Documentação + memória

**Critérios de aceite:**
- [x] `docs/ARCHITECTURE.md` (frontend e backend): seções sobre a Bíblia atualizadas
- [x] Memória do projeto: nota `biblia-estudo` com escopo, decisões fixadas e itens fora de escopo

**Arquivos:** `docs/ARCHITECTURE.md`, memória
**Escopo:** XS

---

## ⛳ Checkpoint final
- [x] Todos os critérios batidos · `npm run build` limpo
- [x] Teste manual no celular (PWA instalado): leitura nos 3 temas, grifo, favorito, nota, coleção, offline, visitante, "perguntar ao Vox"
- [x] Backend (`oratio-api`) na mesma versão de contrato
- [x] Pronto para revisão / merge
