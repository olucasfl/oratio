# Auditoria visual (Playwright)

Suíte **à parte** do `vitest`. O `vitest` (`npm test`) continua sendo o
teste de unidade. Aqui a gente sobe o app de verdade num Chromium e olha
o layout em vários tamanhos de tela — é a ferramenta da auditoria de
UX/responsividade.

## Rodar

```bash
npm run e2e          # tudo, headless
npm run e2e:audit    # só o spec de auditoria (screenshots)
npm run e2e:ui       # modo interativo, dá pra ver cada passo
npm run e2e:report   # abre o último relatório HTML
```

O Playwright sobe o `npm run dev` sozinho na porta 5199. A API usada é a
de `.env.local` (produção Render por padrão).

## O que sai

- **Screenshots**: `e2e/output/<device>/<tela>.png` — full page, um por
  tela por device. É o que se olha.
- **Relatório HTML**: `e2e/output/report/` — com os anexos (listas de
  alvos de toque pequenos, traces em caso de falha).
- Tudo em `e2e/output/` é git-ignored.

## Devices (`playwright.config.ts`)

| projeto | viewport | o que cobre |
|---|---|---|
| `iphone-se` | 375×667 | piso iOS |
| `iphone-14` | 390×844 | iPhone moderno com notch |
| `android-360` | 360×740 | piso Android |
| `pixel-7` | 412×915 | Android moderno |
| `ipad` | 768×1024 | tablet |
| `desktop` | 1280×900 | desktop |

Os projetos de celular rodam com `standalone: true` — um override de
`window.matchMedia` que faz `isPWA()` responder "sim", pra a
`BottomNavbar` aparecer. **Não** simula `env(safe-area-inset-*)`.

## Limites (precisa de device real)

- `env(safe-area-inset-*)` do iPhone (o gap do composer do Vox)
- congelamento de viewport depois do `navigator.share()`
- teclado nativo do iOS

## Conta de teste

`e2e/auth.setup.ts` loga uma vez via API e salva a sessão em
`e2e/.auth/user.json` (git-ignored). Sobrescreva com `E2E_EMAIL` /
`E2E_PASSWORD` se precisar de outra conta.
