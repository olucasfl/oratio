import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/profileService", () => ({ getProfile: vi.fn() }))
vi.mock("../../utils/auth", () => ({ isLoggedIn: vi.fn() }))

import { getProfile } from "../../services/profileService"
import { isLoggedIn } from "../../utils/auth"
import LegalTermsGate from "./LegalTermsGate"

const getProfileMock = getProfile as unknown as ReturnType<typeof vi.fn>
const isLoggedInMock = isLoggedIn as unknown as ReturnType<typeof vi.fn>

function LocationDisplay(){
  const location = useLocation()
  return <div data-testid="loc">{location.pathname}</div>
}

// Botões que simulam navegação SPA: login, "Aceitar" da tela de consentimento
// (que navega pra /oratio/home), outra rota qualquer, e o botão voltar.
function Controls(){
  const navigate = useNavigate()
  return (
    <>
      <button onClick={() => navigate("/oratio/profile")}>entrar</button>
      <button onClick={() => navigate("/oratio/home", { replace: true })}>aceitar</button>
      <button onClick={() => navigate("/oratio/prayers")}>outra-rota</button>
      <button onClick={() => navigate(-1)}>voltar</button>
    </>
  )
}

function renderGate(initialEntries: string[] = ["/oratio/home"]){
  return render(
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialEntries.length - 1}>
      <LegalTermsGate />
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

describe("LegalTermsGate", () => {

  it("aparece: redireciona para /oratio/consentimento quando legalTermsAccepted é false", async () => {
    getProfileMock.mockResolvedValue({ legalTermsAccepted: false })

    renderGate()

    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/consentimento"))
  })

  it("aparece: redireciona também quando legalTermsAccepted vem undefined (cache antigo)", async () => {
    getProfileMock.mockResolvedValue({})

    renderGate()

    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/consentimento"))
  })

  it("não redireciona quando legalTermsAccepted é true", async () => {
    getProfileMock.mockResolvedValue({ legalTermsAccepted: true })

    renderGate()

    await waitFor(() => expect(getProfileMock).toHaveBeenCalled())
    expect(loc()).toHaveTextContent("/oratio/home")
  })

  it("reavalia por troca de rota (login por senha, sem reload)", async () => {
    isLoggedInMock.mockReturnValue(false)
    getProfileMock.mockResolvedValue({ legalTermsAccepted: false })

    renderGate(["/login"])

    await waitFor(() => expect(loc()).toHaveTextContent("/login"))
    expect(getProfileMock).not.toHaveBeenCalled()

    isLoggedInMock.mockReturnValue(true)
    fireEvent.click(screen.getByText("entrar"))

    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/consentimento"))
    expect(getProfileMock).toHaveBeenCalledTimes(1)
  })

  it("não é pulável: voltar da tela de consentimento redireciona de novo", async () => {
    getProfileMock.mockResolvedValue({ legalTermsAccepted: false })

    // histórico: /oratio/home → /oratio/prayers (onde o gate intercepta)
    renderGate(["/oratio/home", "/oratio/prayers"])

    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/consentimento"))

    fireEvent.click(screen.getByText("voltar"))

    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/consentimento"))
  })

  it("não é pulável: navegar da tela de consentimento para outra rota redireciona de novo", async () => {
    getProfileMock.mockResolvedValue({ legalTermsAccepted: false })

    renderGate()

    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/consentimento"))

    fireEvent.click(screen.getByText("outra-rota"))

    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/consentimento"))
  })

  it("depois do aceite: sem loop, para de redirecionar e de consultar", async () => {
    getProfileMock.mockResolvedValue({ legalTermsAccepted: false })

    renderGate()

    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/consentimento"))
    expect(getProfileMock).toHaveBeenCalledTimes(1)

    // acceptLegalTerms() invalidou o memo — o próximo GET já vem aceito
    getProfileMock.mockResolvedValue({ legalTermsAccepted: true })
    fireEvent.click(screen.getByText("aceitar"))

    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(2))
    expect(loc()).toHaveTextContent("/oratio/home")

    fireEvent.click(screen.getByText("outra-rota"))
    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/prayers"))
    fireEvent.click(screen.getByText("entrar"))
    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/profile"))

    expect(getProfileMock).toHaveBeenCalledTimes(2)
  })

  it("falha de rede: não redireciona e tenta de novo na próxima navegação", async () => {
    getProfileMock.mockRejectedValueOnce(new Error("network"))

    renderGate()

    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1))
    expect(loc()).toHaveTextContent("/oratio/home")

    getProfileMock.mockResolvedValueOnce({ legalTermsAccepted: false })
    fireEvent.click(screen.getByText("entrar"))

    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/consentimento"))
  })

  it("visitante deslogado: nenhuma rota fora da lista dispara chamada", async () => {
    isLoggedInMock.mockReturnValue(false)

    renderGate(["/oratio/prayers"])

    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/prayers"))
    expect(getProfileMock).not.toHaveBeenCalled()
  })

  it("rotas dos documentos legais ficam de fora (não intercepta leitura pública)", async () => {
    renderGate(["/termos-de-uso"])

    await waitFor(() => expect(loc()).toHaveTextContent("/termos-de-uso"))
    expect(getProfileMock).not.toHaveBeenCalled()
  })

})
