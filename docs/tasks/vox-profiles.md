# Perfis de resposta do VoxAI — ponteiro

O **plano-mestre** desta feature vive no backend:
`oratio-api/docs/tasks/vox-profiles-plan.md` (design, arquitetura, grafo de
dependências, fases, e o Apêndice com os rascunhos de prompt dos 6 perfis).

Checklists executáveis:
- Backend: `oratio-api/docs/tasks/vox-profiles-todo.md`
- Frontend: `oratio/docs/tasks/vox-profiles-todo.md`

## Resumo

O prompt do Vox deixa de ser bloco único e vira **identidade fixa + 6 perfis de
estilo** escolhidos por usuário:

| Chave | Rótulo | Papel |
|---|---|---|
| `DEFAULT` | Padrão | Atual **destravado** — formato acompanha a pergunta. Vai pra todo mundo no deploy. |
| `DIRECT` | Direto ao ponto | Curto, sem seções, sem "como aplicar". |
| `STUDY` | Profundo | Fundamento bíblico + Magistério, distinções, história. |
| `PASTORAL` | Pastoral | Acolhe primeiro, tom de conversa, sugere oração. |
| `CATECHIST` | Catequista | Passo a passo, analogia, "como viver isso". |
| `APOLOGETIC` | Apologético | Desfaz a caricatura, responde objeções. |

O que o frontend constrói:
- `voxService`: `getVoxProfiles()`, `setVoxProfile()`, `dismissVoxIntro()`;
  `getBootstrap` traz `profile` e `showVoxIntro`.
- **Engrenagem "Configurações do Vox"** no header do Vox → `VoxSettingsPanel`.
- **Onboarding**: `bootstrap.showVoxIntro` → `VoxProfilesIntroModal`, **uma única
  vez** (escolher ou "Depois" encerra pra sempre).
- Trocar de perfil com conversa aberta → linha discreta "Perfil alterado para X"
  no chat (só visual, não persiste).
- Componentes compartilhados: `VoxProfileList`, `VoxProfileDetailsModal`
  (um perfil por vez), `VoxMarkdown` (extraído do `Vox.tsx`).

Backend correspondente: `User.voxProfile` + `voxOnboardingSeenAt`,
`GET /oratio/voxai/profiles`, `PATCH /oratio/voxai/profile`,
`POST /oratio/voxai/profile/intro-seen`, `max_tokens` por perfil,
`buildSystemPrompt()` unificando `chat`/`chatStream`.
