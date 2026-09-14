import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { describe, it, expect } from "vitest"

import useBackOrHome from "./useBackOrHome"

function LocationDisplay(){
  const location = useLocation()
  return <div data-testid="loc">{location.pathname}</div>
}

function LegalPage(){
  const goBack = useBackOrHome()
  return <button onClick={goBack}>voltar</button>
}

function OtherPage(){
  const navigate = useNavigate()
  return <button onClick={() => navigate("/termos-de-uso")}>abrir-termos</button>
}

function renderAt(initial: string){
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/termos-de-uso" element={<LegalPage />} />
        <Route path="*" element={<OtherPage />} />
      </Routes>
      <LocationDisplay />
    </MemoryRouter>,
  )
}

describe("useBackOrHome", () => {

  it("aberta por link direto (sem histórico do app): voltar leva para /oratio/home", async () => {
    renderAt("/termos-de-uso")

    fireEvent.click(screen.getByText("voltar"))

    await waitFor(() => expect(screen.getByTestId("loc")).toHaveTextContent("/oratio/home"))
  })

  it("aberta de dentro do app: voltar volta para a tela anterior", async () => {
    renderAt("/oratio/profile")

    fireEvent.click(screen.getByText("abrir-termos"))
    await waitFor(() => expect(screen.getByTestId("loc")).toHaveTextContent("/termos-de-uso"))

    fireEvent.click(screen.getByText("voltar"))

    await waitFor(() => expect(screen.getByTestId("loc")).toHaveTextContent("/oratio/profile"))
  })

})
