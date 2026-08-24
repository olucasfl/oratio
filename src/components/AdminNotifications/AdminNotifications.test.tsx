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
const getAllUsersMock = getAllUsers as unknown as ReturnType<typeof vi.fn>

const RULE = {
  key: "ROSARY_UNFINISHED",
  enabled: true,
  title: "Volte para terminar seu Terço",
  body: "Você começou um terço e não terminou.",
  url: "/oratio/rosary",
  hour: 18,
  condition: "ROSARY_UNFINISHED",
}

function setupDefaults() {
  listCampaignsMock.mockResolvedValue([])
  getSubscribersMock.mockResolvedValue({ totalUsers: 10, subscribedUsers: 4 })
  getRulesMock.mockResolvedValue([RULE])
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

  it("shows the plain-language trigger description for a known rule condition", async () => {
    render(<AdminNotifications />)

    const ruleCard = (await screen.findByText("Terço não terminado")).closest("div")!
    expect(within(ruleCard.parentElement as HTMLElement).getByText(/só quem começou um terço e não terminou/))
      .toBeInTheDocument()
  })

})
