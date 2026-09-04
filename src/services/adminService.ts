import api from "./api"

export interface AdminFilters {
  search?: string
  isAdmin?: boolean
  emailVerified?: boolean
  activeLastDays?: number
}

/*
 Shape do que `GET /users/admin/users` devolve. Espelha o `select` de
 `UsersService.getAllUsers` no oratio-api — se aquele select mudar, este tipo
 muda junto. `spiritualStats` é opcional porque a relação pode não existir numa
 conta que nunca rezou.

 Cuidado com o nome: `prayerStreak` conta dias de oração, não um recorde de
 sequência — é o nome enganoso já documentado no ARCHITECTURE do backend.
*/
export interface AdminSpiritualStats {
  prayersPrayed?: number
  rosariesPrayed?: number
  prayerStreak?: number
  lastPrayerDate?: string | null
}

export interface AdminUser {
  id: string
  name: string
  email: string
  createdAt: string
  emailVerified: boolean
  isAdmin: boolean
  spiritualStats?: AdminSpiritualStats | null
}

/* Painel do admin — cada tipo cobre o que a tela realmente lê da resposta. */

/* Espelha o `return` de `UsersService.getAdminStats`. */
export interface AdminStats {
  totalUsers: number
  totalVerified: number
  consecrationStarted: number
  consecrationCompleted: number
  prayersPrayed: number
  rosariesPrayed: number
  thisWeek: {
    newUsers: number
    prayers: number
    rosaries: number
    consecrations: number
    logins: number
  }
}

/*
 Espelha `SystemLogEntry` do backend. É um buffer em memória dos últimos 5xx,
 que reseta a cada deploy — não é log de auditoria.
*/
export interface AdminErrorLog {
  timestamp: string
  method: string
  path: string
  statusCode: number
  message: string
  errorName?: string
  stack?: string
}

/* Espelha o `return` de `AppController.getSystemStatus`. */
export interface AdminSystemStatus {
  database: "up" | "down"
  uptimeSeconds: number
  nodeVersion: string
  environment: string
  memory: {
    rssMB: number
    heapUsedMB: number
    heapTotalMB: number
  }
  recentErrors: AdminErrorLog[]
}

export interface AdminActivity {
  type: string
  action: string
  timestamp: string
}

export interface AdminHeatmapData {
  matrix: number[][]
  maxCount: number
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

