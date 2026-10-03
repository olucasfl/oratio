# O Pote — ponteiro

> Status: 📝 rascunho (2026-10-02) — nada implementado.

A **spec mestra** vive no backend: `oratio-api/docs/specs/pote.md` (regras, catálogo, textos,
contrato das rotas, modelo de dados, critérios de aceite). Plano: `oratio-api/docs/tasks/pote-plan.md`.

## O que este repo constrói

- **Só o admin vê o jogo.** Entrada "Dinâmicas" no menu condicionada a `isAdmin`; páginas do líder e do telão sob `AdminRoute`. Convidados **não** têm entrada: chegam pelo sino da Home.
- **Rotas** (prefixo `/oratio/` como o resto do app; o PDF original usava `/dinamicas/...`):
  `/oratio/dinamicas` (admin: criar sala e convidar) · `/oratio/dinamicas/pote/:code` (jogador) · `.../lider` (admin) · `.../telao` (admin, só leitura).
  Rota nova passa pelo `pwa-cache-guardrail`.
- **Tempo real = polling** de ~1 s em `GET /pote/rooms/:code?since=<version>` (sem Supabase). Hook único `usePoteRoom`; timers de pausa/rodada 2 calculados a partir de `round2EndsAt`.
- **Domínio puro copiado** do backend para `src/pages/Pote/domain/` + teste de hash igual ao do backend.
- Verificar que `NotificationBell` abre a `url` interna do convite.
- Textos só em `domain/content.ts`, nunca nos componentes.
