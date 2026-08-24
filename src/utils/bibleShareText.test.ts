import { describe, it, expect } from "vitest"
import { buildBibleChapterShareText } from "./bibleShareText"

describe("buildBibleChapterShareText", () => {

  it("builds the book/chapter heading, invite text and link, signed by the app", () => {
    const text = buildBibleChapterShareText("Gênesis", 3, "https://oratio-phi.vercel.app/x")

    expect(text).toBe(
      "Gênesis 3\n\nLeia comigo esse capítulo: https://oratio-phi.vercel.app/x\n\n— Enviado pelo app Oratio",
    )
  })

})
