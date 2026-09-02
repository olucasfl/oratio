import api from "./api"

export type InboxItem = {
  id: string
  title: string
  body: string | null
  url: string | null
  createdAt: string
  seenAt: string | null
  source: string
  /** regra que disparou (BIBLE_RESUME, STREAK_AT_RISK, ...); null em campanhas */
  ruleKey?: string | null
}

export async function getInbox(
  cursor?: string,
  limit = 10,
): Promise<{ items: InboxItem[]; nextCursor: string | null }> {
  const { data } = await api.get("/oratio/notifications/inbox", {
    params: { cursor, limit },
  })
  return data
}

export async function getUnseenCount(): Promise<number> {
  const { data } = await api.get("/oratio/notifications/unseen-count")
  return data?.count ?? 0
}

export async function markSeen(id: string): Promise<void> {
  await api.post(`/oratio/notifications/${id}/seen`)
}

export async function markAllSeen(): Promise<void> {
  await api.post("/oratio/notifications/seen-all")
}
