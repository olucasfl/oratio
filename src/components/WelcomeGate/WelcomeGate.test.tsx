import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/profileService", () => ({ getProfile: vi.fn() }))
vi.mock("../../utils/auth", () => ({ isLoggedIn: vi.fn() }))

import { getProfile } from "../../services/profileService"
import { isLoggedIn } from "../../utils/auth"
import WelcomeGate from "./WelcomeGate"
import LegalTermsGate from "../LegalTermsGate/LegalTermsGate"

const getProfileMock = getProfile as unknown as ReturnType<typeof vi.fn>
const isLoggedInMock = isLoggedIn as unknown as ReturnType<typeof vi.fn>

function LocationDisplay(){
  const location = useLocation()
  return <div data-testid="loc">{location.pathname}</div>
}

// Simula o `Login.tsx` (navega por SPA, sem reload), o "Aceitar" da tela de
// consentimento e o "Começar" do guia (os dois navegam pra /oratio/home), e
// uma troca de rota qualquer.
function Controls(){
  const navigate = useNavigate()
  return (
    <>
      <button onClick={() => navigate("/oratio/home")}>entrar</button>
      <button onClick={() => navigate("/oratio/home", { replace: true })}>concluir</button>
      <button onClick={() => navigate("/oratio/prayers")}>outra-rota</button>
      <button onClick={() => navigate(-1)}>voltar</button>
    </>
  )
}

function renderGate(initial = "/oratio/home", { withLegalGate = false } = {}){
  return render(
    <MemoryRouter initialEntries={[initial]}>
      {withLegalGate && <LegalTermsGate />}
      <WelcomeGate />
      <Controls />
      <LocationDisplay />
    </MemoryRouter>,
  )
}

const loc = () => screen.getByTestId("loc")

beforeEach(() => {
  vi.clearAllMocks()
  isLoggedInMock.mockReturnValue(true)
})

describe("WelcomeGate", () => {

  it("aparece: redireciona para /oratio/boas-vindas quando showWelcome é true (termos aceitos)", async () => {
    getProfileMock.mockResolvedValue({ legalTermsAccepted: true, showWelcome: true })

    renderGate()

    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/boas-vindas"))
  })

  it("não volta: nenhum redirect depois do welcome-seen (showWelcome false)", async () => {
    getProfileMock.mockResolvedValue({ legalTermsAccepted: true, showWelcome: false })

    renderGate()

    await waitFor(() => expect(getProfileMock).toHaveBeenCalled())
    expect(loc()).toHaveTextContent("/oratio/home")
  })

  it("avalia uma vez só depois dos termos aceitos: navegações seguintes não consultam de novo", async () => {
    getProfileMock.mockResolvedValue({ legalTermsAccepted: true, showWelcome: false })

    renderGate()

    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByText("outra-rota"))
    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/prayers"))

    expect(getProfileMock).toHaveBeenCalledTimes(1)
  })

  it("não pula o consentimento legal quando já está na tela de consentimento", async () => {
    getProfileMock.mockResolvedValue({ showWelcome: true })

    renderGate("/oratio/consentimento")

    await waitFor(() => expect(getProfileMock).not.toHaveBeenCalled())
    expect(loc()).toHaveTextContent("/oratio/consentimento")
  })

  it("precedência: não redireciona pro guia enquanto legalTermsAccepted !== true", async () => {
    getProfileMock.mockResolvedValue({ legalTermsAccepted: false, showWelcome: true })

    renderGate()

    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1))
    // dá tempo pro .then rodar
    await new Promise((r) => setTimeout(r, 0))
    expect(loc()).toHaveTextContent("/oratio/home")
  })

  it("não se gasta enquanto os termos estão pendentes: depois do aceite avalia showWelcome", async () => {
    getProfileMock.mockResolvedValue({ legalTermsAccepted: false, showWelcome: true })

    renderGate("/oratio/prayers")

    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1))
    await new Promise((r) => setTimeout(r, 0))
    expect(loc()).toHaveTextContent("/oratio/prayers")

    getProfileMock.mockResolvedValue({ legalTermsAccepted: true, showWelcome: true })
    fireEvent.click(screen.getByText("entrar"))

    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/boas-vindas"))
  })

  it("cadastro por senha: monta deslogado em /login, loga, e a navegação SPA dispara o redirect", async () => {
    isLoggedInMock.mockReturnValue(false)
    getProfileMock.mockResolvedValue({ legalTermsAccepted: true, showWelcome: true })

    renderGate("/login")

    await waitFor(() => expect(loc()).toHaveTextContent("/login"))
    expect(getProfileMock).not.toHaveBeenCalled()

    isLoggedInMock.mockReturnValue(true)
    fireEvent.click(screen.getByText("entrar"))

    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/boas-vindas"))
    expect(getProfileMock).toHaveBeenCalledTimes(1)
  })

  describe("com o LegalTermsGate montado antes (ordem do App.tsx)", () => {

    it("conta nova com os dois pendentes: consentimento → guia → Home, nesta ordem", async () => {
      getProfileMock.mockResolvedValue({ legalTermsAccepted: false, showWelcome: true })

      renderGate("/oratio/home", { withLegalGate: true })

      // 1. consentimento vence — o guia não sobrescreve o redirect
      await waitFor(() => expect(loc()).toHaveTextContent("/oratio/consentimento"))
      await new Promise((r) => setTimeout(r, 0))
      expect(loc()).toHaveTextContent("/oratio/consentimento")

      // voltar/sair da tela de consentimento não pula nada
      fireEvent.click(screen.getByText("outra-rota"))
      await waitFor(() => expect(loc()).toHaveTextContent("/oratio/consentimento"))
      await new Promise((r) => setTimeout(r, 0))
      expect(loc()).toHaveTextContent("/oratio/consentimento")

      // 2. aceite (acceptLegalTerms invalidou o memo) → Home → guia
      getProfileMock.mockResolvedValue({ legalTermsAccepted: true, showWelcome: true })
      fireEvent.click(screen.getByText("concluir"))
      await waitFor(() => expect(loc()).toHaveTextContent("/oratio/boas-vindas"))

      // 3. "Começar" no guia → Home, e ninguém redireciona de novo
      getProfileMock.mockResolvedValue({ legalTermsAccepted: true, showWelcome: false })
      fireEvent.click(screen.getByText("concluir"))
      await waitFor(() => expect(loc()).toHaveTextContent("/oratio/home"))
      await new Promise((r) => setTimeout(r, 0))
      expect(loc()).toHaveTextContent("/oratio/home")
    })

  })

})
