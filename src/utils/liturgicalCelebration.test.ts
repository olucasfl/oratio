import { describe, it, expect } from "vitest"
import {
  parseCelebration,
  getLiturgicalColor,
  normalizeCelebrationName,
  getEasterSunday,
  getFerialColor,
} from "./liturgicalCelebration"

describe("parseCelebration", () => {

  it("returns null for empty/missing input", () => {
    expect(parseCelebration(undefined)).toBeNull()
    expect(parseCelebration(null)).toBeNull()
    expect(parseCelebration("")).toBeNull()
  })

  it("splits a simple 'Nome, Grau' into its parts", () => {
    expect(parseCelebration("São José, Solenidade")).toEqual({
      nome: "São José",
      grau: "Solenidade",
    })
  })

  it("joins every comma-part before the grau back into the name", () => {
    expect(parseCelebration("São João Câncio, presbítero, Memória")).toEqual({
      nome: "São João Câncio, presbítero",
      grau: "Memória",
    })
  })

  it("matches the grau case-insensitively, returning the catalog's canonical casing", () => {
    expect(parseCelebration("Natal do Senhor, solenidade")).toEqual({
      nome: "Natal do Senhor",
      grau: "Solenidade",
    })
  })

  it("returns null when the last comma-part isn't a recognized grau", () => {
    expect(parseCelebration("Terça-feira da 2ª Semana do Tempo Comum")).toBeNull()
  })

  it("returns null when the grau is recognized but there's no name before it", () => {
    expect(parseCelebration("Solenidade")).toBeNull()
  })

})

describe("getLiturgicalColor", () => {

  it("resolves a known color to its hex pair", () => {
    expect(getLiturgicalColor("vermelho")).toEqual({ hex: "#9a2846", hexSoft: "#fbe9ee" })
  })

  it("is case- and whitespace-insensitive", () => {
    expect(getLiturgicalColor("  ROXO  ")).toEqual({ hex: "#6a4c93", hexSoft: "#f0ebf6" })
  })

  it("falls back to verde for an unknown or missing color", () => {
    const verde = { hex: "#3f7d5c", hexSoft: "#e9f3ee" }
    expect(getLiturgicalColor("laranja")).toEqual(verde)
    expect(getLiturgicalColor(undefined)).toEqual(verde)
    expect(getLiturgicalColor(null)).toEqual(verde)
  })

})

describe("normalizeCelebrationName", () => {

  it("strips accents, lowercases, and collapses punctuation/whitespace", () => {
    expect(normalizeCelebrationName("São José, Esposo de Maria!")).toBe("sao jose esposo de maria")
  })

})

describe("getEasterSunday", () => {

  it("matches the known Easter date for 2024 and 2025", () => {
    // datas de domingo de Páscoa publicamente conhecidas
    const e2024 = getEasterSunday(2024)
    expect([e2024.getMonth() + 1, e2024.getDate()]).toEqual([3, 31])

    const e2025 = getEasterSunday(2025)
    expect([e2025.getMonth() + 1, e2025.getDate()]).toEqual([4, 20])
  })

})

describe("getFerialColor", () => {

  // Páscoa de 2025 = 20 de abril
  it("is roxo during Lent (before Easter, after Ash Wednesday)", () => {
    // Quarta-feira de Cinzas 2025 = 5 de março; um dia bem dentro da Quaresma:
    expect(getFerialColor(new Date(2025, 2, 20))).toBe("roxo")
  })

  it("is branco during the Easter season (Easter through Pentecost)", () => {
    expect(getFerialColor(new Date(2025, 3, 21))).toBe("branco") // logo depois da Páscoa
  })

  it("is verde in Ordinary Time, well outside any special season", () => {
    expect(getFerialColor(new Date(2025, 7, 15))).toBe("verde") // meados de agosto
  })

  it("is roxo during Advent", () => {
    expect(getFerialColor(new Date(2025, 11, 10))).toBe("roxo")
  })

  it("is branco during the Christmas season, including its January tail", () => {
    expect(getFerialColor(new Date(2025, 11, 26))).toBe("branco")
    expect(getFerialColor(new Date(2026, 0, 2))).toBe("branco")
  })

})
