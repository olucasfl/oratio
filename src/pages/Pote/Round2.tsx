import { useRef, useState } from "react"
import Icon from "../../components/Icon/Icon"
import { ITEMS, ITEM_BY_ID, SIZE, ROCK_IDS, type Category } from "./domain/catalog"
import { JAR_FULL_MESSAGE, SAND_TIRED_MESSAGE } from "./domain/content"
import { deriveJar, canPlace, place } from "./domain/rules"
import { COMBOS, computeScore } from "./domain/score"
import ComboBurst from "./components/ComboBurst"
import Jar from "./components/Jar"
import { ScoreBar, ScoreItem } from "./components/Score"
import { formatClock } from "./useRound2Clock"
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"
import {
  round2Finish,
  round2Place,
  round2Remove,
  type PlayerMe,
  type RoomState,
} from "../../services/poteService"
import styles from "./Pote.module.css"

type Act = (fn: () => Promise<RoomState>) => Promise<string | null>
type Tab = Category

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "PEDRA", label: "Pedras", icon: "hexagon" },
  { id: "CASCALHO", label: "Cascalho", icon: "bubble_chart" },
  { id: "AREIA", label: "Areia", icon: "grain" },
]

const TOAST_MS = 2600
const BURST_MS = 2200

export function Round2Play({
  code,
  me,
  paused,
  remainingMs,
  act,
}: {
  code: string
  me: PlayerMe
  paused: boolean
  remainingMs: number | null
  act: Act
}) {
  const r2 = me.round2
  const [tab, setTab] = useState<Tab>("PEDRA")
  const [toast, setToast] = useState<{ text: string; icon: string } | null>(null)
  const [burst, setBurst] = useState<{ icon: string; name: string; key: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const burstTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const burstSeq = useRef(0)

  const placed = r2.placed
  const jar = deriveJar(placed)
  const rocksIn = ROCK_IDS.filter((id) => placed.includes(id)).length
  const unlocked = r2.unlocked
  const activeTab: Tab = !unlocked && tab !== "PEDRA" ? "PEDRA" : tab
  const activeIndex = TABS.findIndex((t) => t.id === activeTab)

  function say(text: string, icon = "info") {
    setToast({ text, icon })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS)
  }

  function celebrate(icon: string, name: string) {
    burstSeq.current += 1
    setBurst({ icon, name, key: burstSeq.current })
    clearTimeout(burstTimer.current)
    burstTimer.current = setTimeout(() => setBurst(null), BURST_MS)
  }

  async function toggle(id: string) {
    if (busy || paused) return
    const item = ITEM_BY_ID[id]
    const isIn = placed.includes(id)
    if (isIn && item.category === "PEDRA") return // pedras não saem do pote

    if (!isIn && !canPlace(jar, item.category)) {
      say(JAR_FULL_MESSAGE, "block")
      return
    }

    // Anúncios otimistas calculados com as mesmas funções puras do servidor.
    let announce: { text: string; icon: string } | null = null
    let combo: (typeof COMBOS)[number] | undefined
    if (!isIn) {
      const result = place(jar, id, item.category)
      const before = computeScore(placed, 2)
      const after = computeScore([...placed, id], 2)
      combo = COMBOS.find((c) => after.combos.includes(c.id) && !before.combos.includes(c.id))
      if (!combo) {
        if (after.sandTired && !before.sandTired) announce = { text: SAND_TIRED_MESSAGE, icon: "smartphone" }
        else if (result.usedGap) announce = { text: "Encaixou nos vãos", icon: "auto_awesome" }
      }
    }

    setBusy(true)
    const err = await act(() => (isIn ? round2Remove(code, id) : round2Place(code, id)))
    setBusy(false)
    if (err) say(err === "NAO_CABE" ? JAR_FULL_MESSAGE : err, "error")
    else if (combo) celebrate(combo.icon, combo.name)
    else if (announce) say(announce.text, announce.icon)
  }

  const items = ITEMS.filter((i) => i.category === activeTab)

  return (
    <>
      <ScoreBar>
        <ScoreItem kind="fun" label="Diversão" value={r2.fun} />
        <ScoreItem kind="life" label="Vida" value={r2.life} />
        <ScoreItem kind="plain" label="Tempo">
          <span className={styles.timer}>{formatClock(remainingMs)}</span>
        </ScoreItem>
      </ScoreBar>

      <p className={styles.subtitle}>
        {unlocked ? `Espaço para escolhas: ${r2.spaceLeft}` : `Pedras: ${rocksIn}/5`}
      </p>

      <div className={styles.tabs} role="tablist">
        <span
          className={styles.tabIndicator}
          aria-hidden
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {TABS.map((t) => {
          const locked = t.id !== "PEDRA" && !unlocked
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              className={activeTab === t.id ? styles.tabActive : styles.tab}
              disabled={locked}
              onClick={() => setTab(t.id)}
            >
              <Icon name={locked ? "lock" : t.icon} size={18} />
              {t.label}
            </button>
          )
        })}
      </div>

      {!unlocked && activeTab === "PEDRA" && (
        <p className={`${styles.locked} ${styles.small}`}>
          <Icon name="lock" size={18} />
          Primeiro as pedras: cascalho e areia liberam depois das 5.
        </p>
      )}

      <div className={styles.game}>
        <div className={styles.col}>
          {/* key: a lista reentra a cada aba */}
          <div className={styles.items} key={activeTab}>
            {items.map((item, i) => {
              const isIn = placed.includes(item.id)
              return (
                <button
                  key={item.id}
                  className={`${isIn ? styles.tileIn : styles.tile} ${styles.enter}`}
                  style={{ ["--i" as string]: i }}
                  disabled={busy || paused || (isIn && item.category === "PEDRA")}
                  aria-pressed={isIn}
                  onClick={() => toggle(item.id)}
                >
                  <span className={styles.tileHead}>
                    <Icon name={item.icon} size={24} filled={isIn} className={styles.tileIcon} />
                    <span className={styles.tileName}>{item.name}</span>
                    {isIn && <Icon name="check_circle" size={20} filled className={styles.tileCheck} />}
                  </span>
                  <span className={styles.tileMeta}>
                    <span>{`Tamanho ${SIZE[item.category]}`}</span>
                    <span><Icon name="favorite" size={14} filled className={styles.icoLife} />{item.life}</span>
                    <span><Icon name="bolt" size={14} filled className={styles.icoFun} />{item.fun}</span>
                  </span>
                  {isIn && item.life < 0 && (
                    <span className={styles.tileWarn} role="img" aria-label="Machuca a Vida">
                      <Icon name="warning" size={16} filled />
                      machuca a vida
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <Jar placed={placed} />
      </div>

      {r2.combos.length > 0 && (
        <div className={styles.leftOut} data-testid="combos">
          {COMBOS.filter((c) => r2.combos.includes(c.id)).map((c) => (
            <span key={c.id} className={`${styles.chip} ${styles.pop}`}>
              <Icon name={c.icon} size={16} filled />
              {c.name}
            </span>
          ))}
        </div>
      )}

      <button className={styles.btnGhost} disabled={paused} onClick={() => setConfirmFinish(true)}>
        <Icon name="flag" size={20} />
        Fechar minha semana
      </button>

      {toast && (
        <div className={styles.toast} role="status" key={toast.text}>
          <Icon name={toast.icon} size={20} filled />
          {toast.text}
        </div>
      )}
      {burst && <ComboBurst key={burst.key} icon={burst.icon} name={burst.name} />}

      <ConfirmModal
        open={confirmFinish}
        title="Fechar a semana?"
        message="Depois de fechar, você não poderá mais mexer no seu pote."
        confirmLabel="Fechar minha semana"
        onConfirm={async () => {
          setConfirmFinish(false)
          const err = await act(() => round2Finish(code))
          if (err) say(err, "error")
        }}
        onCancel={() => setConfirmFinish(false)}
      />
    </>
  )
}

export function Round2Waiting({
  me,
  finished,
  total,
}: {
  me: PlayerMe
  finished: number
  total: number
}) {
  return (
    <>
      <p className={styles.subtitle}>
        Semana fechada. Aguardando os outros… ({finished}/{total} fecharam)
      </p>
      <div className={styles.lobbyJar}>
        <Jar placed={me.round2.placed} />
      </div>
    </>
  )
}
