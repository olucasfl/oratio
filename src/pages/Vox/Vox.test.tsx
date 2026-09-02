import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}))

vi.mock("../../services/voxService", () => ({
  deleteConversation: vi.fn(),
  renameConversation: vi.fn(),
  askVoxStream: vi.fn(),
  createConversation: vi.fn(),
  getConversations: vi.fn(),
  getMessages: vi.fn(),
  getBootstrap: vi.fn(),
  getVoxProfiles: vi.fn(),
  setVoxProfile: vi.fn(),
  dismissVoxIntro: vi.fn(),
}))

vi.mock("../../hooks/useLiturgy", () => ({
  useLiturgy: () => ({ liturgy: null, loadingLiturgy: false }),
}))

import {
  getBootstrap, getMessages, getConversations, createConversation,
  askVoxStream, deleteConversation,
  getVoxProfiles, setVoxProfile, dismissVoxIntro,
} from "../../services/voxService"
import Vox from "./Vox"

const m = {
  bootstrap: getBootstrap as unknown as ReturnType<typeof vi.fn>,
  messages: getMessages as unknown as ReturnType<typeof vi.fn>,
  conversations: getConversations as unknown as ReturnType<typeof vi.fn>,
  create: createConversation as unknown as ReturnType<typeof vi.fn>,
  stream: askVoxStream as unknown as ReturnType<typeof vi.fn>,
  del: deleteConversation as unknown as ReturnType<typeof vi.fn>,
  profiles: getVoxProfiles as unknown as ReturnType<typeof vi.fn>,
  setProfile: setVoxProfile as unknown as ReturnType<typeof vi.fn>,
  dismissIntro: dismissVoxIntro as unknown as ReturnType<typeof vi.fn>,
}

const PROFILES = [
  { key: "DEFAULT", label: "Padrão", short: "Equilibrado.", details: "", examples: [] },
  { key: "DIRECT", label: "Direto ao ponto", short: "Curto.", details: "", examples: [] },
]

const CONV = {
  id: "c1", title: "Sobre a fé", hasMessages: true,
  updatedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
}

function renderVox() {
  return render(<MemoryRouter><Vox /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  m.bootstrap.mockResolvedValue({ active: { id: "c1" }, conversations: [CONV] })
  m.messages.mockResolvedValue([
    { id: "u1", role: "user", content: "O que é a graça?", createdAt: "2026-02-01T10:00:00Z", status: "sent" },
    { id: "a1", role: "assistant", content: "A graça é um dom de Deus.", createdAt: "2026-02-01T10:00:05Z" },
  ])
  m.conversations.mockResolvedValue([CONV])
  m.create.mockResolvedValue({ id: "c2" })
  m.del.mockResolvedValue(undefined)
  m.profiles.mockResolvedValue(PROFILES)
  m.setProfile.mockResolvedValue({ profile: "DIRECT" })
  m.dismissIntro.mockResolvedValue({ ok: true })
})

describe("Vox", () => {

  it("bootstraps and renders the active conversation's messages", async () => {
    renderVox()
    expect(await screen.findByText("O que é a graça?")).toBeInTheDocument()
    expect(screen.getByText("A graça é um dom de Deus.")).toBeInTheDocument()
  })

  it("shows an error when the bootstrap fails", async () => {
    m.bootstrap.mockResolvedValue({ error: true })
    renderVox()
    expect(await screen.findByText("Não foi possível carregar suas conversas.")).toBeInTheDocument()
  })

  it("prefills the input with a draft passed via navigation state and clears that state", async () => {
    const draft = 'João 3,16 — "Porque Deus amou o mundo…"\n\nO que este versículo quer me dizer?'
    render(
      <MemoryRouter initialEntries={[{ pathname: "/oratio/vox", state: { draft } }]}>
        <Vox />
      </MemoryRouter>,
    )

    const box = await screen.findByDisplayValue(/O que este versículo quer me dizer/)
    expect((box as HTMLTextAreaElement).value).toBe(draft)
    expect(navigateMock).toHaveBeenCalledWith("/oratio/vox", { replace: true, state: null })
  })

  it("does not prefill anything when there is no draft", async () => {
    renderVox()
    await screen.findByText("O que é a graça?")
    expect(navigateMock).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ state: null }),
    )
  })

  it("creates a new conversation", async () => {
    renderVox()
    await screen.findByText("O que é a graça?")
    m.messages.mockResolvedValue([])
    fireEvent.click(screen.getByRole("button", { name: /Nova conversa/ }))
    await waitFor(() => expect(m.create).toHaveBeenCalled())
    await waitFor(() => expect(m.messages).toHaveBeenLastCalledWith("c2"))
  })

  it("sends a message and streams the assistant reply", async () => {
    m.stream.mockImplementation(async (_text: string, _id: string, onDelta: (c: string) => void) => {
      onDelta("Deus ")
      onDelta("é amor.")
      return { success: true }
    })
    renderVox()
    await screen.findByText("O que é a graça?")

    fireEvent.change(screen.getByLabelText("Digite sua pergunta para o Vox"), {
      target: { value: "Quem é Deus?" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }))

    await waitFor(() =>
      expect(m.stream).toHaveBeenCalledWith("Quem é Deus?", "c1", expect.any(Function)),
    )
    expect(
      await screen.findByText("Deus é amor.", {}, { timeout: 4000 }),
    ).toBeInTheDocument()
  })

  it("surfaces the error copy when the stream reports a failure", async () => {
    m.stream.mockResolvedValue({ success: false, error: "LIMIT_EXCEEDED" })
    renderVox()
    await screen.findByText("O que é a graça?")

    fireEvent.change(screen.getByLabelText("Digite sua pergunta para o Vox"), {
      target: { value: "Mais uma" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }))

    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument())
  })

  it("deletes a conversation after confirmation", async () => {
    renderVox()
    await screen.findByText("O que é a graça?")

    fireEvent.click(screen.getByRole("button", { name: /Apagar conversa/ }))
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar" }))
    await waitFor(() => expect(m.del).toHaveBeenCalledWith("c1"))
  })

  describe("perfis de resposta", () => {

    it("opens the settings panel from the gear and switches profile (with a chat marker)", async () => {
      renderVox()
      await screen.findByText("O que é a graça?")

      fireEvent.click(screen.getByRole("button", { name: "Configurações do Vox" }))

      const directCard = await screen.findByText("Direto ao ponto")
      fireEvent.click(directCard)

      await waitFor(() => expect(m.setProfile).toHaveBeenCalledWith("DIRECT"))
      expect(await screen.findByText("Perfil alterado para Direto ao ponto")).toBeInTheDocument()
    })

    it("reverts the selection when the profile switch fails", async () => {
      m.setProfile.mockResolvedValue(null)
      renderVox()
      await screen.findByText("O que é a graça?")

      fireEvent.click(screen.getByRole("button", { name: "Configurações do Vox" }))
      fireEvent.click(await screen.findByText("Direto ao ponto"))

      expect(await screen.findByRole("alert")).toHaveTextContent(/não foi possível trocar/i)
      expect(screen.queryByText(/Perfil alterado para/)).not.toBeInTheDocument()
    })

    it("shows the intro modal only when bootstrap says so", async () => {
      m.bootstrap.mockResolvedValue({
        active: { id: "c1" }, conversations: [CONV],
        profile: null, showVoxIntro: true,
      })
      renderVox()

      expect(await screen.findByText("Escolha como o Vox responde")).toBeInTheDocument()
    })

    it("does not show the intro modal when a profile is already set", async () => {
      m.bootstrap.mockResolvedValue({
        active: { id: "c1" }, conversations: [CONV],
        profile: "STUDY", showVoxIntro: false,
      })
      renderVox()
      await screen.findByText("O que é a graça?")

      expect(screen.queryByText("Escolha como o Vox responde")).not.toBeInTheDocument()
    })

    it("'Depois' dismisses the intro via the API without choosing a profile", async () => {
      m.bootstrap.mockResolvedValue({
        active: { id: "c1" }, conversations: [CONV],
        profile: null, showVoxIntro: true,
      })
      renderVox()

      fireEvent.click(await screen.findByRole("button", { name: "Depois" }))

      await waitFor(() => expect(m.dismissIntro).toHaveBeenCalled())
      expect(m.setProfile).not.toHaveBeenCalled()
      expect(screen.queryByText("Escolha como o Vox responde")).not.toBeInTheDocument()
    })

    it("points at the gear right after the intro is dismissed", async () => {
      m.bootstrap.mockResolvedValue({
        active: { id: "c1" }, conversations: [CONV],
        profile: null, showVoxIntro: true,
      })
      renderVox()

      fireEvent.click(await screen.findByRole("button", { name: "Depois" }))

      expect(await screen.findByText(/Aqui você troca o estilo de resposta/)).toBeInTheDocument()

      fireEvent.click(screen.getByRole("button", { name: "Entendi" }))
      expect(screen.queryByText(/Aqui você troca o estilo de resposta/)).not.toBeInTheDocument()
    })

  })

})
