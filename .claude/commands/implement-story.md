---
description: Implementa uma spec aprovada — plano curto primeiro, depois código e testes por critério
argument-hint: <caminho-da-spec ou do todo>
---

Implemente **$ARGUMENTS**.

## 1. Contexto (antes de qualquer edição)

Leia: `.claude/rules/RULES.md` → `CLAUDE.md` → `docs/ARCHITECTURE.md` (§3 boot, §4 api/auth,
§5 PWA, §6 estrutura) → a spec/checklist passado → o plano pareado em `docs/tasks/`, se houver.

Se a spec não tiver critérios de aceite em BDD, **diga isso** e proponha convertê-los antes de
codar — sem eles, `/qa-verify` não consegue provar nada depois.

## 2. Plano curto, antes de editar

Apresente, em no máximo 15 linhas: os arquivos que vão mudar, a ordem, e qual critério de aceite
cada passo fecha. **Pare e espere o "ok"** se o plano tocar algo que o `RULES.md` marca como
"Perguntar antes" (CSP/`vercel.json`, `APP_VERSION`/`CACHE_NAME`, chave nova de `localStorage`,
rota de visitante, dependência, `src/data/**`).

## 3. Implementar, em fatias verticais

Uma fatia = um critério de aceite fechado ponta a ponta, não "todos os services e depois todas as
telas". Siga as convenções de `docs/ARCHITECTURE.md` §8: chamada de backend em `*Service.ts`
(nunca `axios` cru em componente), rota nova registrada e lazy em `App.tsx`, decisão explícita de
`KEEP_ON_LOGOUT` para chave nova.

## 4. Testar cada critério

Aplique a skill `oratio-testing`. Cada critério de aceite ganha ao menos um teste que falharia se
o comportamento sumisse. Nada de teste sem asserção.

## 5. Verificar

```
npx vitest run <arquivos tocados>
npx vitest run
npx tsc -b --noEmit
npx eslint <arquivos tocados>
npm run test:cov
npm run build
```

Não pule etapa "porque a anterior passou".

## 6. Fechar

- Marque `[x]` no `docs/tasks/*-todo.md` correspondente.
- Atualize `docs/ARCHITECTURE.md` se o comportamento mudou, **no mesmo commit**.
- Atualize o status em `docs/specs/INDEX.md`.
- Commit com o **porquê** na mensagem. Confira a branch antes (`RULES.md` §6).

Se um critério não puder ser fechado, **diga qual e por quê** — não entregue silenciosamente
parcial.
