import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("./api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))
vi.mock("../utils/auth", () => ({ isLoggedIn: vi.fn() }))

import api from "./api"
import { isLoggedIn } from "../utils/auth"
import {
  listCollections,
  getCollection,
  createCollection,
  renameCollection,
  deleteCollection,
  addCollectionItem,
  removeCollectionItem,
} from "./bibleCollectionsService"

const mockedApi = api as unknown as Record<"get" | "post" | "patch" | "delete", ReturnType<typeof vi.fn>>
const mockedIsLoggedIn = isLoggedIn as unknown as ReturnType<typeof vi.fn>

const collection = { id: "c1", name: "Consolo", createdAt: "2026-01-01T00:00:00.000Z" }
const verseRef = { book: "Jo", chapter: 3, verse: 16 }

beforeEach(() => {
  vi.clearAllMocks()
  mockedIsLoggedIn.mockReturnValue(true)
})

describe("listCollections", () => {

  it("lists every collection when no verse is given", async () => {
    mockedApi.get.mockResolvedValue({ data: [collection] })

    await expect(listCollections()).resolves.toEqual([collection])
    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/bible/collections", { params: undefined })
  })

  it("filters by verse when one is given — this is what powers 'add to collection'", async () => {
    mockedApi.get.mockResolvedValue({ data: [] })

    await listCollections({ ...verseRef, reference: "João 3:16", text: "…" })

    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/bible/collections", {
      params: { book: "Jo", chapter: 3, verse: 16 },
    })
  })

  it("returns an empty list for a visitor without ever calling the backend", async () => {
    mockedIsLoggedIn.mockReturnValue(false)

    await expect(listCollections()).resolves.toEqual([])
    expect(mockedApi.get).not.toHaveBeenCalled()
  })

  it("swallows a request failure and returns empty", async () => {
    mockedApi.get.mockRejectedValue(new Error("offline"))

    await expect(listCollections()).resolves.toEqual([])
  })

  it("returns empty when the payload is not an array", async () => {
    mockedApi.get.mockResolvedValue({ data: { nope: 1 } })

    await expect(listCollections()).resolves.toEqual([])
  })

})

describe("getCollection", () => {

  it("fetches one collection by id", async () => {
    mockedApi.get.mockResolvedValue({ data: collection })

    await expect(getCollection("c1")).resolves.toEqual(collection)
    expect(mockedApi.get).toHaveBeenCalledWith("/oratio/bible/collections/c1")
  })

  it("returns null instead of throwing when the collection is missing or belongs to someone else", async () => {
    mockedApi.get.mockRejectedValue(new Error("404"))

    await expect(getCollection("alheia")).resolves.toBeNull()
  })

  it("returns null when the backend answers with an empty body", async () => {
    mockedApi.get.mockResolvedValue({ data: undefined })

    await expect(getCollection("c1")).resolves.toBeNull()
  })

})

describe("escrita — propaga o erro para o chamador desfazer", () => {

  it("createCollection posts the name and returns the created collection", async () => {
    mockedApi.post.mockResolvedValue({ data: collection })

    await expect(createCollection("Consolo")).resolves.toEqual(collection)
    expect(mockedApi.post).toHaveBeenCalledWith("/oratio/bible/collections", { name: "Consolo" })
  })

  it("createCollection rejects on failure instead of returning null", async () => {
    mockedApi.post.mockRejectedValue(new Error("400"))

    await expect(createCollection("")).rejects.toThrow()
  })

  it("renameCollection patches the given id", async () => {
    mockedApi.patch.mockResolvedValue({ data: { ...collection, name: "Novo" } })

    await expect(renameCollection("c1", "Novo")).resolves.toEqual({ ...collection, name: "Novo" })
    expect(mockedApi.patch).toHaveBeenCalledWith("/oratio/bible/collections/c1", { name: "Novo" })
  })

  it("deleteCollection deletes by id and resolves with nothing", async () => {
    mockedApi.delete.mockResolvedValue({ data: null })

    await expect(deleteCollection("c1")).resolves.toBeUndefined()
    expect(mockedApi.delete).toHaveBeenCalledWith("/oratio/bible/collections/c1")
  })

  it("deleteCollection rejects when the collection is not the user's", async () => {
    mockedApi.delete.mockRejectedValue(new Error("404"))

    await expect(deleteCollection("alheia")).rejects.toThrow()
  })

  it("addCollectionItem posts the verse snapshot under the collection", async () => {
    const input = { ...verseRef, reference: "João 3:16", text: "Porque Deus amou o mundo…" }
    mockedApi.post.mockResolvedValue({ data: { id: "i1", ...input } })

    await expect(addCollectionItem("c1", input)).resolves.toEqual({ id: "i1", ...input })
    expect(mockedApi.post).toHaveBeenCalledWith("/oratio/bible/collections/c1/items", input)
  })

  it("removeCollectionItem deletes the item under its collection", async () => {
    mockedApi.delete.mockResolvedValue({ data: null })

    await expect(removeCollectionItem("c1", "i1")).resolves.toBeUndefined()
    expect(mockedApi.delete).toHaveBeenCalledWith("/oratio/bible/collections/c1/items/i1")
  })

})
