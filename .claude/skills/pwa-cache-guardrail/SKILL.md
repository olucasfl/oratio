---
name: pwa-cache-guardrail
description: Procedimento para mexer em cache, versão e persistência do PWA — APP_VERSION, CACHE_NAME, KEEP_ON_LOGOUT, precache do service worker. Use ao bumpar versão, adicionar chave no localStorage, adicionar rota, ou quando uma correção "não aparece" no navegador.
---

# Guardrail de cache e versão do PWA

Existem **quatro** mecanismos independentes de persistência neste app, todos manuais, todos com
regra de inclusão diferente. Nenhum deles avisa quando você erra: o sintoma aparece semanas
depois, no aparelho de um usuário.

| Mecanismo | Onde | Governa | Regra de inclusão |
|---|---|---|---|
| `APP_VERSION` (`"v10"`) | `src/App.tsx:79` | limpeza do `localStorage` no boot | **substring**: apaga chave que contenha `oratio`, `stage_` ou `consecration` |
| `CACHE_NAME` (`"oratio-cache-v22"`) | `public/sw.js:1` | cache de assets do service worker | prefixo: caches `oratio-cache-*` antigos são apagados no `activate` |
| `KEEP_ON_LOGOUT` | `src/services/api.ts:83` | o que sobrevive ao logout | **allowlist explícita** (`Set`) |
| exceção do nudge | `src/App.tsx` | flags de "já vi isso" | `key.startsWith("oratio_quaresma_nudge_")` escapa da limpeza |

**Os dois números não são a mesma coisa e não sobem juntos automaticamente.** `v10` e `v22` já
divergiram porque governam ciclos diferentes.

## Antes de bumpar: qual dos dois?

- Mudou **asset** (JS, CSS, imagem, `index.html`)? → `CACHE_NAME`.
- Mudou o **formato de algo guardado no `localStorage`**, ou é preciso forçar limpeza? →
  `APP_VERSION`.
- Release normal com mudança de código? → **os dois**.

E antes de subir `APP_VERSION`, liste o que **vai ser apagado**. A limpeza é por *substring*, não
por lista: uma chave chamada `minhas_oracoes` some (contém `oracoes`… não; mas `oratio_x` sim),
enquanto `bibliaLeituraPrefs` sobrevive só por não conter nenhum dos três padrões. Isso é
frágil por construção — confira caso a caso, não por analogia.

Use `/bump-version`; ele executa este checklist.

## Ao adicionar chave nova no `localStorage`

Duas decisões **explícitas**, escritas na tarefa ou no PR:

1. **Sobrevive ao logout?** Se sim, entra no `KEEP_ON_LOGOUT` de `api.ts`. É allowlist: quem não
   está lá é apagado.
2. **Sobrevive ao bump de `APP_VERSION`?** Se a chave contém `oratio`, `stage_` ou
   `consecration`, ela **será apagada** no próximo bump. Se ela é uma flag permanente do tipo
   "já vi isso uma vez", precisa de uma exceção `startsWith` como a do
   `oratio_quaresma_nudge_` — senão o aviso reaparece a cada versão para quem já o fechou.

Os dois são **opt-out por pattern-matching**, não opt-in. Uma chave pode ser varrida sem
ninguém ter decidido isso — que é exatamente o bug que esta skill previne.

## Ao adicionar rota nova

- Registrar em `App.tsx` e importar com `lazy()`.
- Decidir `<ProtectedRoute>` / `<AdminRoute>`.
- **Preload só se for destino provável logo após o boot.** Precarregar tudo anula o lazy loading.
  Note que as páginas da Bíblia ficam **fora** do preload de propósito: puxam o texto bíblico
  inteiro (~5 MB).
- Se for acessível a visitante, os **três** lugares precisam concordar — ver `RULES.md` §4.

## "Corrigi e não mudou nada"

Antes de investigar o código, elimine o cache. Nesta ordem:

1. **Aba anônima.** Resolve a maioria dos casos e leva cinco segundos.
2. DevTools → Application → Service Workers → *Unregister*, e Storage → *Clear site data*.
3. Só então suspeite do código.

Esse sintoma é a causa mais comum de tempo perdido neste repo, e não tem nada a ver com o bug
que você está investigando.

## Duas armadilhas registradas no `ARCHITECTURE.md` §5/§7

- O service worker **hardcoda `"render.com"`** para identificar tráfego de API, em vez de ler
  `VITE_API_URL`. Se o host do backend mudar, o comportamento offline quebra silenciosamente e
  ninguém é avisado.
- Não existe layout compartilhado. Esquecer `<BottomNavbar/>` numa página nova é omissão
  silenciosa — nem o router nem um guard pegam.

## Verificação obrigatória

`npm run build`, e depois **teste em aba anônima**. A janela normal pode continuar servindo o
service worker antigo e esconder exatamente o efeito que você quer confirmar.
