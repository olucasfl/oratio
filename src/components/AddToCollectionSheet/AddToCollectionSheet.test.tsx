import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/bibleCollectionsService", () => ({
  listCollections: (...a: unknown[]) => listMock(...a),
  createCollection: (...a: unknown[]) => createMock(...a),
  addCollectionItem: (...a: unknown[]) => addItemMock(...a),
  removeCollectionItem: (...a: unknown[]) => removeItemMock(...a),
}))

import AddToCollectionSheet from "./AddToCollectionSheet"

const listMock = vi.fn()
const createMock = vi.fn()
const addItemMock = vi.fn()
const removeItemMock = vi.fn()

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
    { id: "c1", name: "Promessas", _count: { items: 2 }, containsItemId: null },
    { id: "c2", name: "Salmos favoritos", _count: { items: 5 }, containsItemId: "it42" },
  ])
  addItemMock.mockResolvedValue({ id: "newItem" })
  removeItemMock.mockResolvedValue(undefined)
  createMock.mockResolvedValue({ id: "c3", name: "Fé" })
})

describe("AddToCollectionSheet", () => {

  it("requests collections scoped to the verse", async () => {
    renderSheet()
    await waitFor(() =>
      expect(listMock).toHaveBeenCalledWith({ book: "João", chapter: 3, verse: 16 }),
    )
  })

  it("adds the verse to a collection it is not in yet", async () => {
    const onDone = renderSheet()
    fireEvent.click(await screen.findByRole("button", { name: /Promessas/ }))

    await waitFor(() => expect(addItemMock).toHaveBeenCalledWith("c1", item))
    expect(onDone).toHaveBeenCalledWith('Adicionado a "Promessas"')
  })

  it("removes the verse from a collection it is already in", async () => {
    const onDone = renderSheet()
    fireEvent.click(await screen.findByRole("button", { name: /Salmos favoritos/ }))

    await waitFor(() => expect(removeItemMock).toHaveBeenCalledWith("c2", "it42"))
    expect(addItemMock).not.toHaveBeenCalled()
    expect(onDone).toHaveBeenCalledWith('Removido de "Salmos favoritos"')
  })

  it("toggles back and forth on the same collection", async () => {
    renderSheet()
    const row = await screen.findByRole("button", { name: /Promessas/ })

    fireEvent.click(row)
    await waitFor(() => expect(addItemMock).toHaveBeenCalledTimes(1))

    fireEvent.click(row)
    await waitFor(() => expect(removeItemMock).toHaveBeenCalledWith("c1", "newItem"))
  })

  it("creates a new collection and adds the verse to it", async () => {
    const onDone = renderSheet()
    await screen.findByRole("button", { name: /Promessas/ })

    fireEvent.change(screen.getByPlaceholderText("Nova coleção…"), { target: { value: "Fé" } })
    fireEvent.keyDown(screen.getByPlaceholderText("Nova coleção…"), { key: "Enter" })

    await waitFor(() => expect(createMock).toHaveBeenCalledWith("Fé"))
    await waitFor(() => expect(addItemMock).toHaveBeenCalledWith("c3", item))
    expect(onDone).toHaveBeenCalledWith('Adicionado a "Fé"')
  })

  describe("multi-select mode (items instead of item)", () => {

    const items = [
      { book: "João", chapter: 3, verse: 16, reference: "João 3,16", text: "Deus amou o mundo" },
      { book: "João", chapter: 3, verse: 17, reference: "João 3,17", text: "Não enviou o Filho para condenar" },
    ]

    function renderMultiSheet(onDone = vi.fn()) {
      render(
        <AddToCollectionSheet
          open
          onClose={vi.fn()}
          reference="2 versículos selecionados"
          item={null}
          items={items}
          onDone={onDone}
        />,
      )
      return onDone
    }

    it("requests collections without scoping to a single verse", async () => {
      renderMultiSheet()
      await waitFor(() => expect(listMock).toHaveBeenCalledWith(undefined))
    })

    it("adds every selected verse to the tapped collection, without a remove toggle", async () => {
      const onDone = renderMultiSheet()
      const row = await screen.findByRole("button", { name: /Promessas/ })
      fireEvent.click(row)

      await waitFor(() => expect(addItemMock).toHaveBeenCalledTimes(2))
      expect(addItemMock).toHaveBeenCalledWith("c1", items[0])
      expect(addItemMock).toHaveBeenCalledWith("c1", items[1])
      expect(onDone).toHaveBeenCalledWith('2 versículos adicionados a "Promessas"')

      // modo múltiplo não tem toggle — tocar de novo adiciona de novo,
      // nunca remove (upsert do backend já é idempotente)
      fireEvent.click(row)
      await waitFor(() => expect(addItemMock).toHaveBeenCalledTimes(4))
      expect(removeItemMock).not.toHaveBeenCalled()
    })

    it("creates a collection and adds every selected verse to it", async () => {
      const onDone = renderMultiSheet()
      await screen.findByRole("button", { name: /Promessas/ })

      fireEvent.change(screen.getByPlaceholderText("Nova coleção…"), { target: { value: "Fé" } })
      fireEvent.keyDown(screen.getByPlaceholderText("Nova coleção…"), { key: "Enter" })

      await waitFor(() => expect(createMock).toHaveBeenCalledWith("Fé"))
      await waitFor(() => expect(addItemMock).toHaveBeenCalledTimes(2))
      expect(addItemMock).toHaveBeenCalledWith("c3", items[0])
      expect(addItemMock).toHaveBeenCalledWith("c3", items[1])
      expect(onDone).toHaveBeenCalledWith('2 versículos adicionados a "Fé"')
    })
  })
})
