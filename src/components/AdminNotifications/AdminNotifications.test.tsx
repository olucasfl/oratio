import { render, screen, fireEvent, waitFor, within } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../services/adminNotificationsService", () => ({
  sendNotification: vi.fn(),
  listCampaigns: vi.fn(),
  getSubscribers: vi.fn(),
  getRules: vi.fn(),
  updateRule: vi.fn(),
  createRule: vi.fn(),
  deleteRule: vi.fn(),
  deleteCampaign: vi.fn(),
  deleteAllCampaigns: vi.fn(),
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
  getVariants: vi.fn(),
  createVariant: vi.fn(),
  updateVariant: vi.fn(),
  deleteVariant: vi.fn(),
}))

vi.mock("../../services/adminService", () => ({
  getAllUsers: vi.fn(),
}))

import {
  sendNotification,
  listCampaigns,
  getSubscribers,
  getRules,
  updateRule,
  deleteCampaign,
  deleteAllCampaigns,
  getSettings,
  updateSettings,
  getVariants,
  createVariant,
  updateVariant,
  deleteVariant,
} from "../../services/adminNotificationsService"
import { getAllUsers } from "../../services/adminService"
import AdminNotifications from "./AdminNotifications"

const sendNotificationMock = sendNotification as unknown as ReturnType<typeof vi.fn>
const listCampaignsMock = listCampaigns as unknown as ReturnType<typeof vi.fn>
const getSubscribersMock = getSubscribers as unknown as ReturnType<typeof vi.fn>
const getRulesMock = getRules as unknown as ReturnType<typeof vi.fn>
const updateRuleMock = updateRule as unknown as ReturnType<typeof vi.fn>
const deleteCampaignMock = deleteCampaign as unknown as ReturnType<typeof vi.fn>
const deleteAllCampaignsMock = deleteAllCampaigns as unknown as ReturnType<typeof vi.fn>
const getSettingsMock = getSettings as unknown as ReturnType<typeof vi.fn>
const updateSettingsMock = updateSettings as unknown as ReturnType<typeof vi.fn>
const getVariantsMock = getVariants as unknown as ReturnType<typeof vi.fn>
const createVariantMock = createVariant as unknown as ReturnType<typeof vi.fn>
const updateVariantMock = updateVariant as unknown as ReturnType<typeof vi.fn>
const deleteVariantMock = deleteVariant as unknown as ReturnType<typeof vi.fn>
const getAllUsersMock = getAllUsers as unknown as ReturnType<typeof vi.fn>

const VARIANT = (over = {}) => ({
  id: "vt1", ruleKey: "ROSARY_UNFINISHED", title: "Volte para terminar seu Terço",
  body: "Você começou um terço e não terminou.", url: null, enabled: true, order: 0, ...over,
})

const SETTINGS = {
  maxPerDay: 2,
  maxNudgesPerDay: 1,
  quietStart: 22,
  quietEnd: 7,
  spacingHours: 6,
  restGapEnabled: true,
  urgentThreshold: 80,
}

const RULE = {
  key: "ROSARY_UNFINISHED",
  enabled: true,
  title: "Volte para terminar seu Terço",
  body: "Você começou um terço e não terminou.",
  url: "/oratio/rosary",
  hour: 18,
  condition: "ROSARY_UNFINISHED",
  thresholdDays: null,
  band: "AFTERNOON",
}

const BIBLE_RULE = {
  key: "BIBLE_RESUME",
  enabled: true,
  title: "Continue sua leitura",
  body: "Você parou em {label}.",
  url: "/oratio/biblia",
  hour: 9,
  condition: "BIBLE_RESUME",
  thresholdDays: 3,
  band: "MORNING",
}

function setupDefaults() {
  listCampaignsMock.mockResolvedValue([])
  getSubscribersMock.mockResolvedValue({ totalUsers: 10, subscribedUsers: 4 })
  getRulesMock.mockResolvedValue([RULE])
  getSettingsMock.mockResolvedValue({ ...SETTINGS })
  getVariantsMock.mockResolvedValue([VARIANT()])
  getAllUsersMock.mockResolvedValue([
    { id: "u1", name: "Ana", email: "ana@example.com" },
    { id: "u2", name: "Beto", email: "beto@example.com" },
  ])
}

beforeEach(() => {
  vi.clearAllMocks()
  setupDefaults()
})

describe("AdminNotifications", () => {

  it("loads campaigns, subscriber counts and rules on mount", async () => {
    render(<AdminNotifications />)

    await waitFor(() => expect(screen.getByText("10 usuários")).toBeInTheDocument())
    expect(screen.getByText("4 com push ativo")).toBeInTheDocument()
    expect(await screen.findByText("Terço não terminado")).toBeInTheDocument()
  })

  it("blocks sending without a title", async () => {
    render(<AdminNotifications />)
    await screen.findByText("Terço não terminado")

    fireEvent.click(screen.getByText("Enviar notificação"))

    expect(await screen.findByText("Dê um título à notificação.")).toBeInTheDocument()
    expect(sendNotificationMock).not.toHaveBeenCalled()
  })

  it("blocks sending to specific people with none selected", async () => {
    render(<AdminNotifications />)
    await screen.findByText("Terço não terminado")

    fireEvent.change(screen.getByPlaceholderText("Ex.: Novidade no Oratio ✝️"), {
      target: { value: "Aviso" },
    })
    fireEvent.click(screen.getByText("Escolher pessoas"))
    fireEvent.click(screen.getByText("Enviar notificação"))

    expect(await screen.findByText("Selecione ao menos uma pessoa.")).toBeInTheDocument()
    expect(sendNotificationMock).not.toHaveBeenCalled()
  })

  it("sends to ALL, shows the targeted count, and clears the form", async () => {
    sendNotificationMock.mockResolvedValue({ id: "c1", targeted: 10 })
    render(<AdminNotifications />)
    await screen.findByText("Terço não terminado")

    const titleInput = screen.getByPlaceholderText("Ex.: Novidade no Oratio ✝️")
    fireEvent.change(titleInput, { target: { value: "Aviso geral" } })
    fireEvent.click(screen.getByText("Enviar notificação"))

    expect(await screen.findByText(/Enviada para 10 pessoa\(s\)/)).toBeInTheDocument()
    expect(sendNotificationMock).toHaveBeenCalledWith({
      title: "Aviso geral",
      body: undefined,
      url: undefined,
      audience: "ALL",
      userIds: undefined,
    })
    expect((titleInput as HTMLInputElement).value).toBe("")
  })

  it("loads users only after switching to 'Escolher pessoas', and sends with the selected ids", async () => {
    sendNotificationMock.mockResolvedValue({ id: "c1", targeted: 1 })
    render(<AdminNotifications />)
    await screen.findByText("Terço não terminado")

    expect(getAllUsersMock).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText("Escolher pessoas"))
    await screen.findByText("Ana")
    expect(getAllUsersMock).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByText("Ana"))
    fireEvent.change(screen.getByPlaceholderText("Ex.: Novidade no Oratio ✝️"), {
      target: { value: "Só pra você" },
    })
    fireEvent.click(screen.getByText("Enviar notificação"))

    await waitFor(() => expect(sendNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ audience: "SPECIFIC", userIds: ["u1"] }),
    ))
  })

  it("deleting a campaign asks for confirmation and removes it from the list on confirm", async () => {
    listCampaignsMock.mockResolvedValue([
      { id: "c1", title: "Campanha A", body: null, url: null, audience: "ALL", createdAt: "2026-01-01", targeted: 5, pushSent: 5, pushFailed: 0 },
    ])
    deleteCampaignMock.mockResolvedValue({ ok: true })
    vi.spyOn(window, "confirm").mockReturnValue(true)

    render(<AdminNotifications />)
    await screen.findByText("Campanha A")

    fireEvent.click(screen.getByLabelText("Apagar envio"))

    await waitFor(() => expect(screen.queryByText("Campanha A")).not.toBeInTheDocument())
    expect(deleteCampaignMock).toHaveBeenCalledWith("c1")
  })

  it("does not delete a campaign when confirmation is declined", async () => {
    listCampaignsMock.mockResolvedValue([
      { id: "c1", title: "Campanha A", body: null, url: null, audience: "ALL", createdAt: "2026-01-01", targeted: 5, pushSent: 5, pushFailed: 0 },
    ])
    vi.spyOn(window, "confirm").mockReturnValue(false)

    render(<AdminNotifications />)
    await screen.findByText("Campanha A")

    fireEvent.click(screen.getByLabelText("Apagar envio"))

    expect(deleteCampaignMock).not.toHaveBeenCalled()
    expect(screen.getByText("Campanha A")).toBeInTheDocument()
  })

  it("deleting all campaigns clears the whole list on confirm", async () => {
    listCampaignsMock.mockResolvedValue([
      { id: "c1", title: "Campanha A", body: null, url: null, audience: "ALL", createdAt: "2026-01-01", targeted: 5, pushSent: 5, pushFailed: 0 },
    ])
    deleteAllCampaignsMock.mockResolvedValue({ ok: true })
    vi.spyOn(window, "confirm").mockReturnValue(true)

    render(<AdminNotifications />)
    await screen.findByText("Campanha A")

    fireEvent.click(screen.getByText("Apagar todas"))

    await waitFor(() => expect(screen.queryByText("Campanha A")).not.toBeInTheDocument())
    expect(deleteAllCampaignsMock).toHaveBeenCalledTimes(1)
  })

  it("toggling a rule updates optimistically and persists via updateRule", async () => {
    updateRuleMock.mockResolvedValue({ ...RULE, enabled: false })
    render(<AdminNotifications />)
    await screen.findByText("Terço não terminado")

    const toggle = screen.getByRole("switch", { name: "Ligar/desligar" })
    expect(toggle).toHaveAttribute("aria-checked", "true")

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute("aria-checked", "false")
    await waitFor(() => expect(updateRuleMock).toHaveBeenCalledWith("ROSARY_UNFINISHED", { enabled: false }))
  })

  it("reverts the optimistic toggle when the update fails", async () => {
    updateRuleMock.mockRejectedValue(new Error("network down"))
    render(<AdminNotifications />)
    await screen.findByText("Terço não terminado")

    const toggle = screen.getByRole("switch", { name: "Ligar/desligar" })
    fireEvent.click(toggle)

    await waitFor(() => expect(toggle).toHaveAttribute("aria-checked", "true"))
  })

  it("loads the frequency settings and renders the editable knobs", async () => {
    render(<AdminNotifications />)

    expect(await screen.findByText("Ajustes de frequência")).toBeInTheDocument()
    const maxPerDay = screen.getByLabelText("Máx. por dia") as HTMLInputElement
    expect(maxPerDay.value).toBe("2")
    expect((screen.getByLabelText("Início do silêncio") as HTMLInputElement).value).toBe("22")
    expect(screen.getByRole("switch", { name: "Gap de descanso" })).toHaveAttribute("aria-checked", "true")
  })

  it("edits a knob and persists the full settings object on save", async () => {
    updateSettingsMock.mockResolvedValue({ ...SETTINGS, maxPerDay: 3, restGapEnabled: false })
    render(<AdminNotifications />)
    await screen.findByText("Ajustes de frequência")

    fireEvent.change(screen.getByLabelText("Máx. por dia"), { target: { value: "3" } })
    fireEvent.click(screen.getByRole("switch", { name: "Gap de descanso" }))
    fireEvent.click(screen.getByText("Salvar ajustes"))

    await waitFor(() =>
      expect(updateSettingsMock).toHaveBeenCalledWith(
        expect.objectContaining({ maxPerDay: 3, restGapEnabled: false, quietStart: 22 }),
      ),
    )
    expect(await screen.findByText("Ajustes salvos.")).toBeInTheDocument()
  })

  it("shows an error message when saving the settings fails", async () => {
    updateSettingsMock.mockRejectedValue(new Error("400"))
    render(<AdminNotifications />)
    await screen.findByText("Ajustes de frequência")

    fireEvent.change(screen.getByLabelText("Fim do silêncio"), { target: { value: "40" } })
    fireEvent.click(screen.getByText("Salvar ajustes"))

    expect(await screen.findByText(/Não foi possível salvar/)).toBeInTheDocument()
  })

  it("shows the plain-language trigger description for a known rule condition", async () => {
    render(<AdminNotifications />)

    const ruleCard = (await screen.findByText("Terço não terminado")).closest("div")!
    expect(within(ruleCard.parentElement as HTMLElement).getByText(/só quem começou um terço e não terminou/))
      .toBeInTheDocument()
  })

  it("shows the band select for every rule and the day-threshold field only for window conditions", async () => {
    getRulesMock.mockResolvedValue([RULE, BIBLE_RULE])
    render(<AdminNotifications />)
    await screen.findByText("Voltar à Bíblia")

    // faixa aparece pras duas
    expect(screen.getByLabelText("Faixa de horário — Terço não terminado")).toHaveValue("AFTERNOON")
    expect(screen.getByLabelText("Faixa de horário — Voltar à Bíblia")).toHaveValue("MORNING")

    // limiar só pra BIBLE_RESUME (condição de janela), não pra ROSARY_UNFINISHED
    expect(screen.getByLabelText("Limiar em dias — Voltar à Bíblia")).toHaveValue(3)
    expect(screen.queryByLabelText("Limiar em dias — Terço não terminado")).not.toBeInTheDocument()

    // a descrição do gatilho reflete o valor real
    expect(screen.getByText(/parou a leitura da Bíblia há 3 dias/)).toBeInTheDocument()
  })

  it("loads and lists a rule's text variants", async () => {
    getRulesMock.mockResolvedValue([RULE])
    getVariantsMock.mockResolvedValue([
      VARIANT({ id: "a", body: "Texto A" }),
      VARIANT({ id: "b", body: "Texto B", order: 1 }),
    ])
    render(<AdminNotifications />)

    await screen.findByText(/Variantes \(2\)/)
    expect(screen.getByDisplayValue("Texto A")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Texto B")).toBeInTheDocument()
    expect(getVariantsMock).toHaveBeenCalledWith("ROSARY_UNFINISHED")
  })

  it("adds a variant via createVariant and appends it to the list", async () => {
    getRulesMock.mockResolvedValue([RULE])
    getVariantsMock.mockResolvedValue([VARIANT({ id: "a", body: "Texto A" })])
    createVariantMock.mockResolvedValue(VARIANT({ id: "new", body: "", order: 1 }))
    render(<AdminNotifications />)
    await screen.findByText(/Variantes \(1\)/)

    fireEvent.click(screen.getByText("Adicionar variante"))

    await waitFor(() => expect(createVariantMock).toHaveBeenCalledWith("ROSARY_UNFINISHED", { body: "" }))
    await screen.findByText(/Variantes \(2\)/)
  })

  it("edits a variant's body and saves it via updateVariant", async () => {
    getRulesMock.mockResolvedValue([RULE])
    getVariantsMock.mockResolvedValue([VARIANT({ id: "a", body: "Antigo" })])
    updateVariantMock.mockResolvedValue(VARIANT({ id: "a", body: "Novo" }))
    render(<AdminNotifications />)
    await screen.findByDisplayValue("Antigo")

    fireEvent.change(screen.getByDisplayValue("Antigo"), { target: { value: "Novo" } })
    fireEvent.click(screen.getByLabelText("Salvar variante 1"))

    await waitFor(() =>
      expect(updateVariantMock).toHaveBeenCalledWith("a", expect.objectContaining({ body: "Novo" })),
    )
  })

  it("reverts the optimistic variant toggle and shows an error when the API rejects (last active)", async () => {
    getRulesMock.mockResolvedValue([RULE])
    getVariantsMock.mockResolvedValue([VARIANT({ id: "a" })])
    updateVariantMock.mockRejectedValue(new Error("400"))
    render(<AdminNotifications />)

    const toggle = await screen.findByRole("switch", { name: "Ativar variante 1" })
    expect(toggle).toHaveAttribute("aria-checked", "true")

    fireEvent.click(toggle)

    await waitFor(() => expect(toggle).toHaveAttribute("aria-checked", "true"))
    expect(screen.getByText(/pelo menos uma variante ativa/)).toBeInTheDocument()
  })

  it("deletes a variant after confirmation via deleteVariant", async () => {
    getRulesMock.mockResolvedValue([RULE])
    getVariantsMock.mockResolvedValue([
      VARIANT({ id: "a", body: "A" }),
      VARIANT({ id: "b", body: "B", order: 1 }),
    ])
    deleteVariantMock.mockResolvedValue(undefined)
    vi.spyOn(window, "confirm").mockReturnValue(true)
    render(<AdminNotifications />)
    await screen.findByText(/Variantes \(2\)/)

    fireEvent.click(screen.getByLabelText("Remover variante 2"))

    await waitFor(() => expect(deleteVariantMock).toHaveBeenCalledWith("b"))
    await screen.findByText(/Variantes \(1\)/)
  })

  it("saves band and thresholdDays via updateRule", async () => {
    getRulesMock.mockResolvedValue([BIBLE_RULE])
    updateRuleMock.mockResolvedValue({ ...BIBLE_RULE, band: "EVENING", thresholdDays: 5 })
    render(<AdminNotifications />)
    await screen.findByText("Voltar à Bíblia")

    fireEvent.change(screen.getByLabelText("Faixa de horário — Voltar à Bíblia"), { target: { value: "EVENING" } })
    fireEvent.change(screen.getByLabelText("Limiar em dias — Voltar à Bíblia"), { target: { value: "5" } })
    fireEvent.click(screen.getByText("Salvar"))

    await waitFor(() =>
      expect(updateRuleMock).toHaveBeenCalledWith(
        "BIBLE_RESUME",
        expect.objectContaining({ band: "EVENING", thresholdDays: 5 }),
      ),
    )
  })

})
