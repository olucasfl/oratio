import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }))

import api from "../../services/api"
import VerifyEmailModal from "./VerifyEmailModal"

const apiMock = api as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> }

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  apiMock.get.mockResolvedValue({ data: { verified: false } })
  apiMock.post.mockResolvedValue({})
})

describe("VerifyEmailModal", () => {

  it("renders nothing when closed", () => {
    const { container } = render(
      <VerifyEmailModal open={false} email="a@b.com" onVerified={vi.fn()} onClose={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("shows the pending email while waiting", () => {
    render(<VerifyEmailModal open email="a@b.com" onVerified={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText("Verifique seu email")).toBeInTheDocument()
    expect(screen.getByText("a@b.com")).toBeInTheDocument()
  })

  it("confirms a successful resend", async () => {
    render(<VerifyEmailModal open email="a@b.com" onVerified={vi.fn()} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: "Reenviar email" }))
    await waitFor(() =>
      expect(apiMock.post).toHaveBeenCalledWith("/auth/resend-verification", { email: "a@b.com" }),
    )
    expect(await screen.findByText(/Email reenviado/)).toBeInTheDocument()
  })

  it("reports a failed resend", async () => {
    apiMock.post.mockRejectedValue(new Error("nope"))
    render(<VerifyEmailModal open email="a@b.com" onVerified={vi.fn()} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: "Reenviar email" }))
    expect(await screen.findByText(/Não foi possível reenviar/)).toBeInTheDocument()
  })

  it("calls onVerified once the poll reports the email verified", async () => {
    const onVerified = vi.fn()
    apiMock.get.mockResolvedValue({ data: { verified: true } })
    render(<VerifyEmailModal open email="a@b.com" onVerified={onVerified} onClose={vi.fn()} />)

    await act(async () => { await vi.advanceTimersByTimeAsync(3100) })
    expect(await screen.findByText("Email verificado!")).toBeInTheDocument()
    await act(async () => { await vi.advanceTimersByTimeAsync(1600) })
    expect(onVerified).toHaveBeenCalled()
  })

})
