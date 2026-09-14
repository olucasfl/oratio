# Admin: método de entrada — ponteiro

> Status: **implementado, na `develop`** (2026-09-10) — só leitura, sem schema, sem `db push`.
> Falta o teste manual no painel real (contas dos três tipos) e a promoção pra `main`.

A **spec mestra** vive no backend: `oratio-api/docs/specs/admin-provedor.md`
(objetivo, os três estados, contrato dos endpoints, as três cláusulas `where`,
critérios de aceite).

## O que este repo construiu

- **`adminService.ts`** — `AdminFilters` ganha `provider?: "oratio" | "google" | "both"`;
  `AdminUser` ganha `hasPassword: boolean` e `authProviders: string[]` (o hash nunca
  vem — o backend mapeia e descarta); `getAllUsers` serializa `provider` na query
  string só quando definido.
- **`AdminFilterSheet`** — novo grupo de chips **"Entrada"**: Todos / Só Oratio /
  Só Google / Ambos, no mesmo padrão de "Cargo" e "Verificação".
- **`AdminPanel`** — estado `filterProvider` mapeado para `filters.provider`
  (`"all"` → `undefined`), no mesmo desenho de `filterRole`/`filterVerif`: conta no
  `activeFilterCount`, aparece no `filterSummary` ("Só Oratio" / "Só Google" /
  "Ambos") e zera em `clearAllFilters`.
- **Ícones de linha** (`renderCard` / `renderCompactRow`) e no badge do modal de
  detalhe ("Entrada: …"): `Mail` = e-mail+senha, `Chrome` = Google, os dois quando
  a conta tem ambos, e `AlertTriangle` (`title="Sem método de entrada"`) para a
  anomalia — conta sem nenhum método, que não deveria existir.
  - **Desvio do "glifo do Google":** `lucide-react` não tem um. `Chrome` é o mais
    próximo e o `title="Entra com o Google"` desfaz a ambiguidade — em vez de
    adicionar um SVG novo (o painel é 100% lucide). Trocável num ponto só
    (`ProviderIcons` em `AdminPanel.tsx`).

## Testes

- `adminService.test.ts` — `provider` entra na query string só quando setado.
- `AdminFilterSheet.test.tsx` — o grupo "Entrada" e o `setFilterProvider("google")`.
- `AdminPanel.test.tsx` — os dois ícones num usuário "ambos"; o `AlertTriangle` na
  anomalia; `filterProvider` chega ao `getAllUsers` como `provider: "google"` e some
  no "Limpar filtros".

Sem `db push`, sem rota nova, sem dependência nova.
