import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/profileService", () => ({ getProfile: vi.fn() }))
vi.mock("../../utils/auth", () => ({ isLoggedIn: vi.fn() }))

import { getProfile } from "../../services/profileService"
import { isLoggedIn } from "../../utils/auth"
import WelcomeGate from "./WelcomeGate"

const getProfileMock = getProfile as unknown as ReturnType<typeof vi.fn>
const isLoggedInMock = isLoggedIn as unknown as ReturnType<typeof vi.fn>

function LocationDisplay(){
  const location = useLocation()
  return <div data-testid="loc">{location.pathname}</div>
}

// Simula o `Login.tsx`: navega por SPA (sem reload) quando clicado.
function FakeLogin(){
  const navigate = useNavigate()
  return <button onClick={() => navigate("/oratio/home")}>entrar</button>
}

function renderGate(initial = "/oratio/home"){
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <WelcomeGate />
      <FakeLogin />
      <LocationDisplay />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  isLoggedInMock.mockReturnValue(true)
})

describe("WelcomeGate", () => {

  it("aparece: redireciona para /oratio/boas-vindas quando showWelcome é true", async () => {
    getProfileMock.mockResolvedValue({ showWelcome: true })

    renderGate()

    await waitFor(() =>
      expect(screen.getByTestId("loc")).toHaveTextContent("/oratio/boas-vindas"),
    )
  })

  it("não volta: nenhum redirect depois do welcome-seen (showWelcome false)", async () => {
    getProfileMock.mockResolvedValue({ showWelcome: false })

    renderGate()

    await waitFor(() => expect(getProfileMock).toHaveBeenCalled())
    // o efeito rodou, a resposta chegou, e a rota continua onde estava
    expect(screen.getByTestId("loc")).toHaveTextContent("/oratio/home")
  })

  it("não pula o consentimento legal quando já está na tela de consentimento", async () => {
    getProfileMock.mockResolvedValue({ showWelcome: true })

    renderGate("/oratio/consentimento")

    await waitFor(() => expect(getProfileMock).not.toHaveBeenCalled())
    expect(screen.getByTestId("loc")).toHaveTextContent("/oratio/consentimento")
  })

  it("cadastro por senha: monta deslogado em /login, loga, e a navegação SPA dispara o redirect", async () => {
    // no boot em /login não há sessão — o efeito roda e não faz nada
    isLoggedInMock.mockReturnValue(false)
    getProfileMock.mockResolvedValue({ showWelcome: true })

    renderGate("/login")

    await waitFor(() => expect(screen.getByTestId("loc")).toHaveTextContent("/login"))
    expect(getProfileMock).not.toHaveBeenCalled()

    // "login": agora há sessão, e o Login.tsx navega por SPA
    isLoggedInMock.mockReturnValue(true)
    fireEvent.click(screen.getByText("entrar"))

    await waitFor(() =>
      expect(screen.getByTestId("loc")).toHaveTextContent("/oratio/boas-vindas"),
    )
    expect(getProfileMock).toHaveBeenCalledTimes(1)
  })

})
