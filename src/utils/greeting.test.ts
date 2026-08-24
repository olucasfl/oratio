import { describe, it, expect } from "vitest"
import {
  getMomento,
  getSaudacao,
  getDataLonga,
  getFraseDoMomento,
  getMomentoConvite,
} from "./greeting"

function at(hour: number, minute = 0) {
  return new Date(2026, 0, 15, hour, minute)
}

describe("getMomento", () => {

  it("is 'manha' from 5:00 up to (not including) 12:00", () => {
    expect(getMomento(at(5, 0))).toBe("manha")
    expect(getMomento(at(11, 59))).toBe("manha")
  })

  it("is 'tarde' from 12:00 up to (not including) 18:00", () => {
    expect(getMomento(at(12, 0))).toBe("tarde")
    expect(getMomento(at(17, 59))).toBe("tarde")
  })

  it("is 'noite' from 18:00 through the rest of the day, and before 5:00", () => {
    expect(getMomento(at(18, 0))).toBe("noite")
    expect(getMomento(at(23, 59))).toBe("noite")
    expect(getMomento(at(0, 0))).toBe("noite")
    expect(getMomento(at(4, 59))).toBe("noite")
  })

})

describe("getSaudacao", () => {

  it("greets without a name for a guest", () => {
    expect(getSaudacao(null, at(8))).toBe("Bom dia")
    expect(getSaudacao(undefined, at(14))).toBe("Boa tarde")
  })

  it("appends only the first name when given a full name", () => {
    expect(getSaudacao("Ana Maria Silva", at(20))).toBe("Boa noite, Ana")
  })

  it("trims and collapses whitespace before taking the first name", () => {
    expect(getSaudacao("   Lucas   Farias  ", at(9))).toBe("Bom dia, Lucas")
  })

  it("treats an empty/whitespace-only name the same as no name", () => {
    expect(getSaudacao("   ", at(9))).toBe("Bom dia")
  })

})

describe("getDataLonga", () => {

  it("formats weekday, day and month in Portuguese", () => {
    // 15/01/2026 é uma quinta-feira
    expect(getDataLonga(new Date(2026, 0, 15))).toBe("quinta-feira, 15 de janeiro")
  })

})

describe("getFraseDoMomento", () => {

  it("returns a distinct verse for each moment of the day", () => {
    const manha = getFraseDoMomento(at(8))
    const tarde = getFraseDoMomento(at(14))
    const noite = getFraseDoMomento(at(20))

    expect(manha).toContain("Lm 3,23")
    expect(tarde).toContain("1Ts 5,17")
    expect(noite).toContain("Sl 4,9")
    expect(new Set([manha, tarde, noite]).size).toBe(3)
  })

})

describe("getMomentoConvite", () => {

  it("points to /oratio/prayers in the morning and afternoon", () => {
    expect(getMomentoConvite(at(8)).path).toBe("/oratio/prayers")
    expect(getMomentoConvite(at(14)).path).toBe("/oratio/prayers")
  })

  it("points to the night examen (/oratio/confissao) at night", () => {
    const convite = getMomentoConvite(at(20))
    expect(convite.path).toBe("/oratio/confissao")
    expect(convite.acaoLabel).toBe("Iniciar")
  })

})
