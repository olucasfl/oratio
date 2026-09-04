export function saveLocal(key: string, data: unknown, ttlMinutes = 10) {
  const now = Date.now()

  const item = {
    data,
    expiry: now + ttlMinutes * 60 * 1000
  }

  localStorage.setItem(key, JSON.stringify(item))
}

export function getLocal(key: string) {
  const raw = localStorage.getItem(key)
  if (!raw) return null

  try {
    const item = JSON.parse(raw)

    if (!item.expiry || Date.now() > item.expiry) {
      localStorage.removeItem(key)
      return null
    }

    return item.data
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

export function removeLocal(key: string) {
  localStorage.removeItem(key)
}