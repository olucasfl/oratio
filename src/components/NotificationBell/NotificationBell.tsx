import { useEffect, useState, useCallback, useRef, useMemo, Fragment } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { Bell, X, ChevronRight, BellOff, Inbox } from "lucide-react"

import styles from "./NotificationBell.module.css"
import {
  getInbox,
  getUnseenCount,
  markSeen,
  markAllSeen
} from "../../services/notificationsService"
import type { InboxItem } from "../../services/notificationsService"
import { resolveNotifCategory, hexAlpha } from "./notifCategory"

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "agora"
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1) return "ontem"
  return `há ${d} dias`
}

// Agrupa por dia pra organizar a lista (Hoje / Ontem / Anteriores).
function dayGroup(iso: string): string {
  const t = new Date(iso).getTime()
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  if (t >= startToday) return "Hoje"
  if (t >= startToday - 86400000) return "Ontem"
  return "Anteriores"
}

type Tab = "all" | "unread"

export default function NotificationBell(){

  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [unseen, setUnseen] = useState(0)
  const [items, setItems] = useState<InboxItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>("all")
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(()=>{
    getUnseenCount().then(setUnseen).catch(()=>{})
  },[])

  const load = useCallback(async (reset: boolean)=>{
    setLoading(true)
    try{
      const res = await getInbox(reset ? undefined : (cursor ?? undefined))
      setItems(prev => reset ? res.items : [...prev, ...res.items])
      setCursor(res.nextCursor)
    }catch{
      /* noop */
    }finally{
      setLoading(false)
    }
  },[cursor])

  function openPanel(){
    navigator.vibrate?.(8)
    setOpen(true)
    setExpanded(null)
    setTab("all")
    load(true)
  }

  async function toggleItem(it: InboxItem){
    const willExpand = expanded !== it.id
    navigator.vibrate?.(6)
    setExpanded(willExpand ? it.id : null)

    if(willExpand && !it.seenAt){
      markSeen(it.id).catch(()=>{})
      setItems(prev => prev.map(x => x.id === it.id ? { ...x, seenAt: new Date().toISOString() } : x))
      setUnseen(c => Math.max(0, c - 1))
    }

    // Dá tempo da animação de altura (bodyWrap) terminar antes de rolar,
    // senão o cálculo de posição pega o card ainda "fechado".
    if(willExpand){
      window.setTimeout(()=>{
        itemRefs.current[it.id]?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }, 320)
    }
  }

  function seeAll(){
    markAllSeen().catch(()=>{})
    setItems(prev => prev.map(x => ({ ...x, seenAt: x.seenAt ?? new Date().toISOString() })))
    setUnseen(0)
  }

  const visible = useMemo(
    ()=> tab === "unread" ? items.filter(i => !i.seenAt) : items,
    [items, tab],
  )

  const unreadLoaded = useMemo(()=> items.filter(i => !i.seenAt).length, [items])

  let lastGroup = ""
  let idx = 0

  return(

    <>

    <button
      className={styles.bell}
      onClick={openPanel}
      aria-label="Notificações"
    >
      <Bell size={20}/>
      {unseen > 0 && (
        <span className={styles.badge}>{unseen > 9 ? "9+" : unseen}</span>
      )}
    </button>

    {open && createPortal(

      <div className={styles.overlay} onClick={()=>setOpen(false)}>

        <div className={styles.panel} onClick={(e)=>e.stopPropagation()}>

          <div className={styles.handle} aria-hidden="true"/>

          <div className={styles.head}>
            <div className={styles.headTitle}>
              <h3>Notificações</h3>
              <span className={styles.headSub}>
                {unseen > 0 ? `${unseen} não lida${unseen > 1 ? "s" : ""}` : "Tudo em dia"}
              </span>
            </div>
            <div className={styles.headActions}>
              {unseen > 0 && (
                <button className={styles.markAll} onClick={seeAll}>
                  Marcar todas
                </button>
              )}
              <button className={styles.close} onClick={()=>setOpen(false)} aria-label="Fechar">
                <X size={18}/>
              </button>
            </div>
          </div>

          <div className={styles.tabs} role="tablist">
            <button
              role="tab"
              aria-selected={tab === "all"}
              className={`${styles.tab} ${tab === "all" ? styles.tabActive : ""}`}
              onClick={()=>{ setTab("all"); setExpanded(null) }}
            >
              Todas
            </button>
            <button
              role="tab"
              aria-selected={tab === "unread"}
              className={`${styles.tab} ${tab === "unread" ? styles.tabActive : ""}`}
              onClick={()=>{ setTab("unread"); setExpanded(null) }}
            >
              Não lidas
              {unreadLoaded > 0 && <span className={styles.tabCount}>{unreadLoaded}</span>}
            </button>
          </div>

          <div className={styles.list}>

            {items.length === 0 && !loading && (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}><BellOff size={26}/></span>
                <strong>Tudo em dia</strong>
                <span>Nenhuma notificação por aqui ainda.</span>
              </div>
            )}

            {items.length > 0 && visible.length === 0 && (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}><Inbox size={26}/></span>
                <strong>Nada por ler</strong>
                <span>Você já viu todas as notificações.</span>
              </div>
            )}

            {visible.map((it)=>{

              const isOpen = expanded === it.id
              const unread = !it.seenAt
              const hasDetail = !!it.body || !!it.url
              const cat = resolveNotifCategory(it)
              const CatIcon = cat.Icon

              const g = dayGroup(it.createdAt)
              const header = g !== lastGroup ? g : null
              if(header) lastGroup = g
              const i = idx++

              return(

                <Fragment key={it.id}>

                  {header && <div className={styles.groupLabel}>{header}</div>}

                  <div
                    ref={(el)=>{ itemRefs.current[it.id] = el }}
                    className={`${styles.item} ${unread ? styles.unread : ""}`}
                    data-open={isOpen}
                    style={{
                      animationDelay: `${Math.min(i, 8) * 45}ms`,
                      "--accent": cat.accent,
                      "--tile": hexAlpha(cat.accent, 0.12),
                      "--soft": hexAlpha(cat.accent, 0.32),
                    } as React.CSSProperties}
                  >

                    <button
                      className={styles.itemHead}
                      onClick={()=> hasDetail ? toggleItem(it) : undefined}
                    >

                      <span className={styles.icon}>
                        <CatIcon size={17}/>
                      </span>

                      <span className={styles.itemMain}>
                        <span className={styles.itemCat}>{cat.label}</span>
                        <span className={styles.itemTitle}>{it.title}</span>
                        <span className={styles.itemMeta}>
                          {timeAgo(it.createdAt)}
                          {hasDetail && !isOpen && <span className={styles.seeHint}> · Ver detalhes</span>}
                        </span>
                      </span>

                      {unread && <span className={styles.dot} aria-hidden="true"/>}
                      {hasDetail && <ChevronRight size={17} className={styles.chev}/>}

                    </button>

                    <div className={styles.bodyWrap}>
                      <div className={styles.bodyInner}>
                        {it.body && <p className={styles.bodyText}>{it.body}</p>}
                        {it.url && (
                          <button
                            className={styles.goBtn}
                            onClick={()=>{ navigator.vibrate?.(8); setOpen(false); navigate(it.url as string) }}
                          >
                            Abrir <ChevronRight size={15}/>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                </Fragment>

              )

            })}

            {cursor && tab === "all" && (
              <button className={styles.more} onClick={()=>load(false)} disabled={loading}>
                {loading ? "Carregando…" : "Ver mais"}
              </button>
            )}

            {cursor && tab === "unread" && visible.length > 0 && (
              <button className={styles.more} onClick={()=>load(false)} disabled={loading}>
                {loading ? "Carregando…" : "Carregar mais antigas"}
              </button>
            )}

          </div>

        </div>

      </div>,

      document.body

    )}

    </>

  )

}
