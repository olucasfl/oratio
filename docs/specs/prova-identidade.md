# Prova de identidade — ponteiro

> Status: **implementado, na `develop`** (2026-09-10) — falta o teste manual na tela
> (os 3 modos do `DeleteAccountModal` + o link no `ChangePasswordModal`) e a promoção pra `main`.

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

## O que este repo construiu

- **`DeleteAccountModal`** deixou de ramificar rígido em `hasPassword` — ganhou a
  prop `hasGoogle` e três modos: só senha → campo de senha; só Google → botão de
  reautenticação; **os dois** → campo de senha **+** link "Não lembro minha senha"
  que troca para o botão do Google (e "Prefiro usar minha senha" pra voltar). A
  reautenticação Google reusa `GoogleSignInButton` (mesmo padrão da E7).
- **`UserProfile.hasGoogle?`** no `profileService` (espelha o campo aditivo do
  `GET /users/me`); `Profile.tsx` repassa pro modal. Cache antigo sem o campo →
  `undefined` → tratado como `false`.
- **`ChangePasswordModal`** ("Trocar senha") ganhou a prop `email` e um link
  **"Não lembro minha senha atual"** que dispara `POST /auth/forgot-password` com
  o e-mail da própria pessoa (rota pública, idempotente — **sem rota nova**) e
  mostra um estado de confirmação. A confirmação deixa **explícito** que o reset
  se conclui pelo link do e-mail, **fora do app**, e que depois é preciso entrar
  de novo com a senha nova. `AccountSettings` passa o `email` (do perfil / cache).
  - **Difere da letra da spec mestra**, que falava em abrir o `ResetPasswordModal`:
    esse componente lê o token da URL e não tem campo pra colar — não serve pro
    fluxo dentro do app. O disparo + a confirmação clara é o equivalente.
  - Vale pra conta só-senha e pra conta com os dois métodos. Conta só-Google usa
    "Definir senha" (não pede a atual) — fora do alcance do link.
- **`profileService.setPassword` NÃO mudou** — a ideia de aceitar `googleCredential`
  ali foi descartada na spec mestra ("Fora de escopo"): o sintoma 2 sai de graça
  reusando `forgot-password`.

## Decisão de escopo

**Spec própria, não Fase F do login-google** — o sintoma 2 não é sobre Google, e
a exclusão de conta é irreversível (merece isolamento). Raciocínio completo na
spec mestra → "Questões em aberto".

Sem `db push`, sem env var nova. Backend (na `develop` do `oratio-api`): a primitiva
`assertFreshProof` (senha **ou** Google fresco, pelo que a conta tem) + `hasGoogle`
aditivo no `GET /users/me` + 2 testes — **sem afrouxar a exclusão**: sessão roubada
continua não podendo apagar a conta.
