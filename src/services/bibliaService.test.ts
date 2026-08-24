import { describe, it, expect, beforeEach } from "vitest"
import {
  getOldTestament,
  getNewTestament,
  getBook,
  getChapter,
  searchVerses,
  searchVersesByKeywords,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
} from "./bibliaService"

describe("bibliaService", () => {

  describe("getOldTestament / getNewTestament / getBook / getChapter", () => {

    it("returns non-empty testament arrays from the bundled Bible data", () => {
      expect(getOldTestament().length).toBeGreaterThan(0)
      expect(getNewTestament().length).toBeGreaterThan(0)
    })

    it("getBook finds a book by exact name across both testaments", () => {
      const [firstOT] = getOldTestament()
      expect(getBook(firstOT.nome)).toBe(firstOT)

      const [firstNT] = getNewTestament()
      expect(getBook(firstNT.nome)).toBe(firstNT)
    })

    it("getBook returns undefined for an unknown name", () => {
      expect(getBook("Not A Real Book")).toBeUndefined()
    })

    it("getChapter returns the chapter object for a valid book + chapter number", () => {
      const [firstOT] = getOldTestament()
      const [firstChapter] = firstOT.capitulos
      expect(getChapter(firstOT.nome, firstChapter.capitulo)).toBe(firstChapter)
    })

    it("getChapter returns null for an unknown book (not undefined -- explicit contract)", () => {
      expect(getChapter("Not A Real Book", 1)).toBeNull()
    })

    it("getChapter returns undefined for an out-of-range chapter number", () => {
      const [firstOT] = getOldTestament()
      expect(getChapter(firstOT.nome, 999999)).toBeUndefined()
    })

  })

  describe("searchVerses", () => {

    it("returns [] for a query shorter than 3 characters (including empty)", () => {
      expect(searchVerses("")).toEqual([])
      expect(searchVerses("ab")).toEqual([])
    })

    it("finds verses containing the query, case- and accent-insensitively", () => {
      const [book] = getOldTestament()
      const [chapter] = book.capitulos
      const [verse] = chapter.versiculos
      const word = verse.texto.split(/\s+/).find((w: string) => w.length >= 4) ?? verse.texto

      const results = searchVerses(word.toUpperCase())

      expect(results.length).toBeGreaterThan(0)
      expect(results.some((r) => r.text === verse.texto)).toBe(true)
    })

    it("caps results at the given limit", () => {
      const results = searchVerses("que", 3)
      expect(results.length).toBeLessThanOrEqual(3)
    })

  })

  describe("searchVersesByKeywords", () => {

    it("returns [] for an empty keyword list", () => {
      expect(searchVersesByKeywords([])).toEqual([])
    })

    it("matches verses containing any of the given keywords, capped at the limit", () => {
      const results = searchVersesByKeywords(["que"], 5)
      expect(results.length).toBeGreaterThan(0)
      expect(results.length).toBeLessThanOrEqual(5)
    })

  })

  describe("recent searches (localStorage)", () => {

    beforeEach(() => {
      localStorage.clear()
    })

    it("starts empty", () => {
      expect(getRecentSearches()).toEqual([])
    })

    it("adds a search to the front, treating a case-insensitive repeat as a move-to-front, not a duplicate", () => {
      addRecentSearch("amor")
      addRecentSearch("paz")
      addRecentSearch("AMOR")

      expect(getRecentSearches()).toEqual(["AMOR", "paz"])
    })

    it("ignores queries shorter than 3 characters after trimming", () => {
      addRecentSearch("ab")
      addRecentSearch("  ab  ")
      expect(getRecentSearches()).toEqual([])
    })

    it("trims whitespace before storing", () => {
      addRecentSearch("  paz  ")
      expect(getRecentSearches()).toEqual(["paz"])
    })

    it("caps the recent list at 6 entries, dropping the oldest", () => {
      for (const q of ["um1", "dois2", "tres3", "quatro4", "cinco5", "seis6", "sete7"]) {
        addRecentSearch(q)
      }

      const result = getRecentSearches()
      expect(result.length).toBe(6)
      expect(result[0]).toBe("sete7")
      expect(result).not.toContain("um1")
    })

    it("clearRecentSearches empties the list", () => {
      addRecentSearch("paz")
      clearRecentSearches()
      expect(getRecentSearches()).toEqual([])
    })

    it("returns [] instead of throwing when localStorage holds corrupted JSON", () => {
      localStorage.setItem("oratio_biblia_recent_searches", "not-json{{{")
      expect(getRecentSearches()).toEqual([])
    })

  })

})
