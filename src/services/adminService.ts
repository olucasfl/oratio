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

export async function setAdminStatus(
    userId: string,
    isAdmin: boolean,
    adminPassword: string
  ) {
    const res = await api.patch(`/users/admin/users/${userId}`, {
      isAdmin,
      adminPassword,
    })
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

export async function getSystemHealth() {
  const res = await api.get("/health")
  return res.data
}

export async function getSystemStatus() {
  const res = await api.get("/admin/system")
  return res.data
}

export type AdminTimeseriesMetric =
  "users" | "prayers" | "rosaries" | "consecrations" | "logins"

export type AdminTimeseriesRange = "7d" | "30d" | "6m" | "12m"

export async function getAdminTimeseries(
  metric: AdminTimeseriesMetric,
  range: AdminTimeseriesRange = "6m"
) {
  const res = await api.get(
    `/users/admin/stats/timeseries?metric=${metric}&range=${range}`
  )
  return res.data
}

export async function getActivityHeatmap(
  metric: AdminTimeseriesMetric,
  days = 90
) {
  const res = await api.get(
    `/users/admin/stats/heatmap?metric=${metric}&days=${days}`
  )
  return res.data
}

