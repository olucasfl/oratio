import { describe, it, expect, vi } from "vitest"

vi.mock("../data/saintsOfTheDay", () => ({
  findSaintOfDay: vi.fn(),
}))

vi.mock("../data/saintBios", () => ({
  SAINT_BIOS: {
    "sao-jose": { titulo: "São José", resumo: "Esposo de Maria", texto: "..." },
  },
  findMovableFeast: vi.fn(),
}))

import { findSaintOfDay } from "../data/saintsOfTheDay"
import { findMovableFeast } from "../data/saintBios"
import { resolveSaintOfDay } from "./saintOfDay"
import type { LiturgyData } from "../hooks/useLiturgy"

const findSaintOfDayMock = findSaintOfDay as unknown as ReturnType<typeof vi.fn>
const findMovableFeastMock = findMovableFeast as unknown as ReturnType<typeof vi.fn>

function liturgy(over: Partial<LiturgyData> = {}): LiturgyData {
  return { data: "19/03", liturgia: undefined, cor: "verde", ...over }
}

describe("resolveSaintOfDay", () => {

  it("returns null when there is no liturgy data at all", () => {
    findSaintOfDayMock.mockReturnValue(null)
    findMovableFeastMock.mockReturnValue(null)
    expect(resolveSaintOfDay(null)).toBeNull()
    expect(resolveSaintOfDay(undefined)).toBeNull()
  })

  it("returns null when neither the local index nor the API confirm any celebration", () => {
    findSaintOfDayMock.mockReturnValue(null)
    findMovableFeastMock.mockReturnValue(null)

    expect(resolveSaintOfDay(liturgy({ liturgia: undefined }))).toBeNull()
  })

  it("uses the local index as complementary content (opcional=true) when the API confirms nothing", () => {
    findSaintOfDayMock.mockReturnValue({
      dia: 19, mes: 3, nome: "São José, Esposo de Maria", match: ["sao jose"],
    })
    findMovableFeastMock.mockReturnValue(null)

    const result = resolveSaintOfDay(liturgy({ liturgia: undefined, cor: "verde" }))

    expect(result?.nome).toBe("São José, Esposo de Maria")
    expect(result?.grau).toBe("Dia Comum")
    expect(result?.opcional).toBe(true)
    // opcional + tem data de referência => cor da féria, não a cor bruta da API
    expect(result?.cor).not.toBeNull()
  })

  it("uses the API's celebration as-is when it doesn't match any local index entry", () => {
    findSaintOfDayMock.mockReturnValue(null)
    findMovableFeastMock.mockReturnValue(null)

    const result = resolveSaintOfDay(liturgy({
      liturgia: "Terça-feira da 2ª Semana da Quaresma", // sem grau reconhecido -> parseCelebration null
      cor: "roxo",
    }))

    // sem fixedEntry e sem celebration reconhecida (grau não bate) => null
    expect(result).toBeNull()
  })

  it("promotes the API's confirmed celebration when it matches the local index entry", () => {
    findSaintOfDayMock.mockReturnValue({
      dia: 19, mes: 3, nome: "São José, Esposo da Virgem Maria", match: ["sao jose"], opcional: false,
    })
    findMovableFeastMock.mockReturnValue(null)

    const result = resolveSaintOfDay(liturgy({
      liturgia: "São José, Esposo da Virgem Maria, Solenidade",
      cor: "branco",
    }))

    expect(result?.nome).toBe("São José, Esposo da Virgem Maria")
    expect(result?.grau).toBe("Solenidade")
    expect(result?.opcional).toBe(false)
    expect(result?.cor).toBe("branco") // não é opcional -> usa a cor da API direto
  })

  it("marks a matched-but-optional local entry as 'Memória Facultativa' and shows the ferial color", () => {
    findSaintOfDayMock.mockReturnValue({
      dia: 19, mes: 3, nome: "Beato Fulano", match: ["beato fulano"], opcional: true,
    })
    findMovableFeastMock.mockReturnValue(null)

    const result = resolveSaintOfDay(liturgy({
      liturgia: "Beato Fulano, Memória Facultativa",
      cor: "branco",
    }))

    expect(result?.grau).toBe("Memória Facultativa")
    expect(result?.opcional).toBe(true)
    expect(result?.cor).not.toBe("branco") // opcional -> ignora a cor bruta da API, usa a féria
  })

  it("falls back to the API's raw celebration name when the local index entry doesn't match it (never shows an unconfirmed title)", () => {
    findSaintOfDayMock.mockReturnValue({
      dia: 19, mes: 3, nome: "Algum Santo Local", match: ["algum santo local"],
    })
    findMovableFeastMock.mockReturnValue(null)

    const result = resolveSaintOfDay(liturgy({
      liturgia: "Outra Celebração Bem Diferente, Festa",
      cor: "branco",
    }))

    expect(result?.nome).toBe("Outra Celebração Bem Diferente")
    expect(result?.opcional).toBe(false) // celebration existe -> não é conteúdo complementar
  })

  it("resolves the bio from SAINT_BIOS via the local entry's bioId", () => {
    findSaintOfDayMock.mockReturnValue({
      dia: 19, mes: 3, nome: "São José", match: ["sao jose"], bioId: "sao-jose",
    })
    findMovableFeastMock.mockReturnValue(null)

    const result = resolveSaintOfDay(liturgy({ liturgia: undefined }))

    expect(result?.bio).toEqual({ titulo: "São José", resumo: "Esposo de Maria", texto: "..." })
  })

  it("falls back to a movable-feast bio when there's no fixed-index bio but the API name matches one", () => {
    findSaintOfDayMock.mockReturnValue(null)
    findMovableFeastMock.mockReturnValue({
      titulo: "Páscoa", resumo: "Ressurreição do Senhor", texto: "...",
    })

    const result = resolveSaintOfDay(liturgy({
      liturgia: "Páscoa da Ressurreição do Senhor, Solenidade",
      cor: "branco",
    }))

    expect(result?.nome).toBe("Páscoa")
    expect(result?.bio).toEqual({ titulo: "Páscoa", resumo: "Ressurreição do Senhor", texto: "..." })
  })

})
