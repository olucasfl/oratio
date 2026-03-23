import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Users, SlidersHorizontal } from "lucide-react"

import { getAdminStats, getAllUsers, setAdminStatus } from "../../services/adminService"
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

  useEffect(()=>{
    loadData()
    getCurrentUser()
  },[]) 

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
      const [statsData,usersData] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
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

          <div className={styles.usersTable}>
            <div className={styles.rowHeader}>
              <span>Nome</span>
              <span>Email</span>
              <span>Verificado</span>
              <span>Admin</span>
              <span>Desde</span>
            </div>
            {users.map((user)=> (
              <div key={user.id} className={styles.row}>
                <span>{user.name}</span>
                <span>{user.email}</span>
                <span>{user.emailVerified ? "Sim" : "Não"}</span>
                <span>
                  <button
                    className={user.isAdmin ? styles.adminActive : styles.adminToggle}
                    disabled={updateId === user.id}
                    onClick={()=>toggleAdmin(user.id, user.isAdmin)}
                    aria-label={`Tornar ${user.isAdmin ? "não " : ""}administrador`}
                  >
                    {updateId === user.id ? "..." : user.isAdmin ? "Admin" : "Normal"}
                  </button>
                </span>
                <span>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </section>

        <p className={styles.note}>
          Este painel é restrito a administradores. Use com responsabilidade para evitar alterações indevidas.
        </p>
      </div>

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

      <BottomNavbar/>
    </div>
  )
}
