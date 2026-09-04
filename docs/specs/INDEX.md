# Índice de specs — Oratio Web

Mapa único de `spec ↔ plano ↔ checklist ↔ status`. **Este arquivo é a fonte da verdade sobre o
que existe**; não confie em adivinhar nome de arquivo. Quem fecha uma fase atualiza esta tabela
no mesmo commit — e `/docs-sync` confere se ela bate com a realidade.

| Feature | Spec | Plano | Checklist | Backend pareado | Status |
|---|---|---|---|---|---|
| Cobertura de testes + lint | `specs/cobertura-testes.md` | `tasks/plan.md` | (no próprio plano) | n/a | ✅ implementada |
| Bíblia de Estudo | — *(retro-spec pendente)* | `tasks/biblia-plan.md` | `tasks/biblia-todo.md` | `oratio-api/docs/tasks/biblia-*.md` | 🚧 em andamento |
| Perfis de resposta do VoxAI | — *(retro-spec pendente)* | `tasks/vox-profiles.md` (ponteiro) | `tasks/vox-profiles-todo.md` | `oratio-api/docs/tasks/vox-profiles-plan.md` (mestre) | 🚧 falta smoke em device |
| Reformulação das notificações | — | `tasks/notifications.md` (ponteiro) | — | `oratio-api/docs/tasks/notifications-*.md` (mestre) | ✅ concluída |
| Biografias do Santo do Dia | — | `tasks/santos-plan.md` | `tasks/santos-todo.md` | n/a | ✅ concluída (20/out–13/dez) |

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

## Nota sobre as retro-specs pendentes

Bíblia de Estudo e Perfis do VoxAI foram construídas direto no par plano+checklist, sem spec.
Os planos são bons, mas os critérios lá são **declarativos** ("model com `@@unique`…"), não
BDD — o que impede `/qa-verify` e `/spec-sync` de operarem sobre eles. Escrever a retro-spec
das duas é a próxima etapa natural; features já fechadas (notificações, santos) não precisam.
