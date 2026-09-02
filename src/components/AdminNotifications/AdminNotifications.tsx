import { useEffect, useMemo, useState } from "react"
import { Send, Users, Search, Check, Bell, Clock, Trash2, SlidersHorizontal, Plus } from "lucide-react"

import styles from "./AdminNotifications.module.css"
import {
  sendNotification,
  listCampaigns,
  getSubscribers,
  getRules,
  updateRule,
  deleteCampaign,
  deleteAllCampaigns,
  getSettings,
  updateSettings,
  getVariants,
  createVariant,
  updateVariant,
  deleteVariant
} from "../../services/adminNotificationsService"
import type { Campaign, Rule, NotificationSettings, Variant } from "../../services/adminNotificationsService"
import { getAllUsers } from "../../services/adminService"

const RULE_LABELS: Record<string, string> = {
  ROSARY_UNFINISHED: "Terço não terminado",
  STREAK_AT_RISK: "Sequência em risco",
  BIBLE_RESUME: "Voltar à Bíblia",
  CATECHISM_RESUME: "Voltar ao Catecismo",
  ROSARY_LAPSE: "Faz tempo sem Terço",
  COMEBACK: "Sentimos sua falta",
  SUNDAY_MASS: "Domingo, dia do Senhor",
  VOX_INTRO: "Conheça o VoxAI",
  EXAMEN_NIGHT: "Exame de consciência"
}

// Regra do sistema = uma das pré-definidas (chave conhecida). Só edita
// texto/hora/faixa/limiar/liga-desliga; a lógica de PRA QUEM enviar é
// código e não pode ser apagada pelo painel.
function isSystemRule(rule: Rule): boolean {
  return !!RULE_LABELS[rule.key]
}

const BAND_OPTIONS: { value: string; label: string }[] = [
  { value: "MORNING", label: "Manhã" },
  { value: "AFTERNOON", label: "Tarde" },
  { value: "EVENING", label: "Noite" },
  { value: "ANY", label: "Qualquer" },
]

// Condições que usam janela de "parado há N dias" — só nelas o campo de
// limiar faz sentido.
const THRESHOLD_CONDITIONS = new Set([
  "BIBLE_RESUME", "CATECHISM_RESUME", "ROSARY_LAPSE", "COMEBACK",
])
function usesThreshold(condition: string | null): boolean {
  return !!condition && THRESHOLD_CONDITIONS.has(condition)
}

function dias(n: number | null, fallback: number): string {
  const v = n ?? fallback
  return `${v} dia${v === 1 ? "" : "s"}`
}

// Explica o gatilho de cada regra em linguagem clara, já com os valores
// reais de limiar. As condições são fixas em código; o painel ajusta
// texto/hora/faixa/limiar.
function ruleTrigger(rule: Rule): string {
  const h = rule.hour ?? 0
  const from = `A partir das ${h}h`
  const d = rule.thresholdDays
  switch (rule.condition) {
    case "ROSARY_UNFINISHED": return `${from} · só quem começou um terço e não terminou`
    case "STREAK_AT_RISK":    return `${from} · só quem pode perder a sequência de oração`
    case "BIBLE_RESUME":      return `${from} · só quem parou a leitura da Bíblia há ${dias(d, 3)}`
    case "CATECHISM_RESUME":  return `${from} · só quem parou o Catecismo há ${dias(d, 4)}`
    case "ROSARY_LAPSE":      return `${from} · só quem não completa um terço há ${dias(d, 7)}`
    case "COMEBACK":          return `${from} · só quem está há ${dias(d, 3)}–14 sem abrir o app`
    case "SUNDAY":            return `Domingo, a partir das ${h}h · para quem ativou o push`
    case "VOX_INTRO":         return `${from} · só quem nunca usou o VoxAI`
    default:                  return `À noite (a partir das ${h}h) · lembrete de reflexão`
  }
}

// Destinos do app pra escolher com um clique no link da notificação —
// preenche a rota padrão de cada área.
const APP_LOCATIONS: { label: string; path: string }[] = [
  { label: "Início", path: "/oratio/home" },
  { label: "Liturgia", path: "/oratio/liturgia-completa" },
  { label: "Terço", path: "/oratio/rosary" },
  { label: "Orações", path: "/oratio/prayers" },
  { label: "Consagração", path: "/oratio/consecration" },
  { label: "Confissão", path: "/oratio/confissao" },
  { label: "Bíblia", path: "/oratio/biblia" },
  { label: "Catecismo", path: "/oratio/catecismo" },
  { label: "VoxAI", path: "/oratio/vox" },
  { label: "Santo do dia", path: "/oratio/santo-do-dia" },
  { label: "Perfil", path: "/oratio/profile" },
]

// Editor do pool de variantes de texto de uma regra. Cada disparo usa a
// que aquele usuário recebeu há mais tempo. O piso de "1 variante ativa"
// é garantido pelo backend — aqui só refletimos o erro.
function RuleVariants({ ruleKey }: { ruleKey: string }){
  const [variants, setVariants] = useState<Variant[] | null>(null)
  const [dirty, setDirty] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    getVariants(ruleKey).then(setVariants).catch(()=> setVariants([]))
  },[ruleKey])

  function patchLocal(id: string, patch: Partial<Variant>){
    setVariants(prev => prev ? prev.map(v => v.id === id ? { ...v, ...patch } : v) : prev)
    setDirty(prev => new Set(prev).add(id))
    setError(null)
  }

  async function save(v: Variant){
    setSavingId(v.id)
    setError(null)
    try{
      await updateVariant(v.id, { title: v.title, body: v.body })
      setDirty(prev => { const n = new Set(prev); n.delete(v.id); return n })
    }catch{ setError("Não foi possível salvar a variante.") }
    finally{ setSavingId(null) }
  }

  async function toggle(v: Variant){
    const next = !v.enabled
    setVariants(prev => prev ? prev.map(x => x.id === v.id ? { ...x, enabled: next } : x) : prev)
    setError(null)
    try{ await updateVariant(v.id, { enabled: next }) }
    catch{
      setVariants(prev => prev ? prev.map(x => x.id === v.id ? { ...x, enabled: v.enabled } : x) : prev)
      setError("A regra precisa de pelo menos uma variante ativa.")
    }
  }

  async function remove(v: Variant){
    if(!window.confirm("Remover esta variante?")) return
    setError(null)
    try{
      await deleteVariant(v.id)
      setVariants(prev => prev ? prev.filter(x => x.id !== v.id) : prev)
    }catch{ setError("Não foi possível remover (a regra precisa de uma variante ativa).") }
  }

  async function add(){
    setError(null)
    try{
      const created = await createVariant(ruleKey, { body: "" })
      setVariants(prev => prev ? [...prev, created] : [created])
    }catch{ setError("Não foi possível adicionar a variante.") }
  }

  if(variants === null) return <p className={styles.muted}>Carregando variantes…</p>

  return(
    <div className={styles.variants}>
      <span className={styles.variantsHead}>Variantes ({variants.length}) — o disparo alterna entre as ativas</span>
      {variants.map((v)=>(
        <div key={v.id} className={`${styles.variant} ${v.enabled ? "" : styles.variantOff}`}>
          <div className={styles.variantTop}>
            <button
              type="button"
              className={`${styles.ruleSwitch} ${v.enabled ? styles.ruleSwitchOn : ""}`}
              onClick={()=>toggle(v)}
              role="switch"
              aria-checked={v.enabled}
              aria-label={`Ativar variante ${v.order + 1}`}
            ><span className={styles.ruleKnob}/></button>
            <div className={styles.variantActions}>
              {dirty.has(v.id) && (
                <button
                  className={styles.saveMini}
                  onClick={()=>save(v)}
                  disabled={savingId===v.id}
                  aria-label={`Salvar variante ${v.order + 1}`}
                >
                  {savingId===v.id ? "…" : "Salvar"}
                </button>
              )}
              <button className={styles.iconDel} onClick={()=>remove(v)} aria-label={`Remover variante ${v.order + 1}`}>
                <Trash2 size={15}/>
              </button>
            </div>
          </div>
          <input
            className={styles.input}
            value={v.title ?? ""}
            onChange={e=>patchLocal(v.id, { title: e.target.value })}
            placeholder="Título (vazio = usa o título da regra)"
            maxLength={120}
          />
          <textarea
            className={styles.textarea}
            rows={2}
            maxLength={500}
            value={v.body ?? ""}
            onChange={e=>patchLocal(v.id, { body: e.target.value })}
            placeholder="Texto da notificação"
          />
        </div>
      ))}
      {error && <p className={styles.feedback}>{error}</p>}
      <button className={styles.addVariant} onClick={add} type="button">
        <Plus size={14}/> Adicionar variante
      </button>
    </div>
  )
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

  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null)

  useEffect(()=>{
    listCampaigns().then(setCampaigns).catch(()=>{})
    getSubscribers().then(setSubs).catch(()=>{})
    getRules().then(setRules).catch(()=>{})
    getSettings().then(setSettings).catch(()=>{})
  },[])

  function patchSettings(patch: Partial<NotificationSettings>){
    setSettings(prev => prev ? { ...prev, ...patch } : prev)
    setSettingsMsg(null)
  }

  async function handleSaveSettings(){
    if(!settings) return
    setSavingSettings(true)
    setSettingsMsg(null)
    try{
      const saved = await updateSettings(settings)
      setSettings(saved)
      setSettingsMsg("Ajustes salvos.")
    }catch{
      setSettingsMsg("Não foi possível salvar. Confira os valores (horas 0–23, tetos 0–10).")
    }finally{
      setSavingSettings(false)
    }
  }

  function patchRuleLocal(key: string, patch: Partial<Rule>){
    setRules(prev => prev.map(r => r.key === key ? { ...r, ...patch } : r))
  }

  async function saveRule(rule: Rule){
    setSavingKey(rule.key)
    try{
      // título/corpo agora vivem nas variantes (RuleVariants) — aqui só os
      // parâmetros da regra
      await updateRule(rule.key, {
        enabled: rule.enabled, url: rule.url,
        hour: rule.hour, band: rule.band, thresholdDays: rule.thresholdDays,
      })
    }catch{ /* noop */ }finally{ setSavingKey(null) }
  }

  async function toggleRule(rule: Rule){
    const next = !rule.enabled
    patchRuleLocal(rule.key, { enabled: next })
    try{ await updateRule(rule.key, { enabled: next }) }
    catch{ patchRuleLocal(rule.key, { enabled: rule.enabled }) }
  }

  async function handleDeleteCampaign(id: string){
    if(!window.confirm("Apagar este envio? Ele some do sino de quem recebeu.")) return
    setCampaigns(prev => prev.filter(c => c.id !== id))
    try{ await deleteCampaign(id) }catch{ listCampaigns().then(setCampaigns).catch(()=>{}) }
  }

  async function handleDeleteAllCampaigns(){
    if(campaigns.length === 0) return
    if(!window.confirm(`Apagar TODOS os ${campaigns.length} envios? Eles somem do sino de quem recebeu. Não afeta as automáticas.`)) return
    const prev = campaigns
    setCampaigns([])
    try{ await deleteAllCampaigns() }catch{ setCampaigns(prev) }
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
      setFeedback(`Enviada para ${c.targeted} pessoa(s). O push é entregue em segundo plano — os contadores atualizam na lista de envios abaixo.`)
      setTitle(""); setBody(""); setUrl(""); setSelected([])
      // pequeno atraso pra pegar os contadores já com a entrega em andamento
      setTimeout(()=>{ listCampaigns().then(setCampaigns).catch(()=>{}) }, 1500)
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
        <textarea className={styles.textarea} value={body} onChange={e=>setBody(e.target.value)} rows={4} maxLength={500} placeholder={"Texto completo — pode usar tópicos e emojis.\nQuebras de linha são preservadas."}/>

        <label className={styles.label}>Link de destino (opcional)</label>
        <div className={styles.locGrid}>
          {APP_LOCATIONS.map((loc)=>(
            <button
              key={loc.path}
              type="button"
              className={`${styles.locBtn} ${url === loc.path ? styles.locBtnOn : ""}`}
              onClick={()=>setUrl(url === loc.path ? "" : loc.path)}
            >
              {loc.label}
            </button>
          ))}
        </div>
        <input
          className={styles.input}
          value={url}
          onChange={e=>setUrl(e.target.value)}
          placeholder="Nenhum (abre o app) — ou escolha um local acima"
        />

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
        <div className={styles.cardHead}>
          <h3 className={styles.cardTitle}>Notificações criadas</h3>
          {campaigns.length > 0 && (
            <button className={styles.clearAll} onClick={handleDeleteAllCampaigns}>
              <Trash2 size={14}/> Apagar todas
            </button>
          )}
        </div>
        {campaigns.length === 0 && <p className={styles.muted}>Nenhuma notificação criada ainda.</p>}
        <div className={styles.campList}>
          {campaigns.map(c=>(
            <div key={c.id} className={styles.camp}>
              <div className={styles.campHead}>
                <strong>{c.title}</strong>
                <div className={styles.campRight}>
                  <span className={styles.campBadge}>{c.audience === "ALL" ? "Todos" : "Específicos"}</span>
                  <button className={styles.iconDel} onClick={()=>handleDeleteCampaign(c.id)} aria-label="Apagar envio">
                    <Trash2 size={15}/>
                  </button>
                </div>
              </div>
              {c.body && <p className={styles.campBody}>{c.body}</p>}
              <div className={styles.campMeta}>
                {new Date(c.createdAt).toLocaleDateString("pt-BR")} · {c.targeted} alvo(s) · push {c.pushSent} ✓{c.pushFailed ? ` / ${c.pushFailed} ✕` : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      {settings && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><SlidersHorizontal size={15}/> Ajustes de frequência</h3>
          <p className={styles.muted}>Valem para todas as automáticas. Os valores padrão reproduzem o comportamento de antes — mexa com calma.</p>

          <div className={styles.setGrid}>
            <div className={styles.setField}>
              <label className={styles.label}>Máx. por dia
                <input className={styles.input} type="number" min={0} max={10}
                  value={settings.maxPerDay}
                  onChange={e=>patchSettings({ maxPerDay: Number(e.target.value) })}/>
              </label>
              <span className={styles.setHint}>Teto de automáticas por pessoa por dia.</span>
            </div>

            <div className={styles.setField}>
              <label className={styles.label}>Máx. convites por dia
                <input className={styles.input} type="number" min={0} max={10}
                  value={settings.maxNudgesPerDay}
                  onChange={e=>patchSettings({ maxNudgesPerDay: Number(e.target.value) })}/>
              </label>
              <span className={styles.setHint}>Quantas não-urgentes por dia. O resto do teto fica reservado para as urgentes.</span>
            </div>

            <div className={styles.setField}>
              <label className={styles.label}>Início do silêncio
                <input className={styles.input} type="number" min={0} max={23}
                  value={settings.quietStart}
                  onChange={e=>patchSettings({ quietStart: Number(e.target.value) })}/>
              </label>
              <span className={styles.setHint}>Hora local a partir da qual não notificar.</span>
            </div>

            <div className={styles.setField}>
              <label className={styles.label}>Fim do silêncio
                <input className={styles.input} type="number" min={0} max={23}
                  value={settings.quietEnd}
                  onChange={e=>patchSettings({ quietEnd: Number(e.target.value) })}/>
              </label>
              <span className={styles.setHint}>Hora local antes da qual não notificar.</span>
            </div>

            <div className={styles.setField}>
              <label className={styles.label}>Intervalo mínimo (h)
                <input className={styles.input} type="number" min={0} max={24}
                  value={settings.spacingHours}
                  onChange={e=>patchSettings({ spacingHours: Number(e.target.value) })}/>
              </label>
              <span className={styles.setHint}>Horas de espera entre duas automáticas.</span>
            </div>

            <div className={styles.setField}>
              <label className={styles.label}>Limiar de urgência
                <input className={styles.input} type="number" min={0} max={100}
                  value={settings.urgentThreshold}
                  onChange={e=>patchSettings({ urgentThreshold: Number(e.target.value) })}/>
              </label>
              <span className={styles.setHint}>Prioridade ≥ isso conta como urgente: passa na frente e ignora o descanso.</span>
            </div>
          </div>

          <div className={styles.setToggleRow}>
            <button
              type="button"
              className={`${styles.ruleSwitch} ${settings.restGapEnabled ? styles.ruleSwitchOn : ""}`}
              onClick={()=>patchSettings({ restGapEnabled: !settings.restGapEnabled })}
              role="switch"
              aria-checked={settings.restGapEnabled}
              aria-label="Gap de descanso"
            ><span className={styles.ruleKnob}/></button>
            <span className={styles.setToggleText}>
              <strong>Gap de descanso</strong>
              <span className={styles.setHint}>Cria dias vazios: uma notificação não-urgente só dispara se não houve nenhuma ontem nem hoje. Urgentes passam mesmo assim.</span>
            </span>
          </div>

          {settingsMsg && <p className={styles.feedback}>{settingsMsg}</p>}

          <button className={styles.sendBtn} onClick={handleSaveSettings} disabled={savingSettings}>
            <Check size={16}/> {savingSettings ? "Salvando…" : "Salvar ajustes"}
          </button>
        </div>
      )}

      <div className={styles.card}>
        <h3 className={styles.cardTitle}><Clock size={15}/> Automáticas</h3>
        <p className={styles.muted}>Enviadas sozinhas para quem ativou o push, respeitando os <strong>ajustes de frequência</strong> acima (as urgentes têm prioridade). Gatilho fixo em cada regra; você edita as <strong>variantes de texto, hora, faixa e limiar</strong> e liga/desliga. Use {"{count}"} e {"{label}"} pra interpolar.</p>
        <div className={styles.campList}>
          {rules.map((rule)=>(
            <div key={rule.key} className={styles.rule}>
              <div className={styles.ruleTop}>
                <span className={styles.ruleName}>
                  {RULE_LABELS[rule.key] || "Aviso diário"}
                  {isSystemRule(rule) && <span className={styles.ruleTag}>sistema</span>}
                </span>
                <div className={styles.ruleTopRight}>
                  <button
                    className={`${styles.ruleSwitch} ${rule.enabled ? styles.ruleSwitchOn : ""}`}
                    onClick={()=>toggleRule(rule)}
                    role="switch"
                    aria-checked={rule.enabled}
                    aria-label="Ligar/desligar"
                  ><span className={styles.ruleKnob}/></button>
                </div>
              </div>
              <span className={styles.ruleTrigger}><Clock size={12}/> {ruleTrigger(rule)}</span>
              <RuleVariants ruleKey={rule.key} />
              <div className={styles.ruleKnobs}>
                <label className={styles.knob}>
                  <span>Faixa</span>
                  <select
                    className={styles.knobSelect}
                    value={rule.band ?? "ANY"}
                    onChange={e=>patchRuleLocal(rule.key,{band: e.target.value as Rule["band"]})}
                    aria-label={`Faixa de horário — ${RULE_LABELS[rule.key] || rule.key}`}
                  >
                    {BAND_OPTIONS.map(o=>(<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </label>
                {usesThreshold(rule.condition) && (
                  <label className={styles.knob}>
                    <span>Parado há</span>
                    <input
                      className={styles.knobNum}
                      type="number" min={0} max={90}
                      value={rule.thresholdDays ?? ""}
                      onChange={e=>patchRuleLocal(rule.key,{ thresholdDays: e.target.value === "" ? null : Number(e.target.value) })}
                      aria-label={`Limiar em dias — ${RULE_LABELS[rule.key] || rule.key}`}
                    />
                    <span>dias</span>
                  </label>
                )}
              </div>
              <div className={styles.ruleFoot}>
                <input className={styles.input} value={rule.url ?? ""} onChange={e=>patchRuleLocal(rule.key,{url:e.target.value})} placeholder="/oratio/…"/>
                <span className={styles.hourWrap}>
                  <Clock size={13}/>
                  <input className={styles.hourInput} type="number" min={0} max={23} value={rule.hour ?? 0} onChange={e=>patchRuleLocal(rule.key,{hour:Number(e.target.value)})}/>h
                </span>
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
