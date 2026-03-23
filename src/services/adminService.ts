import api from "./api"

export interface AdminFilters {
  search?: string
  isAdmin?: boolean
  emailVerified?: boolean
  activeLastDays?: number
}

export async function getAdminStats() {
  const res = await api.get("/users/admin/stats")
  return res.data
}

export async function getAllUsers(filters?: AdminFilters) {
  const params = new URLSearchParams()
  
  if (filters?.search) params.append('search', filters.search)
  if (filters?.isAdmin !== undefined) params.append('isAdmin', String(filters.isAdmin))
  if (filters?.emailVerified !== undefined) params.append('emailVerified', String(filters.emailVerified))
  if (filters?.activeLastDays !== undefined) params.append('activeLastDays', String(filters.activeLastDays))
  
  const queryString = params.toString()
  const url = queryString ? `/users/admin/users?${queryString}` : '/users/admin/users'
  
  const res = await api.get(url)
  return res.data
}

export async function setAdminStatus(userId: string, isAdmin: boolean) {
  const res = await api.patch(`/users/admin/users/${userId}`, { isAdmin })
  return res.data
}

export async function getUserDetail(userId: string) {
  const res = await api.get(`/users/admin/users/${userId}`)
  return res.data
}

export async function deleteUser(userId: string) {
  const res = await api.delete(`/users/admin/users/${userId}`)
  return res.data
}

export async function getUserActivity(userId: string) {
  const res = await api.get(`/users/admin/users/${userId}/activity`)
  return res.data
}


