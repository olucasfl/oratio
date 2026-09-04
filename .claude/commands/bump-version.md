---
description: Sobe APP_VERSION e CACHE_NAME juntos, com o checklist de efeitos colaterais
argument-hint: [motivo do bump]
---

Faça o bump de versão do app. Motivo: **${ARGUMENTS:-(informe o motivo)}**

## Por que este comando existe

São **dois conceitos de versão distintos, manuais e independentes** (`ARCHITECTURE.md` §5/§7):

- `APP_VERSION` em `src/App.tsx` → invalida o cache do **`localStorage`** do cliente.
- `CACHE_NAME` em `public/sw.js` → invalida o cache de **assets do service worker**.

Bumpar um sem o outro é o erro clássico: ou o usuário fica com bundle antigo e não vê a correção,
ou perde dado local sem necessidade. Este comando existe para que os dois sejam sempre uma
decisão consciente, não um esquecimento.

## Procedimento

1. Mostre os valores atuais dos dois:
   ```
   grep -n "APP_VERSION" src/App.tsx
   grep -n "CACHE_NAME" public/sw.js
   ```
2. **Pergunte, explicitamente, qual dos dois deve subir** — e por quê:
   - Mudou asset (JS/CSS/imagem/`index.html`)? → `CACHE_NAME`.
   - Mudou o formato de algo guardado no `localStorage`, ou é preciso forçar limpeza? →
     `APP_VERSION`.
   - Na dúvida, ou em release normal com mudança de código: **os dois**.
3. Antes de subir `APP_VERSION`, liste as chaves de `localStorage` que **serão varridas** e as
   que sobrevivem. A limpeza é por *substring match* (`oratio`/`stage_`/`consecration` em
   `App.tsx`), não por lista explícita — então confira se alguma chave nova cai fora sem querer,
   e cheque `KEEP_ON_LOGOUT` em `src/services/api.ts`.
4. Aplique o bump.
5. Verifique: `npm run build`, e teste em **aba anônima** — a janela normal pode continuar
   servindo o service worker antigo e esconder o efeito.
6. No commit, escreva **o que** foi bumpado, **qual dos dois**, e **por quê**.

## Limites

- **Nunca** bumpe como efeito colateral de outra tarefa. É sempre uma decisão explícita
  (`RULES.md` §4).
- **Nunca** bumpe `APP_VERSION` "por garantia": cada bump apaga dado local de todos os usuários.
