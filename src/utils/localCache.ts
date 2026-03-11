export function saveLocal(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getLocal(key: string) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function removeLocal(key: string) {
  localStorage.removeItem(key);
}