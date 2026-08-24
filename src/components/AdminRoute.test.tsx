import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { describe, it, expect, vi } from "vitest"

vi.mock("../services/profileService", () => ({ getProfile: vi.fn() }))

import { getProfile } from "../services/profileService"
import AdminRoute from "./AdminRoute"

const getProfileMock = getProfile as unknown as ReturnType<typeof vi.fn>

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin" element={<AdminRoute><div>Painel Admin</div></AdminRoute>} />
        <Route path="/oratio/home" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("AdminRoute", () => {

  it("renders nothing while the profile check is still in flight", () => {
    getProfileMock.mockReturnValue(new Promise(() => {}))
    const { container } = renderAt("/admin")

    expect(container).toBeEmptyDOMElement()
  })

  it("renders the admin content once the profile confirms isAdmin", async () => {
    getProfileMock.mockResolvedValue({ isAdmin: true })
    renderAt("/admin")

    expect(await screen.findByText("Painel Admin")).toBeInTheDocument()
  })

  it("redirects to /oratio/home when the profile says isAdmin is false", async () => {
    getProfileMock.mockResolvedValue({ isAdmin: false })
    renderAt("/admin")

    expect(await screen.findByText("Home")).toBeInTheDocument()
  })

  it("redirects to /oratio/home (fails closed) when the profile fetch errors out", async () => {
    getProfileMock.mockRejectedValue(new Error("network down"))
    renderAt("/admin")

    expect(await screen.findByText("Home")).toBeInTheDocument()
  })

})
