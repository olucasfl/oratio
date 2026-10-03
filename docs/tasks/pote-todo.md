# Checklist: O Pote (frontend)

Mestre: `oratio-api/docs/tasks/pote-plan.md` · Spec: `oratio-api/docs/specs/pote.md`
Depende do backend (P1–P4) e do `db push` humano.

- [x] P5 — cópia do domínio + teste de hash; `poteService`; `usePoteRoom` (polling + `since`); rotas + guardrail PWA; botão "Dinâmicas" no card admin do Perfil (só admin vê); tela "Você não foi convidado" (403)
- [x] P5 — `/oratio/dinamicas`: criar sala, buscar e convidar usuários, retomar sala ativa
- [x] P5 — `NotificationBell` já faz `navigate(it.url)` (lido no código); **conferir na tela** com um convite real
- [x] P6 — jogador, rodada 1 (tutorial 3 telas, card + barra de 6 s, pote, "Ficou de fora", espera, overlay de pausa)
- [x] P7 — líder + telão: lobby, rodada 1, resultado 1, parábola
- [x] P8 — rodada 2 (abas bloqueadas até 5/5, retirada, combos, "Encaixou nos vãos", fechar semana)
- [x] P9 — final, compromisso, encerramento/cancelado
- [x] ARCHITECTURE.md atualizado
- [ ] 🧑 P10 — ver na tela em 380 px, 3 navegadores + telão (nada disso foi visto: só testes automáticos)
