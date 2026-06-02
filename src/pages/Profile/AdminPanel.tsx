import { useEffect,useMemo,useState } from "react"
import { useNavigate } from "react-router-dom"

import {
 Users,
 Trash2,
 Eye,
 Shield,
 ShieldCheck,
 Search,
 Activity,
 Crown,
 RefreshCcw,
 ArrowLeft,
 Flame,
 X
} from "lucide-react"

import type { AdminFilters }
from "../../services/adminService"

import {
 getAdminStats,
 getAllUsers,
 setAdminStatus,
 getUserDetail,
 deleteUser,
 getUserActivity
} from "../../services/adminService"

import { getProfile }
from "../../services/profileService"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

import styles from "./AdminPanel.module.css"

export default function AdminPanel(){

 const navigate = useNavigate()

 const [loading,setLoading] = useState(true)
 const [error,setError] = useState<string | null>(null)

 const [stats,setStats] = useState<any>(null)
 const [users,setUsers] = useState<any[]>([])

 const [updateId,setUpdateId] =
 useState<string | null>(null)

 const [currentUserId,setCurrentUserId] =
 useState<string | null>(null)

 const [searchTerm,setSearchTerm] =
 useState("")

 const [filterAdmin,setFilterAdmin] =
 useState<boolean | null>(null)

 const [filterVerified,setFilterVerified] =
 useState<boolean | null>(null)

 const [filterActive,setFilterActive] =
 useState(false)

 const [detailModal,setDetailModal] =
 useState<{
  show:boolean
  user:any
 }>({
  show:false,
  user:null
 })

 const [detailLoading,setDetailLoading] =
 useState(false)

 const [activityData,setActivityData] =
 useState<any>(null)

 const [activityLoading,setActivityLoading] =
 useState(false)

 const [deleteModal,setDeleteModal] =
 useState<{
  show:boolean
  userId:string | null
 }>({
  show:false,
  userId:null
 })

 const [deleteLoading,setDeleteLoading] =
 useState(false)

 const [activityPage,setActivityPage] =
 useState(1)

 const ITEMS_PER_PAGE = 20

 const [adminPasswordModal,
 setAdminPasswordModal] = useState<{
  show:boolean
  userId:string | null
  current:boolean
 }>({
  show:false,
  userId:null,
  current:false
 })

 const [adminPassword,setAdminPassword] =
 useState("")

 const [adminLoading,setAdminLoading] =
 useState(false)

 useEffect(()=>{

  loadData()

  getCurrentUser()

 },[])

 useEffect(()=>{

  if(adminPasswordModal.show) return

  const timer = setTimeout(()=>{

   loadData()

  },300)

  return ()=>clearTimeout(timer)

 },[
  searchTerm,
  filterAdmin,
  filterVerified,
  filterActive
 ])

 async function getCurrentUser(){

  try{

   const profile = await getProfile()

   setCurrentUserId(profile.id)

  }catch(err){

   console.error(err)

  }

 }

 async function loadData(){

  try{

   setLoading(true)

   const filters:AdminFilters = {

    search:
     searchTerm || undefined,

    isAdmin:
     filterAdmin !== null
      ? filterAdmin
      : undefined,

    emailVerified:
     filterVerified !== null
      ? filterVerified
      : undefined,

    activeLastDays:
     filterActive
      ? 7
      : undefined

   }

   const [statsData,usersData] =
   await Promise.all([

    getAdminStats(),
    getAllUsers(filters)

   ])

   setStats(statsData)
   setUsers(usersData)

   setError(null)

  }catch(err:any){

   setError(
    err?.response?.data?.message ||
    "Erro ao carregar painel"
   )

  }finally{

   setLoading(false)

  }

 }

 async function toggleAdmin(
  userId:string,
  current:boolean
 ){

  setAdminPassword("")

  setAdminPasswordModal({
   show:true,
   userId,
   current
  })

 }

 async function performToggleAdmin(
  userId:string,
  current:boolean,
  password:string
 ){

  try{

   setUpdateId(userId)

   setAdminLoading(true)

   await setAdminStatus(
    userId,
    !current,
    password
   )

   setUsers((prev)=>
    prev.map((u)=>

     u.id === userId
      ? {
         ...u,
         isAdmin:!current
        }
      : u

    )
   )

   setAdminPassword("")

   setAdminPasswordModal({
    show:false,
    userId:null,
    current:false
   })

   if(userId === currentUserId && current){

    setTimeout(()=>{

     navigate("/oratio/profile")

    },500)

   }

  }catch(err:any){

   setError(
    err?.response?.data?.message ||
    "Erro ao alterar admin"
   )

  }finally{

   setAdminLoading(false)
   setUpdateId(null)

  }

 }

 async function openDetailModal(user:any){

  try{

   setDetailLoading(true)
   setActivityLoading(true)
   setActivityPage(1)

   const [detail,activity] =
   await Promise.all([

    getUserDetail(user.id),
    getUserActivity(user.id)

   ])

   setDetailModal({
    show:true,
    user:detail
   })

   setActivityData(activity)

  }catch(err:any){

   setError(
    err?.response?.data?.message ||
    "Erro ao carregar detalhes"
   )

  }finally{

   setDetailLoading(false)
   setActivityLoading(false)

  }

 }

 async function performDeleteUser(
  userId:string
 ){

  try{

   setDeleteLoading(true)

   await deleteUser(userId)

   setUsers((prev)=>
    prev.filter((u)=>
     u.id !== userId
    )
   )

   setDeleteModal({
    show:false,
    userId:null
   })

  }catch(err:any){

   setError(
    err?.response?.data?.message ||
    "Erro ao deletar usuário"
   )

  }finally{

   setDeleteLoading(false)

  }

 }

 function getActivityIcon(type:string){

  switch(type){

   case "LOGIN":
    return "🟢"

   case "PRAYER":
    return "🙏"

   case "ROSARY":
    return "📿"

   case "VOX":
    return "🤖"

   case "CONSECRATION":
    return "✝️"

   default:
    return "📌"

  }

 }

 function formatActivityTime(
  timestamp:string
 ){

  const date = new Date(timestamp)

  const now = new Date()

  const diffMs =
   now.getTime() - date.getTime()

  const diffHours =
   Math.floor(diffMs / 3600000)

  const diffDays =
   Math.floor(diffMs / 86400000)

  if(diffHours < 1){

   return "Agora"

  }

  if(diffHours < 24){

   return `${diffHours}h atrás`

  }

  if(diffDays < 7){

   return `${diffDays}d atrás`

  }

  return date.toLocaleString(
   "pt-BR",
   {
    day:"2-digit",
    month:"short",
    hour:"2-digit",
    minute:"2-digit"
   }
  )

 }

 const paginatedActivities =
 useMemo(()=>{

  const sorted =
   [...(activityData?.activities || [])]
   .sort((a,b)=>

    new Date(b.timestamp).getTime() -
    new Date(a.timestamp).getTime()

   )

  const start =
   (activityPage - 1) * ITEMS_PER_PAGE

  return sorted.slice(
   start,
   start + ITEMS_PER_PAGE
  )

 },[
  activityData,
  activityPage
 ])

 if(loading){

  return(

   <div className={`${styles.page} page-enter`}>

    <div className={styles.backgroundGlow}/>

    <header className={styles.header}>
     <button className={styles.backButton} onClick={()=>navigate(-1)}>
      <ArrowLeft size={20}/>
     </button>
     <div className="skeleton" style={{height:22,width:140,borderRadius:8}}/>
    </header>

    <div style={{padding:"0 20px",display:"flex",flexDirection:"column",gap:16}}>
     <div style={{display:"flex",gap:12}}>
      <div className="skeleton" style={{flex:1,height:80,borderRadius:16}}/>
      <div className="skeleton" style={{flex:1,height:80,borderRadius:16}}/>
      <div className="skeleton" style={{flex:1,height:80,borderRadius:16}}/>
     </div>
     <div className="skeleton" style={{height:48,width:"100%",borderRadius:12}}/>
     <div className="skeleton" style={{height:100,width:"100%",borderRadius:16}}/>
     <div className="skeleton" style={{height:100,width:"100%",borderRadius:16}}/>
     <div className="skeleton" style={{height:100,width:"100%",borderRadius:16}}/>
    </div>

   </div>

  )

 }

 return(

  <div className={`${styles.page} page-enter`}>

   <div className={styles.backgroundGlow}></div>

   {/* HEADER */}

   <header className={styles.header}>

    <button
     className={styles.backButton}
     onClick={()=>navigate(-1)}
    >

     <ArrowLeft size={20}/>

    </button>

    <div>

     <h1>Painel Admin</h1>

     <p>
      Gerencie usuários e estatísticas
     </p>

    </div>

   </header>

   <main className={styles.container}>

    {error && (

     <div className={styles.error}>

      {error}

     </div>

    )}

    {/* STATS */}

    <section className={styles.statsSection}>

     <div className={styles.sectionTitle}>

      <Activity size={18}/>

      <h2>Visão Geral</h2>

     </div>

     <div className={styles.statsGrid}>

      <div className={styles.statCard}>

       <Users size={20}/>

       <span>Total usuários</span>

       <strong>
        {stats?.totalUsers ?? "-"}
       </strong>

      </div>

      <div className={styles.statCard}>

       <ShieldCheck size={20}/>

       <span>Verificados</span>

       <strong>
        {stats?.totalVerified ?? "-"}
       </strong>

      </div>

      <div className={styles.statCard}>

       <Crown size={20}/>

       <span>Consagrações</span>

       <strong>
        {stats?.consecrationStarted ?? "-"}
       </strong>

      </div>

      <div className={styles.statCard}>

       <Flame size={20}/>

       <span>Orações</span>

       <strong>
        {stats?.prayersPrayed ?? "-"}
       </strong>

      </div>

     </div>

    </section>

    {/* USERS */}

    <section className={styles.usersSection}>

     <div className={styles.usersHeader}>

      <div className={styles.sectionTitle}>

       <Users size={18}/>

       <h2>Usuários</h2>

      </div>

      <button
       className={styles.refreshButton}
       onClick={loadData}
      >

       <RefreshCcw size={16}/>

       Atualizar

      </button>

     </div>

     {/* SEARCH */}

     <div className={styles.searchWrapper}>

      <Search size={18}/>

      <input
       type="text"
       placeholder="Buscar usuário..."
       value={searchTerm}
       onChange={(e)=>
        setSearchTerm(e.target.value)
       }
      />

     </div>

     {/* FILTERS */}

     <div className={styles.filters}>

      <button
       className={`${styles.filterButton} ${
        filterAdmin === true
         ? styles.filterActive
         : ""
       }`}
       onClick={()=>

        setFilterAdmin(
         filterAdmin === true
          ? null
          : true
        )

       }
      >

       <Shield size={14}/>
       Admin

      </button>

      <button
       className={`${styles.filterButton} ${
        filterVerified === false
         ? styles.filterActive
         : ""
       }`}
       onClick={()=>

        setFilterVerified(
         filterVerified === false
          ? null
          : false
        )

       }
      >

       Não verificados

      </button>

      <button
       className={`${styles.filterButton} ${
        filterActive
         ? styles.filterActive
         : ""
       }`}
       onClick={()=>
        setFilterActive(!filterActive)
       }
      >

       7 dias

      </button>

     </div>

     {/* TABLE */}

     <div className={styles.tableWrapper}>

      <div className={styles.tableHeader}>

       <span>Usuário</span>
       <span>Status</span>
       <span>Streak</span>
       <span>Ações</span>

      </div>

      {users.length === 0 ? (

       <div className={styles.empty}>

        Nenhum usuário encontrado

       </div>

      ) : (

       users.map((user)=>(

        <div
         key={user.id}
         className={styles.userRow}
        >

         <div className={styles.userInfo}>

          <div className={styles.userAvatar}>

           {user.name?.charAt(0)}

          </div>

          <div>

           <strong>
            {user.name}
           </strong>

           <p>
            {user.email}
           </p>

          </div>

         </div>

         <div className={styles.statusColumn}>

          {user.isAdmin ? (

           <span
            className={styles.adminBadge}
           >

            Admin

           </span>

          ) : (

           <span
            className={styles.userBadge}
           >

            Usuário

           </span>

          )}

         </div>

         <div className={styles.streakColumn}>

          🔥{" "}

          {user.spiritualStats
           ?.prayerStreak || 0}

         </div>

         <div className={styles.actionsColumn}>

          <button
           className={styles.iconButton}
           onClick={()=>
            openDetailModal(user)
           }
          >

           <Eye size={16}/>

          </button>

          <button
           className={
            user.isAdmin
             ? styles.adminButton
             : styles.normalButton
           }
           disabled={
            adminLoading &&
            updateId === user.id
           }
           onClick={()=>

            toggleAdmin(
             user.id,
             user.isAdmin
            )

           }
          >

           {updateId === user.id
            ? "..."
            : user.isAdmin
             ? "Admin"
             : "Normal"}

          </button>

          {user.id !== currentUserId && (

           <button
            className={styles.deleteButton}
            onClick={()=>

             setDeleteModal({
              show:true,
              userId:user.id
             })

            }
           >

            <Trash2 size={15}/>

           </button>

          )}

         </div>

        </div>

       ))

      )}

     </div>

    </section>

   </main>

   {/* DETAIL MODAL */}

   {detailModal.show && detailModal.user && (

    <div
     className={styles.modalOverlay}
     onClick={()=>{
      setDetailModal({
       show:false,
       user:null
      })

      setActivityData(null)
     }}
    >

     <div
      className={styles.detailModal}
      onClick={(e)=>e.stopPropagation()}
     >

      <button
       className={styles.closeButton}
       onClick={()=>{
        setDetailModal({
         show:false,
         user:null
        })

        setActivityData(null)
       }}
      >

       <X size={18}/>

      </button>

      {detailLoading ? (

       <div className={styles.loadingSmall}>

        Carregando...

       </div>

      ) : (

       <>
        <div className={styles.modalUser}>

         <div className={styles.modalAvatar}>

          {detailModal.user.name?.charAt(0)}

         </div>

         <div>

          <h2>
           {detailModal.user.name}
          </h2>

          <p>
           {detailModal.user.email}
          </p>

         </div>

        </div>

        <div className={styles.detailGrid}>

         <div className={styles.detailCard}>

          <h3>Conta</h3>

          <span>
           Criado em:
          </span>

          <strong>

           {new Date(
            detailModal.user.createdAt
           ).toLocaleString("pt-BR")}

          </strong>

         </div>

         <div className={styles.detailCard}>

          <h3>Orações</h3>

          <span>
           Total
          </span>

          <strong>

           {detailModal.user
            .spiritualStats
            ?.prayersPrayed || 0}

          </strong>

         </div>

         <div className={styles.detailCard}>

          <h3>Terços</h3>

          <span>
           Total
          </span>

          <strong>

           {detailModal.user
            .spiritualStats
            ?.rosariesPrayed || 0}

          </strong>

         </div>

         <div className={styles.detailCard}>

          <h3>Streak</h3>

          <span>
           Dias
          </span>

          <strong>

           🔥{" "}

           {detailModal.user
            .spiritualStats
            ?.prayerStreak || 0}

          </strong>

         </div>

        </div>

        {/* ACTIVITY */}

        <div className={styles.activitySection}>

         <h3>
          Atividades recentes
         </h3>

         {activityLoading ? (

          <div className={styles.loadingSmall}>

           Carregando atividades...

          </div>

         ) : paginatedActivities.length > 0 ? (

          <div className={styles.activityList}>

           {paginatedActivities.map(
            (activity:any,index:number)=>(

             <div
              key={index}
              className={styles.activityItem}
             >

              <div
               className={styles.activityIcon}
              >

               {getActivityIcon(
                activity.type
               )}

              </div>

              <div
               className={styles.activityContent}
              >

               <strong>

                {activity.action}

               </strong>

               <span>

                {activity.type}

               </span>

              </div>

              <div
               className={styles.activityTime}
              >

               {formatActivityTime(
                activity.timestamp
               )}

              </div>

             </div>

            )
           )}

           <div className={styles.pagination}>

            <button
             disabled={activityPage === 1}
             onClick={()=>

              setActivityPage((p)=>

               Math.max(p - 1,1)

              )

             }
            >

             ←

            </button>

            <span>
             Página {activityPage}
            </span>

            <button
             disabled={
              activityPage *
              ITEMS_PER_PAGE >=
              (activityData?.activities
               ?.length || 0)
             }
             onClick={()=>

              setActivityPage((p)=>p + 1)

             }
            >

             →

            </button>

           </div>

          </div>

         ) : (

          <div className={styles.emptyActivity}>

           Sem atividades recentes

          </div>

         )}

        </div>
       </>

      )}

     </div>

    </div>

   )}

   {/* DELETE MODAL */}

   {deleteModal.show && (

    <div
     className={styles.modalOverlay}
     onClick={()=>

      setDeleteModal({
       show:false,
       userId:null
      })

     }
    >

     <div
      className={styles.modal}
      onClick={(e)=>e.stopPropagation()}
     >

      <h2>Deletar usuário?</h2>

      <p>
       Esta ação é irreversível.
      </p>

      <div className={styles.modalButtons}>

       <button
        className={styles.cancelBtn}
        onClick={()=>

         setDeleteModal({
          show:false,
          userId:null
         })

        }
       >

        Cancelar

       </button>

       <button
        className={styles.confirmBtn}
        disabled={deleteLoading}
        onClick={async()=>{

         if(deleteModal.userId){

          await performDeleteUser(
           deleteModal.userId
          )

         }

        }}
       >

        {deleteLoading
         ? "Deletando..."
         : "Deletar"}

       </button>

      </div>

     </div>

    </div>

   )}

   {/* ADMIN PASSWORD */}

   {adminPasswordModal.show && (

    <div
     className={styles.modalOverlay}
     onClick={()=>

      setAdminPasswordModal({
       show:false,
       userId:null,
       current:false
      })

     }
    >

     <div
      className={styles.modal}
      onClick={(e)=>e.stopPropagation()}
     >

      <h2>

       {adminPasswordModal.current
        ? "Remover admin"
        : "Tornar admin"}

      </h2>

      <p>
       Digite a senha de segurança.
      </p>

      <input
       type="password"
       placeholder="Senha admin"
       value={adminPassword}
       onChange={(e)=>

        setAdminPassword(
         e.target.value
        )

       }
       className={styles.passwordInput}
      />

      <div className={styles.modalButtons}>

       <button
        className={styles.cancelBtn}
        onClick={()=>{
         setAdminPassword("")
         setAdminPasswordModal({
          show:false,
          userId:null,
          current:false
         })
        }}
       >

        Cancelar

       </button>

       <button
        className={styles.confirmBtn}
        disabled={
         !adminPassword ||
         adminLoading
        }
        onClick={()=>{

         if(adminPasswordModal.userId){

          performToggleAdmin(
           adminPasswordModal.userId,
           adminPasswordModal.current,
           adminPassword
          )

         }

        }}
       >

        {adminLoading
         ? "Verificando..."
         : "Confirmar"}

       </button>

      </div>

     </div>

    </div>

   )}

   <BottomNavbar/>

  </div>

 )
}