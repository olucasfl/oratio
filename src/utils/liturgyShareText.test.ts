import { describe, it, expect } from "vitest"
import {
  buildLeituraShareText,
  buildSalmoShareText,
  buildQuickReadingShareText,
  buildEvangelhoShareText,
} from "./liturgyShareText"

const ASSINATURA = "— Enviado pelo app Oratio"

describe("buildLeituraShareText", () => {

  it("includes heading, titulo, referencia, cleaned texto and the signature", () => {
    const text = buildLeituraShareText("Primeira Leitura", {
      titulo: "Leitura da carta de São Paulo",
      referencia: "Rm 8, 31-35",
      texto: "1Se Deus é por nós, 2quem será contra nós?",
    })

    expect(text).toBe(
      [
        "Primeira Leitura",
        "Leitura da carta de São Paulo",
        "Rm 8, 31-35",
        "",
        "Se Deus é por nós, quem será contra nós?",
        "",
        ASSINATURA,
      ].join("\n"),
    )
  })

  it("omits titulo/referencia lines entirely when absent, rather than leaving them blank", () => {
    const text = buildLeituraShareText("Segunda Leitura", { texto: "Um texto qualquer." })

    expect(text).toBe(["Segunda Leitura", "", "Um texto qualquer.", "", ASSINATURA].join("\n"))
  })

  it("appends the closing response lines (padre/assembleia/todos) when present", () => {
    const text = buildLeituraShareText("Primeira Leitura", {
      texto: "Um texto.",
      final: [{ padre: "Palavra do Senhor." }, { assembleia: "Graças a Deus." }],
    })

    expect(text).toBe(
      ["Primeira Leitura", "", "Um texto.", "", "Palavra do Senhor.", "Graças a Deus.", "", ASSINATURA].join("\n"),
    )
  })

})

describe("buildSalmoShareText", () => {

  it("includes the refrain marked with ℟. when present", () => {
    const text = buildSalmoShareText({
      referencia: "Sl 33",
      refrao: "Provai e vede como o Senhor é bom.",
      texto: "1Bendirei ao Senhor em todo o tempo.",
    })

    expect(text).toBe(
      [
        "Salmo Responsorial",
        "Sl 33",
        "",
        "℟. Provai e vede como o Senhor é bom.",
        "",
        "Bendirei ao Senhor em todo o tempo.",
        "",
        ASSINATURA,
      ].join("\n"),
    )
  })

  it("omits the refrain line entirely when absent", () => {
    const text = buildSalmoShareText({ texto: "Um salmo qualquer." })

    expect(text).toBe(["Salmo Responsorial", "", "Um salmo qualquer.", "", ASSINATURA].join("\n"))
  })

})

describe("buildQuickReadingShareText", () => {

  it("includes refrao, the computed resposta, and a 'Leia no app' link when all are given", () => {
    const text = buildQuickReadingShareText(
      "Salmo",
      { referencia: "Sl 33", refrao: "Provai e vede.", texto: "Um salmo." },
      { padre: "Palavra do Senhor.", assembleia: "Graças a Deus." },
      "https://oratio-phi.vercel.app/liturgia",
    )

    expect(text).toBe(
      [
        "Salmo",
        "Sl 33",
        "",
        "℟. Provai e vede.",
        "",
        "Um salmo.",
        "",
        "Palavra do Senhor.",
        "Graças a Deus.",
        "",
        "Leia no app: https://oratio-phi.vercel.app/liturgia",
        "",
        ASSINATURA,
      ].join("\n"),
    )
  })

  it("omits refrao, resposta and link independently when not given", () => {
    const text = buildQuickReadingShareText("Evangelho", { texto: "Um texto." })

    expect(text).toBe(["Evangelho", "", "Um texto.", "", ASSINATURA].join("\n"))
  })

})

describe("buildEvangelhoShareText", () => {

  it("pulls the 'Proclamação...' opening line out of abertura, plus referencia and closing lines", () => {
    const text = buildEvangelhoShareText({
      abertura: [
        { assembleia: "Glória a vós, Senhor." },
        { padre: "Proclamação do Evangelho de Jesus Cristo segundo Marcos." },
      ],
      referencia: "Mc 1, 1-8",
      texto: "1Eis que envio o meu mensageiro à tua frente.",
      final: [{ padre: "Palavra da Salvação." }, { assembleia: "Glória a vós, Senhor." }],
    })

    expect(text).toBe(
      [
        "Evangelho",
        "Proclamação do Evangelho de Jesus Cristo segundo Marcos.",
        "Mc 1, 1-8",
        "",
        "Eis que envio o meu mensageiro à tua frente.",
        "",
        "Palavra da Salvação.",
        "Glória a vós, Senhor.",
        "",
        ASSINATURA,
      ].join("\n"),
    )
  })

  it("omits the opening line when no abertura item starts with 'Proclamação'", () => {
    const text = buildEvangelhoShareText({
      abertura: [{ assembleia: "Glória a vós, Senhor." }],
      texto: "Um texto.",
    })

    expect(text).toBe(["Evangelho", "", "Um texto.", "", ASSINATURA].join("\n"))
  })

  it("cleans verse-number prefixes that are glued to the following word", () => {
    const text = buildEvangelhoShareText({ texto: "5Naquele tempo, 6disse Jesus aos discípulos." })

    expect(text).toContain("Naquele tempo, disse Jesus aos discípulos.")
    expect(text).not.toMatch(/\d(Naquele|disse)/)
  })

})
