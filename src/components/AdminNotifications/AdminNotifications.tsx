import { useEffect, useMemo, useState } from "react"
import { Send, Users, Search, Check, Bell } from "lucide-react"

import styles from "./AdminNotifications.module.css"
import {
  sendNotification,
  listCampaigns,
  getSubscribers
} from "../../services/adminNotificationsService"
import type { Campaign } from "../../services/adminNotificationsService"
import { getAllUsers } from "../../services/adminService"

export default function AdminNotifications(){

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [url, setUrl] = useState("")
  const [audience, setAudience] = useState<"ALL" | "SPECIFIC">("ALL")

  const [users, setUsers] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [userSearch, setUserSearch] = useState("")

  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [subs, setSubs] = useState<{ totalUsers: number; subscribedUsers: number } | null>(null)

  useEffect(()=>{
    listCampaigns().then(setCampaigns).catch(()=>{})
    getSubscribers().then(setSubs).catch(()=>{})
  },[])

  useEffect(()=>{
    if(audience === "SPECIFIC" && users.length === 0){
      getAllUsers().then((u:any)=> setUsers(Array.isArray(u) ? u : (u?.users ?? []))).catch(()=>{})
    }
  },[audience, users.length])

  const filteredUsers = useMemo(()=>{
    const q = userSearch.trim().toLowerCase()
    if(!q) return users.slice(0, 40)
    return users.filter((u:any)=>
      (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q)
    ).slice(0, 40)
  },[users, userSearch])

  function toggleUser(id: string){
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])
  }

  async function handleSend(){
    if(!title.trim()) { setFeedback("Dê um título à notificação."); return }
    if(audience === "SPECIFIC" && selected.length === 0){ setFeedback("Selecione ao menos uma pessoa."); return }

    setSending(true)
    setFeedback(null)
    try{
      const c = await sendNotification({
        title: title.trim(),
        body: body.trim() || undefined,
        url: url.trim() || undefined,
        audience,
        userIds: audience === "SPECIFIC" ? selected : undefined
      })
      setFeedback(`Enviada para ${c.targeted} pessoa(s) · push: ${c.pushSent} entregue(s).`)
      setTitle(""); setBody(""); setUrl(""); setSelected([])
      listCampaigns().then(setCampaigns).catch(()=>{})
    }catch{
      setFeedback("Falha ao enviar. Tente novamente.")
    }finally{
      setSending(false)
    }
  }

  return(

    <div className={styles.wrap}>

      {subs && (
        <div className={styles.statRow}>
          <div className={styles.stat}><Users size={15}/> {subs.totalUsers} usuários</div>
          <div className={styles.stat}><Bell size={15}/> {subs.subscribedUsers} com push ativo</div>
        </div>
      )}

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Nova notificação</h3>

        <label className={styles.label}>Título</label>
        <input className={styles.input} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Novidade no Oratio ✝️" maxLength={120}/>

        <label className={styles.label}>Descrição (opcional)</label>
        <textarea className={styles.textarea} value={body} onChange={e=>setBody(e.target.value)} rows={4} placeholder={"Texto completo — pode usar tópicos e emojis.\nQuebras de linha são preservadas."}/>

        <label className={styles.label}>Link de destino (opcional)</label>
        <input className={styles.input} value={url} onChange={e=>setUrl(e.target.value)} placeholder="/oratio/rosary"/>

        <label className={styles.label}>Público</label>
        <div className={styles.segRow}>
          <button className={`${styles.seg} ${audience==="ALL"?styles.segOn:""}`} onClick={()=>setAudience("ALL")}>Todos</button>
          <button className={`${styles.seg} ${audience==="SPECIFIC"?styles.segOn:""}`} onClick={()=>setAudience("SPECIFIC")}>Escolher pessoas</button>
        </div>

        {audience === "SPECIFIC" && (
          <div className={styles.picker}>
            <div className={styles.searchBox}>
              <Search size={15}/>
              <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Buscar por nome ou e-mail"/>
              {selected.length > 0 && <span className={styles.selCount}>{selected.length}</span>}
            </div>
            <div className={styles.userList}>
              {filteredUsers.map((u:any)=>{
                const on = selected.includes(u.id)
                return(
                  <button key={u.id} className={`${styles.userRow} ${on?styles.userRowOn:""}`} onClick={()=>toggleUser(u.id)}>
                    <span className={styles.check}>{on && <Check size={13}/>}</span>
                    <span className={styles.userInfo}>
                      <strong>{u.name || "—"}</strong>
                      <span>{u.email}</span>
                    </span>
                  </button>
                )
              })}
              {filteredUsers.length === 0 && <p className={styles.muted}>Nenhum usuário.</p>}
            </div>
          </div>
        )}

        {feedback && <p className={styles.feedback}>{feedback}</p>}

        <button className={styles.sendBtn} onClick={handleSend} disabled={sending}>
          <Send size={16}/> {sending ? "Enviando…" : "Enviar notificação"}
        </button>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Ativas (últimos 15 dias)</h3>
        {campaigns.length === 0 && <p className={styles.muted}>Nenhuma notificação ativa.</p>}
        <div className={styles.campList}>
          {campaigns.map(c=>(
            <div key={c.id} className={styles.camp}>
              <div className={styles.campHead}>
                <strong>{c.title}</strong>
                <span className={styles.campBadge}>{c.audience === "ALL" ? "Todos" : "Específicos"}</span>
              </div>
              {c.body && <p className={styles.campBody}>{c.body}</p>}
              <div className={styles.campMeta}>
                {new Date(c.createdAt).toLocaleDateString("pt-BR")} · {c.targeted} alvo(s) · push {c.pushSent} ✓{c.pushFailed ? ` / ${c.pushFailed} ✕` : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>

  )

}
