import { test as base, expect, type Page } from "@playwright/test"

/*
Fixtures da auditoria visual.

- standalone: quando true, injeta um override de window.matchMedia ANTES
  do app carregar, fazendo isPWA() responder "sim" (display-mode:
  standalone). É como a BottomNavbar aparece fora de um PWA instalado
  de verdade. NÃO simula safe-area — só o modo.

- setFontScale: helper pra por a preferência de tamanho de fonte
  (utils/fontScale.ts) antes do primeiro paint e recarregar.
*/

/* Opções configuráveis por projeto no playwright.config.ts */
export type AuditOptions = {
  standalone: boolean
}

type AuditFixtures = AuditOptions & {
  setFontScale: (scale: number) => Promise<void>
}

export const test = base.extend<AuditFixtures>({
  standalone: [false, { option: true }],

  page: async ({ page, standalone }, use) => {
    if (standalone) {
      await page.addInitScript(() => {
        const real = window.matchMedia.bind(window)
        window.matchMedia = ((query: string) => {
          if (/display-mode:\s*standalone/.test(query)) {
            return {
              matches: true,
              media: query,
              onchange: null,
              addListener: () => {},
              removeListener: () => {},
              addEventListener: () => {},
              removeEventListener: () => {},
              dispatchEvent: () => false,
            } as unknown as MediaQueryList
          }
          return real(query)
        }) as typeof window.matchMedia
      })
    }
    await use(page)
  },

  setFontScale: async ({ page }, use) => {
    // só registra o initScript — chame ANTES de navegar pra tela.
    await use(async (scale: number) => {
      await page.addInitScript((s) => {
        try {
          localStorage.setItem("oratio_font_scale", String(s))
        } catch {
          /* ignore */
        }
      }, scale)
    })
  },
})

export { expect }

/*
Falha se a página rola horizontalmente (o body nunca deve rolar de lado).
Tolerância de 1px pra arredondamento de sub-pixel.
*/
export async function expectNoHorizontalScroll(page: Page, label: string) {
  const overflow = await page.evaluate(() => {
    const el = document.scrollingElement || document.documentElement
    return {
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      offenders: [...document.querySelectorAll<HTMLElement>("body *")]
        .filter((n) => n.getBoundingClientRect().right > el.clientWidth + 1)
        .slice(0, 8)
        .map((n) => ({
          tag: n.tagName.toLowerCase(),
          cls: typeof n.className === "string" ? n.className.slice(0, 60) : "",
          right: Math.round(n.getBoundingClientRect().right),
        })),
    }
  })
  expect(
    overflow.scrollWidth,
    `${label}: página rola horizontalmente (${overflow.scrollWidth}px > ${overflow.clientWidth}px). ` +
      `Suspeitos: ${JSON.stringify(overflow.offenders)}`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1)
}

/*
Coleta controles interativos com área de toque menor que `min`px.
Não falha o teste sozinho — o spec decide o que fazer com a lista.
*/
export async function smallTouchTargets(page: Page, min = 44) {
  return page.evaluate((minSize) => {
    const sel = 'a[href],button,[role="button"],input:not([type="hidden"]),select,textarea'
    return [...document.querySelectorAll<HTMLElement>(sel)]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && (r.width < minSize || r.height < minSize)
      })
      .slice(0, 20)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        label: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40),
        cls: typeof el.className === "string" ? el.className.slice(0, 50) : "",
        w: Math.round(el.getBoundingClientRect().width),
        h: Math.round(el.getBoundingClientRect().height),
      }))
  }, min)
}
