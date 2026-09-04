import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("./api", () => ({
  default: { get: vi.fn(), put: vi.fn() },
}))
vi.mock("../utils/auth", () => ({ isLoggedIn: vi.fn() }))

import api from "./api"
import { isLoggedIn } from "../utils/auth"
import {
  getChapterMarks,
  getAllMarks,
  upsertMark,
  isDeleted,
  HIGHLIGHT_COLORS,
} from "./bibleMarksService"

const mockedApi = api as unknown as { get: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> }
const mockedIsLoggedIn = isLoggedIn as unknown as ReturnType<typeof vi.fn>

const mark = {
  id: "m1", book: "Jo", chapter: 3, verse: 16,
  reference: "João 3:16", text: "Porque Deus amou o mundo…",
  highlighted: true, highlightColor: "amber", favorite: false, note: null,
  createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedIsLoggedIn.mockReturnValue(true)
})

describe("getChapterMarks", () => {

  it("asks the backend only for the requested chapter", async () => {
    mockedApi.get.mockResolvedValue({ data: [mark] })

    await expect(getChapterMarks("Jo", 3)).resolves.toEqual([mark])
    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/bible/marks", {
      params: { book: "Jo", chapter: 3 },
    })
  })

  it("returns an empty list for a visitor without ever calling the backend", async () => {
    mockedIsLoggedIn.mockReturnValue(false)

    await expect(getChapterMarks("Jo", 3)).resolves.toEqual([])
    expect(mockedApi.get).not.toHaveBeenCalled()
  })

  it("swallows a request failure and returns empty — reading must never depend on marks", async () => {
    mockedApi.get.mockRejectedValue(new Error("offline"))

    await expect(getChapterMarks("Jo", 3)).resolves.toEqual([])
  })

  it("returns empty when the backend answers with something that is not an array", async () => {
    mockedApi.get.mockResolvedValue({ data: { unexpected: true } })

    await expect(getChapterMarks("Jo", 3)).resolves.toEqual([])
  })

})

describe("getAllMarks", () => {

  it("asks for every mark, with no chapter filter", async () => {
    mockedApi.get.mockResolvedValue({ data: [mark] })

    await expect(getAllMarks()).resolves.toEqual([mark])
    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/bible/marks")
  })

  it("returns an empty list for a visitor without calling the backend", async () => {
    mockedIsLoggedIn.mockReturnValue(false)

    await expect(getAllMarks()).resolves.toEqual([])
    expect(mockedApi.get).not.toHaveBeenCalled()
  })

  it("swallows a request failure and returns empty", async () => {
    mockedApi.get.mockRejectedValue(new Error("offline"))

    await expect(getAllMarks()).resolves.toEqual([])
  })

  it("returns empty when the payload is not an array", async () => {
    mockedApi.get.mockResolvedValue({ data: null })

    await expect(getAllMarks()).resolves.toEqual([])
  })

})

describe("upsertMark", () => {

  it("sends the whole verse snapshot, since the backend has no bible text of its own", async () => {
    mockedApi.put.mockResolvedValue({ data: mark })
    const input = {
      book: "Jo", chapter: 3, verse: 16,
      reference: "João 3:16", text: "Porque Deus amou o mundo…",
      highlighted: true, highlightColor: "amber" as const,
    }

    await expect(upsertMark(input)).resolves.toEqual(mark)
    expect(mockedApi.put).toHaveBeenCalledWith("/oratio/bible/marks", input)
  })

  it("returns the deleted marker when clearing the last flag removes the row", async () => {
    mockedApi.put.mockResolvedValue({ data: { deleted: true } })

    const result = await upsertMark({
      book: "Jo", chapter: 3, verse: 16,
      reference: "João 3:16", text: "…",
      highlighted: false, favorite: false, note: "",
    })

    expect(isDeleted(result)).toBe(true)
  })

  it("rejects instead of swallowing — the caller applies the change optimistically and needs to undo it", async () => {
    mockedApi.put.mockRejectedValue(new Error("500"))

    await expect(
      upsertMark({ book: "Jo", chapter: 3, verse: 16, reference: "João 3:16", text: "…" }),
    ).rejects.toThrow()
  })

  it("does not gate writes on isLoggedIn — the UI gates them before calling", async () => {
    mockedIsLoggedIn.mockReturnValue(false)
    mockedApi.put.mockResolvedValue({ data: mark })

    await expect(
      upsertMark({ book: "Jo", chapter: 3, verse: 16, reference: "João 3:16", text: "…" }),
    ).resolves.toEqual(mark)
    expect(mockedApi.put).toHaveBeenCalled()
  })

})

describe("isDeleted", () => {

  it("tells a deleted marker apart from a real mark", () => {
    expect(isDeleted({ deleted: true })).toBe(true)
    expect(isDeleted(mark as never)).toBe(false)
  })

})

describe("HIGHLIGHT_COLORS", () => {

  it("matches the five colours the backend accepts, in order", () => {
    expect(HIGHLIGHT_COLORS).toEqual(["amber", "green", "blue", "pink", "purple"])
  })

})
