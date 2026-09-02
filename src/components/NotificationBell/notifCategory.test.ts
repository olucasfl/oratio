import { describe, it, expect } from "vitest"

import { resolveNotifCategory, hexAlpha } from "./notifCategory"

describe("resolveNotifCategory", () => {
  it("maps a known ruleKey to its category", () => {
    expect(resolveNotifCategory({ source: "RULE", ruleKey: "BIBLE_RESUME" }).label).toBe("Leitura")
    expect(resolveNotifCategory({ source: "RULE", ruleKey: "STREAK_AT_RISK" }).label).toBe("Sequência")
  })

  it("treats both rosary rules as the same category", () => {
    const a = resolveNotifCategory({ source: "RULE", ruleKey: "ROSARY_UNFINISHED" })
    const b = resolveNotifCategory({ source: "RULE", ruleKey: "ROSARY_LAPSE" })
    expect(a.label).toBe("Terço")
    expect(b.accent).toBe(a.accent)
  })

  it("falls back to 'Novidade' for a campaign with no ruleKey", () => {
    expect(resolveNotifCategory({ source: "CAMPAIGN", ruleKey: null }).label).toBe("Novidade")
  })

  it("falls back to 'Aviso' for an unknown rule", () => {
    expect(resolveNotifCategory({ source: "RULE", ruleKey: "SOMETHING_NEW" }).label).toBe("Aviso")
    expect(resolveNotifCategory({ source: "RULE" }).label).toBe("Aviso")
  })
})

describe("hexAlpha", () => {
  it("appends a two-digit alpha channel", () => {
    expect(hexAlpha("#4f46e5", 1)).toBe("#4f46e5ff")
    expect(hexAlpha("#4f46e5", 0)).toBe("#4f46e500")
    expect(hexAlpha("#4f46e5", 0.5)).toBe("#4f46e580")
  })

  it("clamps out-of-range alpha", () => {
    expect(hexAlpha("#000000", 2)).toBe("#000000ff")
    expect(hexAlpha("#000000", -1)).toBe("#00000000")
  })
})
