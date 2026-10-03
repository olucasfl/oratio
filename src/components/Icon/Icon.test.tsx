/// <reference types="node" />
import { readFileSync, readdirSync, statSync } from "node:fs"
import { resolve, join } from "node:path"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import Icon from "./Icon"
import { ALL_ICON_NAMES, UI_ICONS } from "./iconNames"

const root = process.cwd()

function iconNamesInIndexHtml(): string[] {
  const html = readFileSync(resolve(root, "index.html"), "utf8")
  const match = html.match(/Material\+Symbols\+Rounded[^"]*?icon_names=([a-z0-9_,]+)/)
  if (!match) throw new Error("index.html não carrega o Material Symbols com icon_names")
  return match[1].split(",")
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

describe("Icon", () => {
  it("renderiza o nome do ícone como ligadura, decorativo por padrão", () => {
    const { container } = render(<Icon name="favorite" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.textContent).toBe("favorite")
    expect(el).toHaveAttribute("aria-hidden", "true")
  })

  it("com label vira imagem acessível", () => {
    render(<Icon name="warning" label="Atenção" />)
    expect(screen.getByRole("img", { name: "Atenção" })).toBeInTheDocument()
  })

  it("filled e size chegam ao elemento", () => {
    const { container } = render(<Icon name="bolt" filled size={40} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.fontSize).toBe("40px")
    expect(el.className).toMatch(/filled/)
  })
})

describe("ícones do Google no index.html", () => {
  it("a URL do index.html carrega exatamente os ícones que o app usa, em ordem alfabética", () => {
    expect(iconNamesInIndexHtml()).toEqual(ALL_ICON_NAMES)
  })

  it("todo <Icon name=\"...\"> literal do app está na lista", () => {
    const known = new Set<string>(ALL_ICON_NAMES)
    const files = walk(resolve(root, "src")).filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx"))
    const missing: string[] = []
    for (const file of files) {
      const src = readFileSync(file, "utf8")
      for (const m of src.matchAll(/<Icon\s+name="([a-z0-9_]+)"/g)) {
        if (!known.has(m[1])) missing.push(`${file}: ${m[1]}`)
      }
    }
    expect(missing).toEqual([])
  })

  it("a lista de UI não tem duplicata nem emoji", () => {
    expect(new Set(UI_ICONS).size).toBe(UI_ICONS.length)
    for (const name of ALL_ICON_NAMES) expect(name).toMatch(/^[a-z0-9_]+$/)
  })
})
