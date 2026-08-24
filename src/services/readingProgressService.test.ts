import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("./api", () => ({
  default: { put: vi.fn() },
}))

import api from "./api"
import { saveReadingProgress } from "./readingProgressService"

const putMock = api.put as unknown as ReturnType<typeof vi.fn>

/*
saveReadingProgress() é "nice to have" em background (§ARCHITECTURE.md):
não pode atrapalhar a leitura em si. Os dois comportamentos que importam
são exatamente os que um mock "feliz" simples não exercitaria: pular a
chamada pra convidado, e nunca deixar uma falha de rede subir.
*/
describe("saveReadingProgress", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it("does nothing for a guest (no access_token) — never calls the API", async () => {
    await saveReadingProgress("BIBLE", "genesis/3", "Gênesis 3")
    expect(putMock).not.toHaveBeenCalled()
  })

  it("saves the reading position for a logged-in user", async () => {
    localStorage.setItem("access_token", "tok-1")
    putMock.mockResolvedValue({ data: {} })

    await saveReadingProgress("CATECHISM", "42", "Página 42")

    expect(putMock).toHaveBeenCalledWith("/oratio/reading-progress", {
      kind: "CATECHISM",
      reference: "42",
      label: "Página 42",
    })
  })

  it("never throws when the save call fails (best-effort)", async () => {
    localStorage.setItem("access_token", "tok-1")
    putMock.mockRejectedValue(new Error("network down"))

    await expect(saveReadingProgress("BIBLE", "genesis/3", "Gênesis 3")).resolves.toBeUndefined()
  })

})
