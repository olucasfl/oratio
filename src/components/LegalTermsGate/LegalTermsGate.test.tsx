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
// Ficam FORA do gate, pra continuarem clicáveis enquanto ele segura o app.
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
      <LegalTermsGate>
        {(cleared) => <div data-testid="app">app:{String(cleared)}</div>}
      </LegalTermsGate>
      <Controls />
      <LocationDisplay />
    </MemoryRouter>,
  )
}

const loc = () => screen.getByTestId("loc")
const app = () => screen.queryByTestId("app")

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  isLoggedInMock.mockReturnValue(true)
})

describe("LegalTermsGate", () => {

  it("segura o app: enquanto a resposta não chega, nada do app monta", async () => {
    let resolve!: (v: unknown) => void
    getProfileMock.mockReturnValue(new Promise((r) => { resolve = r }))

    renderGate()

    expect(screen.getByTestId("legal-gate-checking")).toBeInTheDocument()
    expect(app()).not.toBeInTheDocument()

    resolve({ legalTermsAccepted: true })

    await waitFor(() => expect(app()).toHaveTextContent("app:true"))
  })

  it("não aceito: vai para /oratio/consentimento sem montar o app antes", async () => {
    getProfileMock.mockResolvedValue({ legalTermsAccepted: false })

    renderGate()

    expect(app()).not.toBeInTheDocument()
    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/consentimento"))
    // na tela de consentimento a rota renderiza, mas sem popups nem guia
    expect(app()).toHaveTextContent("app:false")
  })

  it("redireciona também quando legalTermsAccepted vem undefined (backend/cache antigo)", async () => {
    getProfileMock.mockResolvedValue({})

    renderGate()

    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/consentimento"))
  })

  it("aceito: libera o app com cleared=true", async () => {
    getProfileMock.mockResolvedValue({ legalTermsAccepted: true })

    renderGate()

    await waitFor(() => expect(app()).toHaveTextContent("app:true"))
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

    await waitFor(() => expect(app()).toHaveTextContent("app:true"))
    expect(loc()).toHaveTextContent("/oratio/home")
    expect(getProfileMock).toHaveBeenCalledTimes(2)

    fireEvent.click(screen.getByText("outra-rota"))
    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/prayers"))
    fireEvent.click(screen.getByText("entrar"))
    await waitFor(() => expect(loc()).toHaveTextContent("/oratio/profile"))

    expect(app()).toHaveTextContent("app:true")
    expect(getProfileMock).toHaveBeenCalledTimes(2)
  })

  it("falha de rede sem cache: mostra erro, não libera o app, e 'Tentar de novo' consulta outra vez", async () => {
    getProfileMock.mockRejectedValueOnce(new Error("network"))

    renderGate()

    expect(await screen.findByRole("alert")).toHaveTextContent(/Não foi possível verificar sua conta/i)
    expect(app()).not.toBeInTheDocument()
    expect(loc()).toHaveTextContent("/oratio/home")

    getProfileMock.mockResolvedValueOnce({ legalTermsAccepted: true })
    fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }))

    await waitFor(() => expect(app()).toHaveTextContent("app:true"))
    expect(getProfileMock).toHaveBeenCalledTimes(2)
  })

  it("falha de rede com cache de perfil já aceito: libera (PWA offline de quem já aceitou)", async () => {
    localStorage.setItem("oratio-profile", JSON.stringify({ legalTermsAccepted: true }))
    getProfileMock.mockRejectedValueOnce(new Error("network"))

    renderGate()

    await waitFor(() => expect(app()).toHaveTextContent("app:true"))
  })

  it("falha de rede com cache NÃO aceito: não libera", async () => {
    localStorage.setItem("oratio-profile", JSON.stringify({ legalTermsAccepted: false }))
    getProfileMock.mockRejectedValueOnce(new Error("network"))

    renderGate()

    expect(await screen.findByRole("alert")).toBeInTheDocument()
    expect(app()).not.toBeInTheDocument()
  })

  it("visitante deslogado: renderiza o app sem consulta", async () => {
    isLoggedInMock.mockReturnValue(false)

    renderGate(["/oratio/prayers"])

    expect(app()).toHaveTextContent("app:true")
    expect(getProfileMock).not.toHaveBeenCalled()
  })

  it("rotas dos documentos legais ficam de fora (leitura pública, sem popups)", async () => {
    renderGate(["/termos-de-uso"])

    expect(app()).toHaveTextContent("app:false")
    expect(loc()).toHaveTextContent("/termos-de-uso")
    expect(getProfileMock).not.toHaveBeenCalled()
  })

})
