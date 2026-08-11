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
