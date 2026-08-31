import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("../../hooks/useVisualViewportOffset", () => ({ resyncViewport: vi.fn() }))

import ShareReadingButton from "./ShareReadingButton"

const origShare = Object.getOwnPropertyDescriptor(navigator, "share")
const origClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard")

function setNav(share: unknown, clipboard: unknown) {
  Object.defineProperty(navigator, "share", { configurable: true, value: share })
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: clipboard })
}

beforeEach(() => vi.clearAllMocks())

afterEach(() => {
  if (origShare) Object.defineProperty(navigator, "share", origShare)
  else Reflect.deleteProperty(navigator, "share")
  if (origClipboard) Object.defineProperty(navigator, "clipboard", origClipboard)
})

describe("ShareReadingButton", () => {

  it("uses the native share sheet with the built text", async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    setNav(share, undefined)
    render(<ShareReadingButton label="Evangelho" buildText={() => "texto do evangelho"} />)
    fireEvent.click(screen.getByRole("button", { name: "Compartilhar Evangelho" }))
    await waitFor(() => expect(share).toHaveBeenCalledWith({ text: "texto do evangelho" }))
  })

  it("falls back to the clipboard and shows 'Copiado!' when share is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setNav(undefined, { writeText })
    render(<ShareReadingButton label="Salmo" buildText={() => "salmo 23"} />)
    fireEvent.click(screen.getByRole("button", { name: "Compartilhar Salmo" }))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("salmo 23"))
    expect(await screen.findByText("Copiado!")).toBeInTheDocument()
  })

  it("does not fall back to the clipboard when the user cancels the share sheet", async () => {
    const share = vi.fn().mockRejectedValue(Object.assign(new Error("x"), { name: "AbortError" }))
    const writeText = vi.fn()
    setNav(share, { writeText })
    render(<ShareReadingButton label="Salmo" buildText={() => "salmo"} />)
    fireEvent.click(screen.getByRole("button", { name: "Compartilhar Salmo" }))
    await waitFor(() => expect(share).toHaveBeenCalled())
    expect(writeText).not.toHaveBeenCalled()
  })

  it("renders a compact icon-only button when asked", () => {
    setNav(undefined, { writeText: vi.fn() })
    render(<ShareReadingButton label="1ª Leitura" buildText={() => ""} compact />)
    expect(screen.getByRole("button", { name: "Compartilhar 1ª Leitura" })).toBeInTheDocument()
    expect(screen.queryByText("Compartilhar 1ª Leitura")).not.toBeInTheDocument()
  })

})
