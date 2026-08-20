import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { formatVerses } from "./LiturgiaFull"

/*
formatVerses recebe texto da API pública de liturgia (terceiro, fora do
nosso controle) e antes injetava o resultado via dangerouslySetInnerHTML
sem escapar nada — qualquer HTML/script retornado pela API rodava no
navegador de quem abrisse a liturgia do dia. Esses testes travam a
correção: o texto tem que sempre virar conteúdo de texto do React, nunca
marcação interpretada pelo navegador.
*/
describe("formatVerses", () => {

  it("never lets markup in the source text become a real DOM element", () => {

    const malicious = '<img src=x onerror="window.__pwned = true">'

    const { container } = render(<div>{formatVerses(malicious)}</div>)

    expect(container.querySelector("img")).toBeNull()
    expect(container.textContent).toContain(malicious)

  })

  it("never lets a <script> tag in the source text execute", () => {

    const malicious = '<script>window.__pwned = true</script>'

    const { container } = render(<div>{formatVerses(malicious)}</div>)

    expect(container.querySelector("script")).toBeNull()
    expect((window as any).__pwned).toBeUndefined()

  })

  it("still wraps a verse number immediately followed by a letter in a .verse span", () => {

    const { container } = render(<div>{formatVerses("1Em o princípio")}</div>)

    const verse = container.querySelector(".verse")

    expect(verse).not.toBeNull()
    expect(verse?.textContent).toBe("1")
    expect(container.textContent).toBe("1Em o princípio")

  })

  it("wraps the first letter in a .capitular span when the text doesn't start with a verse number", () => {

    const { container } = render(<div>{formatVerses("Em o princípio")}</div>)

    const capitular = container.querySelector(".capitular")

    expect(capitular).not.toBeNull()
    expect(capitular?.textContent).toBe("E")
    expect(container.textContent).toBe("Em o princípio")

  })

  it("returns an empty result for empty input without throwing", () => {

    expect(() => render(<div>{formatVerses("")}</div>)).not.toThrow()

  })

})
