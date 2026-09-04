---
name: doutrina-guardrail
description: Preflight obrigatório antes de escrever ou alterar conteúdo devocional — biografia de santo, texto de oração, texto bíblico, calendário litúrgico. Use sempre que a tarefa tocar src/data/, mesmo que pareça só um typo.
---

# Guardrail de conteúdo devocional

`src/data/**` não é conteúdo de exemplo: é o produto. Um erro aqui é um erro doutrinário que o
usuário lê como verdade — data errada de memória litúrgica, santo atribuído ao dia errado,
oração com o texto trocado, canonização atribuída ao Papa errado.

E é o tipo de erro que um modelo comete com mais confiança: hagiografia é exatamente o terreno
onde detalhe plausível e detalhe verdadeiro são indistinguíveis sem fonte.

**Por isso este preflight é obrigatório e vem antes de qualquer edição.**

## Preflight — as quatro perguntas

Responda as quatro, por escrito, antes de abrir o arquivo:

1. **O que exatamente vai mudar?** Nome, data, grau litúrgico, corpo da biografia, texto de
   oração, versículo?
2. **Esta tarefa era sobre isso?** Se você chegou aqui no meio de uma tarefa de teste, lint ou
   refactor: **pare**. Conteúdo devocional nunca muda de carona (`RULES.md` §3). Registre o
   achado e siga.
3. **Qual é a fonte?** Se a resposta for "eu sei" ou "está claro", **pare**. Não existe fonte
   "de memória" para este tipo de conteúdo.
4. **É correção de índice ou de biografia?** São protocolos diferentes — ver abaixo.

## Ordem de prioridade das fontes

Já decidida em `docs/tasks/santos-plan.md` §Fontes. Resumo operacional:

**Para saber QUEM é o santo do dia e o GRAU** (Solenidade / Festa / Memória obrigatória /
facultativa):
1. `gcatholic.org/calendar/<ano>/BR-pt` (Próprio do Brasil) + `.../General-G-pt` (Romano Geral)
2. `cnbb.org.br` — Calendário Próprio dos Santos do Brasil, Missal 3ª ed.
3. Martirológio Romano (ed. 2004)

**Para a biografia — cruzar SEMPRE ao menos duas:**
- `vaticannews.va/pt`, homilias de canonização em `vatican.va` — oficiais
- `newadvent.org` (Catholic Encyclopedia) — sólido para santos antigos
- `a12.com` (Santuário Nacional), `cancaonova.com` — PT-BR, devoção no Brasil
- Butler's *Lives of the Saints*

## Regras que não se negociam

- **Só use fato que coincide entre ≥2 fontes.** Fato que aparece em uma só não entra.
- **Número por número:** nascimento, morte, local, ordem religiosa, ano de canonização e o Papa
  que canonizou são conferidos individualmente, não "no geral".
- **Nunca invente fonte, data, atribuição ou citação.** Se não encontrou, o resultado é
  *"não encontrei fonte confiável para X"* — e isso é uma entrega válida.
- **Não force preenchimento.** Data sem santo com biografia sólida fica **sem** `bioId` (o app
  já lida com isso) e o motivo vai registrado. A meta é qualidade verificada, não cobrir o
  calendário.
- **Data móvel não vira entrada fixa.** Cristo Rei, Páscoa e afins são resolvidos por
  `MOVABLE_FEASTS`; criar entrada fixa para elas quebra os outros anos.
- **Aceite humano antes do commit.** Apresente o texto e espere o "aceito" — e registre "aceito"
  na mensagem do commit. Nenhum conteúdo devocional entra sem isso.

## Cuidado extra: oração já publicada

Texto de oração que já está no ar tem outro peso: usuários rezam com ele **diariamente** e sabem
de cor. Mudança silenciosa quebra a memória de uso, mesmo quando "corrige" algo.

Qualquer alteração em oração publicada é **Perguntar antes**, sempre — inclusive pontuação e
quebra de linha.

## Ao terminar

Verifique, além do de sempre (`npm test`, `npm run build`):

- O `match` do índice segue o padrão das linhas vizinhas (1–3 trechos, minúsculas, sem acento).
- `opcional: true` está marcado se for Memória Facultativa confirmada.
- A biografia segue o formato das vizinhas em `saintBios.ts`.
- O commit diz **quais fontes** foram cruzadas e registra o "aceito".
