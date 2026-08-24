import { describe, it, expect } from "vitest"
import { buildRosaryShareText } from "./rosaryShareText"

describe("buildRosaryShareText", () => {

  it("builds the title, invite text and link, signed by the app", () => {
    const text = buildRosaryShareText("Mistérios Gozosos", "https://oratio-phi.vercel.app/x")

    expect(text).toBe(
      "Mistérios Gozosos\n\nReze esse terço comigo: https://oratio-phi.vercel.app/x\n\n— Enviado pelo app Oratio",
    )
  })

})
