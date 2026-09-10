import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/profileService", () => ({ getProfile: vi.fn() }))
vi.mock("../../utils/auth", () => ({ isLoggedIn: vi.fn(() => true) }))

import { getProfile } from "../../services/profileService"
import WelcomeGate from "./WelcomeGate"

const getProfileMock = getProfile as unknown as ReturnType<typeof vi.fn>

function LocationDisplay(){
  const location = useLocation()
  return <div data-testid="loc">{location.pathname}</div>
}

function renderGate(){
  return render(
    <MemoryRouter initialEntries={["/oratio/home"]}>
      <WelcomeGate />
      <LocationDisplay />
    </MemoryRouter>,
  )
}

beforeEach(() => vi.clearAllMocks())

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

})
