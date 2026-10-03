import { describe, expect, it } from "vitest"
import { jarSegments } from "./jarSegments"

describe("jarSegments", () => {
  it("pote vazio: sem segmentos e 100 livres", () => {
    const { segments, state } = jarSegments([])
    expect(segments).toEqual([])
    expect(state.free).toBe(100)
  })

  it("cada pedra soma 20 à pilha", () => {
    const { segments } = jarSegments(["oracao", "missa"])
    expect(segments.map((s) => s.height)).toEqual([20, 20])
  })

  it("item que cabe inteiro nos vãos não cresce a pilha; o que cabe só em parte cresce só o excedente", () => {
    // pedra: 8 de vão. Areia(2) e cascalho(5) cabem inteiros nos vãos (sobra 1); o 2º cascalho usa 1 do vão + 4 do livre.
    const { segments, inGaps, state } = jarSegments(["oracao", "reels", "amigos", "role"])
    expect(segments.map((s) => s.height)).toEqual([20, 4])
    expect(inGaps).toBe(2) // reels e amigos couberam inteiros nos vãos
    expect(state.gaps).toBe(0)
    expect(state.free).toBe(100 - 20 - 4)
  })

  it("marca como negativo o item de Vida < 0 (o ⚠️ só aparece depois de colocado)", () => {
    const { segments } = jarSegments(["madrugada"])
    expect(segments[0].negative).toBe(true)
    expect(jarSegments(["reels"]).segments[0].negative).toBe(false)
  })
})
