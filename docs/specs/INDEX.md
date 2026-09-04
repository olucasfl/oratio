# Índice de specs — Oratio Web

Mapa único de `spec ↔ plano ↔ checklist ↔ status`. **Este arquivo é a fonte da verdade sobre o
que existe**; não confie em adivinhar nome de arquivo. Quem fecha uma fase atualiza esta tabela
no mesmo commit — e `/docs-sync` confere se ela bate com a realidade.

| Feature | Spec | Plano | Checklist | Backend pareado | Status |
|---|---|---|---|---|---|
| Cobertura de testes + lint | `specs/cobertura-testes.md` | `tasks/plan.md` | (no próprio plano) | n/a | ⚠️ **parcial** — cobertura ✅, lint ❌ (143 problemas, L2–L11 abertas) |
| Bíblia de Estudo | — *(não precisa: já entregue)* | `tasks/biblia-plan.md` | `tasks/biblia-todo.md` | `oratio-api/docs/tasks/biblia-*.md` | ✅ **em produção** (F1–F9 na `main`) |
| Perfis de resposta do VoxAI | — *(não precisa: já entregue)* | `tasks/vox-profiles.md` (ponteiro) | `tasks/vox-profiles-todo.md` | `oratio-api/docs/tasks/vox-profiles-plan.md` (mestre) | ✅ **em produção** (F1–F4 na `main`; backend idem) |
| Reformulação das notificações | — | `tasks/notifications.md` (ponteiro) | — | `oratio-api/docs/tasks/notifications-*.md` (mestre) | ✅ concluída |
| Biografias do Santo do Dia | — | `tasks/santos-plan.md` | `tasks/santos-todo.md` | n/a | ✅ concluída (20/out–13/dez) |

## Dívidas conhecidas (medidas em 2026-09-04)

Não são specs; são gaps reais que a auditoria encontrou e que precisam de dono.

- **Fase Lint parada.** `npx eslint .` → 143 problemas (122 erros / 21 avisos). A baseline da
  spec era 148 (128/20): só a Tarefa L1 foi feita. `tasks/plan.md` L2–L11 seguem abertas.
- **Serviços da Bíblia sem cobertura.** `bibleMarksService.ts` está em **0%** e
  `bibleCollectionsService.ts` em **57,69%**. Os dois nasceram depois da Fase 1 (Services) do
  `plan.md`, que já estava fechada, e nunca entraram na fila. A cobertura global passa mesmo
  assim, o que é exatamente o tipo de buraco que a média esconde.
- **`CollectionDetail.test.tsx` sem asserção de visitante** — ver `tasks/biblia-todo.md`, F5.1.

## Legenda de status

| Status | Significa |
|---|---|
| 📝 rascunho | spec escrita, ainda não aprovada pelo humano |
| ✅ aprovada | aprovada, implementação não começou |
| 🚧 em andamento | tem plano e checklist abertos em `docs/tasks/` |
| ✅ implementada | todos os critérios de aceite verificados por `/qa-verify` |
| 🗑️ obsoleta | superada por outra spec — diga qual |

## Como usar

- **Feature nova:** `/criar-spec <nome>` → gera `specs/<nome>.md` a partir de `_template.md` e
  adiciona a linha aqui.
- **Implementar:** `/implement-story specs/<nome>.md`.
- **Provar que está pronto:** `/qa-verify specs/<nome>.md` — critério a critério, com evidência.
- **Requisito mudou:** edite **só a spec** e rode `/spec-sync specs/<nome>.md`. O agente compara
  desejado × implementado × testes e reporta a divergência. Não reexplique o contexto em conversa
  nova — a spec é o único lugar onde "o que deveria acontecer" está escrito.

## Por que não há spec para as features existentes

Todas as features desta tabela foram construídas direto no par plano+checklist, sem spec — e
**não vale a pena escrever spec retroativa para elas**. Spec é contrato antes do código: quando o
código já existe e funciona, o que sobra é documentação, e isso o `docs/ARCHITECTURE.md` já faz.
Um terceiro arquivo dizendo o mesmo só cria mais uma coisa para manter em sincronia.

O template e os comandos (`/criar-spec`, `/qa-verify`, `/spec-sync`) valem para a **próxima**
feature — a que ainda não existe. Aí a spec é contrato de verdade, e mudar um requisito vira
editar um arquivo em vez de reexplicar contexto numa conversa nova.
