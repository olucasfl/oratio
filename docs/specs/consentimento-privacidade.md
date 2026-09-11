# Spec: consentimento-privacidade — telas e portas de consentimento

> Status: rascunho
> Plano: — *(a decidir na aprovação)* · Checklist: —
> Backend pareado: `oratio-api/docs/specs/consentimento-privacidade.md` (mestre — dado, rotas,
> DTO, critérios de backend e as decisões de design das quatro portas vivem lá)

## Objetivo

Ninguém usa o Oratio (cria conta, entra pelo Google, ou reabre o app já logado) sem antes ver e
aceitar **dois documentos** — os **Termos de Uso** e a **Política de Privacidade** — e quem
recusa nunca fica sem saída: o cadastro simplesmente não se conclui, e quem já tem conta pode
sair (sem perder nada) ou excluir a conta (LGPD), nunca tem dado apagado sem pedir.

**Correção factual (2026-09-11): o app NÃO guarda "intenções de oração".** `Prayer` e
`GeneralPrayer` não têm `userId` — são o catálogo do app, o mesmo texto para todo mundo, sem
nenhum dado pessoal ali. O que é dado pessoal — e, no caso da convicção religiosa, **sensível**
(LGPD art. 5º, II) — é outra coisa, em três frentes:

- **Texto livre escrito pela pessoa:** mensagens ao Vox (`Message.content`), anotações em
  versículos da Bíblia (`BibleMark.note`), e a penitência da Quaresma de São Miguel
  (`QuaresmaMichaelPenance.content`).
- **Registros de prática devocional:** sessões de terço (`RosarySession`), progresso e dias
  concluídos da consagração (`ConsecrationProgress`/`ConsecrationCompletedDay`), posição de
  leitura (`ReadingProgress`), estatísticas espirituais e atividade (`SpiritualStats`/
  `UserActivity`).
- **O fato de a conta existir** — nome, e-mail, e o vínculo entre tudo acima e uma pessoa
  identificável.

Hoje não se pede consentimento nenhum para nada disso.

## Stack

Padrão da casa. **Dois** componentes de conteúdo — `PrivacyPolicyContent` (já previsto) e
`TermsOfUseContent` (novo) — montados em três lugares diferentes (rota pública própria de cada
um, e dentro do fluxo de consentimento). Componentes novos que espelham padrões já existentes no
repo (`WelcomeGate`/`WelcomeGuide` da spec `boas-vindas`), e reúso total do `DeleteAccountModal`
já existente.

**Atualização (2026-09-11): o texto já existe e já foi aprovado — não é mais placeholder.**
`docs/legal/2026-09-11-politica-de-privacidade.md` e `docs/legal/2026-09-11-termos-de-uso.md`
são a fonte, texto real e aprovado por Lucas (não gerado por IA de memória — RULES.md §3 não se
aplica aqui, é conteúdo jurídico, não devocional, mas o cuidado de fonte é o mesmo espírito).
`PrivacyPolicyContent`/`TermsOfUseContent` devem renderizar exatamente este conteúdo. **Como**
— ver "Decisões" abaixo: este projeto não tem `DOMPurify` e `dangerouslySetInnerHTML` é proibido
(RULES.md §4, stored-XSS real já aconteceu por esse caminho), então markdown não pode ir para
`dangerouslySetInnerHTML` de forma alguma. A tradução do Markdown para nós React precisa seguir
o padrão de `formatVerses()` (array de strings/elementos JSX) ou uma biblioteca de
markdown-para-React que nunca produza uma string HTML intermediária (ex.: `react-markdown`,
que renderiza para elementos React diretamente) — introduzir essa biblioteca é mudança de
`package.json` além de devDependency de teste, então **cai no "Perguntar antes" do RULES.md §7**
antes de instalar.

## Decisões (fechadas na escrita desta versão)

- **Um único par de campos cobre os dois aceites, não dois pares** (decisão do humano, ao
  responder à pergunta de design desta revisão): os dois documentos são obrigatórios e sempre
  aceitos juntos, na mesma tela, no mesmo clique — não existe "aceitei só os Termos, ainda não a
  Política". A versão passa a identificar **o par de documentos**, não um documento isolado.
  **Por isso os campos e a constante saem do nome `privacy*` e passam a `legalTerms*`** — ver o
  par backend para o schema (`User.legalTermsAcceptedAt`/`legalTermsVersion`,
  `LEGAL_TERMS_VERSION`). Reflexo aqui: `UserProfile.legalTermsAccepted`, `acceptLegalTerms()`,
  `register(..., legalTermsAccepted)`.
- **Componentes e rota do fluxo de consentimento também são renomeados** para não sugerir que só
  a Política de Privacidade está em jogo: `PrivacyConsentGate` → **`LegalConsentGate`**;
  `PrivacyGate` → **`LegalTermsGate`**; `pages/PrivacyConsent/` (rota `/oratio/privacidade`) →
  **`pages/LegalConsent/`** (rota **`/oratio/consentimento`**). `PrivacyPolicyContent` **não**
  muda de nome — continua sendo o conteúdo específico da Política, um dos dois documentos.
- **"Aceitar e continuar" fica desabilitado até as duas caixas estarem marcadas** — correção em
  relação a uma versão anterior desta spec, que descrevia o botão "habilitado desde o início".
  Isso fazia sentido com uma única caixa cujo estado não importava; com duas caixas que
  **nascem desmarcadas por exigência desta tarefa** (não podem vir pré-marcadas, ao contrário do
  modelo do Google — ver seção seguinte), uma caixa cujo estado não bloqueia nada não seria um
  consentimento genuíno, só um enfeite. Não há trava de rolagem (scroll) — só a marcação das
  duas caixas.

## Comportamento esperado

### As quatro portas — mecanismo (contrato completo no par backend)

1. **Cadastro por senha (`Register.tsx`)** — segura o `handleSubmit`: ao clicar "Criar conta",
   abre o `LegalConsentGate` (modo `pre-account`) por cima do formulário **já preenchido**, em
   vez de chamar `register()` direto. Aceitar chama `register(..., legalTermsAccepted: true)`
   (o backend rejeita com 400 se isso não vier `true` — ver par backend). Recusar só fecha o
   overlay; o formulário continua ali, intacto, nada foi enviado.
2. **Cadastro por Google (`Register.tsx`)** — o botão nativo do GIS não pode ser interceptado no
   clique (é um iframe controlado pelo Google, `onCredential` só dispara **depois** do popup
   completar). Por isso, enquanto `!legalTermsAccepted` (estado local da página, não vem de lugar
   nenhum — nunca existiu sessão pra perguntar), o `<GoogleSignInButton/>` fica coberto por um
   overlay clicável (mesma técnica CSS de `.blocker` que `GoogleSignInButton` já usa para o
   estado `disabled` — um elemento por cima intercepta o clique antes de alcançar o iframe) cujo
   clique abre o `LegalConsentGate` (modo `pre-account`) em vez de abrir o popup do Google.
   Aceitar remove o overlay, expondo o botão real — a pessoa clica **de novo**, agora no botão de
   verdade, e o popup abre. Depois que `loginWithGoogle` devolve os tokens e a sessão é
   persistida, `Register.tsx` chama `acceptLegalTerms()` (o `POST /users/me/legal-terms-accepted`
   do par backend) **antes** de navegar para `/oratio/boas-vindas` — grava o aceite que o usuário
   já deu na tela, já que a criação da conta via Google não grava isso sozinha (ver "Decisões" no
   par backend: `auth.service.ts` nunca stampa consentimento).
3. **Login com Google (`Login.tsx`)** — **nenhuma mudança nesta tela.** O popup completa, a
   sessão é persistida, e a navegação que já acontece em seguida (`navigate(...)`) é interceptada
   pela porta 4 abaixo, na re-renderização — mesmo mecanismo que já resolveu o bug equivalente do
   `WelcomeGate` (spec `boas-vindas`: "cadastro por senha caía na Home porque o efeito só rodava
   no boot").
4. **Já logado (login por senha, Google, ou reabertura do PWA) — `LegalTermsGate`** —
   componente novo, `render-nothing`, mesma forma do `WelcomeGate`: monta no shell do `App`,
   **antes** do `WelcomeGate` na ordem do JSX (`<LegalTermsGate/>` então `<WelcomeGate/>`),
   reavalia a cada troca de `location.pathname` (não só no boot), busca `GET /users/me` uma vez
   por navegação qualificada (`checked` ref), e redireciona para `/oratio/consentimento`
   (`replace: true`) sempre que `legalTermsAccepted !== true` — **exceto** nas rotas de auth
   (`/login`, `/register`, `/verificar-email`, `/confirmar-troca-email`), nas rotas públicas dos
   próprios documentos (`/termos-de-uso`, `/politica-de-privacidade`) e na própria
   `/oratio/consentimento`. **Nem `/oratio/boas-vindas` fica de fora** — se por algum motivo uma
   conta tiver `showWelcome: true` **e** `legalTermsAccepted: false` ao mesmo tempo, o
   consentimento vem primeiro. Na prática isso nunca acontece (ver Nota abaixo), mas o gate não
   confia nisso — intercepta sempre que `legalTermsAccepted !== true`, ponto.
   - **Nota (por que a colisão não acontece hoje):** toda conta que já existia quando o
     `welcomeSeenAt` foi lançado recebeu backfill (`showWelcome: false` para sempre); toda conta
     criada **depois** desta feature nasce com `legalTermsAccepted: true` (portas 1/2 gravam na
     criação). Não existe hoje nenhuma conta real com as duas flags discordando ao mesmo tempo —
     mas o gate não depende disso continuar verdade.

### `LegalConsentGate` — o componente de decisão

Um único componente reusado nas quatro portas, com dois modos:

- **`mode="pre-account"`** (portas 1 e 2, dentro de `Register.tsx`, sem sessão): mostra as duas
  caixas — **"Aceito os Termos de Uso"** e **"Aceito o tratamento dos meus dados conforme a
  Política de Privacidade"** — **ambas desmarcadas por padrão**, **ambas obrigatórias**. Modelo:
  a tela de criação de conta do Google — mesma estrutura de duas caixas com link para cada
  documento, exceto que as do Google vêm **pré-marcadas** (o usuário já tem conta Google e está
  ligando outra coisa) e **as nossas não podem** (é o primeiro aceite, tem que ser um ato
  deliberado). Botão "Aceitar e continuar" **desabilitado até as duas caixas estarem marcadas**
  (ver "Decisões") + um botão "Recusar" visível (não escondido no rodapé). Aceitar chama
  `onAccept()` e fecha. Recusar só chama `onDecline()` (que fecha o overlay) — **nenhuma saída
  oferecida**, porque nada foi criado ainda.
- **`mode="post-account"`** (porta 4, e a chamada que a porta 2 faz depois do popup): mesmo
  conteúdo + as duas caixas + "Aceitar e continuar" (chama `acceptLegalTerms()` e `onAccept()`).
  Recusar **não fecha** — troca o conteúdo do mesmo overlay por duas saídas lado a lado:
  **"Sair do app"** (chama o `logout()`/`clearSession()` que já existe, volta para `/login` —
  conta e dados intactos, a pessoa pode voltar e aceitar depois) e **"Excluir minha conta"**
  (abre o `DeleteAccountModal` **já existente**, sem alteração — o componente só precisa de
  `userEmail`/`hasPassword`/`hasGoogle`, que a tela hospedeira já tem do próprio `getProfile()`).
  **Nunca** apaga nada automaticamente — recusar não é um pedido de exclusão, só revela o caminho
  para quem realmente quer excluir.
- **Cada caixa tem um link no próprio texto do rótulo** ("Termos de Uso", "Política de
  Privacidade") que abre o documento correspondente **para leitura**. Ver mecanismo abaixo — não
  é uma navegação de rota.
- Caixas desmarcadas sempre resetam ao reabrir (sem persistência de rascunho — recusar e tentar
  de novo começa do zero, é intencional: aceite é um ato deliberado a cada vez que a tela abre).
- Conteúdo **nunca abre em aba nova** (`target="_blank"` quebra o PWA instalado) — é sempre
  renderizado dentro do próprio app.

### Ler um documento a partir do gate — troca de view interna, não navegação de rota

**Nunca abrir em aba nova**, e **ao voltar a caixa já marcada continua marcada** — isso é
incompatível com uma navegação de rota de verdade no meio do `mode="pre-account"`: esse modo
vive **dentro** do overlay de `Register.tsx`, sem sessão; se o clique no link "Termos de Uso"
disparasse um `navigate("/termos-de-uso")` de React Router, o `Register.tsx` (e o estado local
`legalTermsAccepted`, e os campos do formulário) desmontaria.

Por isso o `LegalConsentGate` guarda um estado interno de **view**
(`'consent' | 'terms' | 'privacy'`), não uma rota: clicar no link do rótulo troca a view para
`'terms'` ou `'privacy'`, renderizando o mesmo `TermsOfUseContent`/`PrivacyPolicyContent` com um
cabeçalho "← Voltar" que só troca a view de volta para `'consent'` — nenhum componente pai
desmonta, as duas caixas (e, na porta 1/2, o formulário por baixo) continuam exatamente como
estavam. As rotas públicas (`/termos-de-uso`, `/politica-de-privacidade`, ver abaixo) reusam os
**mesmos** componentes de conteúdo para quem chega neles direto (visitante, ou o Google exigindo
uma URL pública) — são a mesma peça, montada em dois lugares diferentes, exatamente como o
`Stack` já descreve.

### Confirmação: os dois documentos já prometem o que o item "Vox" aponta como dívida

Lendo `docs/legal/2026-09-11-termos-de-uso.md` §4 diretamente: o texto já promete que "O Vox não
é atendimento de saúde" e que, em crise ou pensamento de tirar a própria vida, a pessoa deve
"procurar ajuda agora" — CVV 188 (telefone e `cvv.org.br`), SAMU 192, e falar com alguém de
confiança. Isso não é hipótese futura: é o texto que os Termos vão exibir e pedir aceite **já
nesta spec**, e o `vox.prompt.ts` não tem nenhuma instrução correspondente hoje (confirmado por
busca — zero ocorrências de suic/crise/depress/CVV/188/profissional). Por isso o item "Vox" em
"Fora de escopo" abaixo é registrado como **bloqueante**: sem ele, o app pede aceite para uma
promessa que o texto já faz e o código ainda não cumpre.

### Rotas novas

- **`/termos-de-uso`** — **pública, sem `<ProtectedRoute>`**. Renderiza só `TermsOfUseContent`
  com um cabeçalho simples (botão voltar) — sem checkbox, sem botão de aceite: é leitura, não é
  um passo de um fluxo.
- **`/politica-de-privacidade`** — **pública, sem `<ProtectedRoute>`** (o Google exige uma URL
  pública para a tela de consentimento OAuth — dívida conhecida no `oratio-api/docs/specs/
  INDEX.md`). Renderiza só `PrivacyPolicyContent`, mesmo padrão da rota acima.
- **`/oratio/consentimento`** — **protegida** (`<ProtectedRoute>`), tela cheia, fora do bottom nav
  (mesmo padrão de `/oratio/boas-vindas`). Renderiza `LegalConsentGate` em `mode="post-account"`
  — é para onde o `LegalTermsGate` redireciona. Ao aceitar, navega para `/oratio/home`
  (`replace: true`) — mesma simplicidade do `WelcomeGuide` (não tenta voltar pra "onde a pessoa
  estava indo"; deixa o `WelcomeGate`, que continua montado, pegar o `showWelcome` na navegação
  seguinte se for o caso).

### Visitante deslogado

Nenhuma das quatro portas se aplica a quem navega sem conta — visitante nunca vê nenhuma tela de
consentimento (não há `User` para gravar nada). `/termos-de-uso` e `/politica-de-privacidade` são
as únicas rotas novas acessíveis a visitante, e são puramente informativas.

### Erro

- `register()` (porta 1) falhando por qualquer motivo (inclusive um 400 de
  `legalTermsAccepted` ausente, que não deveria acontecer se a tela está correta) cai no mesmo
  `AlertModal` de erro que `Register.tsx` já usa — sem tratamento especial.
- `acceptLegalTerms()` falhando (porta 2, depois do popup, ou porta 4) mostra um erro inline no
  `LegalConsentGate` e **não navega** — a pessoa tenta de novo; não há como "seguir sem
  aceitar" por uma falha de rede transitória (diferente do `WelcomeGate`, que tolera falha porque
  o guia é só onboarding, não é uma exigência legal).

### Acoplamento texto (frontend) × versão (backend) — risco silencioso

O **texto** dos dois documentos vive neste repo, em `docs/legal/<data>-*.md`; a **constante de
versão** (`LEGAL_TERMS_VERSION`) vive no `oratio-api`, em outro repositório. Trocar o texto sem
bumpar a constante do outro lado significa que **ninguém reaceita** — a base inteira continua
com `legalTermsAccepted: true` para uma versão de texto que a pessoa nunca viu, silenciosamente.
Não há CI compartilhado entre os dois repos para travar isso automaticamente.

**A convenção de nome do arquivo já ajuda:** cada arquivo em `docs/legal/` nasce com o prefixo
`<data>-` e um cabeçalho `**Versão:** <data>` idêntico — mudar o texto de forma que exija
reaceite é, por convenção, **criar um novo arquivo** com a data nova (nunca editar o antigo
em-place), exatamente como este projeto já faz para `docs/tasks/*.sql` versionados por data.
Mitigação registrada (ver também o par backend):

- **Teste de front-end** (`legalDocs.test.ts`, a escrever na implementação): lê os dois arquivos
  de `docs/legal/` atualmente referenciados pelos componentes de conteúdo e afirma que os dois
  cabeçalhos `**Versão:**` são iguais entre si — pega o caso "atualizei só um dos dois
  documentos e esqueci o outro" dentro deste repo, sozinho.
- **Comentário em cada componente de conteúdo** (`TermsOfUseContent`, `PrivacyPolicyContent`)
  apontando para `oratio-api/src/modules/users/legal-terms-version.ts` e lembrando que qualquer
  mudança de arquivo em `docs/legal/` (a data do nome muda) exige bump de `LEGAL_TERMS_VERSION`
  no outro repo, no mesmo dia.
- **Item de checklist de release** (a registrar em `docs/tasks/` quando esta spec for aprovada e
  planejada): "novo arquivo em `docs/legal/`? bump de `LEGAL_TERMS_VERSION` no `oratio-api`, no
  mesmo PR ou num PR pareado, com a mesma data."

## Requisitos de saída

- **`profileService.ts`**: `UserProfile.legalTermsAccepted?: boolean` (aditivo, como
  `showWelcome`). `acceptLegalTerms()` → `POST /users/me/legal-terms-accepted`, retorna
  `{ ok: true }`.
- **`authService.ts`**: `register(name, email, password, confirmPassword, legalTermsAccepted)` —
  quinto parâmetro obrigatório, inclui `legalTermsAccepted` no corpo do `POST /users`.
- **`components/TermsOfUseContent/`**: componente puro de conteúdo, renderizando o texto real e
  aprovado de `docs/legal/2026-09-11-termos-de-uso.md` (ver "Decisões" — nunca
  `dangerouslySetInnerHTML`). Sem estado, sem chamada de rede.
- **`components/PrivacyPolicyContent/`**: idem, para `docs/legal/2026-09-11-politica-de-
  privacidade.md` (já previsto, sem mudança de forma).
- **`components/LegalConsentGate/`**: props `mode: "pre-account" | "post-account"`,
  `onAccept: () => void`, `onDecline: () => void`; em `post-account` também
  `userEmail: string`, `hasPassword: boolean`, `hasGoogle?: boolean` (para o
  `DeleteAccountModal`). Estado interno de view (`consent`/`terms`/`privacy`) e das duas caixas.
- **`components/LegalTermsGate/`**: sem props, `render-nothing`, mesma forma de `WelcomeGate`.
- **`pages/TermsOfUse/`**: monta em `/termos-de-uso`.
- **`pages/PrivacyPolicy/`**: monta em `/politica-de-privacidade`.
- **`pages/LegalConsent/`**: monta em `/oratio/consentimento`, busca o próprio perfil
  (`getProfile()`) para alimentar o `LegalConsentGate`.
- **`App.tsx`**: `<LegalTermsGate/>` antes de `<WelcomeGate/>`; as três rotas novas.
- **`Register.tsx`**: estado local `legalTermsAccepted` (nunca persistido além da sessão da
  página); overlay sobre o `GoogleSignInButton`; `LegalConsentGate` intercalado no
  `handleSubmit`.

## Critérios de aceite (testáveis, em BDD)

- [ ] **Dado** o formulário de cadastro por senha preenchido, **quando** clica "Criar conta",
  **então** o `LegalConsentGate` abre **antes** de qualquer chamada a `register()`, e os campos
  do formulário continuam preenchidos por baixo do overlay.
- [ ] **Dado** o `LegalConsentGate` aberto (porta 1) com as duas caixas desmarcadas, **então**
  "Aceitar e continuar" está desabilitado; **quando** marca só uma das duas, **então** continua
  desabilitado; **quando** marca as duas, **então** habilita.
- [ ] **Dado** o `LegalConsentGate` aberto (porta 1) com as duas caixas marcadas, **quando** clica
  "Aceitar e continuar", **então** `register()` é chamado com `legalTermsAccepted: true` como
  último argumento.
- [ ] **Dado** o `LegalConsentGate` aberto (porta 1), **quando** clica "Recusar", **então** o
  overlay fecha, `register()` **nunca** foi chamado, e o formulário (nome/email/senha) continua
  com os valores digitados.
- [ ] **Dado** o `LegalConsentGate` aberto, **quando** clica no link "Termos de Uso" (ou
  "Política de Privacidade"), **então** a view troca para o conteúdo do documento, sem nenhuma
  navegação de rota (`Register.tsx` e as duas caixas não desmontam); **quando** clica "Voltar",
  **então** volta para a view de consentimento com as caixas no mesmo estado de antes.
- [ ] **Dado** a tela de cadastro, **quando** ainda não aceitou os dois documentos e clica na área
  do botão do Google, **então** o `LegalConsentGate` abre em vez do popup do Google
  (`onCredential` não dispara).
- [ ] **Dado** o `LegalConsentGate` aceito pela via do Google (porta 2), **quando** o popup
  completa e os tokens chegam, **então** `acceptLegalTerms()` é chamado **antes** de
  `navigate("/oratio/boas-vindas")`.
- [ ] **Dado** um usuário autenticado com `legalTermsAccepted: false` navegando para qualquer
  rota fora da lista de exceções, **quando** o `LegalTermsGate` reavalia, **então** redireciona
  para `/oratio/consentimento` com `replace: true`.
- [ ] **Dado** um usuário autenticado com `legalTermsAccepted: true`, **quando** o
  `LegalTermsGate` reavalia, **então** nenhum redirecionamento acontece.
- [ ] **Dado** a falha de rede do `GET /users/me` dentro do `LegalTermsGate`, **quando** o efeito
  roda, **então** não redireciona e libera o `checked` ref para tentar de novo na próxima
  navegação (nunca prende ninguém na porta do app).
- [ ] **Dado** `/oratio/consentimento` (porta 4), **quando** clica "Recusar", **então** o mesmo
  overlay passa a mostrar "Sair do app" e "Excluir minha conta" lado a lado, e **nenhuma** chamada
  de exclusão ou logout acontece só por ter clicado em "Recusar".
  - [ ] **quando**, a partir daí, clica "Sair do app", **então** a sessão é encerrada
    (`clearSession()`) e a navegação vai para `/login` — a conta continua existindo.
  - [ ] **quando**, a partir daí, clica "Excluir minha conta", **então** o `DeleteAccountModal`
    já existente abre, recebendo `hasPassword`/`hasGoogle`/`userEmail` do perfil já carregado.
- [ ] **Dado** um visitante deslogado, **quando** navega para `/termos-de-uso` ou
  `/politica-de-privacidade`, **então** a página correspondente abre normalmente, sem checkbox,
  sem exigir login.
- [ ] **Dado** um visitante deslogado, **quando** navega para qualquer outra rota do app,
  **então** o `LegalTermsGate` não faz nenhuma chamada (`isLoggedIn()` corta antes do
  `getProfile()`).

## Plano de testes

- **Unitário (Vitest + RTL):**
  - `LegalTermsGate.test.tsx` — espelha `WelcomeGate.test.tsx`: redireciona quando
    `legalTermsAccepted: false`; não redireciona quando `true`; reavalia por troca de rota (não
    só no boot); falha de rede não intercepta.
  - `LegalConsentGate.test.tsx` — o gate de habilitação do botão (nenhuma / uma / as duas caixas
    marcadas); a troca de view para cada documento e o "Voltar" preservando o estado das caixas;
    os dois modos: `pre-account` (aceitar chama `onAccept`, recusar chama `onDecline` sem
    saídas), `post-account` (aceitar chama `acceptLegalTerms()` + `onAccept`; recusar revela as
    duas saídas; "Sair do app" chama `clearSession`; "Excluir conta" abre o `DeleteAccountModal`
    mockado).
  - `Register.test.tsx` — acrescenta: submit intercalado pelo gate; formulário preservado ao
    recusar; overlay sobre o Google até aceitar; `acceptLegalTerms` chamado antes do navigate
    no fluxo Google.
  - `profileService.test.ts` / `authService.test.ts` — `acceptLegalTerms` faz `POST
    /users/me/legal-terms-accepted`; `register` inclui `legalTermsAccepted` no corpo.
- **E2E (Playwright):** não previsto — os fluxos são cobertos por RTL; nenhum comportamento aqui
  depende de browser real (sem PWA/offline/push envolvidos).
- **Manual:** verificação visual das telas (o texto real de `docs/legal/`, renderizado, layout)
  e o fluxo completo do botão do Google em navegador real (o `GoogleSignInButton` não roda em
  jsdom).

Loop de verificação por tarefa: `npx vitest run <arquivo>` → `npx vitest run` →
`npx tsc -b --noEmit` → `npx eslint <arquivos tocados>` → `npm run test:cov` → `npm run build` →
commit.

## Fora de escopo

- **Escrever ou revisar o texto jurídico.** Já está feito — `docs/legal/2026-09-11-*.md`, real e
  aprovado por Lucas. Esta spec só cobre a mecânica de exibir, marcar e gravar o aceite; qualquer
  revisão de redação futura do texto é edição de conteúdo, não deste mecanismo (mas **exige**
  bump de `LEGAL_TERMS_VERSION` — ver "Acoplamento").
- **Exportar dados pessoais** — feature separada, mesmo motivador de LGPD.
- **Bump de `APP_VERSION`/`CACHE_NAME`** (`/bump-version`) — processo, não critério de aceite.
- **`db push` de produção** — execução humana, registrado no par backend.
- **Corrigir `ARCHITECTURE.md`** — este repo ainda menciona `guestAllowedPrefixes` como se fosse
  uma lista real (`docs/ARCHITECTURE.md`, §3/§7/quirks) — não é: a única coisa que decide se uma
  rota é acessível a visitante é ela estar fora de `<ProtectedRoute>` (já corrigido no
  `RULES.md`). Dívida pequena, registrada no `docs/specs/INDEX.md` → "Dívidas conhecidas", não
  corrigida aqui porque só o `RULES.md` foi pedido explicitamente.
- **Link para `/termos-de-uso`/`/politica-de-privacidade` no rodapé/menu do app** (fora do fluxo
  de consentimento) — não foi pedido; se vier, é um `MenuDrawer` a mais, trivial de adicionar
  depois.
- **O protocolo de crise do Vox** (detectar ideação suicida/autolesão/sofrimento agudo e
  encaminhar CVV/SAMU) — os Termos de Uso **já publicados** (`docs/legal/2026-09-11-termos-de-
  uso.md` §4) prometem que o Vox encaminha quem precisa; hoje o `vox.prompt.ts` não tem essa
  instrução (zero ocorrências de suic/crise/CVV/188/profissional). **Não faz parte desta
  entrega** — é item próprio, registrado como **bloqueante da publicação dos Termos de Uso** no
  `oratio-api/docs/specs/INDEX.md` (ver spec `oratio-api/docs/specs/vox-protocolo-crise.md`).

## Notas de ambiente

- **Três rotas novas.** `/termos-de-uso` e `/politica-de-privacidade` ficam **fora** de
  `<ProtectedRoute>` — acessíveis a visitante por construção (não precisa de
  `guestAllowedPrefixes`: esse símbolo não existe no código; o mecanismo real é justamente "não
  estar dentro de `<ProtectedRoute>`" — ver correção do `RULES.md`). `/oratio/consentimento` fica
  **dentro** de `<ProtectedRoute>`.
- **Sem chave nova de `localStorage`.** O estado "já aceitou" não é local — vem inteiramente do
  `legalTermsAccepted` do `GET /users/me`, igual ao `showWelcome`. Nenhuma decisão de
  `KEEP_ON_LOGOUT` necessária.
- **Sem mudança de `APP_VERSION`/`CACHE_NAME`** — o chunk novo (`LegalConsent`, `TermsOfUse`,
  `PrivacyPolicy`) entra no precache do SW no próximo bump normal, não precisa de um bump
  dedicado a esta feature.
- **Acoplamento texto × versão entre repos** — ver seção "Acoplamento" acima. Mitigado por um
  teste dentro deste repo (`legalDocs.test.ts`, os dois arquivos com a mesma versão) + comentário
  nos componentes de conteúdo + item de checklist de release — não há teste automatizado
  **entre** repos, porque não há CI compartilhado entre `oratio` e `oratio-api`.
- **Bloqueio externo:** o Vox não pode prometer, nos Termos de Uso, um encaminhamento de crise
  que o `vox.prompt.ts` não faz hoje — ver "Fora de escopo" e `oratio-api/docs/specs/INDEX.md`.
- **`RULES.md` corrigido em sessão anterior** (não é código, é achado de pesquisa pedido
  explicitamente): a menção a `guestAllowedPrefixes` no §4 foi trocada pela descrição real do
  mecanismo (rota fora de `<ProtectedRoute>`), porque esse símbolo não existe em lugar nenhum do
  código — confirmado por busca em `src/`.

## Questões em aberto

Nenhuma.
