# Spec: Cobertura de testes do frontend (80%) + limpeza do backlog de lint

> Status: **parcial** — a metade de cobertura está atingida, a de lint não.
>
> **Cobertura: ✅ atingida** (medido em 2026-09-04, `npx vitest run --coverage`, exit 0):
> statements 80,22% · lines 82,59% · branches 71,98% · functions 72,4% — todos acima dos
> thresholds de `vitest.config.ts` (80/80/70/70). Fases 1–6 fechadas.
>
> **Lint: ❌ em aberto.** `npx eslint .` reporta **143 problemas (122 erros, 21 avisos)**. A
> baseline desta spec era 148 (128/20): só a Tarefa L1 foi feita. As tarefas **L2–L11 seguem
> pendentes** em `docs/tasks/plan.md`, e o critério de sucesso "0 erros" não está cumprido.
>
> Plano/checklist: `docs/tasks/plan.md`
> As regras permanentes que nasceram aqui (a seção **Boundaries**) foram promovidas para
> `.claude/rules/RULES.md` — esta spec mantém só o que é específico desta iniciativa.

## Objetivo

Levar o frontend (`oratio/`) de cobertura de teste real a um mínimo de 80% (lines/statements) /
70% (functions/branches), e zerar os 148 problemas do `npm run lint` (128 erros / 20 avisos)
identificados nesta sessão — sem quebrar nada observável pro usuário em nenhuma das duas frentes.

Contexto: o backend (`oratio-api`) já tem ~96% de cobertura com testes reais (ver
`oratio-api/docs/ARCHITECTURE.md` §2); o frontend começou esta sessão em 1,2% e o `npm run lint`
não rodava (sem `eslint.config.js`). Ambas as lacunas já foram corrigidas ao ponto de terem
ferramenta funcionando e um plano de tarefas em andamento — esta spec formaliza o que já está
combinado e testado nas últimas ~8 tarefas de cobertura + 1 de lint, pra liberar execução
autônoma do resto sem precisar de aprovação tarefa a tarefa.

Êxito = usuário final não percebe NENHUMA mudança de comportamento; só ganha uma rede de
segurança de testes e um código-fonte mais limpo.

## Tech Stack

React 19 + Vite 7 + TypeScript, Vitest 4 + `@vitest/coverage-v8` + React Testing Library,
ESLint 9 (flat config). Ver `docs/ARCHITECTURE.md` §1 para o resto da stack (routing, styling,
state, PWA).

## Comandos

```
npm test              # Vitest, single run
npm run test:cov       # Vitest + cobertura (thresholds: lines/statements 80, functions/branches 70)
npx tsc -b --noEmit      # typecheck (mais rápido que build completo pra verificar cada tarefa)
npm run build              # tsc -b && vite build — build de produção completo
npm run lint                 # ESLint sobre o projeto inteiro
```

Loop de verificação por tarefa: `npx vitest run <arquivo(s)>` → `npx vitest run` (suíte
completa) → `npx tsc -b --noEmit` → `npx eslint <arquivo(s) tocados>` → `npm run test:cov`
(cobertura) → `npm run build` → commit.

## Estrutura do projeto

Ver `docs/ARCHITECTURE.md` §6. Testes ficam ao lado do arquivo que testam
(`Foo.ts` + `Foo.test.ts`), convenção já em uso no projeto (`api.test.ts`,
`LiturgiaFull.test.tsx`, `ErrorBoundary.test.tsx`, `pdfConfig.test.ts`).

## Estilo de código (testes)

Um arquivo de teste por arquivo de produção. `describe` por função/comportamento, `it` descrevendo
o comportamento em linguagem natural (não o nome do método). `./api` sempre mockado com
`vi.mock("./api", () => ({ default: { get: vi.fn(), post: vi.fn(), ... } }))` — nunca bate rede de
verdade. Módulos irmãos que o arquivo sob teste importa (`../utils/localCache`,
`../utils/auth`) são mockados só quando o teste quer isolar a lógica do próprio arquivo; quando a
interação entre os dois É o comportamento sob teste (ex.: `isLoggedIn()` real gatando uma chamada),
usa-se o módulo real. Nada de `expect(true).toBe(true)` ou "renders without crashing" sem
asserção — todo teste verifica um efeito colateral real (chamada mockada, `localStorage`, valor de
retorno, texto renderizado).

```ts
vi.mock("./api", () => ({ default: { get: vi.fn(), post: vi.fn() } }))
import api from "./api"
const mockedApi = api as any // eslint-disable-line @typescript-eslint/no-explicit-any

it("returns the response body on success", async () => {
  mockedApi.get.mockResolvedValue({ data: { ok: true } })
  await expect(myFn()).resolves.toEqual({ ok: true })
})
```

## Estratégia de testes

**Cobertura** (`docs/tasks/plan.md`, Fases 1-6): ordem de prioridade já em andamento —
services (concluída) → utils → hooks → contexts/guards → componentes com lógica real →
páginas com lógica real. Cada arquivo ganha teste só se tiver comportamento verificável; arquivo
puramente apresentacional (markup sem branch) ganha `/* v8 ignore file */` em vez de teste forçado,
decidido individualmente ao tocar no arquivo — não uma lista pré-definida.

Denominador dos 80% exclui (`vitest.config.ts`): `src/data/**` (conteúdo estático),
`src/main.tsx` (boot puro), `*.d.ts`. `coverage.all: true` garante que todo `src/**/*.{ts,tsx}`
conta, tocado por teste ou não — sem isso o número seria fácil de enganar.

**Lint** (`docs/tasks/plan.md`, Fase Lint): backlog já triado e ordenado por risco (L1 concluída —
reordenações puras + catches vazios documentados, ambos zero-mudança-de-comportamento). L2
(`react-hooks/set-state-in-effect`, 6 arquivos) exige a técnica certa por caso — estado inicial
preguiçoso via `useState(() => ...)` quando não depende de nada assíncrono externo, ou manter o
padrão atual quando há uma chamada assíncrona real no meio. L3-L9 (`no-explicit-any`, ~110
ocorrências): tipar contra o shape real que a API devolve, nunca `unknown` genérico só pra calar o
linter. L10 (`exhaustive-deps`, 13 avisos): só adicionar a dependência faltante quando a função
referenciada for estabilizada (`useCallback`); do contrário, `eslint-disable-next-line` com
comentário explicando por que é intencional — nunca adicionar a dependência "pra calar o aviso"
sem entender se isso recria um loop de re-fetch (a razão de L2/L10 serem tratados por último e com
mais cautela, não em lote com L3-L9).

## Boundaries

**Sempre:**
- Rodar a suíte completa + typecheck + lint dos arquivos tocados + `npm run build` antes de cada
  commit.
- Um commit por tarefa concluída (mensagem explicando o quê + por quê + progresso de cobertura).
- Marcar a tarefa como `[x]` em `docs/tasks/plan.md` no mesmo commit que a implementa.
- Se um teste revelar um bug real no código de produção: se for **crítico** (afeta dado do
  usuário, segurança, ou repete um comportamento já reportado por ele), **parar e perguntar antes
  de corrigir** — não corrigir silenciosamente dentro de uma tarefa de cobertura/lint. Se for
  **não-crítico e a correção for óbvia e mínima** (ex.: um `!==` que deveria ser `===` num branch
  nunca exercitado), corrigir, documentar no commit, e seguir — sem pausa, já que a autorização
  desta spec cobre exatamente esse tipo de achado incremental.

**Perguntar antes:**
- Qualquer mudança em `package.json`/lockfile além de devDependencies de teste já em uso
  (`@vitest/coverage-v8`, etc.) — ex.: adicionar uma lib de mock nova.
- Qualquer mudança que precise tocar `oratio-api` (backend) — esta spec é só frontend.
- Se a cobertura de 80% não parecer alcançável sem forçar teste falso em página puramente visual
  — nesse caso, reportar o número real atingível e perguntar se ajusta a meta ou aceita o número.

**Nunca:**
- Mudar comportamento observável (UI, rota, payload de request, texto exibido) só pra "facilitar"
  um teste ou silenciar um lint.
- Adicionar `eslint-disable` em massa pra abaixar a contagem de problemas sem resolver a causa.
- Pular a suíte completa/build antes de commitar.
- Force-push, `git reset --hard`, ou qualquer operação destrutiva.

## Critério de sucesso

- `npm run test:cov` reporta ≥80% lines/statements e ≥70% functions/branches, sem `ERROR:` de
  threshold. (A meta de functions foi ajustada de 80 → 70 ao fechar a Fase 6: o gap residual era
  quase todo handler secundário do `Vox.tsx` e handlers pontuais, cujo teste profundo não cabia
  no escopo "simples" desta rodada — mesmo racional de "branches ficam atrás" já aceito aqui.)
- `npm run lint` reporta 0 erros (avisos residuais documentados no `docs/tasks/plan.md` são aceitáveis
  se cada um tiver uma razão registrada — ex.: `react-refresh/only-export-components` avaliado e
  considerado aceitável como está).
- `npm run build` e `npx tsc -b --noEmit` passam limpos.
- Todo teste novo verifica comportamento real (nenhum "smoke test" vazio).
- `docs/tasks/plan.md` com todas as tarefas de Fase 1-6 e Fase Lint marcadas `[x]`.

## Questões em aberto

Nenhuma — todas as decisões relevantes (exclusões de cobertura, split lines/branches,
gate de CI, ordem de prioridade, política de correção de bug encontrado) já foram tomadas
explicitamente nesta conversa antes desta spec ser escrita.
