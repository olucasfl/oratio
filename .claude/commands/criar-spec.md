---
description: Escreve uma spec nova em docs/specs/ por entrevista dirigida, com critérios de aceite em BDD
argument-hint: <nome-da-feature>
---

Crie a spec de **$ARGUMENTS** em `docs/specs/$ARGUMENTS.md`, a partir de `docs/specs/_template.md`.

## Antes de perguntar qualquer coisa

Leia, nesta ordem: `.claude/rules/RULES.md`, `CLAUDE.md`, `docs/ARCHITECTURE.md` e
`docs/specs/INDEX.md`. Se já existir spec ou plano para algo parecido, **diga isso e pergunte se
é para estender o que existe** em vez de criar arquivo novo.

## Como conduzir

Faça **perguntas direcionadas, uma de cada vez**, com opções quando fizer sentido. Cubra:
objetivo · comportamento esperado · stack (só se divergir do padrão da casa — e por quê) · erros
e limites · comportamento para visitante deslogado · critérios de aceite · fora de escopo ·
notas de ambiente (env, `localStorage`, `guestAllowedPrefixes`, CSP, `APP_VERSION`).

**Não pergunte o que já está claro no pedido ou nas convenções do projeto — só o que realmente
muda o design.** Teto de **3 perguntas** antes de propor a spec. O que faltar, você assume um
padrão razoável, escreve na spec, e **sinaliza a suposição explicitamente** para o humano
confirmar ou corrigir.

## Regras de conteúdo

- **Critérios de aceite em BDD**: `Dado <estado>, quando <ação>, então <resultado observável>`.
  Um critério por comportamento, não por tela. Inclua pelo menos **um caminho de erro** e **um de
  visitante deslogado**.
- Nada de "funciona corretamente", "está performático", "a UI está boa" — se não dá para outra
  pessoa verificar, não é critério.
- **Separe feature do produto de passo de processo.** Bump de `APP_VERSION`, atualizar
  `ARCHITECTURE.md` e revisar contrato com o backend são processo: vão em "Fora de escopo", nunca
  em critério de aceite.
- Se a feature toca o backend, registre o par em `oratio-api/docs/specs/` e aponte um para o outro.

## Ao terminar

1. Escreva o arquivo com `Status: rascunho`.
2. Adicione a linha correspondente em `docs/specs/INDEX.md`.
3. Liste as suposições que você fez, em bullets, e **pare** — a spec só vira `aprovada` com um
   "ok" explícito do humano. Não comece a implementar.
