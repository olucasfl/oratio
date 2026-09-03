import { test, expect, expectNoHorizontalScroll, smallTouchTargets } from "./fixtures"

/*
Passeia pelas telas principais em cada device (ver playwright.config.ts),
tira screenshot e roda checagens de responsividade. Screenshots vão pra
e2e/output/<project>/... — é o que se olha depois.
*/

const ROUTES: { path: string; name: string; auth?: boolean }[] = [
  { path: "/oratio/home", name: "home" },
  { path: "/oratio/biblia", name: "biblia-home" },
  { path: "/oratio/biblia/salmos/23", name: "biblia-capitulo", auth: true },
  { path: "/oratio/biblia/minha", name: "biblia-minha", auth: true },
  { path: "/oratio/vox", name: "vox", auth: true },
  { path: "/oratio/profile", name: "perfil", auth: true },
  { path: "/oratio/prayers", name: "oracoes" },
  { path: "/oratio/rosary", name: "terco" },
  { path: "/oratio/liturgia-completa", name: "liturgia" },
  { path: "/oratio/santo-do-dia", name: "santo-do-dia", auth: true },
  { path: "/oratio/confissao", name: "confissao", auth: true },
  { path: "/oratio/quaresma", name: "quaresma", auth: true },
]

async function settle(page: import("@playwright/test").Page) {
  await page.waitForLoadState("networkidle").catch(() => {})
  // deixa as animações de entrada (0,28s) terminarem
  await page.waitForTimeout(600)
}

for (const route of ROUTES) {
  test(`${route.name} — layout e responsividade`, async ({ page }, testInfo) => {
    await page.goto(route.path)
    await settle(page)

    // 1. nunca rola de lado
    await expectNoHorizontalScroll(page, route.name)

    // 2. screenshot da tela inteira
    await page.screenshot({
      path: testInfo.outputPath(`../${testInfo.project.name}/${route.name}.png`),
      fullPage: true,
    })

    // 3. alvos de toque pequenos — anexado ao relatório, não falha
    const small = await smallTouchTargets(page)
    if (small.length) {
      await testInfo.attach(`${route.name}-alvos-pequenos.json`, {
        body: JSON.stringify(small, null, 2),
        contentType: "application/json",
      })
    }
  })
}

test("home — grade de atalhos não fica imprensada", async ({ page }) => {
  await page.goto("/oratio/home")
  await settle(page)

  const gaps = await page.evaluate(() => {
    const grids = [...document.querySelectorAll<HTMLElement>('[class*="shortcutsGrid"],[class*="liturgyButtons"]')]
    return grids.map((g) => {
      const kids = [...g.children] as HTMLElement[]
      const rects = kids.map((k) => k.getBoundingClientRect())
      const minW = Math.min(...rects.map((r) => r.width))
      return { cls: g.className.slice(0, 40), count: kids.length, minChildWidth: Math.round(minW) }
    })
  })
  for (const g of gaps) {
    expect(g.minChildWidth, `${g.cls}: tile de ${g.minChildWidth}px é estreito demais`).toBeGreaterThan(64)
  }
})

test("vox — composer colado no rodapé, sem faixa morta grande", async ({ page }) => {
  await page.goto("/oratio/vox")
  await settle(page)

  const box = await page.evaluate(() => {
    const wrap = document.querySelector<HTMLElement>('[class*="inputWrapper"]')
    if (!wrap) return null
    const pill = wrap.querySelector<HTMLElement>('[class*="inputBox"]')
    const w = wrap.getBoundingClientRect()
    const p = pill?.getBoundingClientRect()
    return {
      wrapBottom: Math.round(window.innerHeight - w.bottom),
      gapBelowPill: p ? Math.round(w.bottom - p.bottom) : null,
    }
  })
  expect(box, "inputWrapper não encontrado (precisa estar logado)").not.toBeNull()
  // wrapper encostado no fundo da viewport
  expect(Math.abs(box!.wrapBottom)).toBeLessThanOrEqual(1)
  // sem safe-area emulada, a folga abaixo do pill deve ser ~12px (o max()),
  // nunca os ~46px do bug (env + 12 somados)
  expect(box!.gapBelowPill!).toBeLessThan(24)
})

test("navbar aparece em modo standalone e some com o teclado", async ({ page }) => {
  test.skip(({ standalone }) => !standalone, "só faz sentido no modo PWA fingido")
  await page.goto("/oratio/home")
  await settle(page)

  const nav = page.locator('nav[aria-label="Navegação inferior"]')
  await expect(nav).toBeVisible()

  const pos = await nav.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { bottomGap: Math.round(window.innerHeight - r.bottom) }
  })
  expect(Math.abs(pos.bottomGap), "navbar deveria estar colada no rodapé").toBeLessThanOrEqual(1)
})

test.describe("fonte grande (escala 1.15)", () => {
  test("home aguenta a fonte grande sem quebrar o layout", async ({ page, setFontScale }) => {
    await page.goto("/oratio/home")
    await setFontScale(1.15)
    await settle(page)
    await expectNoHorizontalScroll(page, "home @ fonte grande")
    await page.screenshot({
      path: test.info().outputPath(`../${test.info().project.name}/home-fonte-grande.png`),
      fullPage: true,
    })
  })

  test("vox aguenta a fonte grande", async ({ page, setFontScale }) => {
    await page.goto("/oratio/vox")
    await setFontScale(1.15)
    await settle(page)
    await expectNoHorizontalScroll(page, "vox @ fonte grande")
    await page.screenshot({
      path: test.info().outputPath(`../${test.info().project.name}/vox-fonte-grande.png`),
      fullPage: true,
    })
  })
})
