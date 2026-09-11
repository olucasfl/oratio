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

function FakeLogin(){
  const navigate = useNavigate()
  return <button onClick={() => navigate("/oratio/home")}>entrar</button>
}

function renderGate(initial = "/oratio/home"){
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <LegalTermsGate />
      <FakeLogin />
      <LocationDisplay />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  isLoggedInMock.mockReturnValue(true)
})

describe("LegalTermsGate", () => {

  it("aparece: redireciona para /oratio/consentimento quando legalTermsAccepted é false", async () => {
    getProfileMock.mockResolvedValue({ legalTermsAccepted: false })

    renderGate()

    await waitFor(() =>
      expect(screen.getByTestId("loc")).toHaveTextContent("/oratio/consentimento"),
    )
  })

  it("aparece: redireciona também quando legalTermsAccepted vem undefined (cache antigo)", async () => {
    getProfileMock.mockResolvedValue({})

    renderGate()

    await waitFor(() =>
      expect(screen.getByTestId("loc")).toHaveTextContent("/oratio/consentimento"),
    )
  })

  it("não redireciona quando legalTermsAccepted é true", async () => {
    getProfileMock.mockResolvedValue({ legalTermsAccepted: true })

    renderGate()

    await waitFor(() => expect(getProfileMock).toHaveBeenCalled())
    expect(screen.getByTestId("loc")).toHaveTextContent("/oratio/home")
  })

  it("reavalia por troca de rota (login por senha, sem reload)", async () => {
    isLoggedInMock.mockReturnValue(false)
    getProfileMock.mockResolvedValue({ legalTermsAccepted: false })

    renderGate("/login")

    await waitFor(() => expect(screen.getByTestId("loc")).toHaveTextContent("/login"))
    expect(getProfileMock).not.toHaveBeenCalled()

    isLoggedInMock.mockReturnValue(true)
    fireEvent.click(screen.getByText("entrar"))

    await waitFor(() =>
      expect(screen.getByTestId("loc")).toHaveTextContent("/oratio/consentimento"),
    )
    expect(getProfileMock).toHaveBeenCalledTimes(1)
  })

  it("falha de rede: não redireciona e libera o checked ref pra tentar de novo", async () => {
    getProfileMock.mockRejectedValueOnce(new Error("network"))

    renderGate()

    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1))
    expect(screen.getByTestId("loc")).toHaveTextContent("/oratio/home")

    getProfileMock.mockResolvedValueOnce({ legalTermsAccepted: false })
    fireEvent.click(screen.getByText("entrar")) // dispara nova navegação (mesmo path só reavalia por deps, então navegamos)

    await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(2))
  })

  it("visitante deslogado: nenhuma rota fora da lista dispara chamada", async () => {
    isLoggedInMock.mockReturnValue(false)

    renderGate("/oratio/prayers")

    await waitFor(() => expect(screen.getByTestId("loc")).toHaveTextContent("/oratio/prayers"))
    expect(getProfileMock).not.toHaveBeenCalled()
  })

  it("rotas dos documentos legais ficam de fora (não intercepta leitura pública)", async () => {
    renderGate("/termos-de-uso")

    await waitFor(() => expect(screen.getByTestId("loc")).toHaveTextContent("/termos-de-uso"))
    expect(getProfileMock).not.toHaveBeenCalled()
  })

})
