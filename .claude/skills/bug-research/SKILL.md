---
name: bug-research
description: Investiga a causa raiz de um bug antes de qualquer correção. Use quando um teste falha, quando o comportamento diverge do esperado, quando um usuário reporta um problema, ou quando você está prestes a "tentar uma coisa pra ver se resolve".
---

# Pesquisa de bug — provar a causa antes de corrigir

O erro que esta skill existe para evitar: corrigir o **sintoma que aparece por cima**, achar que
resolveu porque a tela parou de quebrar, e o bug voltar em outra forma três semanas depois.

**A regra que sustenta tudo: não altere código de produção antes do passo 4.**

## Os 6 passos

### 1. Reproduzir

Antes de qualquer leitura de código, defina o caso concreto: quais dados, qual rota, logado ou
visitante, online ou offline, qual navegador, qual passo exato.

Se você **não consegue reproduzir**, esse é o resultado desta etapa. Diga o que tentou e o que
falta (um dado, um device, um passo do usuário) — e pare. Corrigir um bug que você não conseguiu
reproduzir é chutar.

No Oratio, boa parte dos bugs difíceis mora em três lugares — comece por eles se o sintoma
encaixar:
- **Boot** (`src/App.tsx`): ordem de inicialização, `APP_VERSION`, redirect de visitante.
- **Auth** (`src/services/api.ts`): refresh de token, `KEEP_ON_LOGOUT`, 401 em cascata.
- **PWA** (`public/sw.js`): cache servindo versão antiga, `CACHE_NAME` desatualizado.
  *Sintoma clássico:* "corrigi e não mudou nada" — muitas vezes é o service worker servindo o
  bundle velho. Teste em aba anônima antes de investigar mais fundo.

### 2. Localizar a causa raiz

Leia o caminho de execução do começo ao fim. Não pare no primeiro `if` suspeito.

Pergunte: **por que** o valor errado chegou aqui? E de novo, para a resposta. A causa raiz é
aquela em que a resposta vira "porque foi escrito assim" — não "porque a variável estava
`undefined`".

### 3. Formular a hipótese

Escreva uma frase testável: *"O valor X chega como `undefined` em `foo.ts:42` porque `bar()`
retorna antes de resolver a promise quando o usuário está offline."*

Se não couber numa frase, você ainda está no passo 2.

### 4. Confirmar com um teste que falha

**Este é o portão.** Escreva um teste que falha **pela razão da hipótese** — não um teste que
falha por qualquer motivo.

- Rode-o e **mostre a saída da falha**, com a mensagem real.
- Se ele passar de primeira, a hipótese está errada. Volte ao passo 2. Isso é um resultado bom:
  você acabou de descobrir barato que ia corrigir a coisa errada.
- Convenção do projeto: teste ao lado do arquivo (`Foo.ts` + `Foo.test.ts`), `./api` sempre
  mockado. Ver a skill `oratio-testing`.

### 5. Corrigir

Só agora. A **menor** mudança que faz o teste do passo 4 passar. Nada de refactor de oportunidade.

Se a correção exigir algo que o `RULES.md` protege (CSP, `APP_VERSION`/`CACHE_NAME`, conteúdo de
`src/data/**`, dependência pinada), pare e peça aprovação com o diff pronto.

### 6. Garantir a regressão

O teste do passo 4 **fica no repositório**. Rode a suíte inteira (`npx vitest run`), o typecheck
(`npx tsc -b --noEmit`), o lint dos arquivos tocados e o `npm run build`.

Na mensagem do commit: o que era, por que acontecia, o que mudou, e qual teste impede a volta.

## Anti-padrões

| Sintoma | O que está acontecendo |
|---|---|
| "Vou tentar mudar isso e ver se resolve" | Pulou do passo 1 pro 5. Não sabe a causa. |
| Corrigiu, mas não escreveu teste | Sem passo 4 e sem passo 6: o bug volta e ninguém percebe. |
| O teste novo passa antes da correção | O teste não exercita o bug. Não vale como confirmação. |
| A correção mexeu em 6 arquivos | Ou o escopo vazou, ou a causa raiz não foi encontrada. |
| "Também aproveitei e arrumei…" | Vira outra tarefa. Sempre. |
