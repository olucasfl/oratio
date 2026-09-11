import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/profileService", () => ({ acceptLegalTerms: vi.fn() }))
vi.mock("../../services/authService", () => ({ logout: vi.fn() }))
vi.mock("../TermsOfUseContent/TermsOfUseContent", () => ({
  default: () => <div data-testid="terms-content">Termos de Uso — conteúdo</div>,
}))
vi.mock("../PrivacyPolicyContent/PrivacyPolicyContent", () => ({
  default: () => <div data-testid="privacy-content">Política de Privacidade — conteúdo</div>,
}))
vi.mock("../DeleteAccountModal/DeleteAccountModal", () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="delete-modal">DeleteAccountModal aberto</div> : null,
}))

import { acceptLegalTerms } from "../../services/profileService"
import { logout } from "../../services/authService"
import LegalConsentGate from "./LegalConsentGate"

const acceptLegalTermsMock = acceptLegalTerms as unknown as ReturnType<typeof vi.fn>
const logoutMock = logout as unknown as ReturnType<typeof vi.fn>

function termsCheckbox(){
  return screen.getByRole("checkbox", { name: /Aceito os Termos de Uso/i })
}
function privacyCheckbox(){
  return screen.getByRole("checkbox", { name: /Política de Privacidade/i })
}
function acceptButton(){
  return screen.getByRole("button", { name: /Aceitar e continuar/i })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("LegalConsentGate — gate de habilitação do botão", () => {

  it("nasce com as duas caixas desmarcadas e o botão desabilitado", () => {
    render(<LegalConsentGate mode="pre-account" onAccept={vi.fn()} onDecline={vi.fn()} />)

    expect(termsCheckbox()).not.toBeChecked()
    expect(privacyCheckbox()).not.toBeChecked()
    expect(acceptButton()).toBeDisabled()
  })

  it("continua desabilitado com só uma das duas marcada", () => {
    render(<LegalConsentGate mode="pre-account" onAccept={vi.fn()} onDecline={vi.fn()} />)

    fireEvent.click(termsCheckbox())
    expect(acceptButton()).toBeDisabled()
  })

  it("habilita quando as duas estão marcadas", () => {
    render(<LegalConsentGate mode="pre-account" onAccept={vi.fn()} onDecline={vi.fn()} />)

    fireEvent.click(termsCheckbox())
    fireEvent.click(privacyCheckbox())
    expect(acceptButton()).toBeEnabled()
  })

})

describe("LegalConsentGate — troca de view interna (nunca navegação de rota)", () => {

  it("abre o conteúdo dos Termos ao clicar no link, e Voltar preserva as caixas marcadas", () => {
    render(<LegalConsentGate mode="pre-account" onAccept={vi.fn()} onDecline={vi.fn()} />)

    fireEvent.click(termsCheckbox())
    fireEvent.click(screen.getByRole("button", { name: "Termos de Uso" }))

    expect(screen.getByTestId("terms-content")).toBeInTheDocument()
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Voltar/i }))

    expect(termsCheckbox()).toBeChecked()
    expect(privacyCheckbox()).not.toBeChecked()
  })

  it("abre o conteúdo da Política ao clicar no link", () => {
    render(<LegalConsentGate mode="pre-account" onAccept={vi.fn()} onDecline={vi.fn()} />)

    fireEvent.click(screen.getByRole("button", { name: "Política de Privacidade" }))

    expect(screen.getByTestId("privacy-content")).toBeInTheDocument()
  })

})

describe("LegalConsentGate — mode pre-account", () => {

  it("aceitar chama só onAccept (sem chamar acceptLegalTerms)", () => {
    const onAccept = vi.fn()
    render(<LegalConsentGate mode="pre-account" onAccept={onAccept} onDecline={vi.fn()} />)

    fireEvent.click(termsCheckbox())
    fireEvent.click(privacyCheckbox())
    fireEvent.click(acceptButton())

    expect(onAccept).toHaveBeenCalledTimes(1)
    expect(acceptLegalTermsMock).not.toHaveBeenCalled()
  })

  it("recusar chama onDecline, sem revelar nenhuma saída", () => {
    const onDecline = vi.fn()
    render(<LegalConsentGate mode="pre-account" onAccept={vi.fn()} onDecline={onDecline} />)

    fireEvent.click(screen.getByRole("button", { name: "Recusar" }))

    expect(onDecline).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(/Sair do app/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Excluir minha conta/i)).not.toBeInTheDocument()
  })

})

describe("LegalConsentGate — mode post-account", () => {

  it("aceitar chama acceptLegalTerms() e SÓ ENTÃO onAccept()", async () => {
    const onAccept = vi.fn()
    acceptLegalTermsMock.mockResolvedValue({ ok: true })

    render(
      <LegalConsentGate
        mode="post-account"
        onAccept={onAccept}
        onDecline={vi.fn()}
        userEmail="usuario@exemplo.com"
        hasPassword={true}
      />,
    )

    fireEvent.click(termsCheckbox())
    fireEvent.click(privacyCheckbox())
    fireEvent.click(acceptButton())

    await waitFor(() => expect(onAccept).toHaveBeenCalledTimes(1))
    expect(acceptLegalTermsMock).toHaveBeenCalledTimes(1)
  })

  it("aceitar mostra erro inline e NÃO chama onAccept quando a chamada falha", async () => {
    const onAccept = vi.fn()
    acceptLegalTermsMock.mockRejectedValue(new Error("network"))

    render(
      <LegalConsentGate
        mode="post-account"
        onAccept={onAccept}
        onDecline={vi.fn()}
        userEmail="usuario@exemplo.com"
        hasPassword={true}
      />,
    )

    fireEvent.click(termsCheckbox())
    fireEvent.click(privacyCheckbox())
    fireEvent.click(acceptButton())

    await waitFor(() => expect(acceptLegalTermsMock).toHaveBeenCalledTimes(1))
    expect(onAccept).not.toHaveBeenCalled()
    expect(await screen.findByText(/Não foi possível conectar/i)).toBeInTheDocument()
  })

  it("recusar NUNCA chama onDecline — só revela as duas saídas", () => {
    const onDecline = vi.fn()
    render(
      <LegalConsentGate
        mode="post-account"
        onAccept={vi.fn()}
        onDecline={onDecline}
        userEmail="usuario@exemplo.com"
        hasPassword={true}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Recusar" }))

    expect(onDecline).not.toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "Sair do app" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Excluir minha conta" })).toBeInTheDocument()
  })

  it("'Sair do app' chama logout()", () => {
    render(
      <LegalConsentGate
        mode="post-account"
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        userEmail="usuario@exemplo.com"
        hasPassword={true}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Recusar" }))
    fireEvent.click(screen.getByRole("button", { name: "Sair do app" }))

    expect(logoutMock).toHaveBeenCalledTimes(1)
  })

  it("'Excluir minha conta' abre o DeleteAccountModal (mockado)", () => {
    render(
      <LegalConsentGate
        mode="post-account"
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        userEmail="usuario@exemplo.com"
        hasPassword={true}
        hasGoogle={false}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Recusar" }))
    expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Excluir minha conta" }))
    expect(screen.getByTestId("delete-modal")).toBeInTheDocument()
  })

})
