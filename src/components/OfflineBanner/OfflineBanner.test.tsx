import { render, screen, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../hooks/useOffline", () => ({ useOffline: vi.fn() }))

import { useOffline } from "../../hooks/useOffline"
import OfflineBanner from "./OfflineBanner"

const useOfflineMock = useOffline as unknown as ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

describe("OfflineBanner", () => {

  it("renders nothing while online", () => {
    useOfflineMock.mockReturnValue(false)
    const { container } = render(<OfflineBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it("shows the offline message while offline", () => {
    useOfflineMock.mockReturnValue(true)
    render(<OfflineBanner />)
    expect(screen.getByText("Você está offline")).toBeInTheDocument()
  })

  it("flashes 'Conexão restabelecida' after coming back online, then hides it", () => {
    useOfflineMock.mockReturnValue(true)
    const { rerender } = render(<OfflineBanner />)

    useOfflineMock.mockReturnValue(false)
    rerender(<OfflineBanner />)
    expect(screen.getByText("Conexão restabelecida")).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(2600) })
    expect(screen.queryByText("Conexão restabelecida")).not.toBeInTheDocument()
  })

})
