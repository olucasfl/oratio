import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { describe, it, expect, beforeEach } from "vitest"
import ProtectedRoute from "./ProtectedRoute"

beforeEach(() => {
  localStorage.clear()
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/protegida"
          element={<ProtectedRoute><div>Conteúdo protegido</div></ProtectedRoute>}
        />
        <Route path="/login" element={<div>Tela de login</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("ProtectedRoute", () => {

  it("redirects to /login when there is no access_token", () => {
    renderAt("/protegida")
    expect(screen.getByText("Tela de login")).toBeInTheDocument()
  })

  it("renders the protected content when an access_token is present", () => {
    localStorage.setItem("access_token", "tok")
    renderAt("/protegida")
    expect(screen.getByText("Conteúdo protegido")).toBeInTheDocument()
  })

})
