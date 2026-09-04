---
description: Revisão completa antes do PR — critérios de aceite e varredura de erros, em paralelo
argument-hint: [branch base, padrão develop]
---

Revise a branch atual antes de abrir PR. Base: **${ARGUMENTS:-develop}**.

## 1. Sanidade

```
git rev-parse --abbrev-ref HEAD
git diff --stat ${ARGUMENTS:-develop}...HEAD
```

Se a branch atual for `main` ou `develop`, **pare** — `RULES.md` §6. Se o diff estiver vazio,
diga isso e pare.

## 2. Dois revisores, em paralelo

Dispare os dois agentes **read-only**, na mesma mensagem:

- **`ac-reviewer`** — recebe a spec correspondente (`docs/specs/`) ou o checklist
  (`docs/tasks/*-todo.md`). Devolve veredito por critério de aceite, com evidência.
- **`error-scanner`** — recebe o diff. Devolve os achados do checklist fixo de 12 itens
  (XSS, token em log, `localStorage` sem decisão, visitante, versões do PWA, timezone, CSP,
  teste vazio, pins, dado pessoal).

Nenhum dos dois edita código. É isso que torna a saída deles confiável como portão.

## 3. Verificação mecânica

```
npx vitest run
npx tsc -b --noEmit
npm run lint
npm run test:cov
npm run build
```

## 4. Síntese

Um veredito só, em três blocos:

- **Bloqueadores** — o que impede o PR de existir (critério não atendido, achado crítico, build
  quebrado). Se houver qualquer um, o veredito é **não abrir**.
- **Corrigir antes do merge** — o que dá para resolver rápido.
- **Registrar como dívida** — o que fica, com onde foi anotado.

E confirme os itens de higiene: `docs/tasks/*-todo.md` com os `[x]` marcados,
`docs/ARCHITECTURE.md` atualizado se o comportamento mudou, `docs/specs/INDEX.md` com o status
novo.

**O agente antecede a revisão humana, nunca a substitui.** Diga isso no fecho.
