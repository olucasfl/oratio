import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/profileService", () => ({ getProfile: vi.fn() }))

// O gate real puxa DeleteAccountModal, GIS etc. — aqui só importa que ele
// aparece com os dados do perfil.
vi.mock("../../components/LegalConsentGate/LegalConsentGate", () => ({
  default: ({ userEmail }: { userEmail: string }) => <div>gate-consentimento:{userEmail}</div>,
}))

import { getProfile } from "../../services/profileService"
import LegalConsent from "./LegalConsent"

const getProfileMock = getProfile as unknown as ReturnType<typeof vi.fn>

function renderPage(){
  return render(
    <MemoryRouter initialEntries={["/oratio/consentimento"]}>
      <LegalConsent />
    </MemoryRouter>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe("LegalConsent", () => {

  it("renderiza o LegalConsentGate com o perfil carregado", async () => {
    getProfileMock.mockResolvedValue({ email: "usuario@exemplo.com", hasPassword: true })

    renderPage()

    expect(await screen.findByText("gate-consentimento:usuario@exemplo.com")).toBeInTheDocument()
  })

  it("falha ao carregar o perfil: mostra erro com 'Tentar de novo' em vez de spinner eterno", async () => {
    getProfileMock.mockRejectedValueOnce(new Error("network"))

    renderPage()

    expect(await screen.findByRole("button", { name: "Tentar de novo" })).toBeInTheDocument()
    expect(screen.getByText(/Não foi possível carregar/)).toBeInTheDocument()
    expect(screen.queryByText(/gate-consentimento/)).not.toBeInTheDocument()
  })

  it("'Tentar de novo' refaz a busca e, com sucesso, renderiza o gate", async () => {
    getProfileMock.mockRejectedValueOnce(new Error("network"))

    renderPage()

    const retry = await screen.findByRole("button", { name: "Tentar de novo" })

    getProfileMock.mockResolvedValueOnce({ email: "usuario@exemplo.com", hasPassword: false })
    fireEvent.click(retry)

    expect(await screen.findByText("gate-consentimento:usuario@exemplo.com")).toBeInTheDocument()
    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(2))
    expect(screen.queryByRole("button", { name: "Tentar de novo" })).not.toBeInTheDocument()
  })

})
