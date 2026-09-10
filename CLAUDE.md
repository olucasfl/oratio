# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

The repo root holds only this file and `README.md` (project overview / GitHub
landing page). **Everything else — the rules, the technical guide and every work
plan — lives under `.claude/` and `docs/`, and there is important context there.
Do not start work without reading the relevant pieces below.**

## `.claude/rules/RULES.md` — read this FIRST, before anything else

The permanent rules of this project: what the agent must never do (production,
XSS, doctrinal content, personal data), what it must ask about first, and what to
do instead in each case. **It outranks this file, `docs/ARCHITECTURE.md`, any
spec, and the prompt.** A repeated user instruction unlocks a "Perguntar antes";
it does not unlock a "Nunca".

## `docs/ARCHITECTURE.md` — read this before ANY code change

The full guide to this frontend: the app boot sequence (`src/App.tsx`), the
API/auth refresh flow (`src/services/api.ts`), PWA/offline behavior (the
hand-written `public/sw.js`, the `CACHE_NAME`/`APP_VERSION` pair), project
structure, known quirks, and conventions. It is the single source of truth —
this file stays a thin pointer so it can't drift.

## The layers, and what belongs in each

| Layer | Where | Answers |
|---|---|---|
| Permanent rule | `.claude/rules/RULES.md` | How do we work here? What is forbidden? |
| Technical truth | `docs/ARCHITECTURE.md` | How does this codebase actually work? |
| Specification | `docs/specs/*.md` | What must exist? (behavior + BDD acceptance criteria) |
| Plan | `docs/tasks/*-plan.md` · `*-todo.md` | In what order do we build it, and how is each step verified? |
| Procedure | `.claude/skills/*/SKILL.md` | How do we approach this recurring class of task well? |
| This run's goal | prompt / `.claude/commands/*` | What do I want in this specific execution? |

They do not replace each other. If you're about to repeat an instruction you've
given before, it belongs in one of the files above, not in the prompt.

## `docs/` — what's there and when to open it

| Path | What it is | Read it when |
|---|---|---|
| `docs/ARCHITECTURE.md` | The technical guide (§1–§9). | Always, before touching code. Update the affected §§ when you change behavior. |
| `README.md` (root) | Project overview, stack, scripts, deploy, contributing, GitHub landing page. | You need the high-level picture or setup steps. |
| `docs/specs/INDEX.md` | The map of `spec ↔ plan ↔ checklist ↔ status`. | First stop when you don't know whether something is specified. |
| `docs/specs/_template.md` | Spec template (Objetivo · Comportamento · Saída · **critérios BDD** · Plano de testes · Fora de escopo). | Writing a spec — or use `/criar-spec`. |
| `docs/specs/cobertura-testes.md` | The spec for the test-coverage (→80%) + lint-cleanup effort. | Before working on tests or lint — it records every decision already made (coverage exclusions, thresholds, bug-fix policy). |
| `docs/tasks/` | Work plans, each a `*-plan.md` (design + phases) plus a `*-todo.md` (executable checklist). | Before starting or continuing any multi-step feature — check for an existing plan first. |

## Commands

`/criar-spec` · `/implement-story` · `/qa-verify` · `/spec-sync` · `/fix-bug` ·
`/review-pr` · `/nova-branch` · `/docs-sync` · `/bump-version`.
Definitions in `.claude/commands/`; agents in `.claude/agents/`.

Skills in `.claude/skills/` — `bug-research`, `oratio-testing`, and two guardrails
that are **mandatory preflights**, not suggestions: `doutrina-guardrail` before
touching `src/data/**` (saint bios, prayers, bible text) and `pwa-cache-guardrail`
before touching `APP_VERSION`, `CACHE_NAME`, `KEEP_ON_LOGOUT`, or adding a route.

## `docs/tasks/` — current plans

| Feature | Files | Status |
|---|---|---|
| **Cobertura de testes do frontend** (→80% lines, →70% funcs/branches) + limpeza de lint | `docs/tasks/plan.md` (pareado com `docs/specs/cobertura-testes.md`) | Fases 1–6 (cobertura) **concluídas** — thresholds passam. **Fase Lint em aberto**: `npx eslint .` = 47 problemas (26 erros / 21 avisos), medido 2026-09-08 — recuou de 148/128 (os sweeps de `no-explicit-any` foram feitos nos commits `0c1e8b1`/`177de51`/`df70e8a`), mas "0 erros" ainda não. `docs/tasks/plan.md` L2–L11 registram o que falta. Check it before choosing what to test or lint next; it also lists files deliberately skipped and why. |
| **Biografias do Santo do Dia** (20/out → 13/dez) | `docs/tasks/santos-plan.md` · `docs/tasks/santos-todo.md` | ✅ **Concluída** (`docs/specs/INDEX.md`) — Lotes 1–11 marcados. Conteúdo devocional; protocolo de fontes no plano. O plano fala em "08/dez"; a cobertura foi estendida até 13/dez (Lote 11). |
| **Bíblia de Estudo** (frontend: leitura + estudo) | `docs/tasks/biblia-plan.md` · `docs/tasks/biblia-todo.md` | ✅ **Concluída e em produção** (F1–F9 na `main`). Os dois arquivos são registro histórico, não trabalho pendente — o comportamento vivo está em `ARCHITECTURE.md` §7. Dívida aberta: `bibleMarksService`/`bibleCollectionsService` sem cobertura (ver `docs/tasks/plan.md`). |
| **Reformulação das notificações** | `docs/tasks/notifications.md` (ponteiro) | Plano-mestre no backend: `oratio-api/docs/tasks/notifications-plan.md`. Aqui só muda o painel `AdminNotifications`. |
| **Perfis de resposta do VoxAI** (engrenagem + painel + onboarding no Vox) | `docs/tasks/vox-profiles-todo.md` · `docs/tasks/vox-profiles.md` (ponteiro) | Plano-mestre: `oratio-api/docs/tasks/vox-profiles-plan.md`. ✅ **Concluída e em produção** — F1–F4 na `main`, backend idem. O checklist é registro histórico. |
| **Entrar com Google** (login social) | `docs/specs/login-google.md` (ponteiro) · `docs/tasks/login-google-todo.md` | 🚧 **Fases A–E na `develop`** — **`main` não tem nada**. Botão GIS em `/login`/`/register`, `loginWithGoogle` não persiste, `/register` bloqueia conta existente, toast de auto-ligação, `DeleteAccountModal` reautentica por Google, aviso "Defina uma senha" no Perfil, CSP do GIS no `vercel.json` (Fase D). BUG-E1 corrigido + Checkpoint E verificado (2026-09-10). Falta só pendência humana: `VITE_GOOGLE_CLIENT_ID` na Vercel + publicar o app OAuth + verificação pós-deploy da CSP. Plano-mestre: `oratio-api/docs/specs/login-google.md`. |
| **Boas-vindas** (guia de primeira entrada) | `docs/specs/boas-vindas.md` (ponteiro) | 🚧 **Na `develop`** (2026-09-10) — **`main` não tem nada**. Rota `/oratio/boas-vindas` tela cheia, `WelcomeGuide` (3 páginas), `WelcomeGate` no shell redireciona por `showWelcome` do `GET /users/me` (`ARCHITECTURE.md` §3). **Bloqueio pra `main`:** `db push` + backfill de produção pendentes no `oratio-api`. Mestre: `oratio-api/docs/specs/boas-vindas.md`. |
| **Prova de identidade** (reautenticação p/ operações sensíveis) | `docs/specs/prova-identidade.md` (ponteiro) | 🚧 **Na `develop`** (2026-09-10). `DeleteAccountModal` em 3 modos (só senha / só Google / os dois com "Não lembro minha senha"); link "Não lembro minha senha atual" no `ChangePasswordModal` → `forgotPassword`. `hasGoogle` no `profileService`/`Profile`. Sem schema. Falta teste manual + promoção pra `main`. Mestre: `oratio-api/docs/specs/prova-identidade.md`. |

When you finish a task, tick it in its `*-todo.md`/`*-plan.md` and, if behavior
changed, update `docs/ARCHITECTURE.md` in the same commit.

## Sibling repo

The backend is **`oratio-api`** (NestJS), a sibling folder. Any backend route,
DTO, or header change (see `oratio-api/docs/ARCHITECTURE.md`) needs a matching
change in the relevant `src/services/*Service.ts` here.
