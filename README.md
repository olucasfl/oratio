<p align="center">
  <img src="./public/banner-oratio.png" alt="Oratio" width="100%" />
</p>

<h1 align="center">Oratio</h1>

<p align="center">
  <strong>Aplicativo de espiritualidade católica</strong> — liturgia diária, oração,
  consagração a Nossa Senhora, leitura da Bíblia e do Catecismo, e um assistente
  espiritual com inteligência artificial.
</p>

<p align="center">
  <a href="https://oratio-phi.vercel.app/"><strong>🌐 Abrir o aplicativo</strong></a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" />
  <img alt="Vitest" src="https://img.shields.io/badge/tests-676%20passing-6E9F18?logo=vitest&logoColor=white" />
  <img alt="PWA" src="https://img.shields.io/badge/PWA-offline--ready-5A0FC8?logo=pwa&logoColor=white" />
  <img alt="Deploy" src="https://img.shields.io/badge/deploy-Vercel-000000?logo=vercel&logoColor=white" />
</p>

---

## Índice

- [Sobre](#sobre)
- [Funcionalidades](#funcionalidades)
- [Stack tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Começando](#começando)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Testes e qualidade](#testes-e-qualidade)
- [PWA e uso offline](#pwa-e-uso-offline)
- [Deploy](#deploy)
- [Contribuindo](#contribuindo)
- [Status e roadmap](#status-e-roadmap)
- [Licença](#licença)
- [Autor](#autor)

---

## Sobre

**Oratio** é uma aplicação web (PWA) que reúne, num só lugar, os elementos centrais
da vida de oração católica, com uma interface simples, rápida e confortável de ler.

Este repositório contém o **frontend**. Ele consome uma API própria — o backend
**`oratio-api`** (NestJS), mantido em repositório separado. A comunicação é feita
por uma única instância `axios` (`src/services/api.ts`), com fluxo de autenticação
JWT (access token + refresh token) e retry automático em `401`.

O aplicativo funciona em três modos:

| Modo | O que vê |
|---|---|
| **Visitante** (sem conta) | Home, liturgia completa, orações, terço e Bíblia — somente leitura |
| **Autenticado** | Tudo acima + consagração, perfil, progresso espiritual, VoxAI, notificações |
| **Administrador** | Painel de métricas de uso e gestão de campanhas de notificação |

---

## Funcionalidades

### 🕊️ Liturgia diária
Primeira leitura, salmo responsorial, segunda leitura (quando há), evangelho e a
celebração/cor litúrgica do dia, atualizados automaticamente. Inclui o **Santo do
Dia** com biografia escrita à mão para cada data coberta.

### 🙏 Biblioteca de orações
As principais orações da tradição católica, com página individual por oração e
texto pronto para compartilhar.

### 📿 Terço
Todos os mistérios (Gozosos, Luminosos, Dolorosos, Gloriosos) e devoções do rosário,
com acompanhamento guiado conta a conta.

### 🌹 Consagração a Nossa Senhora
O método de **33 dias** de São Luís Maria Grignion de Montfort, com leitura diária,
acompanhamento de progresso, modelo de carta de consagração e página de finalização.

### ⚔️ Quaresma de São Miguel
A devoção dos 40 dias em preparação à festa de São Miguel Arcanjo, com meditação
diária e progresso.

### 📖 Bíblia Sagrada
Texto integral na tradução **Ave-Maria**, navegável por livro e capítulo, embarcado
no próprio aplicativo (funciona offline).

### 📕 Catecismo e documentos
Catecismo da Igreja Católica e o Tratado da Verdadeira Devoção, lidos no app via
visualizador de PDF.

### 🤖 VoxAI
Assistente espiritual com inteligência artificial para dúvidas sobre fé, moral,
liturgia e vida cristã.

### 👤 Perfil e progresso espiritual
Contagem de orações e terços, sequência de dias ativos (login streak) e preferências
(escala de fonte, notificações).

### 🔔 Notificações push
Lembretes automáticos no horário local do dispositivo, com o fuso sincronizado a cada
inicialização para não “desalinhar” quando o usuário viaja.

### 📊 Painel administrativo
Gráficos e mapa de calor de uso, filtros e gestão de campanhas e regras de
notificação (rotas `/oratio/admin`).

---

## Stack tecnológica

| Camada | Tecnologia |
|---|---|
| **Framework** | React 19 + Vite 7 |
| **Linguagem** | TypeScript (modo estrito) |
| **Roteamento** | `react-router-dom` v7 — todas as rotas declaradas em `src/App.tsx` |
| **Estilo** | CSS Modules (`*.module.css` por componente) + tokens em `src/styles/variables.css` — sem CSS-in-JS, sem Tailwind |
| **Estado** | Sem store global (Redux/Zustand). `localStorage` para persistência + estado local de componente + um `PullToRefreshContext` |
| **HTTP** | `axios` — uma instância compartilhada, um `*Service.ts` fino por domínio do backend |
| **Ícones** | `lucide-react` |
| **Conteúdo** | `react-markdown` + `remark-gfm`; `react-pdf` + `pdfjs-dist` (worker embarcado localmente) |
| **PWA** | Service Worker escrito à mão (`public/sw.js`) + `manifest.json` + cache do app-shell |
| **Testes** | Vitest + React Testing Library + `@vitest/coverage-v8` |
| **Lint** | ESLint 9 (flat config, `eslint.config.js`) |
| **Hospedagem** | Vercel (`vercel.json` — rewrite SPA + headers de segurança: CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) |

---

## Arquitetura

O guia técnico completo — sequência de boot, fluxo de auth/refresh, comportamento
PWA/offline, convenções e as “pegadinhas” não óbvias — está em
**[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)**. **Leia antes de mexer no código.**

Em resumo:

- **Boot (`src/App.tsx`)** executa, em ordem: invalidação de cache por versão
  (`APP_VERSION`), heartbeat de atividade + sincronização de fuso do push, e
  correção de URL antes do primeiro paint (evita “flash” de tela errada).
- **Auth (`src/services/api.ts`)** — um interceptor trata `401` com
  `refresh → retry`, enfileirando requisições concorrentes enquanto o refresh está
  em andamento. Rotas públicas de auth são puladas para não engolir erros de
  negócio (senha errada, link expirado).
- **Guardas de rota** — `ProtectedRoute` (checa presença do token) e `AdminRoute`
  (busca o perfil e checa `isAdmin`).
- **PWA (`public/sw.js`)** — SW manual, com precache de todos os chunks do build a
  partir de um `asset-manifest.json` gerado no build; navegação usa network-first
  com fallback offline para o app-shell.
- **Contrato com o backend** — qualquer mudança de rota, DTO ou header no
  `oratio-api` precisa de mudança correspondente no `*Service.ts` daqui.

---

## Começando

### Pré-requisitos

- **Node.js 20.19+** (LTS) e **npm**
- Uma instância do backend **`oratio-api`** acessível (local ou remota)

### Instalação

```bash
git clone https://github.com/olucasfl/oratio.git
cd oratio
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz (veja `.env_example`):

```bash
# Origem completa da API — usada como baseURL do axios e concatenada em alguns pontos
VITE_API_URL=https://sua-api.exemplo.com
```

> `VITE_API_URL` é a **única** variável de ambiente do frontend e precisa ser uma
> origem completa (com `https://`).

### Rodando

```bash
npm run dev       # servidor de desenvolvimento em http://localhost:5173
```

---

## Scripts disponíveis

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento Vite (porta 5173) |
| `npm run build` | `tsc -b && vite build` — checa tipos **antes** de empacotar; erro de tipo quebra o build |
| `npm run preview` | Serve o build de produção localmente |
| `npm test` | Vitest, execução única |
| `npm run test:watch` | Vitest em modo watch |
| `npm run test:cov` | Vitest + relatório de cobertura (text / html / json-summary) |
| `npm run lint` | ESLint sobre o projeto inteiro |

---

## Estrutura do projeto

```
src/
├── App.tsx, main.tsx      Boot, roteamento e registro do Service Worker
├── components/            UI compartilhada: modais, cards, navegação, widgets do admin,
│                          ProtectedRoute / AdminRoute / ErrorBoundary
├── pages/                 Uma pasta por rota (Name.tsx + Name.module.css)
├── services/              Um *Service.ts por domínio do backend, todos via services/api.ts
├── hooks/                 useLiturgy, useOffline, usePullToRefresh, useReadingSize, ...
├── contexts/              PullToRefreshContext — o único contexto compartilhado
├── data/                  Conteúdo estático embarcado no bundle: bibliaAveMaria.json,
│                          saintBios, saintsOfTheDay, frases-diarias.json, quaresma, consagração
├── utils/                 auth, authRedirect, fontScale, localCache, overlayCoordinator,
│                          pdfConfig, helpers de terço e de texto para compartilhar
└── styles/                global.css, variables.css (tokens: cores, sombras)

public/
├── sw.js, manifest.json   PWA
└── *.pdf                   Catecismo, tratado de consagração, modelo de carta
```

Cada página é dona do próprio estilo (`.tsx` + `.module.css`). Não há biblioteca de
componentes nem design system — a linguagem visual comum vive em
`src/styles/variables.css` como CSS custom properties (`--oratio-primary`, etc.).

---

## Testes e qualidade

Testes com **Vitest + React Testing Library**, ao lado do arquivo que testam
(`Foo.ts` + `Foo.test.ts`).

```bash
npm test           # 102 arquivos de teste · 676 testes
npm run test:cov   # cobertura com thresholds
```

- **Cobertura** medida com `coverage.all: true` — todo arquivo em `src/**/*.{ts,tsx}`
  entra no denominador, tenha teste ou não.
- **Thresholds** (`vitest.config.ts`): **80%** linhas/statements, **70%**
  funções/branches.
- **Excluídos** da cobertura: `src/data/**` (conteúdo estático, sem lógica) e
  `src/main.tsx` (boot puro).
- A limpeza do backlog de **lint** está em andamento — ver
  [`SPEC.md`](./SPEC.md) e `tasks/plan.md`.

O build (`npm run build`) roda `tsc -b` primeiro, então um erro de tipo já falha
antes do empacotamento.

---

## PWA e uso offline

- **Service Worker escrito à mão** (`public/sw.js`) — sem Workbox.
- No `install`, faz precache de **todos os chunks** do build (lidos de
  `asset-manifest.json`), não só os referenciados no `index.html`, para que uma rota
  nunca visitada abra offline sem erro.
- Navegação usa **network-first** com fallback para o app-shell em cache.
- Chamadas à API **não são cacheadas**.
- Duas strings de versão precisam ser incrementadas juntas numa mudança que afeta
  dados/assets em cache: `CACHE_NAME` (`sw.js`) e `APP_VERSION` (`App.tsx`) — ver
  `docs/ARCHITECTURE.md` §5.
- Instalável como app (`manifest.json`, `display: standalone`).

---

## Deploy

Hospedado na **Vercel**. `vercel.json` define:

- **Rewrite SPA** — todas as rotas caem em `index.html`.
- **Headers de segurança** — CSP, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`.

> Os headers do `vercel.json` **não** são aplicados pelo `vite preview`, só pela
> Vercel. Depois do deploy, confira o console do navegador por violações de CSP.

URL de produção: **https://oratio-phi.vercel.app/**

---

## Contribuindo

1. **Leia [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) primeiro** — ele explica
   as decisões não óbvias e onde estão os riscos.
2. Trabalhe a partir de `develop`; abra PR para `main`.
3. Antes de commitar: `npm test` (suíte completa) + `npm run build`.
4. Convenções:
   - **Nova página** → adicione a rota e o `lazy()` em `App.tsx`; decida
     `ProtectedRoute` / `AdminRoute`; adicione `<BottomNavbar/>` explicitamente
     (não há layout compartilhado).
   - **Nova chamada ao backend** → crie um `*Service.ts` (wrapper fino sobre a
     instância `api`), nunca `axios` avulso em componente.
   - **Nova chave em `localStorage`** → decida se sobrevive a logout
     (`KEEP_ON_LOGOUT` em `api.ts`) e a um bump de `APP_VERSION`.
   - Comentários explicam **o porquê**, não o quê.
   - Nunca renderize conteúdo externo com `dangerouslySetInnerHTML` — não há
     sanitizador no projeto.

---

## Status e roadmap

- ✅ Núcleo funcional em produção (liturgia, orações, terço, consagração, Bíblia,
  Catecismo, VoxAI, perfil, notificações, admin).
- 🚧 Cobertura de testes do frontend subindo em direção a 80% (`tasks/plan.md`).
- 🚧 Limpeza do backlog de lint (`SPEC.md`).
- 📿 Biografias do “Santo do Dia” com cobertura contínua até dezembro
  (`tasks/santos-plan.md`).

---

## Licença

Projeto pessoal. Nenhum arquivo de licença está publicado — todos os direitos
reservados ao autor. Entre em contato antes de reutilizar.

---

## Autor

Desenvolvido por **Lucas Farias Leandro**.

- GitHub: [@olucasfl](https://github.com/olucasfl)
- Repositório: [olucasfl/oratio](https://github.com/olucasfl/oratio)

---

<p align="center">
  <em>“Orai sem cessar.”</em> — 1 Ts 5,17
</p>
