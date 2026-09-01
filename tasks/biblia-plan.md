# Plano de Implementação — Bíblia de Estudo (Frontend / oratio)

> Parte **frontend** da feature. Backend em `oratio-api/tasks/biblia-plan.md`.
> Ler `docs/ARCHITECTURE.md` antes de tocar no código (regra do repo).

## Visão geral

Transformar a Bíblia do Oratio numa ferramenta de leitura + estudo:

1. **Painel de leitura** — trocar os 3 tamanhos fixos de fonte por um painel tipo
   Kindle: tamanho (mais passos), espaçamento entre linhas, fonte serifada/sem serifa,
   tema de fundo (claro / sépia / escuro), largura da coluna. Só `localStorage`.
2. **Grifo** — marca-texto de versículo inteiro, cor única. Sincronizado na conta.
3. **Favorito** — coração de 1 toque no versículo. Sincronizado na conta.
4. **Anotações** — um texto por versículo. Sincronizado na conta.
5. **Minha Bíblia** — segunda aba da área Bíblia. Abas internas:
   Grifados · Favoritos · Anotações · Coleções. Com busca no conteúdo do próprio usuário.
6. **Coleções/pastas** — a pessoa cria pastas nomeadas ("Promessas de Deus") e joga
   versículos dentro para estudar.
7. **Busca de palavras** — hoje é uma aba ao lado de "Livros". Vira uma entrada
   **minimalista dentro da Bíblia** (ícone/botão que abre a busca), liberando o slot
   da aba para "Minha Bíblia".
8. **Perguntar ao Vox** — ação no menu do versículo que abre o VoxAI com o versículo
   já escrito como rascunho.

**Grifo tem escolha de cor** (amber/green/blue/pink/purple) — adicionado na Fase 1.
É só a cor: **sem** legenda/significado/renomear/filtrar por cor (essa parte segue
fora de escopo).

**Fora de escopo — decisão explícita do usuário, não construir agora nem depois:**
versículo do dia na Home, plano de leitura / streak, compartilhar como imagem,
copiar múltiplos versículos, tags nas notas, exportar coleção em PDF, modo foco,
cores de grifo **com legenda/significado**. Não reabrir isso em revisão sem o usuário pedir.

## Decisões de arquitetura

1. **Persistência:** grifos / favoritos / notas / coleções vão pro **backend**
   (decisão do usuário — sincroniza entre aparelhos, sobrevive ao logout, que hoje
   limpa o `localStorage`). Preferências de tipografia ficam em **`localStorage`**
   (preferência de aparelho, igual `utils/fontScale.ts`).
2. **`bibliaService` não é importado pela "Minha Bíblia".** O backend devolve o
   `text` e o `reference` de cada item (snapshot mandado na hora da escrita), então
   a tela lista tudo sem puxar o JSON de ~5 MB. Manter assim — é o motivo de a
   Bíblia estar fora do preload (ARCHITECTURE §3).
3. **Uma tabela `BibleMark` no backend** (flags `highlighted`/`favorite` + `note?`).
   O front trata como "estado do versículo": `PUT` parcial, e o backend apaga a linha
   quando tudo zera.
4. **Grifo de versículo inteiro, cor única.** A cor adapta por tema de leitura
   (âmbar no claro/sépia, tom mais escuro no tema escuro).
5. **Novas rotas ficam sob `/oratio/biblia`** (prefixo liberado para visitante em
   `App.tsx`), mas toda ação de identidade é barrada com `isLoggedIn()` +
   `GuestGateModal` — padrão do repo (ARCHITECTURE §3, §7). A leitura + o painel de
   tipografia continuam liberados para visitante.
6. **Busca em "Minha Bíblia" é client-side** sobre a lista de marks do usuário
   (uma chamada `GET /marks`, filtro em memória). Sem endpoint de busca.
7. **A busca de palavras na Bíblia mantém o gate de login que já tem hoje**
   (`handleSearchTabClick` em `BibliaHome`). Só muda o lugar/apresentação, não a regra.
8. **Nada de `dangerouslySetInnerHTML` novo** (ARCHITECTURE §7) — qualquer destaque
   inline é montado como nós React.
9. **Menu do versículo = bottom sheet.** Toque no número/no versículo abre o sheet
   com: Grifar · Favoritar · Anotar · Adicionar à coleção · Perguntar ao Vox ·
   Compartilhar. Coração de 1 toque também fica visível direto no versículo.

## Grafo de dependências

```
localStorage (tipografia)
  └── useReadingPrefs (hook)  ──►  ReadingPanel  ──►  BibliaChapter (aplica CSS vars + classe de tema)
                                                        (F1 — independente do backend)

backend: PUT/GET /oratio/bible/marks (B1)
  └── bibleMarksService.ts
        ├── VerseActionSheet (componente)
        │     ├── grifo  ──► render de versículo grifado no BibliaChapter   (F2)
        │     ├── favorito (+ coração 1-toque)                               (F3)
        │     ├── nota (editor + indicador no versículo)                     (F3)
        │     ├── "Adicionar à coleção"  ──► precisa de F7
        │     └── "Perguntar ao Vox"     ──► Vox.tsx lê rascunho (F8)
        └── MinhaBiblia > abas Grifados/Favoritos/Anotações + busca          (F5)

backend: /oratio/bible/collections (B2)
  └── bibleCollectionsService.ts
        ├── MinhaBiblia > aba Coleções (CRUD)                                (F6)
        └── CollectionDetail (página) + "adicionar versículo à coleção"      (F7)

reestruturação de abas + rota /oratio/biblia/minha                          (F4 — habilita F5/F6/F7)
polish: bump de cache, offline, guest, docs, memória                        (F9)
```

## Lista de tarefas

### Fase F1 — Painel de leitura (sem backend; pode ir em paralelo com B1/B2)
- [ ] **F1.1** `useReadingPrefs` + `ReadingPanel` + aplicar no `BibliaChapter`

### Checkpoint F1
- [ ] `npm run build` limpo · leitura funciona nos 3 temas, sem "flash" de tema
- [ ] Preferência sobrevive a reload e a logout

### Fase F2 — Grifo
- [ ] **F2.1** `bibleMarksService.ts` + `VerseActionSheet` + toggle de grifo + render no capítulo

### Fase F3 — Favorito + anotação
- [ ] **F3.1** Coração de 1 toque + favoritar no sheet
- [ ] **F3.2** Editor de nota + indicador de versículo anotado

### Checkpoint F2–F3
- [ ] Grifar/favoritar/anotar persistem no backend real e reaparecem após reload
- [ ] Offline: ação falha com aviso, **leitura nunca quebra**
- [ ] Visitante toca numa ação → `GuestGateModal`

### Fase F4 — Reestruturar abas + rota "Minha Bíblia"
- [ ] **F4.1** Abas `Bíblia | Minha Bíblia` + mover busca de palavras para entrada minimalista + rota

### Fase F5 — Minha Bíblia: listas + busca
- [ ] **F5.1** Abas Grifados/Favoritos/Anotações, busca client-side, voltar ao versículo

### Checkpoint F4–F5
- [ ] `npm run build` limpo · Minha Bíblia lista os 3 tipos e navega de volta ao versículo certo
- [ ] Busca de palavras na Bíblia continua funcionando (com o mesmo gate de login)

### Fase F6 — Coleções: CRUD
- [ ] **F6.1** `bibleCollectionsService.ts` + aba Coleções (criar/renomear/excluir/listar)

### Fase F7 — Coleção: detalhe + adicionar versículo
- [ ] **F7.1** Página de detalhe da coleção (itens, remover, nota do item)
- [ ] **F7.2** "Adicionar à coleção" no `VerseActionSheet` (escolher/criar coleção)

### Checkpoint F6–F7
- [ ] Criar coleção → adicionar versículo pelo menu → ver na coleção → remover
- [ ] Excluir coleção some com os itens

### Fase F8 — Perguntar ao Vox
- [ ] **F8.1** Ação no sheet → `navigate("/oratio/vox", { state: { draft } })` + `Vox.tsx` consome

### Fase F9 — Polish e fechamento
- [ ] **F9.1** Bump `APP_VERSION` (`App.tsx`) + `CACHE_NAME` (`public/sw.js`); revisar offline
- [ ] **F9.2** Gate de visitante na rota Minha Bíblia + estados vazios/carregando
- [ ] **F9.3** Atualizar `docs/ARCHITECTURE.md` (seção Bíblia) + memória do projeto

### Checkpoint final
- [ ] Todos os critérios de aceite batidos · `npm run build` limpo
- [ ] Teste manual no celular (PWA): leitura, grifo, favorito, nota, coleção, offline, visitante
- [ ] Pronto para revisão

## Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Bundle cresce e piora o load da Bíblia (já é o maior chunk, ARCHITECTURE §3) | Médio | Minha Bíblia não importa `bibliaService` (usa snapshots do backend); rotas novas em `lazy()` e **fora** do preload; `VerseActionSheet` num chunk leve. |
| Preferência de tipografia é apagada no bump de `APP_VERSION` / logout | Baixo | Chave sem os substrings `oratio`/`stage_`/`consecration` (ex.: `bibliaLeituraPrefs`) e adicionada a `KEEP_ON_LOGOUT` em `api.ts`. |
| Escrita offline falha | Médio | Best-effort com toast (padrão do `readingProgressService`); leitura e navegação nunca dependem da chamada. |
| Toque para abrir o sheet briga com rolagem / seleção de texto | Médio | Área de toque no número do versículo + no início da linha; sem `onClick` no parágrafo inteiro; testar em mobile. |
| `dangerouslySetInnerHTML` (proibido) para destacar texto | Baixo | Montar nós React (padrão do `formatVerses` citado no §7). |
| Identidade do versículo presa ao nome do livro em PT | Baixo | Nome do livro é dado estático e já é o que as URLs usam; aceitável. |
| Tema escuro de leitura conflita com o resto do app (que é claro) | Baixo | Escopo do tema só no card de texto do `BibliaChapter` (classe local), não no `documentElement`. |

## Perguntas em aberto (padrão assumido)

1. **Preferências de leitura ficam só no aparelho** (não sincronizam). *Assumido: sim.*
2. **Uma nota por versículo**, editável. *Assumido: sim.*
3. **Busca de palavras continua exigindo login.** *Assumido: sim (comportamento atual).*
4. **Cor do grifo:** âmbar suave (`rgba(214,158,46,.28)` no claro), variando por tema. *Assumido.*
5. **Detalhe da coleção:** rota própria `/oratio/biblia/colecao/:id`. *Assumido.*
6. **Ordem das abas em Minha Bíblia:** Grifados · Favoritos · Anotações · Coleções. *Assumido.*
