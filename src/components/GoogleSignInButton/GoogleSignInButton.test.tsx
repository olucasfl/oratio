import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

import type { GoogleAccountsId } from "../../utils/loadGsi"

const initialize = vi.fn()
const renderButton = vi.fn((el: HTMLElement) => { el.innerHTML = "<div>google-btn</div>" })
const loadGsiMock = vi.fn()

vi.mock("../../utils/loadGsi", () => ({
  loadGsi: () => loadGsiMock(),
}))

import GoogleSignInButton from "./GoogleSignInButton"

const fakeGoogleId = { initialize, renderButton } as unknown as GoogleAccountsId

beforeEach(() => {
  vi.clearAllMocks()
  loadGsiMock.mockResolvedValue(fakeGoogleId)
  vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "test-client-id")
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("GoogleSignInButton", () => {

  it("renders nothing when VITE_GOOGLE_CLIENT_ID is not set", () => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "")
    const { container } = render(<GoogleSignInButton onCredential={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
    expect(loadGsiMock).not.toHaveBeenCalled()
  })

  it("initializes GIS with our client id and popup UX, then renders the button", async () => {
    render(<GoogleSignInButton onCredential={vi.fn()} />)

    await waitFor(() => expect(initialize).toHaveBeenCalledTimes(1))

    const config = initialize.mock.calls[0][0]
    expect(config.client_id).toBe("test-client-id")
    expect(config.use_fedcm_for_button).toBe(true)
    // ux_mode fica no default "popup" — nunca redirect (quebra o PWA no iOS)
    expect(config.ux_mode).toBeUndefined()

    await waitFor(() => expect(renderButton).toHaveBeenCalledTimes(1))
    expect(screen.getByText("google-btn")).toBeInTheDocument()
  })

  it("uses the 'continue_with' label by default (E5)", async () => {
    render(<GoogleSignInButton onCredential={vi.fn()} />)
    await waitFor(() => expect(renderButton).toHaveBeenCalledTimes(1))
    expect(renderButton.mock.calls[0][1]).toMatchObject({ text: "continue_with" })
  })

  it("blocks the button with a spinner while disabled (E6)", async () => {
    const { container, rerender } = render(
      <GoogleSignInButton onCredential={vi.fn()} disabled={false} />,
    )
    await waitFor(() => expect(renderButton).toHaveBeenCalledTimes(1))

    // sem disabled: nenhum bloqueador
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()

    rerender(<GoogleSignInButton onCredential={vi.fn()} disabled={true} />)
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  it("calls onCredential with the JWT when the GIS callback fires", async () => {
    const onCredential = vi.fn()
    render(<GoogleSignInButton onCredential={onCredential} />)

    await waitFor(() => expect(initialize).toHaveBeenCalled())
    const { callback } = initialize.mock.calls[0][0]

    callback({ credential: "the.id.token" })
    expect(onCredential).toHaveBeenCalledWith("the.id.token")

    // um callback sem credential não dispara nada
    callback({})
    expect(onCredential).toHaveBeenCalledTimes(1)
  })

  it("degrades silently when the GIS script fails to load", async () => {
    loadGsiMock.mockRejectedValue(new Error("blocked"))
    render(<GoogleSignInButton onCredential={vi.fn()} />)
    // não lança; só não renderiza o botão do Google
    await waitFor(() => expect(loadGsiMock).toHaveBeenCalled())
    expect(initialize).not.toHaveBeenCalled()
  })

})
