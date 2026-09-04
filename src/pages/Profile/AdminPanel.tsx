import { apiErrorMessage } from "../../utils/authErrors"
import { useEffect, useMemo, useState } from "react"
import AdminNotifications from "../../components/AdminNotifications/AdminNotifications"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"

import {
  Users, Trash2, Eye, Crown, Search, Activity,
  RefreshCcw, ChevronLeft, Flame, X, BadgeCheck, BadgeX,
  BookHeart, ChevronDown, ChevronUp, ArrowUpDown, CalendarDays,
  SortAsc, Bot, LogIn, Gem, Heart, Pin, Check, AlertCircle,
  Loader2, Cross, RotateCcw, LayoutGrid, List, SlidersHorizontal,
  BarChart3, Terminal, Cpu, Database, Clock, AlertTriangle, Bell
} from "lucide-react"

import type { AdminFilters, AdminTimeseriesMetric, AdminTimeseriesRange, AdminUser, AdminStats, AdminSystemStatus, AdminActivity, AdminHeatmapData } from "../../services/adminService"
import {
  getAdminStats, getAllUsers, setAdminStatus,
  getUserDetail, deleteUser, getUserActivity, getAdminTimeseries,
  getSystemHealth, getSystemStatus, getActivityHeatmap
} from "../../services/adminService"
import { getProfile } from "../../services/profileService"
import { usePullToRefresh } from "../../hooks/usePullToRefresh"
import Skeleton from "../../components/Skeleton/Skeleton"
import AdminChart from "../../components/AdminChart/AdminChart"
import type { AdminChartPoint } from "../../components/AdminChart/AdminChart"
import AdminHeatmap from "../../components/AdminHeatmap/AdminHeatmap"
import AdminFilterSheet from "../../components/AdminFilterSheet/AdminFilterSheet"
import styles from "./AdminPanel.module.css"

type Tab          = "overview" | "users" | "charts" | "system" | "notifications"
type ViewMode      = "cards" | "compact"
type SortKey      = "createdAt" | "name" | "streak" | "prayers" | "rosaries"
type SortDir      = "desc" | "asc"
type FilterRole   = "all" | "admin" | "normal"
type FilterVerif  = "all" | "verified" | "unverified"
type FilterActivity = "all" | "7d" | "30d"

const METRIC_OPTIONS: { key: AdminTimeseriesMetric; label: string; icon: React.ReactNode }[] = [
  { key: "users",         label: "Usuários",     icon: <Users size={14}/> },
  { key: "prayers",       label: "Orações",      icon: <Heart size={14}/> },
  { key: "rosaries",      label: "Terços",       icon: <BookHeart size={14}/> },
  { key: "logins",        label: "Logins",       icon: <LogIn size={14}/> },
]

const RANGE_OPTIONS: { key: AdminTimeseriesRange; label: string }[] = [
  { key: "7d",  label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "6m",  label: "6 meses" },
]

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric"
  })
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  })
}

// Calibrado pra uma API pequena tipo essa — não é % de um plano
// específico (não temos como saber o limite exato do host daqui).
// < 150MB é tranquilo, 150-300MB merece acompanhar, acima disso já é
// sinal de algo estranho acontecendo (vazamento, carga anormal).
function memorySeverity(rssMB: number): "good" | "warn" | "critical" {
  if (rssMB < 150) return "good"
  if (rssMB < 300) return "warn"
  return "critical"
}

function fmtUptime(totalSeconds: number) {
  const d = Math.floor(totalSeconds / 86400)
  const h = Math.floor((totalSeconds % 86400) / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

function relativeTime(ts: string) {
  const ms = Date.now() - new Date(ts).getTime()
  const h  = Math.floor(ms / 3_600_000)
  const d  = Math.floor(ms / 86_400_000)
  if (h < 1)  return "agora"
  if (h < 24) return `${h}h atrás`
  if (d < 7)  return `${d}d atrás`
  return fmtDateTime(ts)
}

function getActivityIcon(type: string) {
  const map: Record<string, React.ReactNode> = {
    LOGIN:       <LogIn  size={16} />,
    PRAYER:      <Heart  size={16} />,
    ROSARY:      <Gem    size={16} />,
    VOX:         <Bot    size={16} />,
    CONSECRATION:<Cross  size={16} />,
  }
  return map[type] ?? <Pin size={16} />
}

// 0 = sem sequência, 1-6 = comum, 7-29 = constante, 30+ = excepcional
function streakClass(streak: number) {
  if (streak <= 0) return styles.streakNone
  if (streak < 7)  return styles.streakLow
  if (streak < 30) return styles.streakMid
  return styles.streakHigh
}

export default function AdminPanel() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [viewMode,  setViewMode]  = useState<ViewMode>("cards")

  const [initialLoading, setInitialLoading] = useState(true)
  const [usersLoading,   setUsersLoading]   = useState(false)
  const [error,          setError]          = useState<string | null>(null)
  const [stats,          setStats]          = useState<AdminStats | null>(null)
  const [users,          setUsers]          = useState<AdminUser[]>([])
  const [currentUserId,  setCurrentUserId]  = useState<string | null>(null)
  const [updateId,       setUpdateId]       = useState<string | null>(null)
  const [loadingDetailId,setLoadingDetailId]= useState<string | null>(null)

  const [searchTerm,   setSearchTerm]   = useState("")
  const [filterRole,   setFilterRole]   = useState<FilterRole>("all")
  const [filterVerif,  setFilterVerif]  = useState<FilterVerif>("all")
  const [filterActive, setFilterActive] = useState<FilterActivity>("all")
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const [sortBy,  setSortBy]  = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const [chartMetric, setChartMetric] = useState<AdminTimeseriesMetric>("users")
  const [chartRange,  setChartRange]  = useState<AdminTimeseriesRange>("6m")
  const [chartView,   setChartView]   = useState<"evolution" | "heatmap">("evolution")
  const [chartData,    setChartData]    = useState<{ data: AdminChartPoint[] } | null>(null)
  const [chartLoading, setChartLoading] = useState(false)

  const [heatmapData,    setHeatmapData]    = useState<AdminHeatmapData | null>(null)
  const [heatmapLoading, setHeatmapLoading] = useState(false)

  const [health, setHealth] = useState<{ status: string; database: string } | null>(null)

  const [systemStatus,  setSystemStatus]  = useState<AdminSystemStatus | null>(null)
  const [systemLoading, setSystemLoading] = useState(false)

  // Snapshot sem filtro pra alimentar os Destaques — não pode usar o
  // `users` da aba Usuários porque aquele reflete o filtro ativo, e um
  // "top engajamento" calculado em cima de uma lista filtrada mentiria.
  const [allUsersSnapshot, setAllUsersSnapshot] = useState<AdminUser[]>([])

  const [detailModal,     setDetailModal]     = useState<{ show: boolean; user: AdminUser | null }>({ show: false, user: null })
  const [detailLoading,   setDetailLoading]   = useState(false)
  const [activityData,    setActivityData]    = useState<{ activities?: AdminActivity[] } | null>(null)
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityPage,    setActivityPage]    = useState(1)
  const ITEMS_PER_PAGE = 20

  const [deleteModal,   setDeleteModal]   = useState<{ show: boolean; userId: string | null }>({ show: false, userId: null })
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [pwdModal,      setPwdModal]      = useState<{ show: boolean; userId: string | null; current: boolean }>({ show: false, userId: null, current: false })
  const [adminPassword, setAdminPassword] = useState("")
  const [adminLoading,  setAdminLoading]  = useState(false)

  useEffect(() => {
    Promise.all([loadStats(), loadUsers(), loadHighlights(), loadHealth()])
      .finally(() => setInitialLoading(false))
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (pwdModal.show) return
    const t = setTimeout(() => loadUsers(), 350)
    return () => clearTimeout(t)
  }, [searchTerm, filterRole, filterVerif, filterActive])

  useEffect(() => {
    if (activeTab !== "charts") return
    loadChart(chartMetric, chartRange)
  }, [activeTab, chartMetric, chartRange])

  useEffect(() => {
    if (activeTab !== "charts" || chartView !== "heatmap") return
    loadHeatmap(chartMetric)
  }, [activeTab, chartMetric, chartView])

  useEffect(() => {
    if (activeTab !== "system") return
    loadSystemStatus()
  }, [activeTab])

  async function getCurrentUser() {
    try { setCurrentUserId((await getProfile()).id) } catch { /* melhor esforço, sem UI de erro dedicada */ }
  }

  async function loadStats() {
    try { setStats(await getAdminStats()) } catch { /* melhor esforço, sem UI de erro dedicada */ }
  }

  async function loadUsers() {
    try {
      setUsersLoading(true)
      const filters: AdminFilters = {
        search:        searchTerm || undefined,
        isAdmin:       filterRole === "admin" ? true : filterRole === "normal" ? false : undefined,
        emailVerified: filterVerif === "verified" ? true : filterVerif === "unverified" ? false : undefined,
        activeLastDays: filterActive === "7d" ? 7 : filterActive === "30d" ? 30 : undefined,
      }
      setUsers(await getAllUsers(filters))
      setError(null)
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao carregar usuários"))
    } finally {
      setUsersLoading(false)
    }
  }

  async function loadChart(metric: AdminTimeseriesMetric, range: AdminTimeseriesRange) {
    try {
      setChartLoading(true)
      setChartData(await getAdminTimeseries(metric, range))
    } catch {
      setChartData(null)
    } finally {
      setChartLoading(false)
    }
  }

  async function loadHeatmap(metric: AdminTimeseriesMetric) {
    try {
      setHeatmapLoading(true)
      setHeatmapData(await getActivityHeatmap(metric, 90))
    } catch {
      setHeatmapData(null)
    } finally {
      setHeatmapLoading(false)
    }
  }

  async function loadHighlights() {
    try { setAllUsersSnapshot(await getAllUsers({})) } catch { /* melhor esforço, sem UI de erro dedicada */ }
  }

  async function loadHealth() {
    try { setHealth(await getSystemHealth()) }
    catch { setHealth({ status: "ERROR", database: "down" }) }
  }

  async function loadSystemStatus() {
    try {
      setSystemLoading(true)
      setSystemStatus(await getSystemStatus())
    } catch {
      setSystemStatus(null)
    } finally {
      setSystemLoading(false)
    }
  }

  async function refreshAll() {
    const tasks = [loadStats(), loadUsers(), loadHighlights(), loadHealth()]
    if (activeTab === "charts") {
      tasks.push(loadChart(chartMetric, chartRange))
      if (chartView === "heatmap") tasks.push(loadHeatmap(chartMetric))
    }
    if (activeTab === "system") tasks.push(loadSystemStatus())
    await Promise.all(tasks)
  }

  usePullToRefresh(refreshAll)

  const [manualRefreshing, setManualRefreshing] = useState(false)
  const [manualRefreshDone, setManualRefreshDone] = useState(false)

  async function handleManualRefresh() {
    if (manualRefreshing) return
    setManualRefreshing(true)
    try {
      await refreshAll()
      setManualRefreshDone(true)
      setTimeout(() => setManualRefreshDone(false), 1000)
    } finally {
      setManualRefreshing(false)
    }
  }

  function goToChart(metric: AdminTimeseriesMetric) {
    setChartMetric(metric)
    setActiveTab("charts")
  }

  function clearAllFilters() {
    setSearchTerm("")
    setFilterRole("all")
    setFilterVerif("all")
    setFilterActive("all")
  }

  const activeFilterCount = [filterRole, filterVerif, filterActive]
    .filter(v => v !== "all").length

  const filterSummary = [
    filterRole   !== "all" ? (filterRole === "admin" ? "Admin" : "Normal") : null,
    filterVerif  !== "all" ? (filterVerif === "verified" ? "Verificados" : "Não verif.") : null,
    filterActive !== "all" ? (filterActive === "7d" ? "7 dias" : "30 dias") : null,
  ].filter(Boolean).join(" · ")

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (sortBy === "name") {
        const cmp = (a.name || "").localeCompare(b.name || "", "pt-BR")
        return sortDir === "asc" ? cmp : -cmp
      }
      let av = 0, bv = 0
      if      (sortBy === "createdAt") { av = new Date(a.createdAt || 0).getTime();     bv = new Date(b.createdAt || 0).getTime() }
      else if (sortBy === "streak")    { av = a.spiritualStats?.prayerStreak   || 0;    bv = b.spiritualStats?.prayerStreak   || 0 }
      else if (sortBy === "prayers")   { av = a.spiritualStats?.prayersPrayed  || 0;    bv = b.spiritualStats?.prayersPrayed  || 0 }
      else if (sortBy === "rosaries")  { av = a.spiritualStats?.rosariesPrayed || 0;    bv = b.spiritualStats?.rosariesPrayed || 0 }
      return sortDir === "desc" ? bv - av : av - bv
    })
  }, [users, sortBy, sortDir])

  function handleSort(key: SortKey) {
    if (sortBy === key) setSortDir(d => d === "desc" ? "asc" : "desc")
    else { setSortBy(key); setSortDir("desc") }
  }

  function SortBtn({ k, label }: { k: SortKey; label: string }) {
    const active = sortBy === k
    return (
      <button
        className={`${styles.sortBtn} ${active ? styles.sortBtnActive : ""}`}
        onClick={() => handleSort(k)}
      >
        {label}
        {active
          ? sortDir === "desc" ? <ChevronDown size={13}/> : <ChevronUp size={13}/>
          : <ArrowUpDown size={13}/>}
      </button>
    )
  }

  async function toggleAdmin(userId: string, current: boolean) {
    setAdminPassword("")
    setPwdModal({ show: true, userId, current })
  }

  async function performToggleAdmin(userId: string, current: boolean, password: string) {
    try {
      setUpdateId(userId); setAdminLoading(true)
      await setAdminStatus(userId, !current, password)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin: !current } : u))
      setAdminPassword("")
      setPwdModal({ show: false, userId: null, current: false })
      if (userId === currentUserId && current) setTimeout(() => navigate("/oratio/profile"), 500)
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao alterar admin"))
    } finally {
      setAdminLoading(false); setUpdateId(null)
    }
  }

  async function openDetail(user: AdminUser) {
    setLoadingDetailId(user.id)
    try {
      setDetailLoading(true); setActivityLoading(true); setActivityPage(1)
      const [detail, activity] = await Promise.all([getUserDetail(user.id), getUserActivity(user.id)])
      setDetailModal({ show: true, user: detail })
      setActivityData(activity)
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao carregar detalhes"))
    } finally {
      setDetailLoading(false); setActivityLoading(false)
      setLoadingDetailId(null)
    }
  }

  async function performDelete(userId: string) {
    try {
      setDeleteLoading(true)
      await deleteUser(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
      setDeleteModal({ show: false, userId: null })
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao deletar usuário"))
    } finally {
      setDeleteLoading(false)
    }
  }

  function closeDetail() {
    setDetailModal({ show: false, user: null })
    setActivityData(null)
  }

  const paginatedActivities = useMemo(() => {
    const sorted = [...(activityData?.activities || [])].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    const start = (activityPage - 1) * ITEMS_PER_PAGE
    return sorted.slice(start, start + ITEMS_PER_PAGE)
  }, [activityData, activityPage])

  const verifiedPct = stats && stats.totalUsers > 0
    ? Math.round((stats.totalVerified / stats.totalUsers) * 100)
    : null

  const topEngaged = useMemo(() => {
    return [...allUsersSnapshot]
      .sort((a, b) => {
        const streakDiff = (b.spiritualStats?.prayerStreak || 0) - (a.spiritualStats?.prayerStreak || 0)
        if (streakDiff !== 0) return streakDiff
        const aTotal = (a.spiritualStats?.prayersPrayed || 0) + (a.spiritualStats?.rosariesPrayed || 0)
        const bTotal = (b.spiritualStats?.prayersPrayed || 0) + (b.spiritualStats?.rosariesPrayed || 0)
        return bTotal - aTotal
      })
      .slice(0, 5)
  }, [allUsersSnapshot])

  const recentSignups = useMemo(() => {
    return [...allUsersSnapshot]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5)
  }, [allUsersSnapshot])

  function Delta({ value }: { value?: number }) {
    if (typeof value !== "number") return null
    return (
      <em className={`${styles.statDelta} ${value > 0 ? styles.statDeltaUp : ""}`}>
        {value > 0 ? `+${value}` : value} essa semana
      </em>
    )
  }

  function renderActions(user: AdminUser, isLoadingThis: boolean, isUpdatingAdmin: boolean, size = 15) {
    return (
      <div className={styles.userActions}>
        <button
          className={`${styles.btnView} ${isLoadingThis ? styles.btnLoading : ""}`}
          onClick={() => !isLoadingThis && openDetail(user)}
          disabled={isLoadingThis}
          title="Ver detalhes"
        >
          {isLoadingThis ? <Loader2 size={size} className={styles.spinIcon}/> : <Eye size={size}/>}
        </button>
        <button
          className={`${user.isAdmin ? styles.btnAdminOn : styles.btnAdminOff} ${isUpdatingAdmin ? styles.btnLoading : ""}`}
          disabled={isUpdatingAdmin}
          onClick={() => !isUpdatingAdmin && toggleAdmin(user.id, user.isAdmin)}
          title={user.isAdmin ? "Remover admin" : "Tornar admin"}
        >
          {isUpdatingAdmin ? <Loader2 size={size} className={styles.spinIcon}/> : <Crown size={size}/>}
        </button>
        {user.id !== currentUserId && (
          <button
            className={styles.btnDelete}
            onClick={() => setDeleteModal({ show: true, userId: user.id })}
            title="Deletar"
          >
            <Trash2 size={size}/>
          </button>
        )}
      </div>
    )
  }

  function renderCard(user: AdminUser) {
    const isLoadingThis = loadingDetailId === user.id
    const isUpdatingAdmin = adminLoading && updateId === user.id
    const streak = user.spiritualStats?.prayerStreak || 0
    return (
      <div
        key={user.id}
        className={`${styles.userCard} ${isLoadingThis ? styles.userCardLoading : ""} ${user.isAdmin ? styles.userCardAdmin : ""}`}
      >
        <div className={styles.userLeft}>
          <div className={styles.userAvatar}>{user.name?.charAt(0)}</div>
          <div className={styles.userInfo}>
            <div className={styles.userNameRow}>
              <strong>{user.name}</strong>
              {user.isAdmin && <span className={styles.adminBadge}>Admin</span>}
              {user.emailVerified
                ? <span className={styles.verifiedDot} title="Verificado"><Check size={10}/></span>
                : <span className={styles.unverifiedDot} title="Não verificado"><AlertCircle size={10}/></span>
              }
            </div>
            <p className={styles.userEmail}>{user.email}</p>
            {user.createdAt && (
              <p className={styles.userDate}>
                <CalendarDays size={11}/>
                {fmtDate(user.createdAt)}
              </p>
            )}
            <div className={styles.userChips}>
              <span className={styles.chipRosary}>
                {user.spiritualStats?.rosariesPrayed || 0} Terços
              </span>
              <span className={styles.chipPrayer}>
                {user.spiritualStats?.prayersPrayed || 0} Orações
              </span>
            </div>
          </div>
        </div>

        <div className={styles.userRight}>
          <div className={styles.userStats}>
            <span className={streakClass(streak)} title="Streak">
              <Flame size={12}/>
              {streak}
            </span>
          </div>
          {renderActions(user, isLoadingThis, isUpdatingAdmin)}
        </div>
      </div>
    )
  }

  function renderCompactRow(user: AdminUser) {
    const isLoadingThis = loadingDetailId === user.id
    const isUpdatingAdmin = adminLoading && updateId === user.id
    const streak = user.spiritualStats?.prayerStreak || 0
    return (
      <div
        key={user.id}
        className={`${styles.compactRow} ${isLoadingThis ? styles.userCardLoading : ""}`}
      >
        <div className={styles.compactAvatar}>{user.name?.charAt(0)}</div>
        <div className={styles.compactInfo}>
          <div className={styles.compactNameRow}>
            <strong>{user.name}</strong>
            {user.isAdmin && <span className={styles.adminBadge}>Admin</span>}
            {!user.emailVerified && (
              <span className={styles.unverifiedDot} title="Não verificado"><AlertCircle size={9}/></span>
            )}
          </div>
          <span className={styles.compactEmail}>{user.email}</span>
        </div>
        <span className={`${styles.compactStreak} ${streakClass(streak)}`}>
          <Flame size={12}/> {streak}
        </span>
        {renderActions(user, isLoadingThis, isUpdatingAdmin, 14)}
      </div>
    )
  }

  // ─── SKELETON ───────────────────────────────────────────────────────────────
  if (initialLoading) return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.backgroundGlow}/>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate("/oratio/profile")}><ChevronLeft size={20}/></button>
        <Skeleton height={22} width={160} radius={8}/>
      </header>
      <div style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} height={90} radius={18}/>
          ))}
        </div>
        <Skeleton height={48} radius={14}/>
        <Skeleton height={96} radius={18}/>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={80} radius={18}/>
        ))}
      </div>
    </div>
  )

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.backgroundGlow}/>

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <button className={styles.backButton} onClick={() => navigate("/oratio/profile")}>
            <ChevronLeft size={20}/>
          </button>
          <div>
            <h1>Painel Admin</h1>
            <p>Gerencie usuários e estatísticas</p>
          </div>
          <button
            className={`${styles.refreshBtn} ${manualRefreshDone ? styles.refreshBtnDone : ""}`}
            onClick={handleManualRefresh}
            disabled={manualRefreshing}
            title="Atualizar"
            aria-label="Atualizar"
          >
            {manualRefreshDone
              ? <Check size={16}/>
              : <RefreshCcw size={16} className={manualRefreshing ? styles.spinIcon : undefined}/>
            }
          </button>
        </div>

        <div className={styles.tabBar}>
          <button
            className={`${styles.tabBtn} ${activeTab === "overview" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Activity size={15}/> Visão Geral
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "users" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={15}/> Usuários
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "charts" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("charts")}
          >
            <BarChart3 size={15}/> Gráficos
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "system" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("system")}
          >
            <Terminal size={15}/> Sistema
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "notifications" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={15}/> Notificações
          </button>
        </div>
      </header>

      <main className={styles.container}>

        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={18}/>
            <span>{error}</span>
            <button className={styles.errorRetry} onClick={refreshAll}>
              <RefreshCcw size={13}/>
              Tentar novamente
            </button>
          </div>
        )}

        {/* ── VISÃO GERAL ── */}
        {activeTab === "overview" && (
          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <Activity size={17}/>
              <h2>Visão Geral</h2>
              {health && (
                <span className={`${styles.healthPill} ${health.status === "OK" ? styles.healthOk : styles.healthDown}`}>
                  <span className={styles.healthDot}/>
                  {health.status === "OK" ? "Sistema operacional" : "Sistema indisponível"}
                </span>
              )}
            </div>
            <p className={styles.sectionHint}>Toque num indicador pra ver a evolução dele nos Gráficos.</p>

            <div className={styles.statsGrid}>
              <button className={styles.statCard} onClick={() => goToChart("users")}>
                <div className={styles.statIcon}><Users size={17}/></div>
                <span className={styles.statLabel}>Usuários</span>
                <strong className={styles.statValue}>{stats?.totalUsers ?? "–"}</strong>
                <Delta value={stats?.thisWeek?.newUsers}/>
              </button>

              <button className={styles.statCard} onClick={() => goToChart("users")}>
                <div className={styles.statIcon}><BadgeCheck size={17}/></div>
                <span className={styles.statLabel}>Verificados</span>
                <strong className={styles.statValue}>{stats?.totalVerified ?? "–"}</strong>
                <em className={styles.statDelta}>
                  {stats ? `de ${stats.totalUsers} · ${verifiedPct}%` : ""}
                </em>
              </button>

              <button className={styles.statCard} onClick={() => goToChart("prayers")}>
                <div className={styles.statIcon}><Heart size={17}/></div>
                <span className={styles.statLabel}>Orações</span>
                <strong className={styles.statValue}>{stats?.prayersPrayed ?? "–"}</strong>
                <Delta value={stats?.thisWeek?.prayers}/>
              </button>

              <button className={styles.statCard} onClick={() => goToChart("rosaries")}>
                <div className={styles.statIcon}><BookHeart size={17}/></div>
                <span className={styles.statLabel}>Terços</span>
                <strong className={styles.statValue}>{stats?.rosariesPrayed ?? "–"}</strong>
                <Delta value={stats?.thisWeek?.rosaries}/>
              </button>

              <div className={styles.statCard}>
                <div className={styles.statIcon}><Crown size={17}/></div>
                <span className={styles.statLabel}>Consagrações</span>
                <strong className={styles.statValue}>{stats?.consecrationStarted ?? "–"}</strong>
                <em className={styles.statDelta}>
                  {stats ? `${stats.consecrationCompleted ?? 0} concluídas` : ""}
                </em>
              </div>

              <button className={styles.statCard} onClick={() => goToChart("logins")}>
                <div className={styles.statIcon}><LogIn size={17}/></div>
                <span className={styles.statLabel}>Logins</span>
                <strong className={styles.statValue}>{stats?.thisWeek?.logins ?? "–"}</strong>
                <em className={styles.statDelta}>essa semana</em>
              </button>
            </div>

            <div className={styles.highlightsGrid}>

              <div className={styles.highlightCol}>
                <h3 className={styles.highlightTitle}>
                  <Flame size={14}/> Top engajamento
                </h3>
                {topEngaged.length === 0 ? (
                  <p className={styles.highlightEmpty}>Sem dados ainda.</p>
                ) : topEngaged.map((u, i) => (
                  <div key={u.id} className={styles.compactRow}>
                    <span className={styles.highlightRank}>{i + 1}</span>
                    <div className={styles.compactAvatar}>{u.name?.charAt(0)}</div>
                    <div className={styles.compactInfo}>
                      <div className={styles.compactNameRow}>
                        <strong>{u.name}</strong>
                      </div>
                      <span className={styles.compactEmail}>
                        {u.spiritualStats?.prayersPrayed || 0} orações · {u.spiritualStats?.rosariesPrayed || 0} terços
                      </span>
                    </div>
                    <span className={`${styles.compactStreak} ${streakClass(u.spiritualStats?.prayerStreak || 0)}`}>
                      <Flame size={12}/> {u.spiritualStats?.prayerStreak || 0}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.highlightCol}>
                <h3 className={styles.highlightTitle}>
                  <CalendarDays size={14}/> Últimos cadastros
                </h3>
                {recentSignups.length === 0 ? (
                  <p className={styles.highlightEmpty}>Sem dados ainda.</p>
                ) : recentSignups.map(u => (
                  <div key={u.id} className={styles.compactRow}>
                    <div className={styles.compactAvatar}>{u.name?.charAt(0)}</div>
                    <div className={styles.compactInfo}>
                      <div className={styles.compactNameRow}>
                        <strong>{u.name}</strong>
                        {u.emailVerified
                          ? <span className={styles.verifiedDot} title="Verificado"><Check size={9}/></span>
                          : <span className={styles.unverifiedDot} title="Não verificado"><AlertCircle size={9}/></span>
                        }
                      </div>
                      <span className={styles.compactEmail}>{fmtDate(u.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        )}

        {/* ── USUÁRIOS ── */}
        {activeTab === "users" && (
          <section className={styles.section}>

            <div className={styles.usersHeader}>
              <div className={styles.sectionTitle}>
                <Users size={17}/>
                <h2>Usuários</h2>
              </div>
              <div className={styles.viewToggle}>
                <button
                  className={`${styles.viewBtn} ${viewMode === "cards" ? styles.viewBtnActive : ""}`}
                  onClick={() => setViewMode("cards")}
                  title="Ver como cards"
                  aria-label="Ver como cards"
                >
                  <LayoutGrid size={15}/>
                </button>
                <button
                  className={`${styles.viewBtn} ${viewMode === "compact" ? styles.viewBtnActive : ""}`}
                  onClick={() => setViewMode("compact")}
                  title="Ver como lista compacta"
                  aria-label="Ver como lista compacta"
                >
                  <List size={15}/>
                </button>
              </div>
            </div>

            {/* SEARCH + FILTROS */}
            <div className={styles.searchRow}>
              <div className={styles.searchWrapper}>
                <Search size={17}/>
                <input
                  type="text"
                  placeholder="Buscar por nome ou e-mail…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className={styles.clearSearch} onClick={() => setSearchTerm("")}>
                    <X size={15}/>
                  </button>
                )}
              </div>
              <button
                className={`${styles.filterBtn} ${activeFilterCount > 0 ? styles.filterBtnOn : ""}`}
                onClick={() => setFilterSheetOpen(true)}
              >
                <SlidersHorizontal size={15}/>
                Filtros{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}
              </button>
            </div>

            {/* SORT */}
            <div className={styles.sortBar}>
              <SortAsc size={14} className={styles.sortIcon}/>
              <SortBtn k="createdAt" label="Data"/>
              <SortBtn k="name"      label="Nome"/>
              <SortBtn k="streak"    label="Streak"/>
              <SortBtn k="prayers"   label="Orações"/>
              <SortBtn k="rosaries"  label="Terços"/>
              {(sortBy !== "createdAt" || sortDir !== "desc") && (
                <button
                  className={styles.sortClearBtn}
                  onClick={() => { setSortBy("createdAt"); setSortDir("desc") }}
                  title="Limpar ordenação"
                >
                  <RotateCcw size={12}/>
                  Limpar
                </button>
              )}
            </div>

            {/* SUB-CABEÇALHO FIXO */}
            <div className={styles.subHeader}>
              <span>
                {usersLoading
                  ? <Loader2 size={13} className={styles.spinIcon}/>
                  : `${sortedUsers.length} encontrados`
                }
              </span>
              {activeFilterCount > 0 && (
                <span className={styles.subHeaderFilter}>{filterSummary}</span>
              )}
            </div>

            {/* LIST */}
            <div className={`${styles.userList} ${usersLoading ? styles.userListFading : ""} ${viewMode === "compact" ? styles.userListCompact : ""}`}>
              {sortedUsers.length === 0 && !usersLoading ? (
                <div className={styles.emptyState}>
                  <Search size={26}/>
                  <p>Nenhum resultado com esses filtros.</p>
                  <button className={styles.emptyClearBtn} onClick={clearAllFilters}>
                    <RotateCcw size={13}/>
                    Limpar filtros
                  </button>
                </div>
              ) : sortedUsers.map(user =>
                viewMode === "compact" ? renderCompactRow(user) : renderCard(user)
              )}
            </div>

          </section>
        )}

        {/* ── GRÁFICOS ── */}
        {activeTab === "charts" && (
          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <BarChart3 size={17}/>
              <h2>Gráficos</h2>
            </div>
            <p className={styles.sectionHint}>
              {chartView === "evolution"
                ? "Evolução no período — toque numa barra pra ver o valor exato."
                : "Padrão de uso dos últimos 90 dias — toque numa célula pra ver o horário."
              }
            </p>

            <div className={styles.metricChips}>
              {METRIC_OPTIONS.map(m => (
                <button
                  key={m.key}
                  className={`${styles.metricChip} ${chartMetric === m.key ? styles.metricChipOn : ""}`}
                  onClick={() => setChartMetric(m.key)}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>

            <div className={styles.chartViewToggle}>
              <button
                className={`${styles.chartViewBtn} ${chartView === "evolution" ? styles.chartViewBtnActive : ""}`}
                onClick={() => setChartView("evolution")}
              >
                Evolução
              </button>
              <button
                className={`${styles.chartViewBtn} ${chartView === "heatmap" ? styles.chartViewBtnActive : ""}`}
                onClick={() => setChartView("heatmap")}
              >
                Por horário
              </button>
            </div>

            {chartView === "evolution" && (
              <div className={styles.rangeChips}>
                {RANGE_OPTIONS.map(r => (
                  <button
                    key={r.key}
                    className={`${styles.rangeChip} ${chartRange === r.key ? styles.rangeChipOn : ""}`}
                    onClick={() => setChartRange(r.key)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}

            <div className={styles.chartCard}>
              {chartView === "evolution" ? (
                chartLoading ? (
                  <Skeleton height={190} radius={14}/>
                ) : chartData?.data ? (
                  <AdminChart key={`${chartMetric}-${chartRange}`} data={chartData.data}/>
                ) : (
                  <div className={styles.empty}>Não foi possível carregar o gráfico.</div>
                )
              ) : (
                heatmapLoading ? (
                  <Skeleton height={190} radius={14}/>
                ) : heatmapData?.matrix ? (
                  <AdminHeatmap
                    key={chartMetric}
                    matrix={heatmapData.matrix}
                    maxCount={heatmapData.maxCount}
                  />
                ) : (
                  <div className={styles.empty}>Não foi possível carregar o heatmap.</div>
                )
              )}
            </div>
          </section>
        )}

        {/* ── SISTEMA ── */}
        {activeTab === "notifications" && (
          <AdminNotifications/>
        )}

        {activeTab === "system" && (
          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <Terminal size={17}/>
              <h2>Sistema</h2>
            </div>
            <p className={styles.sectionHint}>
              Informações técnicas do backend — só pra quem for mexer no código.
            </p>

            {systemLoading && !systemStatus ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Skeleton height={90} radius={16}/>
                <Skeleton height={140} radius={16}/>
              </div>
            ) : systemStatus ? (
              <>
                <div className={styles.systemGrid}>
                  <div className={styles.systemCard}>
                    <Database size={16}/>
                    <span>Banco de dados</span>
                    <strong className={systemStatus.database === "up" ? styles.systemOk : styles.systemDown}>
                      {systemStatus.database === "up" ? "Conectado" : "Indisponível"}
                    </strong>
                  </div>
                  <div className={styles.systemCard}>
                    <Clock size={16}/>
                    <span>No ar há</span>
                    <strong>{fmtUptime(systemStatus.uptimeSeconds)}</strong>
                  </div>
                  <div className={styles.systemCard}>
                    <Cpu size={16}/>
                    <span>Memória (RSS)</span>
                    <div className={styles.systemMemoryRow}>
                      <strong>{systemStatus.memory?.rssMB} MB</strong>
                      {(() => {
                        const sev = memorySeverity(systemStatus.memory?.rssMB || 0)
                        const title = sev === "good" ? "Tranquilo" : sev === "warn" ? "Acompanhar" : "Alto"
                        return (
                          <span
                            className={`${styles.severityDot} ${styles["severity_" + sev]}`}
                            title={title}
                            aria-label={title}
                          />
                        )
                      })()}
                    </div>
                    <span className={styles.systemSubDetail}>
                      heap {systemStatus.memory?.heapUsedMB} / {systemStatus.memory?.heapTotalMB} MB
                    </span>
                  </div>
                  <div className={styles.systemCard}>
                    <Terminal size={16}/>
                    <span>Node / ambiente</span>
                    <strong className={styles.systemSmall}>
                      {systemStatus.nodeVersion} · {systemStatus.environment}
                    </strong>
                  </div>
                </div>

                <div className={styles.errorLogHeader}>
                  <AlertTriangle size={15}/>
                  <h3>Erros recentes</h3>
                  <span className={styles.errorLogCount}>
                    {systemStatus.recentErrors?.length || 0}
                  </span>
                </div>

                {!systemStatus.recentErrors || systemStatus.recentErrors.length === 0 ? (
                  <div className={styles.emptyState}>
                    <AlertTriangle size={26}/>
                    <p>Nenhum erro registrado desde o último deploy.</p>
                  </div>
                ) : (
                  <div className={styles.errorLogList}>
                    {systemStatus.recentErrors.map((e, i) => (
                      <div key={i} className={styles.errorLogItem}>
                        <div className={styles.errorLogTop}>
                          <span className={styles.errorLogStatus}>{e.statusCode}</span>
                          {e.errorName && <span className={styles.errorLogName}>{e.errorName}</span>}
                          <span className={styles.errorLogTime}>
                            {fmtDateTime(e.timestamp)} · {relativeTime(e.timestamp)}
                          </span>
                        </div>
                        <div className={styles.errorLogBody}>
                          <strong>{e.message}</strong>
                          <span>{e.method} {e.path}</span>
                        </div>
                        {e.stack && (
                          <pre className={styles.errorLogStack}>{e.stack}</pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.empty}>Não foi possível carregar o status do sistema.</div>
            )}
          </section>
        )}
      </main>

      {/* ── BOTTOM SHEET DE FILTROS ── */}
      <AdminFilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        usersLoading={usersLoading}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        filterVerif={filterVerif}
        setFilterVerif={setFilterVerif}
        filterActive={filterActive}
        setFilterActive={setFilterActive}
        onClear={clearAllFilters}
        activeCount={activeFilterCount}
      />

      {/* ── DETAIL MODAL ── */}
      {detailModal.show && detailModal.user && createPortal(
        <div className={styles.overlay} onClick={closeDetail}>
          <div className={styles.detailModal} onClick={e => e.stopPropagation()}>

            <button className={styles.closeBtn} onClick={closeDetail}><X size={18}/></button>

            {detailLoading ? (
              <div className={styles.modalSkeleton}>
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
                  <Skeleton width={68} height={68} circle/>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <Skeleton height={18} width="55%" radius={6}/>
                    <Skeleton height={13} width="75%" radius={4}/>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Skeleton height={22} width={60} radius={99}/>
                      <Skeleton height={22} width={80} radius={99}/>
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} height={72} radius={16}/>
                  ))}
                </div>
                <Skeleton height={18} width={160} radius={6} style={{ marginBottom: 12 }}/>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} height={58} radius={14} style={{ marginBottom: 8 }}/>
                ))}
              </div>
            ) : (
              <>
                <div className={styles.detailHeader}>
                  <div className={styles.detailAvatar}>{detailModal.user.name?.charAt(0)}</div>
                  <div>
                    <h2>{detailModal.user.name}</h2>
                    <p>{detailModal.user.email}</p>
                    <div className={styles.detailBadges}>
                      {detailModal.user.isAdmin && <span className={styles.adminBadge}>Admin</span>}
                      {detailModal.user.emailVerified
                        ? <span className={styles.verifiedBadge}><BadgeCheck size={12}/> Verificado</span>
                        : <span className={styles.unverifiedBadge}><BadgeX size={12}/> Não verificado</span>
                      }
                    </div>
                  </div>
                </div>

                <div className={styles.detailGrid}>
                  <div className={styles.detailCard}>
                    <span>Membro desde</span>
                    <strong>{fmtDate(detailModal.user.createdAt)}</strong>
                  </div>
                  <div className={styles.detailCard}>
                    <span>Streak</span>
                    <strong className={styles.detailStatRow}>
                      <Flame size={16}/> {detailModal.user.spiritualStats?.prayerStreak || 0} dias
                    </strong>
                  </div>
                  <div className={styles.detailCard}>
                    <span>Orações</span>
                    <strong className={styles.detailStatRow}>
                      <Heart size={16}/> {detailModal.user.spiritualStats?.prayersPrayed || 0}
                    </strong>
                  </div>
                  <div className={styles.detailCard}>
                    <span>Terços</span>
                    <strong className={styles.detailStatRow}>
                      <Gem size={16}/> {detailModal.user.spiritualStats?.rosariesPrayed || 0}
                    </strong>
                  </div>
                </div>

                <div className={styles.activitySection}>
                  <h3>Atividades recentes</h3>

                  {activityLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} height={54} radius={14}/>
                      ))}
                    </div>
                  ) : paginatedActivities.length > 0 ? (
                    <>
                      <div className={styles.activityList}>
                        {paginatedActivities.map((a, i) => (
                          <div key={i} className={styles.activityItem}>
                            <div className={styles.activityIcon}>{getActivityIcon(a.type)}</div>
                            <div className={styles.activityInfo}>
                              <strong>{a.action}</strong>
                              <span>{a.type}</span>
                            </div>
                            <div className={styles.activityTime}>{relativeTime(a.timestamp)}</div>
                          </div>
                        ))}
                      </div>
                      <div className={styles.pagination}>
                        <button disabled={activityPage === 1} onClick={() => setActivityPage(p => Math.max(p - 1, 1))}>←</button>
                        <span>Página {activityPage}</span>
                        <button
                          disabled={activityPage * ITEMS_PER_PAGE >= (activityData?.activities?.length || 0)}
                          onClick={() => setActivityPage(p => p + 1)}
                        >→</button>
                      </div>
                    </>
                  ) : (
                    <div className={styles.emptyActivity}>Sem atividades registradas</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ── DELETE MODAL ── */}
      {deleteModal.show && createPortal(
        <div className={styles.overlay} onClick={() => setDeleteModal({ show: false, userId: null })}>
          <div className={styles.smallModal} onClick={e => e.stopPropagation()}>
            <h2>Deletar usuário?</h2>
            <p>Esta ação é irreversível e remove todos os dados do usuário.</p>
            <div className={styles.modalBtns}>
              <button className={styles.btnCancel} onClick={() => setDeleteModal({ show: false, userId: null })}>Cancelar</button>
              <button
                className={styles.btnConfirmDanger}
                disabled={deleteLoading}
                onClick={() => deleteModal.userId && performDelete(deleteModal.userId)}
              >
                {deleteLoading
                  ? <><Loader2 size={14} className={styles.spinIcon}/> Deletando…</>
                  : "Deletar"
                }
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── ADMIN PASSWORD MODAL ── */}
      {pwdModal.show && createPortal(
        <div className={styles.overlay} onClick={() => setPwdModal({ show: false, userId: null, current: false })}>
          <div className={styles.smallModal} onClick={e => e.stopPropagation()}>
            <h2>{pwdModal.current ? "Remover admin" : "Tornar admin"}</h2>
            <p>Digite a senha de segurança para confirmar.</p>
            <input
              type="password"
              placeholder="Senha admin"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              className={styles.pwdInput}
            />
            <div className={styles.modalBtns}>
              <button className={styles.btnCancel} onClick={() => { setAdminPassword(""); setPwdModal({ show: false, userId: null, current: false }) }}>Cancelar</button>
              <button
                className={styles.btnConfirm}
                disabled={!adminPassword || adminLoading}
                onClick={() => pwdModal.userId && performToggleAdmin(pwdModal.userId, pwdModal.current, adminPassword)}
              >
                {adminLoading
                  ? <><Loader2 size={14} className={styles.spinIcon}/> Verificando…</>
                  : "Confirmar"
                }
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
