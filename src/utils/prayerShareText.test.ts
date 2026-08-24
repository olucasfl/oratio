import { describe, it, expect } from "vitest"
import { buildPrayerShareText } from "./prayerShareText"

describe("buildPrayerShareText", () => {

  it("builds the title, invite text and link, signed by the app", () => {
    const text = buildPrayerShareText("Pai Nosso", "https://oratio-phi.vercel.app/x")

    expect(text).toBe(
      "Pai Nosso\n\nReze comigo essa oração: https://oratio-phi.vercel.app/x\n\n— Enviado pelo app Oratio",
    )
  })

})
