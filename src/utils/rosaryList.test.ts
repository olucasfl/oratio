import { describe, it, expect } from "vitest"
import { ROSARIES, getRosaryName } from "./rosaryList"

describe("getRosaryName", () => {

  it("returns the display name for a known slug", () => {
    expect(getRosaryName("gozosos")).toBe("Mistérios Gozosos")
  })

  it("falls back to the slug itself when it's not in the catalog", () => {
    expect(getRosaryName("nao-existe")).toBe("nao-existe")
  })

  it("resolves every catalog entry's own slug back to its own name", () => {
    for (const r of ROSARIES) {
      expect(getRosaryName(r.slug)).toBe(r.name)
    }
  })

})
