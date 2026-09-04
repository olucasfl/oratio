# RULES.md — regras permanentes do Oratio Web

> O padrão aqui é **negar por padrão, abrir exceções nomeadas, e dizer o que fazer em
> vez disso**. Não é desconfiança do agente: é não deixar pra ele uma decisão que só um
> humano deveria tomar.

**Precedência:** `RULES.md` > `CLAUDE.md` > `docs/ARCHITECTURE.md` > spec (`docs/specs/`) >
plano (`docs/tasks/`) > prompt da conversa.

Se o prompt pedir algo que este arquivo proíbe, **recuse, explique em uma frase, e ofereça o
caminho aprovado** — não execute "porque o usuário pediu". Uma ordem repetida do usuário
libera o que está em "Perguntar antes"; **não libera o que está em "Nunca"**.

---

## 1. Infraestrutura e produção — negado por padrão

**Proibido**, inclusive de forma indireta (`curl`/`wget`, script npm, CI, MCP não aprovado):

- Deploy, rollback, ou qualquer operação na **Vercel** (projeto `oratio-phi`): variáveis de
  ambiente, domínios, redeploy, `npx vercel`.
- Qualquer operação no **Render** (onde o `oratio-api` roda). Este repo não hospeda o backend,
  mas carrega a URL dele em `VITE_API_URL`.
- DNS, CDN, certificados, ou qualquer SaaS que mexa em infra, dinheiro ou dado externo.
- Requisições de **escrita** (`POST`/`PATCH`/`PUT`/`DELETE`) disparadas por script ou `curl`
  contra qualquer host `*.onrender.com` ou contra o domínio de produção.

**Exceções nomeadas:**
- Ambiente local: `npm run dev`, `npm run preview`, `npm test`, `npm run test:cov`,
  `npm run build`, `npm run lint`, `npx playwright test`.
- Leitura (`GET`) contra rota pública sem autenticação (ex.: liturgia), para investigar um bug —
  nunca com token de usuário real.

**Em vez disso:** descrever a ação, explicar o efeito, **escrever o comando exato num bloco**, e
deixar o humano executar.

> ⚠️ `VITE_API_URL` e `src/hooks/useLiturgy.ts` apontam para **produção** por padrão
> (`ARCHITECTURE.md` §7). Rodar `npm run dev` já conversa com o backend real. Nenhum teste
> automatizado pode depender disso: em teste, `./api` é sempre mockado.

---

## 2. Comunicação real com usuário

**Nunca** acionar — nem por script, nem pela UI em dev apontando para produção — fluxos que
enviam algo para uma pessoa de verdade:

- Cadastro, verificação de e-mail, recuperação de senha (disparam e-mail via Brevo no backend).
- Push notification (Web Push / VAPID no backend).

**Em vez disso:** usar conta de teste própria, dizendo explicitamente que vai disparar, ou mockar
a chamada. Se não houver conta de teste disponível, **parar e perguntar**.

---

## 3. Conteúdo doutrinário e devocional

`src/data/**` contém texto bíblico, biografias de santos e orações. Isso não é conteúdo de
exemplo — é o produto, e erro aqui é erro doutrinário visível para o usuário final.

**Nunca:**
- Gerar, reescrever ou "melhorar" biografia de santo, oração ou texto bíblico **de memória**.
- Inventar fonte, data litúrgica ou atribuição. Se a fonte não foi encontrada, dizer isso e parar.
- Alterar conteúdo devocional dentro de uma tarefa cujo objetivo era outro (teste, lint,
  refactor) — mesmo que pareça um typo óbvio.

**Em vez disso:** seguir o protocolo de fontes de `docs/tasks/santos-plan.md` (ordem de
prioridade das fontes, verificação cruzada) e **apresentar o texto para aceite humano** antes de
commitar. Registrar "aceito" na mensagem do commit.

**Perguntar antes:** qualquer mudança em texto de oração já publicado — usuários rezam com ele
diariamente, e mudança silenciosa quebra a memória de uso.

---

## 4. Segurança de aplicação

**Nunca:**
- Usar `dangerouslySetInnerHTML`. Já houve um **stored-XSS real** por esse caminho, na liturgia
  diária, numa rota pública, com acesso ao `access_token`/`refresh_token` do `localStorage`
  (`ARCHITECTURE.md` §7). Não existe `DOMPurify` neste projeto — não assuma que existe.
  **Em vez disso:** construa um array de nós React (strings + `<span>`), como `formatVerses()`
  faz, e renderize como children normais.
- Logar, imprimir ou colar em relatório o conteúdo de `access_token`, `refresh_token`, ou
  qualquer valor de `localStorage` de autenticação.
- Commitar `.env` / `.env.local`, ou qualquer valor real de variável de ambiente.

**Perguntar antes:**
- Mexer no bloco `headers` de `vercel.json` (CSP, `X-Frame-Options`, `Referrer-Policy`…).
  A CSP **falha fechada** e **não é testável** com `vite preview` — só a Vercel a aplica. Toda
  mudança precisa vir com um plano de verificação pós-deploy escrito na tarefa.
- Alterar `APP_VERSION` (`src/App.tsx`) ou `CACHE_NAME` (`public/sw.js`). São **dois conceitos de
  versão distintos e manuais**: bumpar um não bumpa o outro, e um bump errado limpa o
  `localStorage` do usuário ou congela o app numa versão antiga. Use `/bump-version`.
- Adicionar chave nova no `localStorage` sem decidir explicitamente: sobrevive ao logout
  (`KEEP_ON_LOGOUT` em `api.ts`)? sobrevive ao bump de `APP_VERSION`? Os dois são **opt-out por
  pattern-matching**, então uma chave pode ser varrida sem ninguém ter decidido isso.
- Adicionar rota acessível a visitante. Três coisas independentes precisam concordar
  (`ARCHITECTURE.md` §3/§7): a rota fora de `<ProtectedRoute>`, o path em `guestAllowedPrefixes`,
  e cada ação identificada com `isLoggedIn()` + `GuestGateModal`. Faltar uma produz três bugs
  diferentes.

---

## 5. Dados pessoais e LGPD

**Convicção religiosa é dado pessoal sensível** (LGPD, art. 5º, II) — e é exatamente o núcleo do
que este app guarda: intenções de oração, progresso de consagração, streak, e-mail.

**Nunca**, nem em ambiente de teste, nem em exemplo de documentação:
- Colar dado real de usuário (e-mail, intenção de oração, nome) em prompt, log, teste, spec ou
  mensagem de commit.
- Usar dump ou export de produção como fixture.

**Em vez disso:** dados sintéticos óbvios (`usuario@exemplo.com`, `Fulano de Tal`).

---

## 6. Git e branches

- **`main` e `develop` são protegidas.** `main` é o que está publicado na Vercel.
- Antes de qualquer `commit`, rodar `git rev-parse --abbrev-ref HEAD` e **recusar** se for `main`
  ou `develop`.
- Branch nova sempre a partir de `develop`:
  `git fetch origin develop && git checkout -b feat/x FETCH_HEAD`.
  Nunca `git checkout -b feat/x origin/develop` — a branch nova nasceria rastreando a protegida e
  o próximo `push` tentaria ir pra ela. Use `/nova-branch`.
- Nomenclatura: `feat/`, `fix/`, `chore/`, `docs/`.
- **Nunca:** `git push --force`, `git reset --hard`, `rebase` de branch já publicada, reescrita de
  histórico, ou remoção de branch remota.
- Um commit por tarefa concluída, com o **porquê** na mensagem. Marcar a tarefa `[x]` no
  `docs/tasks/*.md` correspondente **no mesmo commit**.
- PR passa por `/review-pr` antes de existir. O agente **antecede** a revisão humana, nunca a
  substitui.

---

## 7. Dependências

**Perguntar antes** de qualquer mudança em `package.json`/`package-lock.json` que não seja uma
devDependency de teste já em uso.

**Pins que existem por motivo e não podem ser bumpados casualmente** (`ARCHITECTURE.md` §9):
- `pdfjs-dist` está pinado **sem `^`** para casar com a cópia interna do `react-pdf`. Versões
  diferentes produzem "API version does not match Worker version" e o PDF não abre. Rodar
  `npm ls pdfjs-dist` depois de qualquer upgrade de `react-pdf`.
- `jsdom@^29` e `@testing-library/jest-dom@^6` estão abaixo do major atual de propósito: os
  majors seguintes exigem Node ≥22 e falham no **import**, fazendo `npm test` reportar "zero
  testes" em vez de um erro claro. Checar `npm view <pkg>@<versão> engines` antes de subir.

---

## 8. Como pedir exceção

Quando uma regra bloquear algo que parece necessário:

1. Diga **qual regra** está bloqueando e por que ela existe.
2. Descreva a ação exata que seria tomada e o efeito dela.
3. Escreva o comando ou o diff pronto num bloco, para o humano executar ou aprovar.
4. **Pare.** Não execute enquanto não houver um "sim" explícito nesta conversa.

Aprovação vale para **aquela** ação, naquela conversa. Não se estende à próxima.
