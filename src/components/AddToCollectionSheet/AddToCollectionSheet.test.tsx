import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/bibleCollectionsService", () => ({
  listCollections: (...a: unknown[]) => listMock(...a),
  createCollection: (...a: unknown[]) => createMock(...a),
  addCollectionItem: (...a: unknown[]) => addItemMock(...a),
}))

import AddToCollectionSheet from "./AddToCollectionSheet"

const listMock = vi.fn()
const createMock = vi.fn()
const addItemMock = vi.fn()

const item = {
  book: "João", chapter: 3, verse: 16, reference: "João 3,16", text: "Deus amou o mundo",
}

function renderSheet(onDone = vi.fn()) {
  render(
    <AddToCollectionSheet
      open
      onClose={vi.fn()}
      reference="João 3,16"
      item={item}
      onDone={onDone}
    />,
  )
  return onDone
}

beforeEach(() => {
  vi.clearAllMocks()
  listMock.mockResolvedValue([
    { id: "c1", name: "Promessas", _count: { items: 2 } },
  ])
  addItemMock.mockResolvedValue({ id: "i1" })
  createMock.mockResolvedValue({ id: "c2", name: "Fé" })
})

describe("AddToCollectionSheet", () => {

  it("adds the verse to an existing collection and reports it", async () => {
    const onDone = renderSheet()
    fireEvent.click(await screen.findByRole("button", { name: /Promessas/ }))

    await waitFor(() =>
      expect(addItemMock).toHaveBeenCalledWith("c1", item),
    )
    expect(onDone).toHaveBeenCalledWith('Adicionado a "Promessas"')
  })

  it("creates a new collection and adds the verse to it", async () => {
    const onDone = renderSheet()
    await screen.findByRole("button", { name: /Promessas/ })

    fireEvent.change(screen.getByPlaceholderText("Nova coleção…"), { target: { value: "Fé" } })
    fireEvent.keyDown(screen.getByPlaceholderText("Nova coleção…"), { key: "Enter" })

    await waitFor(() => expect(createMock).toHaveBeenCalledWith("Fé"))
    await waitFor(() => expect(addItemMock).toHaveBeenCalledWith("c2", item))
    expect(onDone).toHaveBeenCalledWith('Adicionado a "Fé"')
  })
})
