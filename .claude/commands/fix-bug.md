---
description: Investiga a causa raiz de um bug e corrige — sem editar nada antes de ter um teste que falha
argument-hint: <descrição do bug ou arquivo de teste falhando>
---

Bug: **$ARGUMENTS**

Aplique a skill **`bug-research`** integralmente. Ela não é sugestão: é o procedimento.

## O portão

**Não altere código de produção antes do passo 4** (teste que falha pela razão da hipótese).
Se você se pegar editando um arquivo em `src/` antes de ter mostrado a saída de um teste
falhando, pare e volte.

## Sequência

1. **Reproduzir** — caso concreto, com dados, estado de login e condição de rede.
   Antes de investigar fundo: teste em **aba anônima**. Cache do service worker servindo bundle
   antigo é a causa mais comum de "corrigi e não mudou nada".
2. **Localizar a causa raiz** — caminho de execução inteiro, não o primeiro `if` suspeito.
3. **Hipótese** em uma frase testável.
4. **Teste que falha** — rode e cole a saída real da falha. Se passar de primeira, a hipótese
   está errada: volte ao 2.
5. **Corrigir** — a menor mudança possível. Delegue ao agente `bug-fixer` se o escopo for claro.
6. **Regressão** — o teste fica no repo; suíte completa + typecheck + lint + build.

## Limites

- Se a correção esbarrar em algo que o `RULES.md` protege (CSP, `APP_VERSION`/`CACHE_NAME`,
  `src/data/**`, dependência pinada), **pare e peça aprovação** com o diff pronto.
- Se o bug for de conteúdo devocional, **não corrija de memória** — `RULES.md` §3.
- Um bug por execução. Achou um segundo? Descreva e siga.
