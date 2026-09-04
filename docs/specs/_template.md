# Spec: <nome da feature>

> Status: rascunho | aprovada | implementada | obsoleta
> Plano: `docs/tasks/<feature>-plan.md` · Checklist: `docs/tasks/<feature>-todo.md`
> Backend pareado: `oratio-api/docs/specs/<feature>.md` (ou "n/a")

## Objetivo

<Uma frase: o que esta feature permite ao usuário do Oratio que hoje não é possível.>

## Stack

<Só o que diverge do padrão da casa. Se seguir `docs/ARCHITECTURE.md` §1 inteiro, escreva
"padrão da casa" e siga em frente. Se divergir, diga **o quê** e **por quê**.>

## Comportamento esperado

- <entrada / ação do usuário> → <saída / efeito observável>
- <regra de negócio>
- <o que acontece deslogado (visitante)>
- <o que acontece offline / sem rede>
- <o que acontece no erro: mensagem, reversão otimista, silêncio>

## Requisitos de saída

<O contrato. Para tela: quais campos aparecem, em que ordem, em que estado.
Para chamada de API: rota, método, shape do request e do response, headers exigidos.
Este bloco é o que `/qa-verify` usa para montar a evidência — seja literal.>

## Critérios de aceite (testáveis, em BDD)

- [ ] **Dado** <estado inicial>, **quando** <ação>, **então** <resultado observável>.
- [ ] **Dado** <estado inicial>, **quando** <ação>, **então** <resultado observável>.

<Regras para escrever um critério útil:
— o "então" tem que ser verificável por alguém que não escreveu o código;
— nada de "funciona corretamente", "está performático", "a UI está boa";
— um critério por comportamento, não um critério por tela;
— inclua pelo menos um caminho de erro e um de visitante deslogado.>

## Plano de testes

- **Unitário (Vitest + RTL):** <quais arquivos, o que cada um cobre>
- **E2E (Playwright):** <qual fluxo, se aplicável — só para o que exige navegador de verdade>
- **Manual:** <o que só dá para verificar em device: PWA, offline, push, instalação>

Loop de verificação por tarefa:
`npx vitest run <arquivo>` → `npx vitest run` → `npx tsc -b --noEmit` →
`npx eslint <arquivos tocados>` → `npm run test:cov` → `npm run build` → commit.

## Fora de escopo

- <o que NÃO faz parte desta entrega, e fica registrado para não voltar como "faltou">
- <separe explicitamente **feature do produto** de **passo do processo de dev**: bump de
  `APP_VERSION`, atualização de doc e revisão de contrato são processo, não critério de aceite>

## Notas de ambiente

- <variável de env nova, chave nova de `localStorage` (e a decisão de `KEEP_ON_LOGOUT`),
  rota nova em `guestAllowedPrefixes`, mudança de CSP em `vercel.json`, bump de
  `APP_VERSION`/`CACHE_NAME` — tudo que o `RULES.md` exige decidir explicitamente>

## Questões em aberto

- [ ] <pergunta que muda o design e ainda não foi respondida — se não houver, escreva "Nenhuma">
