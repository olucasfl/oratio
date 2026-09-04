---
name: oratio-testing
description: Convenções de teste do frontend Oratio (Vitest + React Testing Library). Use ao escrever qualquer teste novo, ao decidir se um arquivo merece teste, ou ao mexer em cobertura e thresholds.
---

# Testes no Oratio Web

Stack: **Vitest 4 + @vitest/coverage-v8 + React Testing Library**, jsdom.
Thresholds em `vitest.config.ts`: **80% lines/statements, 70% functions/branches**.

## Onde o teste mora

Ao lado do arquivo que testa: `Foo.ts` → `Foo.test.ts`, `Foo.tsx` → `Foo.test.tsx`.
Um arquivo de teste por arquivo de produção. Nada de pasta `__tests__` paralela.

## A regra mais importante: `./api` é sempre mockado

Nenhum teste bate rede. Nunca.

```ts
vi.mock("./api", () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }))
import api from "./api"
const mockedApi = api as any // eslint-disable-line @typescript-eslint/no-explicit-any

it("returns the response body on success", async () => {
  mockedApi.get.mockResolvedValue({ data: { ok: true } })
  await expect(myFn()).resolves.toEqual({ ok: true })
})
```

**Módulo irmão (`../utils/localCache`, `../utils/auth`): mocke só quando o objetivo é isolar a
lógica do arquivo sob teste.** Quando a interação entre os dois **é** o comportamento sob teste
(ex.: `isLoggedIn()` de verdade disparando uma chamada), use o módulo real. Mockar por reflexo
esconde exatamente o bug que o teste deveria pegar.

## Como escrever

- `describe` por função ou comportamento; `it` descreve **o comportamento em linguagem natural**,
  não o nome do método. `it("volta pro login quando o refresh falha")`, não `it("calls refresh")`.
- **Toda asserção verifica um efeito real**: valor de retorno, mock chamado com quais argumentos,
  `localStorage`, texto renderizado. Assertar sequência de chamadas é o último recurso.
- **Proibido**: `expect(true).toBe(true)`, e "renders without crashing" sem nenhuma asserção. Um
  teste que não pode falhar não é um teste — é ruído que infla a cobertura.

## Quando um arquivo NÃO merece teste

Arquivo puramente apresentacional (markup sem `if`, sem `map` condicional, sem handler com
lógica) recebe `/* v8 ignore file */` **no próprio arquivo**, decidido ao tocar nele.

Não adicione exclusão nova em `vitest.config.ts` — as que existem (`src/data/**`,
`src/main.tsx`, `*.d.ts`) são exclusões de caminho, deliberadas e fechadas. Ampliá-las para
"componentes difíceis de testar" é maquiar o número.

`coverage.all: true` existe justamente para que um arquivo sem teste apareça como 0% em vez de
sumir do denominador. Não desligue.

## Loop de verificação (o mesmo do `docs/specs/`)

```
npx vitest run <arquivo>     # o teste que você acabou de escrever
npx vitest run               # suíte inteira
npx tsc -b --noEmit          # typecheck
npx eslint <arquivos tocados>
npm run test:cov             # thresholds
npm run build
```

Só depois disso, commit.

## E2E (Playwright)

`e2e/` existe e tem **um** spec. Use E2E só para o que exige navegador de verdade: boot completo,
service worker, comportamento offline, instalação do PWA. Fluxo de lógica pura é teste unitário —
é mais rápido, mais estável e aponta melhor onde quebrou.

## Bug encontrado enquanto se escreve teste

Política já decidida em `docs/specs/cobertura-testes.md`:

- **Crítico** (dado do usuário, segurança, ou comportamento já reportado): **pare e pergunte**.
  Não corrija dentro de uma tarefa de cobertura.
- **Não-crítico e correção óbvia e mínima** (ex.: um `!==` que deveria ser `===` num branch nunca
  exercitado): corrija, documente no commit, siga.
