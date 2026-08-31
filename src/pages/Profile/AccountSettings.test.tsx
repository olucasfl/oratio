import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../components/ChangePasswordModal/ChangePasswordModal", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>password-modal</div> : null),
}))
vi.mock("../../components/ChangeEmailModal/ChangeEmailModal", () => ({
  default: ({ open, onRequested }: { open: boolean; onRequested: (e: string) => void }) =>
    open ? <button onClick={() => onRequested("novo@x.com")}>email-modal</button> : null,
}))

import AccountSettings from "./AccountSettings"

function renderSettings() {
  return render(<MemoryRouter><AccountSettings /></MemoryRouter>)
}

beforeEach(() => vi.clearAllMocks())

describe("AccountSettings", () => {

  it("opens the change-password modal", () => {
    renderSettings()
    fireEvent.click(screen.getByRole("button", { name: /Trocar senha/ }))
    expect(screen.getByText("password-modal")).toBeInTheDocument()
  })

  it("opens the change-email modal and shows the confirmation banner once requested", () => {
    renderSettings()
    fireEvent.click(screen.getByRole("button", { name: /Trocar email/ }))
    fireEvent.click(screen.getByText("email-modal"))
    expect(screen.getByText("Enviamos um link de confirmação para novo@x.com.")).toBeInTheDocument()
  })

  it("goes back to the profile", () => {
    renderSettings()
    fireEvent.click(screen.getAllByRole("button")[0]) // seta de voltar (só ícone)
    expect(navigateMock).toHaveBeenCalledWith("/oratio/profile")
  })

})
