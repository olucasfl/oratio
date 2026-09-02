import api from "./api"

export type Campaign = {
  id: string
  title: string
  body: string | null
  url: string | null
  audience: string
  createdAt: string
  targeted: number
  pushSent: number
  pushFailed: number
}

export async function sendNotification(input: {
  title: string
  body?: string
  url?: string
  audience: "ALL" | "SPECIFIC"
  userIds?: string[]
}): Promise<Campaign> {
  const { data } = await api.post("/oratio/admin/notifications", input)
  return data
}

export async function listCampaigns(): Promise<Campaign[]> {
  const { data } = await api.get("/oratio/admin/notifications")
  return data
}

export async function getSubscribers(): Promise<{ totalUsers: number; subscribedUsers: number }> {
  const { data } = await api.get("/oratio/admin/notifications/subscribers")
  return data
}

export type Rule = {
  key: string
  enabled: boolean
  title: string
  body: string | null
  url: string | null
  hour: number | null
  condition: string | null
}

export async function getRules(): Promise<Rule[]> {
  const { data } = await api.get("/oratio/admin/notifications/rules")
  return data
}

export async function updateRule(
  key: string,
  patch: Partial<Pick<Rule, "enabled" | "title" | "body" | "url" | "hour">>,
): Promise<Rule> {
  const { data } = await api.patch(`/oratio/admin/notifications/rules/${key}`, patch)
  return data
}

export async function createRule(input: {
  title: string
  body?: string
  url?: string
  hour?: number
}): Promise<Rule> {
  const { data } = await api.post("/oratio/admin/notifications/rules", input)
  return data
}

export async function deleteRule(key: string): Promise<void> {
  await api.delete(`/oratio/admin/notifications/rules/${key}`)
}

export async function deleteCampaign(id: string): Promise<void> {
  await api.delete(`/oratio/admin/notifications/${id}`)
}

export async function deleteAllCampaigns(): Promise<void> {
  await api.delete("/oratio/admin/notifications/all")
}

// Bloco de config do funil anti-spam — linha única no backend. Todos os
// campos reproduzem o comportamento antigo por default.
export type NotificationSettings = {
  maxPerDay: number
  maxNudgesPerDay: number
  quietStart: number
  quietEnd: number
  spacingHours: number
  restGapEnabled: boolean
  urgentThreshold: number
}

export async function getSettings(): Promise<NotificationSettings> {
  const { data } = await api.get("/oratio/admin/notifications/settings")
  return data
}

export async function updateSettings(
  patch: Partial<NotificationSettings>,
): Promise<NotificationSettings> {
  const { data } = await api.patch("/oratio/admin/notifications/settings", patch)
  return data
}

