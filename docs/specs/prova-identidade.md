# Prova de identidade — ponteiro

> Status: rascunho (2026-09-09)

A **spec mestra** vive no backend: `oratio-api/docs/specs/prova-identidade.md`
(objetivo, a primitiva `assertFreshProof`, contrato das rotas, critérios de
aceite, questões em aberto).

## Contexto (uma causa, dois sintomas)

Descoberto testando a Fase E do login-google. O backend trata a **senha** como a
única prova de identidade para operações sensíveis — o Google fica invisível
mesmo estando ligado. Isso trava:

1. **Excluir a conta com o Google se você também tem senha.** Quem esqueceu a
   senha não consegue apagar a conta — direito de LGPD, e o app guarda dado
   sensível.
2. **"Esqueci minha senha atual" dentro do app.** Logado, "Trocar senha" exige a
   senha atual; quem não lembra precisa **deslogar** para usar o "Esqueci minha
   senha" da tela de login.

## O que este repo constrói (proposta — não implementada)

- **`DeleteAccountModal`** deixa de ramificar rígido em `hasPassword`. Três modos:
  só senha → campo de senha; só Google → botão de reautenticação; **os dois** →
  campo de senha **+** link "Não lembro minha senha" que troca para a
  reautenticação Google.
- **"Trocar senha"** (`AccountSettings` / `ChangePasswordModal`) ganha um link
  **"Não lembro minha senha atual"**:
  - conta com Google → reautentica pelo Google → formulário de senha nova (sem
    "senha atual"). `profileService.setPassword` passa a aceitar `googleCredential`.
  - conta só senha → dispara o `POST /auth/forgot-password` do **próprio** e-mail
    (a pessoa está logada, sabemos o e-mail) e abre o `ResetPasswordModal` **que
    já existe**, sem deslogar antes.
- Reautenticação Google reusa `GoogleSignInButton` (mesmo padrão da E7).

## Decisão de escopo

**Spec própria, não Fase F do login-google** — o sintoma 2 não é sobre Google, e
a exclusão de conta é irreversível (merece isolamento). Raciocínio completo na
spec mestra → "Questões em aberto".

Sem `db push`, sem env var nova. Backend: afrouxar os `if`s de `users.service` e
os DTOs; a primitiva `assertFreshProof` (senha **ou** Google fresco) — **sem
afrouxar a exclusão**: sessão roubada continua não podendo apagar a conta.
