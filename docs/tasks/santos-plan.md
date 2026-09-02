# Plano — Biografias do Santo do Dia: 20/out → 08/dez (50 dias)

## Context

O recurso "Santo do Dia" (`SaintOfDayCard` na Home + página `SantoDoDia`) mostra nome, grau e
cor vindos da API de liturgia, e — quando existe — uma **biografia** escrita à mão. Hoje há
biografia para 108 dos 365 dias; a cobertura contínua vai de **17/jul a 19/out** (último lote:
14/set–19/out). Os outros dias mostram só nome/grau/cor e a nota "Ainda não escrevemos os
detalhes".

Este plano estende a cobertura **50 dias para a frente: 20/out a 08/dez** (12 dias de out +
30 de nov + 8 de dez). Antes de escrever cada biografia, o santo daquele dia é **conferido nas
fontes oficiais da Igreja** (Calendário Romano Geral + Próprio do Brasil da CNBB / 3ª ed. do
Missal Romano). Quando o índice local (`saintsOfTheDay.ts`) discordar da fonte oficial, o
índice é **corrigido** (nome, `match`, `opcional`) e a biografia passa a ser a da celebração
oficial correta.

Resultado esperado: 50 dias com título litúrgico verificado e biografia própria (2–4 parágrafos,
com fatos cruzados em ≥2 fontes), sem inventar nada — o contrato do arquivo é explícito:
"nunca inventa, nunca mostra algo que não está de fato sendo celebrado".

**Já têm biografia dentro da janela** (3 dias): 28/out (`sao-judas-tadeu`), 01/nov
(`todos-os-santos`), 08/dez (`imaculada-conceicao`). Esses passam só por uma reconferência
rápida — só reescrevo se a pesquisa apontar erro. **Net-novo: 47 biografias.**

## Fontes (ordem de prioridade)

1. **Calendário litúrgico oficial** — para saber QUEM é o santo/celebração da data e o GRAU
   (Solenidade / Festa / Memória obrigatória `M` / Memória facultativa `m`):
   - `gcatholic.org/calendar/2026/BR-pt` (Próprio do Brasil, 2026) e
     `gcatholic.org/calendar/2026/General-G-pt` (Romano Geral) — consolidam o Missal 3ª ed.
   - `cnbb.org.br` — artigos sobre o Calendário Próprio dos Santos do Brasil (Missal 3ª ed.).
   - **Martirológio Romano** (ed. 2004, *Martyrologium Romanum*, Libreria Editrice Vaticana) —
     referência oficial da data; consultar via `en.wikipedia.org/wiki/<Mês> <dia>_in_the_Roman_Martyrology`
     e fontes que o citam.
2. **Biografia / conteúdo histórico** — cruzar SEMPRE ≥2 destas:
   - `vaticannews.va/pt` (Santo do dia) e homilias de canonização em `vatican.va` — oficiais.
   - `newadvent.org` (Catholic Encyclopedia) — sólido para santos antigos.
   - `a12.com` (Santuário Nacional de Aparecida) e `cancaonova.com` — católicas, PT-BR, úteis
     para santos com devoção no Brasil.
   - Butler's *Lives of the Saints* quando disponível.
3. **Datas móveis** — Cristo Rei cai em **22/nov/2026** (domingo). NÃO criar entrada fixa: é
   Solenidade resolvida pelo texto da API via `MOVABLE_FEASTS` (`saintBios.ts`). A entrada fixa
   de 22/nov (Santa Cecília) continua válida para os outros anos e o app já faz o fallback.

## Protocolo por dia (o laço que se repete 50×)

Para cada data `D` (de 20/out a 08/dez, em ordem):

1. **Descobrir a celebração oficial de `D`** no Calendário do Brasil 2026 (gcatholic) + Romano
   Geral. Anotar: nome canônico, grau, se é facultativa, se é própria do Brasil.
   - Se a data não tem memória obrigatória e há várias facultativas, escolher a de maior
     relevância/devoção no Brasil (mesmo critério das entradas existentes) — anotar as demais
     no `match` como aliases se fizer sentido.
2. **Comparar com o índice local** `SAINTS_OF_THE_DAY` (`src/data/saintsOfTheDay.ts`):
   - Bate → seguir.
   - Não bate → **corrigir** `nome` e `match` para a celebração oficial. `match` = 1–3 trechos
     em minúsculas e SEM acento que devem aparecer no texto `liturgia` da API BR (normalmente
     sobrenome / "nome de guerra" — seguir o padrão das linhas vizinhas). Marcar `opcional:true`
     se for Memória Facultativa confirmada.
3. **Pesquisar a história** em ≥2 fontes da lista acima. Só usar fatos que **coincidem** entre
   as fontes. Datas de nascimento/morte, local, ordem religiosa, ano de canonização e o Papa
   que canonizou: conferir número por número.
4. **Escrever a biografia** em `src/data/saintBios.ts` seguindo o formato (ver abaixo).
   Adicionar `bioId:"<slug>"` na entrada correspondente do índice.
5. **Verificar** (ver seção Verificação). Só quando tudo passa e a história está cruzada e
   completa → **próxima data**.
6. A cada 5 dias concluídos → 1 commit + checkpoint.

Se uma data não tiver santo com nome próprio confiável (feria pura, ou só um nome sem biografia
sólida em fonte confiável): **não forçar** — deixar sem `bioId` (o app já lida com isso) e
registrar no todo o motivo. A meta é qualidade verificada, não 50 preenchimentos a qualquer custo.

## Modelo de dados e convenções

**`src/data/saintsOfTheDay.ts`** — índice dos 365 dias, um objeto por data:
```ts
{ dia:20, mes:10, nome:"Santa Maria Bertila Boscardin, virgem",
  match:["maria bertila boscardin"], bioId:"santa-maria-bertila", opcional:true }
```
- `nome`: título "bonito" com o grau (ex.: ", virgem", ", bispo e mártir", ", presbítero").
- `match`: substrings normalizadas (minúsculas, sem acento) que a lógica procura no texto
  `liturgia` da API para "confirmar" o título — ver `normalizeCelebrationName` em
  `src/utils/saintOfDay.ts`.
- `opcional?`: `true` só para Memória Facultativa **confirmada** na fonte oficial.
- `bioId?`: slug kebab-case, igual à chave em `SAINT_BIOS`.

**`src/data/saintBios.ts`** — `SAINT_BIOS: Record<string, SaintBio>`:
```ts
"santa-maria-bertila": {
  titulo: "Santa Maria Bertila Boscardin, virgem",
  resumo: "<1 frase-gancho, ~15–25 palavras>",
  texto: [
    "<parágrafo 1 — nascimento, origem, família/contexto>",
    "<parágrafo 2 — vocação, obra, congregação/missão>",
    "<parágrafo 3 — traço marcante / legado>",
    "<parágrafo 4 — morte + beatificação/canonização (ano, Papa) + 'Sua memória litúrgica é celebrada em <data>.'>"
  ]
}
```
- 3–4 parágrafos. PT-BR, tom sóbrio e respeitoso, factual — mesmo registro dos existentes
  (ver `sao-paulo-cruz`, `sao-lucas`, `santa-teresa-avila` como referência de tamanho/estilo).
- **Ordem no arquivo**: inserir em ordem de data, **depois de `"sao-paulo-cruz"` (fim do bloco,
  ~linha 1199)** e antes do `}` que fecha `SAINT_BIOS` / antes de `MOVABLE_FEASTS`.
- Festas móveis (Pentecostes, Corpo de Deus, Cristo Rei…) **não** entram aqui — vão em
  `MOVABLE_FEASTS`, que já está completo para o que precisamos.

`src/data/**` está **excluído da cobertura de teste** (`vitest.config.ts`) — não há teste novo
a escrever para os dados; a rede de segurança é `saintOfDay.test.ts` (lógica) + build + revisão.

## Execução — 10 lotes de 5 dias

| Lote | Datas | Obs |
|---|---|---|
| 1 | 20–24/out | Bertila Boscardin, Úrsula, João Paulo II, João de Capistrano, Antônio M. Claret |
| 2 | 25–29/out | 25 = **Frei Galvão (M no Brasil)**; 28 já tem bio (só reconferir) |
| 3 | 30/out–03/nov | 01 já tem bio (só reconferir); 02 Fiéis Defuntos; 03 Martinho de Porres |
| 4 | 04–08/nov | Carlos Borromeu; conferir 05 (Zacarias e Isabel) e 08 nas fontes BR |
| 5 | 09–13/nov | 09 Dedicação de Latrão (Festa); Leão Magno, Martinho de Tours, Josafá |
| 6 | 14–18/nov | 16 conferir Margarida da Escócia vs. Gertrudes; 17 Isabel da Hungria (M) |
| 7 | 19–23/nov | 19 = **Roque González e comp. (mártires das reduções — próprio BR)**; 21 Apresentação de Maria |
| 8 | 24–28/nov | 24 André Dung-Lac e comp. (M); 27/28 conferir Medalha Milagrosa / Catarina Labouré |
| 9 | 29/nov–03/dez | 30 Santo André (Festa); **conferir 01 e 02/dez com atenção — o índice atual parece ter erro (02 = "São Silvério" provavelmente errado; 01 pode ser São Carlos de Foucauld)** |
| 10 | 04–08/dez | Ambrósio (M), Nicolau de Mira; 08 já tem bio (só reconferir) |

Cada lote: aplicar o protocolo por dia → rodar Verificação → **1 commit** com mensagem listando
cada dia (bio nova ou correção do índice + fonte). Parar e perguntar ao usuário se:
- uma correção de índice for grande/ambígua (santo trocado, não só grafia);
- as fontes se contradisserem em ponto relevante e não houver como decidir;
- uma data ficar sem bio por falta de fonte confiável (registrar e seguir, mas avisar no
  resumo do lote).

## Arquivos

- `src/data/saintsOfTheDay.ts` — corrigir `nome`/`match`/`opcional` das datas divergentes;
  adicionar `bioId` nas 47 datas novas.
- `src/data/saintBios.ts` — ~47 entradas novas em `SAINT_BIOS`, em ordem de data, após
  `"sao-paulo-cruz"`.
- `docs/tasks/santos-plan.md` — este plano (o `docs/tasks/plan.md` atual é o de cobertura de
  testes, já concluído — **não sobrescrever**).
- `docs/tasks/santos-todo.md` — checklist dia a dia (50 linhas), marcada conforme avança, com a
  fonte usada e qualquer correção anotada.

## Verificação (por lote, antes do commit)

1. `npx tsc -b --noEmit` — o arquivo de dados é `.ts` tipado (`SaintBio`, `SaintOfDayEntry`);
   erro de vírgula/aspas/campo quebra aqui.
2. `npx vitest run src/utils/saintOfDay.test.ts` — a lógica que consome o índice/bios.
3. `npx eslint src/data/saintsOfTheDay.ts src/data/saintBios.ts` — sem novos erros.
4. `npm run build` — garante que o bundle não quebra (os dados entram no chunk `saintOfDay`).
5. **Spot-check manual** de 1–2 dias do lote: num `node`/teste rápido, chamar
   `resolveSaintOfDay({ data:"DD/MM", liturgia:"<texto plausível da API>", cor:"..." })` e
   conferir que retorna `nome`, `grau` e `bio` corretos, e que `bio.texto` tem os parágrafos.
6. Revisão de conteúdo: reler a bio contra as fontes — nenhuma data/nome/ano sem respaldo.

Ao final dos 10 lotes: `npm run test:cov` (continua passando — `src/data/**` fora do
denominador), `npm run build`, e um resumo com as datas cobertas, as correções de índice feitas
(com fonte) e qualquer dia deixado sem bio.

## Riscos e notas

- **`match[]` x texto real da API BR**: não temos como bater a API de liturgia aqui. Mitigação:
  seguir o padrão das entradas vizinhas (sobrenome / termo distintivo, minúsculo, sem acento) e
  incluir 2–3 variantes quando o nome tiver formas comuns (ex.: "teresa d avila"/"teresa de jesus").
- **Cristo Rei (22/nov/2026)**: não mexer — é `MOVABLE_FEASTS`, fallback já funciona.
- **Próprio do Brasil**: algumas datas têm celebração só no Brasil (Frei Galvão 25/out, Roque
  González 19/nov, Medalha Milagrosa 27/nov). Priorizar a fonte BR (CNBB/gcatholic BR) sobre a
  universal nesses casos.
- **Contrato do arquivo**: se a fonte confiável não confirmar um santo para a data, é melhor
  deixar sem bio do que publicar algo incerto — o app foi desenhado pra isso.
- **Escopo**: só dados (`src/data/**`) e o todo/plan. Nada de lógica, componentes ou testes
  novos. Rollback de qualquer lote = `git revert` do commit dele.
