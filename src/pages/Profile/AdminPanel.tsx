import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Users, SlidersHorizontal, Trash2, Eye } from "lucide-react"
import type { AdminFilters } from "../../services/adminService"

import { getAdminStats, getAllUsers, setAdminStatus, getUserDetail, deleteUser, getUserActivity } from "../../services/adminService"
import { getProfile } from "../../services/profileService"
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"
import styles from "./AdminPanel.module.css"

export default function AdminPanel(){
  const navigate = useNavigate()

  const [loading,setLoading] = useState(true)
  const [error,setError] = useState<string | null>(null)
  const [stats,setStats] = useState<any>(null)
  const [users,setUsers] = useState<any[]>([])
  const [updateId,setUpdateId] = useState<string | null>(null)
  const [currentUserId,setCurrentUserId] = useState<string | null>(null)
  const [confirmModal,setConfirmModal] = useState<{ show:boolean; userId:string | null }>({ show:false, userId:null })
  
  // Search e filters
  const [searchTerm,setSearchTerm] = useState("")
  const [filterAdmin,setFilterAdmin] = useState<boolean | null>(null)
  const [filterVerified,setFilterVerified] = useState<boolean | null>(null)
  const [filterActive,setFilterActive] = useState(false)
  
  // Detail modal
  const [detailModal,setDetailModal] = useState<{ show:boolean; user:any }>({ show:false, user:null })
  const [detailLoading,setDetailLoading] = useState(false)
  const [activityData,setActivityData] = useState<any>(null)
  const [activityLoading,setActivityLoading] = useState(false)
  
  // Delete modal
  const [deleteModal,setDeleteModal] = useState<{ show:boolean; userId:string | null }>({ show:false, userId:null })
  const [deleteLoading,setDeleteLoading] = useState(false)

  useEffect(()=>{
    loadData()
    getCurrentUser()
  },[]) 

  useEffect(()=>{
    const timer = setTimeout(() => loadData(), 300)
    return () => clearTimeout(timer)
  }, [searchTerm, filterAdmin, filterVerified, filterActive])

  function getActivityIcon(type: string) {
  switch (type) {
    case "LOGIN": return "🟢"
    case "PRAYER": return "🙏"
    case "ROSARY": return "📿"
    case "VOX": return "🤖"
    case "CONSECRATION": return "✝️"
    default: return "📌"
  }
}

  async function getCurrentUser(){
    try{
      const profile = await getProfile()
      setCurrentUserId(profile.id)
    }catch(err){
      console.error("Erro ao carregar usuário atual", err)
    }
  }

  async function loadData(){
    try{
      setLoading(true)
      
      const filters: AdminFilters = {
        search: searchTerm || undefined,
        isAdmin: filterAdmin !== null ? filterAdmin : undefined,
        emailVerified: filterVerified !== null ? filterVerified : undefined,
        activeLastDays: filterActive ? 7 : undefined,
      }
      
      const [statsData,usersData] = await Promise.all([
        getAdminStats(),
        getAllUsers(filters),
      ])

      setStats(statsData)
      setUsers(usersData)
      setError(null)

    }catch(err:any){
      console.error(err)
      const message = err?.response?.data?.message || "Não foi possível carregar dados do admin"
      setError(message)
    }finally{
      setLoading(false)
    }
  }

  async function toggleAdmin(userId:string,current:boolean){
    if(current && userId === currentUserId){
      setConfirmModal({ show:true, userId })
      return
    }
    
    await performToggleAdmin(userId, current)
  }

  async function performToggleAdmin(userId:string,current:boolean){
    try{
      setUpdateId(userId)
      await setAdminStatus(userId,!current)
      setUsers((prev)=>prev.map((u)=>
        u.id === userId ? { ...u, isAdmin: !current } : u
      ))
      setError(null)
      
      if(userId === currentUserId && current){
        setTimeout(()=>navigate("/oratio/profile"), 500)
      }
    }catch(err:any){
      setError(err?.response?.data?.message || "Erro ao atualizar permissão")
    }finally{
      setUpdateId(null)
    }
  }

  async function openDetailModal(user:any){
    try{
      setDetailLoading(true)
      setActivityLoading(true)
      const [detail, activity] = await Promise.all([
        getUserDetail(user.id),
        getUserActivity(user.id)
      ])
      setDetailModal({ show:true, user:detail })
      setActivityData(activity)
    }catch(err:any){
      setError(err?.response?.data?.message || "Erro ao carregar detalhes")
    }finally{
      setDetailLoading(false)
      setActivityLoading(false)
    }
  }

  async function performDeleteUser(userId:string){
    try{
      setDeleteLoading(true)
      await deleteUser(userId)
      setUsers((prev) => prev.filter(u => u.id !== userId))
      setDeleteModal({ show:false, userId:null })
      setError(null)
    }catch(err:any){
      setError(err?.response?.data?.message || "Erro ao deletar usuário")
    }finally{
      setDeleteLoading(false)
    }
  }

  function formatActivityTime(timestamp: string): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Agora"
    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`
    
    return date.toLocaleString("pt-BR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  if(loading){
    return (
      <div className={styles.loading}>
        <p>Carregando painel de administração...</p>
      </div>
    )
  }

  return(
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={()=>navigate(-1)}>{`←`}</button>
        <h1>Painel Admin</h1>
      </header>

      <div className={styles.container}>

        {error && <div className={styles.error}>{error}</div>}

        <section className={styles.statsCard} aria-label="Estatísticas de administração">
          <h2><SlidersHorizontal size={18}/> Visão geral</h2>

          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span>Total de usuários</span>
              <strong>{stats?.totalUsers ?? "-"}</strong>
            </div>

            <div className={styles.statItem}>
              <span>Verificados</span>
              <strong>{stats?.totalVerified ?? "-"}</strong>
            </div>

            <div className={styles.statItem}>
              <span>Consagrações iniciadas</span>
              <strong>{stats?.consecrationStarted ?? "-"}</strong>
            </div>

            <div className={styles.statItem}>
              <span>Orações rezadas</span>
              <strong>{stats?.prayersPrayed ?? "-"}</strong>
            </div>

            <div className={styles.statItem}>
              <span>Terços rezados</span>
              <strong>{stats?.rosariesPrayed ?? "-"}</strong>
            </div>
          </div>
        </section>

        <section className={styles.usersCard} aria-label="Lista de usuários">
          <div className={styles.usersHeader}>
            <h2><Users size={18}/> Usuários</h2>
            <button className={styles.refetch} onClick={loadData}>Atualizar</button>
          </div>

          {/* SEARCH E FILTERS */}
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterBar}>
            <button
              className={`${styles.filterBtn} ${filterAdmin === true ? styles.filterActive : ""}`}
              onClick={() => setFilterAdmin(filterAdmin === true ? null : true)}
            >
              Admin
            </button>
            <button
              className={`${styles.filterBtn} ${filterVerified === false ? styles.filterActive : ""}`}
              onClick={() => setFilterVerified(filterVerified === false ? null : false)}
            >
              Não verificados
            </button>
            <button
              className={`${styles.filterBtn} ${filterActive ? styles.filterActive : ""}`}
              onClick={() => setFilterActive(!filterActive)}
              title="Mostra usuários que tiveram qualquer atividade nos últimos 7 dias (oração, consagração, vox, etc)"
            >
              7 Dias
            </button>
          </div>

          <div className={styles.usersTable}>
            <div className={styles.tableInner}>
              <div className={styles.rowHeader}>
                <span>Nome</span>
                <span>Email</span>
                <span>Criado em</span>
                <span>Ver.</span>
                <span>Admin</span>
                <span>Streak</span>
                <span>Ações</span>
              </div>
              {users.length === 0 ? (
                <div className={styles.empty}>Nenhum usuário encontrado</div>
              ) : (
                users.map((user)=> (
                  <div key={user.id} className={styles.row}>
                    <span className={styles.nameCell}>{user.name}</span>
                    <span className={styles.emailCell}>{user.email}</span>

                    <span>
                      {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit"
                      })}
                    </span>

                    <span>{user.emailVerified ? "✓" : "-"}</span>

                    <span>
                      <button
                        className={user.isAdmin ? styles.adminActive : styles.adminToggle}
                        disabled={updateId === user.id}
                        onClick={()=>toggleAdmin(user.id, user.isAdmin)}
                      >
                        {updateId === user.id ? "..." : user.isAdmin ? "Admin" : "Normal"}
                      </button>
                    </span>

                    <span>
                      🔥 {user.spiritualStats?.prayerStreak ?? 0}
                    </span>

                    <span className={styles.actionsCell}>
                      <button
                        className={styles.btnIcon}
                        onClick={() => openDetailModal(user)}
                        title="Ver detalhes"
                      >
                        <Eye size={16}/>
                      </button>

                      {user.id !== currentUserId && (
                        <button
                          className={styles.btnIconDelete}
                          onClick={() => setDeleteModal({ show:true, userId:user.id })}
                          title="Deletar usuário"
                        >
                          <Trash2 size={16}/>
                        </button>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <p className={styles.note}>
          Este painel é restrito a administradores. Use com responsabilidade para evitar alterações indevidas.
        </p>
      </div>

      {/* MODAL CONFIRMAÇÃO REMOÇÃO DE ADMIN */}
      {confirmModal.show && (
        <div className={styles.modalOverlay} onClick={()=>setConfirmModal({ show:false, userId:null })}>
          <div className={styles.modal} onClick={(e)=>e.stopPropagation()}>
            <h2>Remover sua permissão de admin?</h2>
            <p>Tem certeza que deseja remover sua permissão de administrador? Você será redirecionado para o perfil e não poderá acessar este painel novamente.</p>
            <div className={styles.modalButtons}>
              <button 
                className={styles.cancelBtn}
                onClick={()=>setConfirmModal({ show:false, userId:null })}
              >
                Cancelar
              </button>
              <button 
                className={styles.confirmBtn}
                onClick={async ()=>{
                  setConfirmModal({ show:false, userId:null })
                  if(confirmModal.userId){
                    await performToggleAdmin(confirmModal.userId, true)
                  }
                }}
              >
                Sim, remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHES DO USUÁRIO */}
      {detailModal.show && detailModal.user && (
        <div className={styles.modalOverlay} onClick={() => {
          setDetailModal({ show: false, user: null })
          setActivityData(null)
        }}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            
            <button
              className={styles.modalClose}
              onClick={() => {
                setDetailModal({ show: false, user: null })
                setActivityData(null)
              }}
            >
              ×
            </button>

            {detailLoading ? (
              <div className={styles.loadingSmall}>
                Carregando detalhes...
              </div>
            ) : (
              <>
                <h2>{detailModal.user.name}</h2>

                <div className={styles.detailSections}>

                  {/* BASIC INFO */}
                  <div className={styles.detailSection}>
                    <h3>Informações Básicas</h3>
                    <div className={styles.detailRow}>
                      <strong>Nome:</strong> {detailModal.user.name}
                    </div>
                    <div className={styles.detailRow}>
                      <strong>Email:</strong> {detailModal.user.email}
                    </div>
                    <div className={styles.detailRow}>
                      <strong>Criado em:</strong> {new Date(detailModal.user.createdAt).toLocaleString("pt-BR")}
                    </div>
                    <div className={styles.detailRow}>
                      <strong>Status Admin:</strong> {detailModal.user.isAdmin ? "✓ Administrador" : "Usuário normal"}
                    </div>
                    <div className={styles.detailRow}>
                      <strong>Email Verificado:</strong> {detailModal.user.emailVerified ? "✓ Sim" : "✗ Não"}
                    </div>
                  </div>

                  {/* SPIRITUAL PROGRESS */}
                  <div className={styles.detailSection}>
                    <h3>Progresso Espiritual</h3>
                    <div className={styles.detailRow}>
                      <strong>Orações Rezadas:</strong> {detailModal.user.spiritualStats?.prayersPrayed || 0}
                    </div>
                    <div className={styles.detailRow}>
                      <strong>Terços Rezados:</strong> {detailModal.user.spiritualStats?.rosariesPrayed || 0}
                    </div>
                    <div className={styles.detailRow}>
                      <strong>Sequência de Orações:</strong> {detailModal.user.spiritualStats?.prayerStreak || 0} dias
                    </div>
                    <div className={styles.detailRow}>
                      <strong>Última Oração:</strong> {detailModal.user.spiritualStats?.lastPrayerDate 
                        ? new Date(detailModal.user.spiritualStats.lastPrayerDate).toLocaleString("pt-BR")
                        : "Nenhuma registrada"}
                    </div>
                  </div>

                  {/* CONSECRATION */}
                  <div className={styles.detailSection}>
                    <h3>Consagração</h3>
                    <div className={styles.detailRow}>
                      <strong>Iniciada:</strong> {detailModal.user.consecration?.started ? "✓ Sim" : "✗ Não"}
                    </div>
                    <div className={styles.detailRow}>
                      <strong>Dias Completados:</strong> {detailModal.user.consecration?.daysCompleted || 0} / 33
                    </div>
                  </div>

                  {/* ACTIVITY */}
                  <div className={styles.detailSection}>
                    <h3>Ações</h3>

                    {activityLoading ? (
                      <div className={styles.activityLoading}>
                        Carregando atividades...
                      </div>
                    ) : activityData?.activities && activityData.activities.length > 0 ? (
                      <div className={styles.activityList}>
                        {activityData.activities.map((activity: any, index: number) => (
                          <div key={index} className={styles.activityItem}>
                            <span>{getActivityIcon(activity.type)}</span>

                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                              <span className={styles.activityAction}>{activity.action}</span>
                              <span style={{ fontSize: "11px", color: "#888" }}>
                                {activity.type}
                              </span>
                            </div>

                            <span className={styles.activityTime}>
                              {formatActivityTime(activity.timestamp)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.activityEmpty}>
                        Sem atividades nos últimos 7 dias
                      </div>
                    )}
                  </div>

                </div>

                <div className={styles.modalButtonsLarge}>
                  <button
                    className={styles.closeModalBtn}
                    onClick={() => {
                      setDetailModal({ show: false, user: null })
                      setActivityData(null)
                    }}
                  >
                    Fechar
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* MODAL CONFIRMAÇÃO DELETE */}
      {deleteModal.show && (
        <div className={styles.modalOverlay} onClick={()=>setDeleteModal({ show:false, userId:null })}>
          <div className={styles.modal} onClick={(e)=>e.stopPropagation()}>
            <h2>Deletar usuário?</h2>
            <p>Tem certeza que deseja deletar este usuário? Esta ação é irreversível e removerá todos os seus dados.</p>
            <div className={styles.modalButtons}>
              <button 
                className={styles.cancelBtn}
                onClick={()=>setDeleteModal({ show:false, userId:null })}
                disabled={deleteLoading}
              >
                Cancelar
              </button>
              <button 
                className={styles.confirmBtn}
                onClick={async ()=>{
                  if(deleteModal.userId){
                    await performDeleteUser(deleteModal.userId)
                  }
                }}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deletando..." : "Deletar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavbar/>
    </div>
  )
}
