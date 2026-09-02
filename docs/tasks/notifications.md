# Reformulação das notificações — parte frontend

O **plano-mestre** desta reformulação (cross-repo) e o checklist executável
ficam no backend:

- Plano: `oratio-api/docs/tasks/notifications-plan.md`
- Checklist: `oratio-api/docs/tasks/notifications-todo.md`

Leia os dois. O que toca este repo (`oratio/`) é o painel `AdminNotifications`:

| Task | O que muda aqui |
|---|---|
| **Task 3** | Bloco "Ajustes de frequência" — máx/dia, quiet hours, espaçamento, rest gap, limiar de urgência, salvos via novo `GET/PATCH /oratio/admin/notifications/settings`. |
| **Task 6** | Card de regra ganha select de faixa (Manhã/Tarde/Noite/Qualquer) e campo de limiar em dias; `ruleTrigger()` passa a descrever pelos valores reais. |
| **Task 11** | Título/corpo únicos da regra viram uma lista de variantes (add / editar / remover / ativar), com piso de 1 variante ativa. |

Arquivos: `src/components/AdminNotifications/*`, `src/services/adminNotificationsService.ts`.
Antes de codar, ler `docs/ARCHITECTURE.md` (regra do repo).
