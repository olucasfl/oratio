import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("../../services/notificationsService", () => ({
  getInbox: vi.fn(),
  getUnseenCount: vi.fn(),
  markSeen: vi.fn(),
  markAllSeen: vi.fn(),
}))

import { getInbox, getUnseenCount, markSeen, markAllSeen } from "../../services/notificationsService"
import NotificationBell from "./NotificationBell"

const getInboxMock = getInbox as unknown as ReturnType<typeof vi.fn>
const getUnseenCountMock = getUnseenCount as unknown as ReturnType<typeof vi.fn>
const markSeenMock = markSeen as unknown as ReturnType<typeof vi.fn>
const markAllSeenMock = markAllSeen as unknown as ReturnType<typeof vi.fn>

const NOW = new Date(2026, 0, 15, 12, 0, 0)

const TODAY_ITEM = {
  id: "n1", title: "Aviso de hoje", body: "Corpo do aviso", url: "/oratio/rosary",
  createdAt: new Date(2026, 0, 15, 8, 0, 0).toISOString(), seenAt: null, source: "RULE",
}
const YESTERDAY_ITEM = {
  id: "n2", title: "Aviso de ontem", body: null, url: null,
  createdAt: new Date(2026, 0, 14, 20, 0, 0).toISOString(), seenAt: "2026-01-14T21:00:00.000Z", source: "CAMPAIGN",
}

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderBell() {
  return render(
    <MemoryRouter>
      <NotificationBell />
      <LocationDisplay />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  // shouldAdvanceTime: mantém o relógio falso avançando junto do tempo
  // real, senão o polling interno de findBy/waitFor (baseado em
  // setTimeout) nunca resolve e todo teste trava até o timeout.
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(NOW)
  Element.prototype.scrollIntoView = vi.fn()
  getUnseenCountMock.mockResolvedValue(1)
  getInboxMock.mockResolvedValue({ items: [TODAY_ITEM, YESTERDAY_ITEM], nextCursor: null })
  markSeenMock.mockResolvedValue(undefined)
  markAllSeenMock.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.useRealTimers()
})

describe("NotificationBell", () => {

  it("shows the unseen badge from getUnseenCount, capped at '9+'", async () => {
    getUnseenCountMock.mockResolvedValue(12)
    renderBell()

    expect(await screen.findByText("9+")).toBeInTheDocument()
  })

  it("shows no badge when there are no unseen notifications", async () => {
    getUnseenCountMock.mockResolvedValue(0)
    renderBell()

    await vi.waitFor(() => expect(getUnseenCountMock).toHaveBeenCalled())
    expect(screen.queryByText(/^\d/)).not.toBeInTheDocument()
  })

  it("loads and shows the inbox, grouped by day, when the bell is opened", async () => {
    renderBell()
    fireEvent.click(screen.getByLabelText("Notificações"))

    expect(await screen.findByText("Aviso de hoje")).toBeInTheDocument()
    expect(screen.getByText("Hoje")).toBeInTheDocument()
    expect(screen.getByText("Ontem")).toBeInTheDocument()
  })

  it("shows the empty state when there are no items", async () => {
    getInboxMock.mockResolvedValue({ items: [], nextCursor: null })
    renderBell()
    fireEvent.click(screen.getByLabelText("Notificações"))

    expect(await screen.findByText("Tudo em dia")).toBeInTheDocument()
  })

  it("expanding an unseen item with detail marks it seen and decrements the badge", async () => {
    renderBell()
    fireEvent.click(screen.getByLabelText("Notificações"))
    await screen.findByText("Aviso de hoje")

    fireEvent.click(screen.getByText("Aviso de hoje"))

    await waitFor(() => expect(markSeenMock).toHaveBeenCalledWith("n1"))
    expect(screen.getByText("Corpo do aviso")).toBeInTheDocument()
  })

  it("does not toggle (no-op) an item with neither body nor url", async () => {
    getInboxMock.mockResolvedValue({
      items: [{ id: "n3", title: "Sem detalhe", body: null, url: null, createdAt: TODAY_ITEM.createdAt, seenAt: null, source: "RULE" }],
      nextCursor: null,
    })
    renderBell()
    fireEvent.click(screen.getByLabelText("Notificações"))
    await screen.findByText("Sem detalhe")

    fireEvent.click(screen.getByText("Sem detalhe"))

    expect(markSeenMock).not.toHaveBeenCalled()
  })

  it("'Marcar todas' calls markAllSeen and clears the badge, and hides itself once there's nothing unseen", async () => {
    renderBell()
    fireEvent.click(screen.getByLabelText("Notificações"))
    await screen.findByText("Marcar todas")

    fireEvent.click(screen.getByText("Marcar todas"))

    expect(markAllSeenMock).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("Marcar todas")).not.toBeInTheDocument()
  })

  it("'Ver mais' only appears when there's a next cursor, and appends the next page", async () => {
    getInboxMock.mockResolvedValueOnce({ items: [TODAY_ITEM], nextCursor: "cur-1" })
    renderBell()
    fireEvent.click(screen.getByLabelText("Notificações"))
    await screen.findByText("Ver mais")

    getInboxMock.mockResolvedValueOnce({ items: [YESTERDAY_ITEM], nextCursor: null })
    fireEvent.click(screen.getByText("Ver mais"))

    await screen.findByText("Aviso de ontem")
    expect(getInboxMock).toHaveBeenLastCalledWith("cur-1")
    expect(screen.queryByText("Ver mais")).not.toBeInTheDocument()
  })

  it("clicking 'Abrir' navigates to the item's url and closes the panel", async () => {
    renderBell()
    fireEvent.click(screen.getByLabelText("Notificações"))
    fireEvent.click(await screen.findByText("Aviso de hoje"))
    fireEvent.click(await screen.findByText(/Abrir/))

    expect(screen.getByTestId("location").textContent).toBe("/oratio/rosary")
    expect(screen.queryByText("Notificações")).not.toBeInTheDocument()
  })

  it("closes the panel on backdrop click but not on panel content click", async () => {
    renderBell()
    fireEvent.click(screen.getByLabelText("Notificações"))
    await screen.findByText("Aviso de hoje")

    fireEvent.click(screen.getByText("Notificações")) // dentro do painel
    expect(screen.getByText("Aviso de hoje")).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText("Fechar"))
    expect(screen.queryByText("Aviso de hoje")).not.toBeInTheDocument()
  })

})
