import api from "./api"

export async function getAdminStats() {
  const res = await api.get("/users/admin/stats")
  return res.data
}

export async function getAllUsers() {
  const res = await api.get("/users/admin/users")
  return res.data
}

export async function setAdminStatus(userId: string, isAdmin: boolean) {
  const res = await api.patch(`/users/admin/users/${userId}`, { isAdmin })
  return res.data
}
