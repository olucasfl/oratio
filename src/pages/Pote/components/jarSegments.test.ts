import { describe, expect, it } from "vitest"
import { jarSegments } from "./jarSegments"

describe("jarSegments", () => {
  it("pote vazio: sem segmentos e 100 livres", () => {
    const { segments, state } = jarSegments([])
    expect(segments).toEqual([])
    expect(state.free).toBe(100)
  })

  it("cada pedra soma 14 à pilha", () => {
    const { segments } = jarSegments(["oracao", "missa"])
    expect(segments.map((s) => s.height)).toEqual([14, 14])
  })

  it("item que cabe inteiro nos vãos não cresce a pilha; o que cabe só em parte cresce só o excedente", () => {
    // pedra: 6 de vão. Areia(2) cabe inteira no vão; cascalho(5) usa os 4 que sobram + 1 do livre.
    const { segments, inGaps, state } = jarSegments(["oracao", "reels", "amigos"])
    expect(segments.map((s) => s.height)).toEqual([14, 1])
    expect(inGaps).toBe(1) // só a areia coube inteira nos vãos
    expect(state.gaps).toBe(0)
    expect(state.free).toBe(100 - 14 - 1)
  })

  it("marca como negativo o item de Vida < 0 (o ⚠️ só aparece depois de colocado)", () => {
    const { segments } = jarSegments(["madrugada"])
    expect(segments[0].negative).toBe(true)
    expect(jarSegments(["reels"]).segments[0].negative).toBe(false)
  })
})
