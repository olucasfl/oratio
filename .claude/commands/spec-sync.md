---
description: A spec mudou — compara desejado × implementado × testes e reporta a divergência
argument-hint: <caminho-da-spec>
---

A especificação **$ARGUMENTS** mudou. Analise o impacto.

Este é o comando que faz a spec valer como fonte da verdade: quando um requisito muda, você edita
**só a spec** e roda isto. O contexto vem do arquivo versionado, não da memória de uma conversa.

## Procedimento

1. Leia a spec atual **e o diff dela**: `git diff HEAD -- $ARGUMENTS` e, se estiver commitada,
   `git log -p --follow -- $ARGUMENTS` para ver o que mudou desde a última verificação.
2. Monte três colunas:
   - **Desejado** — o que a spec diz hoje.
   - **Implementado** — o que o código faz hoje (cite `arquivo:linha`).
   - **Testado** — qual teste garante isso hoje (cite `arquivo:linha`), ou "nenhum".
3. Classifique cada critério:
   - **em dia** — os três batem.
   - **código atrasado** — a spec pede algo que o código não faz.
   - **teste atrasado** — o código faz, nenhum teste garante.
   - **código órfão** — o código faz algo que a spec não pede mais. **Não apague por conta
     própria**: pode ser comportamento em uso. Reporte e pergunte.
4. Verifique o efeito colateral que a spec sozinha não mostra: a mudança exige bump de
   `APP_VERSION`/`CACHE_NAME`? mexe em `guestAllowedPrefixes`? muda contrato com o
   `oratio-api` (então a spec de lá também mudou)?

## Saída

Uma tabela com as quatro colunas (critério · desejado · implementado · testado · veredito), e
depois **um plano curto** do que precisa mudar, em ordem.

**Pare aí.** Não implemente. Se o humano aprovar, o passo seguinte é `/implement-story`.
