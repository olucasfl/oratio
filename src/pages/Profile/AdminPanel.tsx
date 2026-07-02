import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"

import {
  Users, Trash2, Eye, Crown, Search, Activity,
  RefreshCcw, ArrowLeft, Flame, X, BadgeCheck, BadgeX,
  BookHeart, ChevronDown, ChevronUp, ArrowUpDown, CalendarDays,
  SortAsc, Bot, LogIn, Gem, Heart, Pin, Check, AlertCircle,
  Loader2, Cross, RotateCcw
} from "lucide-react"

import type { AdminFilters } from "../../services/adminService"
import {
  getAdminStats, getAllUsers, setAdminStatus,
  getUserDetail, deleteUser, getUserActivity
} from "../../services/adminService"
import { getProfile } from "../../services/profileService"
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"
import Skeleton from "../../components/Skeleton/Skeleton"
import styles from "./AdminPanel.module.css"

type SortKey      = "createdAt" | "name" | "streak" | "prayers" | "rosaries"
type SortDir      = "desc" | "asc"
type FilterRole   = "all" | "admin" | "normal"
type FilterVerif  = "all" | "verified" | "unverified"
type FilterActivity = "all" | "7d" | "30d"

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

export default function AdminPanel() {
  const navigate = useNavigate()

  const [initialLoading, setInitialLoading] = useState(true)
  const [usersLoading,   setUsersLoading]   = useState(false)
  const [error,          setError]          = useState<string | null>(null)
  const [stats,          setStats]          = useState<any>(null)
  const [users,          setUsers]          = useState<any[]>([])
  const [currentUserId,  setCurrentUserId]  = useState<string | null>(null)
  const [updateId,       setUpdateId]       = useState<string | null>(null)
  const [loadingDetailId,setLoadingDetailId]= useState<string | null>(null)

  const [searchTerm,   setSearchTerm]   = useState("")
  const [filterRole,   setFilterRole]   = useState<FilterRole>("all")
  const [filterVerif,  setFilterVerif]  = useState<FilterVerif>("all")
  const [filterActive, setFilterActive] = useState<FilterActivity>("all")

  const [sortBy,  setSortBy]  = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const [detailModal,     setDetailModal]     = useState<{ show: boolean; user: any }>({ show: false, user: null })
  const [detailLoading,   setDetailLoading]   = useState(false)
  const [activityData,    setActivityData]    = useState<any>(null)
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityPage,    setActivityPage]    = useState(1)
  const ITEMS_PER_PAGE = 20

  const [deleteModal,   setDeleteModal]   = useState<{ show: boolean; userId: string | null }>({ show: false, userId: null })
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [pwdModal,      setPwdModal]      = useState<{ show: boolean; userId: string | null; current: boolean }>({ show: false, userId: null, current: false })
  const [adminPassword, setAdminPassword] = useState("")
  const [adminLoading,  setAdminLoading]  = useState(false)

  useEffect(() => {
    Promise.all([loadStats(), loadUsers()]).finally(() => setInitialLoading(false))
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (pwdModal.show) return
    const t = setTimeout(() => loadUsers(), 350)
    return () => clearTimeout(t)
  }, [searchTerm, filterRole, filterVerif, filterActive])

  async function getCurrentUser() {
    try { setCurrentUserId((await getProfile()).id) } catch {}
  }

  async function loadStats() {
    try { setStats(await getAdminStats()) } catch {}
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
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erro ao carregar usuários")
    } finally {
      setUsersLoading(false)
    }
  }

  async function refreshAll() {
    await Promise.all([loadStats(), loadUsers()])
  }

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
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erro ao alterar admin")
    } finally {
      setAdminLoading(false); setUpdateId(null)
    }
  }

  async function openDetail(user: any) {
    setLoadingDetailId(user.id)
    try {
      setDetailLoading(true); setActivityLoading(true); setActivityPage(1)
      const [detail, activity] = await Promise.all([getUserDetail(user.id), getUserActivity(user.id)])
      setDetailModal({ show: true, user: detail })
      setActivityData(activity)
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erro ao carregar detalhes")
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
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erro ao deletar usuário")
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

  const totalUnverified = stats ? (stats.totalUsers ?? 0) - (stats.totalVerified ?? 0) : null

  // ─── SKELETON ───────────────────────────────────────────────────────────────
  if (initialLoading) return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.backgroundGlow}/>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}><ArrowLeft size={20}/></button>
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
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={20}/>
        </button>
        <div>
          <h1>Painel Admin</h1>
          <p>Gerencie usuários e estatísticas</p>
        </div>
        <button className={styles.refreshBtn} onClick={refreshAll} title="Atualizar">
          <RefreshCcw size={16}/>
        </button>
      </header>

      <main className={styles.container}>

        {error && <div className={styles.error}>{error}</div>}

        {/* ── STATS ── */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <Activity size={17}/>
            <h2>Visão Geral</h2>
          </div>

          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.statBlue}`}>
              <Users size={20}/>
              <span>Total</span>
              <strong>{stats?.totalUsers ?? "–"}</strong>
            </div>
            <div className={`${styles.statCard} ${styles.statGreen}`}>
              <BadgeCheck size={20}/>
              <span>Verificados</span>
              <strong>{stats?.totalVerified ?? "–"}</strong>
            </div>
            <div className={`${styles.statCard} ${styles.statOrange}`}>
              <BadgeX size={20}/>
              <span>Não verif.</span>
              <strong>{totalUnverified ?? "–"}</strong>
            </div>
            <div className={`${styles.statCard} ${styles.statRed}`}>
              <Flame size={20}/>
              <span>Orações</span>
              <strong>{stats?.prayersPrayed ?? "–"}</strong>
            </div>
            <div className={`${styles.statCard} ${styles.statPurple}`}>
              <BookHeart size={20}/>
              <span>Terços</span>
              <strong>{stats?.rosariesPrayed ?? "–"}</strong>
            </div>
            <div className={`${styles.statCard} ${styles.statAmber}`}>
              <Crown size={20}/>
              <span>Consagrações</span>
              <strong>{stats?.consecrationStarted ?? "–"}</strong>
            </div>
          </div>
        </section>

        {/* ── USERS ── */}
        <section className={styles.section}>

          <div className={styles.usersHeader}>
            <div className={styles.sectionTitle}>
              <Users size={17}/>
              <h2>Usuários</h2>
            </div>
            <span className={styles.resultCount}>
              {usersLoading
                ? <Loader2 size={13} className={styles.spinIcon}/>
                : `${sortedUsers.length} encontrados`
              }
            </span>
          </div>

          {/* SEARCH */}
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

          {/* FILTER GROUPS */}
          <div className={styles.filterGroups}>

            <div className={styles.filterGroup}>
              <label>Cargo</label>
              <div className={styles.filterRow}>
                {(["all","admin","normal"] as FilterRole[]).map(v => (
                  <button
                    key={v}
                    className={`${styles.filterChip} ${filterRole === v ? styles.filterChipOn : ""}`}
                    onClick={() => setFilterRole(v)}
                  >
                    {usersLoading && filterRole === v && <Loader2 size={11} className={styles.chipSpinner}/>}
                    {v === "all" ? "Todos" : v === "admin" ? "Admin" : "Normal"}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label>Verificação</label>
              <div className={styles.filterRow}>
                {(["all","verified","unverified"] as FilterVerif[]).map(v => (
                  <button
                    key={v}
                    className={`${styles.filterChip} ${filterVerif === v ? styles.filterChipOn : ""}`}
                    onClick={() => setFilterVerif(v)}
                  >
                    {usersLoading && filterVerif === v && <Loader2 size={11} className={styles.chipSpinner}/>}
                    {v === "all" ? "Todos" : v === "verified" ? "Verificados" : "Não verif."}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label>Atividade</label>
              <div className={styles.filterRow}>
                {(["all","7d","30d"] as FilterActivity[]).map(v => (
                  <button
                    key={v}
                    className={`${styles.filterChip} ${filterActive === v ? styles.filterChipOn : ""}`}
                    onClick={() => setFilterActive(v)}
                  >
                    {usersLoading && filterActive === v && <Loader2 size={11} className={styles.chipSpinner}/>}
                    {v === "all" ? "Todos" : v === "7d" ? "7 dias" : "30 dias"}
                  </button>
                ))}
              </div>
            </div>

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

          {/* LIST */}
          <div className={`${styles.userList} ${usersLoading ? styles.userListFading : ""}`}>
            {sortedUsers.length === 0 && !usersLoading ? (
              <div className={styles.empty}>Nenhum usuário encontrado</div>
            ) : sortedUsers.map(user => {
              const isLoadingThis = loadingDetailId === user.id
              const isUpdatingAdmin = adminLoading && updateId === user.id
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
                      <span title="Streak">
                        <Flame size={12} className={user.isAdmin ? styles.flameAdmin : styles.flameDefault}/>
                        {user.spiritualStats?.prayerStreak || 0}
                      </span>
                    </div>
                    <div className={styles.userActions}>
                      <button
                        className={`${styles.btnView} ${isLoadingThis ? styles.btnLoading : ""}`}
                        onClick={() => !isLoadingThis && openDetail(user)}
                        disabled={isLoadingThis}
                        title="Ver detalhes"
                      >
                        {isLoadingThis
                          ? <Loader2 size={15} className={styles.spinIcon}/>
                          : <Eye size={15}/>
                        }
                      </button>
                      <button
                        className={`${user.isAdmin ? styles.btnAdminOn : styles.btnAdminOff} ${isUpdatingAdmin ? styles.btnLoading : ""}`}
                        disabled={isUpdatingAdmin}
                        onClick={() => !isUpdatingAdmin && toggleAdmin(user.id, user.isAdmin)}
                        title={user.isAdmin ? "Remover admin" : "Tornar admin"}
                      >
                        {isUpdatingAdmin
                          ? <Loader2 size={14} className={styles.spinIcon}/>
                          : <Crown size={14}/>
                        }
                      </button>
                      {user.id !== currentUserId && (
                        <button
                          className={styles.btnDelete}
                          onClick={() => setDeleteModal({ show: true, userId: user.id })}
                          title="Deletar"
                        >
                          <Trash2 size={14}/>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </section>
      </main>

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
                        {paginatedActivities.map((a: any, i: number) => (
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

      <BottomNavbar/>
    </div>
  )
}
