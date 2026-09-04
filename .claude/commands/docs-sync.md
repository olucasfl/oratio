---
description: Confere se CLAUDE.md, ARCHITECTURE.md, specs/INDEX.md e docs/tasks batem com a realidade do código
---

Audite a documentação deste repo contra o estado real. Índice que mente é pior que índice que
falta: um agente que lê um `ARCHITECTURE.md` desatualizado toma decisão errada com confiança.

## O que conferir

**1. `CLAUDE.md` × arquivos reais**
- Todo caminho citado existe? (`docs/specs/`, `docs/tasks/*.md`, `.claude/rules/RULES.md`)
- A numeração de seção prometida (`§1–§N`) bate com os `##` reais de `docs/ARCHITECTURE.md`?
- A tabela de "current plans" reflete o status real de cada `docs/tasks/*-todo.md`?

**2. `docs/ARCHITECTURE.md` × código**
- Cada afirmação verificável ainda é verdade? Cheque as mais caras de estar erradas:
  contagem de testes (`find src -name '*.test.ts*' | wc -l`), existência de `eslint.config.js`,
  thresholds em `vitest.config.ts`, scripts em `package.json`, versões pinadas.
- Alguma seção descreve comportamento que o código não tem mais?

**3. `docs/specs/INDEX.md` × `docs/specs/` e `docs/tasks/`**
- Toda spec no disco está na tabela? Toda linha da tabela aponta para arquivo existente?
- O status declarado bate com os checkboxes do `*-todo.md` correspondente?

**4. `docs/tasks/*-todo.md` × git**
- Alguma fase marcada como pendente que já foi entregue em commit? (`git log --oneline -30`)
- Alguma marcada `[x]` sem commit correspondente?

**5. Cross-repo**
- Os ponteiros para `oratio-api/docs/` apontam para arquivos que existem?

## Saída

| Arquivo | Linha | Afirma | Realidade | Gravidade |
|---|---|---|---|---|

Gravidade **alta** quando a afirmação errada levaria alguém a uma decisão ruim (ex.: "não há
testes" quando há 113 arquivos). **Baixa** quando é só cosmético.

Depois da tabela, proponha as correções — **e pare**. Aplique só com o "ok" do humano, num commit
de `docs:` separado do trabalho de feature.
