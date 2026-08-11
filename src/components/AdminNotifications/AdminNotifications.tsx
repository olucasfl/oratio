import { useEffect, useMemo, useState } from "react"
import { Send, Users, Search, Check, Bell, Clock } from "lucide-react"

import styles from "./AdminNotifications.module.css"
import {
  sendNotification,
  listCampaigns,
  getSubscribers,
  getRules,
  updateRule
} from "../../services/adminNotificationsService"
import type { Campaign, Rule } from "../../services/adminNotificationsService"
import { getAllUsers } from "../../services/adminService"

const RULE_LABELS: Record<string, string> = {
  LITURGY_MORNING: "Liturgia (manhã · 7h)",
  ANGELUS_MIDDAY: "Angelus (meio-dia · 12h)",
  ROSARY_UNFINISHED: "Terço não terminado (18h)",
  STREAK_AT_RISK: "Sequência em risco (20h)"
}

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
  const [rules, setRules] = useState<Rule[]>([])
  const [savingKey, setSavingKey] = useState<string | null>(null)

  useEffect(()=>{
    listCampaigns().then(setCampaigns).catch(()=>{})
    getSubscribers().then(setSubs).catch(()=>{})
    getRules().then(setRules).catch(()=>{})
  },[])

  function patchRuleLocal(key: string, patch: Partial<Rule>){
    setRules(prev => prev.map(r => r.key === key ? { ...r, ...patch } : r))
  }

  async function saveRule(rule: Rule){
    setSavingKey(rule.key)
    try{
      await updateRule(rule.key, { enabled: rule.enabled, title: rule.title, body: rule.body, url: rule.url })
    }catch{ /* noop */ }finally{ setSavingKey(null) }
  }

  async function toggleRule(rule: Rule){
    const next = !rule.enabled
    patchRuleLocal(rule.key, { enabled: next })
    try{ await updateRule(rule.key, { enabled: next }) }
    catch{ patchRuleLocal(rule.key, { enabled: rule.enabled }) }
  }

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

      <div className={styles.card}>
        <h3 className={styles.cardTitle}><Clock size={15}/> Automáticas</h3>
        <p className={styles.muted}>Enviadas sozinhas para quem ativou o push. Use {"{count}"} p/ interpolar valores.</p>
        <div className={styles.campList}>
          {rules.map((rule)=>(
            <div key={rule.key} className={styles.rule}>
              <div className={styles.ruleTop}>
                <span className={styles.ruleName}>{RULE_LABELS[rule.key] || rule.key}</span>
                <button
                  className={`${styles.ruleSwitch} ${rule.enabled ? styles.ruleSwitchOn : ""}`}
                  onClick={()=>toggleRule(rule)}
                  role="switch"
                  aria-checked={rule.enabled}
                  aria-label="Ligar/desligar"
                ><span className={styles.ruleKnob}/></button>
              </div>
              <input className={styles.input} value={rule.title} onChange={e=>patchRuleLocal(rule.key,{title:e.target.value})} placeholder="Título"/>
              <textarea className={styles.textarea} rows={2} value={rule.body ?? ""} onChange={e=>patchRuleLocal(rule.key,{body:e.target.value})} placeholder="Descrição"/>
              <div className={styles.ruleFoot}>
                <input className={styles.input} value={rule.url ?? ""} onChange={e=>patchRuleLocal(rule.key,{url:e.target.value})} placeholder="/oratio/…"/>
                <button className={styles.saveMini} onClick={()=>saveRule(rule)} disabled={savingKey===rule.key}>
                  {savingKey===rule.key ? "…" : "Salvar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>

  )

}
