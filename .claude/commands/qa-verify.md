---
description: Prova, critério a critério, se a spec está atendida — com evidência real. Não corrige nada.
argument-hint: <caminho-da-spec>
---

Verifique **$ARGUMENTS** contra a implementação atual. Sua entrega é **evidência**, não opinião.

## Regra que define este comando

**Você não corrige nada.** Se algo falhar, reporte e pare. Correção é `/fix-bug`, em outra
execução, com outro agente. Misturar as duas coisas faz o mesmo agente racionalizar um resultado
ruim como aceitável para "fechar a tarefa".

## Procedimento

1. Leia a spec e extraia os critérios de aceite. Se não estiverem em BDD, avise na primeira linha
   — a verificação vale menos e o leitor precisa saber.
2. Leia a seção **Requisitos de saída** da spec: é dela que sai a evidência esperada.
3. Para cada critério, escolha o meio de prova mais barato que ainda seja real:
   - **Lógica pura / service / hook** → `npx vitest run <arquivo>`, colando a saída.
   - **Comportamento de tela, navegação, boot, offline, PWA** → Playwright
     (`npx playwright test`), verificando pela **árvore de acessibilidade** (papel + nome
     acessível), **não por screenshot**. Screenshot prova pixel, não comportamento.
   - **Rota pública do backend** → `curl` contra a rota pública. **Nunca** com token de usuário
     real e **nunca** com método de escrita contra produção (`RULES.md` §1).
4. Se um critério exigir device físico, deploy na Vercel, ou push real: marque
   **NÃO VERIFICÁVEL AQUI** e diga **quem** verifica e **como**. Não simule o resultado.
5. Se o Playwright não estiver instalado ou o dev server não subir, **avise e pare** aquele
   critério. Não invente que passou.

## Saída

| # | Critério | Passou? | Evidência |
|---|---|---|---|
| 1 | Dado X, quando Y, então Z | ✅ | `npx vitest run src/services/foo.test.ts` → 4 passed |
| 2 | … | ❌ | esperado `{ok:true}`, recebido `{ok:false}` |
| 3 | … | ⏸️ | device: instalar PWA no Android e confirmar ícone |

Feche com uma linha: **quantos passaram de quantos**, e se a feature pode ser fechada ou não.
Se houver falha, liste os critérios que falharam — sem propor a correção.
