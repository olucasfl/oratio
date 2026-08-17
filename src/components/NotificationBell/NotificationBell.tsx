import { useEffect, useState, useCallback, useRef, Fragment } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { Bell, X, ChevronRight, Sparkles, Megaphone, BellOff } from "lucide-react"

import styles from "./NotificationBell.module.css"
import {
  getInbox,
  getUnseenCount,
  markSeen,
  markAllSeen
} from "../../services/notificationsService"
import type { InboxItem } from "../../services/notificationsService"

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

export default function NotificationBell(){

  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [unseen, setUnseen] = useState(0)
  const [items, setItems] = useState<InboxItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
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
            <h3>Notificações</h3>
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

          <div className={styles.list}>

            {items.length === 0 && !loading && (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}><BellOff size={26}/></span>
                <strong>Tudo em dia</strong>
                <span>Nenhuma notificação por aqui ainda.</span>
              </div>
            )}

            {items.map((it)=>{

              const isOpen = expanded === it.id
              const unread = !it.seenAt
              const hasDetail = !!it.body || !!it.url
              const SrcIcon = it.source === "CAMPAIGN" ? Megaphone : Sparkles

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
                    style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                  >

                    <button
                      className={styles.itemHead}
                      onClick={()=> hasDetail ? toggleItem(it) : undefined}
                    >

                      <span className={`${styles.icon} ${it.source === "CAMPAIGN" ? styles.iconCampaign : styles.iconRule}`}>
                        <SrcIcon size={16}/>
                      </span>

                      <span className={styles.itemMain}>
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

            {cursor && (
              <button className={styles.more} onClick={()=>load(false)} disabled={loading}>
                {loading ? "Carregando…" : "Ver mais"}
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
