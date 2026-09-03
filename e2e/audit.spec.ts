import path from "node:path"
import type { Page } from "@playwright/test"
import { test, expect, expectNoHorizontalScroll, smallTouchTargets } from "./fixtures"

/*
Passeia pelas telas principais em cada device (ver playwright.config.ts),
tira screenshot e roda checagens de responsividade. Screenshots vão pra
e2e/output/screens/<project>/... — é o que se olha depois.
*/

const SCREENS_DIR = path.join(process.cwd(), "e2e", "output", "screens")

function shotPath(name: string) {
  return path.join(SCREENS_DIR, test.info().project.name, `${name}.png`)
}

/*
Screenshot para revisão visual. NÃO usar animations:"disabled" — com o
CSS deste app (várias @keyframes com from{opacity:0}) o Playwright
congelava telas inteiras em branco. goToAndSettle já espera o suficiente
pras animações de entrada (0,28s) terminarem.
*/
async function snap(page: Page, name: string) {
  await page.screenshot({ path: shotPath(name), fullPage: true })
}

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

async function goToAndSettle(page: Page, route: string) {
  // "commit" e não "networkidle": o app fica de olho em várias coisas
  // (polling, chunk de ~5MB da Bíblia) e networkidle nunca assenta —
  // estourava o timeout do teste.
  await page.goto(route, { waitUntil: "commit" })

  // 1) <Splash/> — o boot do app faz chamadas à API (cold start do Render
  //    leva ~40s na 1ª).
  await page
    .locator('img[alt="Oratio Logo"]')
    .waitFor({ state: "detached", timeout: 45_000 })
    .catch(() => {})

  // 2) fallback do Suspense (.oratio-loading) enquanto o chunk lazy da
  //    rota baixa — é uma tela cheia da cor de fundo, saía "em branco".
  await page.locator(".oratio-loading").waitFor({ state: "detached", timeout: 30_000 }).catch(() => {})

  // 3) conteúdo real: o chunk lazy monta, mas aí a tela ainda faz o
  //    próprio fetch (skeleton). Espera o texto da página encorpar.
  await expect
    .poll(() => page.evaluate(() => document.body.innerText.trim().length), {
      timeout: 20_000,
      intervals: [250, 500, 1000],
    })
    .toBeGreaterThan(150)
    .catch(() => {})

  // 4) "Carregando..." interno some (backend Render lento no cold start)
  await page
    .getByText(/Carregando/i)
    .first()
    .waitFor({ state: "detached", timeout: 12_000 })
    .catch(() => {})

  // 5) rede assenta (bounded — não importa se estourar) + animação + fontes
  await page.waitForLoadState("networkidle", { timeout: 6_000 }).catch(() => {})
  await page.waitForTimeout(500)
  await page.evaluate(() => document.fonts.ready).catch(() => {})
}

for (const route of ROUTES) {
  test(`${route.name} — layout e responsividade`, async ({ page }, testInfo) => {
    await goToAndSettle(page, route.path)

    // 1. nunca rola de lado
    await expectNoHorizontalScroll(page, route.name)

    // 2. screenshot da tela inteira
    await snap(page, route.name)

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
  await goToAndSettle(page, "/oratio/home")
  // âncora sempre presente na Home, mesmo se a liturgia falhar ao carregar
  await page.getByRole("heading", { name: "Atalhos" }).waitFor({ timeout: 20_000 })

  const gaps = await page.evaluate(() => {
    const grids = [...document.querySelectorAll<HTMLElement>('[class*="shortcutsGrid"],[class*="liturgyButtons"]')]
    return grids.map((g) => {
      const kids = [...g.children] as HTMLElement[]
      const rects = kids.map((k) => k.getBoundingClientRect())
      const minW = Math.min(...rects.map((r) => r.width))
      return { cls: g.className.slice(0, 40), count: kids.length, minChildWidth: Math.round(minW) }
    })
  })
  expect(gaps.length, "nenhuma grade encontrada na Home").toBeGreaterThan(0)
  for (const g of gaps) {
    expect(g.minChildWidth, `${g.cls}: tile de ${g.minChildWidth}px é estreito demais`).toBeGreaterThan(64)
  }
})

test("vox — composer colado no rodapé, sem faixa morta grande", async ({ page }) => {
  await goToAndSettle(page, "/oratio/vox")
  // o textarea do composer é o âncora estável
  await page.getByLabel("Digite sua pergunta para o Vox").waitFor({ timeout: 20_000 })

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

test("navbar aparece em modo standalone e some com o teclado", async ({ page, standalone }) => {
  test.skip(!standalone, "só faz sentido no modo PWA fingido")
  await goToAndSettle(page, "/oratio/home")

  // sanidade: o override do matchMedia pegou?
  const isStandalone = await page.evaluate(
    () => window.matchMedia("(display-mode: standalone)").matches,
  )
  expect(isStandalone, "matchMedia override não aplicou").toBe(true)

  const nav = page.locator('nav[aria-label="Navegação inferior"]')
  await expect(nav).toBeVisible({ timeout: 15_000 })

  const pos = await nav.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { bottomGap: Math.round(window.innerHeight - r.bottom) }
  })
  expect(Math.abs(pos.bottomGap), "navbar deveria estar colada no rodapé").toBeLessThanOrEqual(1)
})

test.describe("fonte grande (escala 1.15)", () => {
  for (const route of ROUTES) {
    test(`${route.name} @ fonte grande`, async ({ page, setFontScale }) => {
      await setFontScale(1.15)
      await goToAndSettle(page, route.path)
      await expectNoHorizontalScroll(page, `${route.name} @ fonte grande`)

      // elementos que vazam pra baixo/pros lados do próprio container
      const clipped = await page.evaluate(() => {
        const bad: string[] = []
        for (const el of Array.from(document.querySelectorAll<HTMLElement>("main *, [class*='container'] *"))) {
          const s = getComputedStyle(el)
          if (s.overflow === "hidden" || s.overflowX === "hidden") continue
          if (el.scrollWidth - el.clientWidth > 2) {
            bad.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} (scrollW ${el.scrollWidth} > ${el.clientWidth})`)
          }
        }
        return bad.slice(0, 10)
      })
      if (clipped.length) {
        await test.info().attach(`${route.name}-fg-vazamento.json`, {
          body: JSON.stringify(clipped, null, 2),
          contentType: "application/json",
        })
      }

      await snap(page, `${route.name}-fonte-grande`)
    })
  }
})
