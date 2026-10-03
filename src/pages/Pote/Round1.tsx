import { useEffect, useRef, useState } from "react"
import Icon from "../../components/Icon/Icon"
import {
  ROUND1_ITEM_SECONDS,
  ITEM_BY_ID,
  ROCK_IDS,
  SIZE,
} from "./domain/catalog"
import { TUTORIAL_BUTTON, TUTORIAL_SCREENS } from "./domain/content"
import { canPlace } from "./domain/rules"
import Jar from "./components/Jar"
import { ScoreBar, ScoreItem } from "./components/Score"
import {
  round1Action,
  tutorialDone,
  type PlayerMe,
  type RoomState,
} from "../../services/poteService"
import styles from "./Pote.module.css"

type Act = (fn: () => Promise<RoomState>) => Promise<string | null>

const ITEM_MS = ROUND1_ITEM_SECONDS * 1000
const TUTORIAL_ICONS = ["inventory_2", "timer", "lock"]

/** Os 3 slides do tutorial. Não explica o vão nem a Vida: é a surpresa. */
export function Tutorial({ code, act, paused }: { code: string; act: Act; paused: boolean }) {
  const [page, setPage] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const last = page === TUTORIAL_SCREENS.length - 1

  return (
    <div className={styles.cardHero} data-testid="tutorial">
      <div className={styles.itemBadge} style={{ alignSelf: "center" }}>
        <Icon name={TUTORIAL_ICONS[page]} size={44} filled />
      </div>
      <p className={styles.eyebrow}>
        {page + 1} / {TUTORIAL_SCREENS.length}
      </p>
      {/* key: o texto reentra a cada slide */}
      <p key={page} className={`${styles.text} ${styles.center} ${styles.enter}`} style={{ minHeight: 110 }}>
        {TUTORIAL_SCREENS[page]}
      </p>
      {error && <p className={styles.error}>{error}</p>}
      {last ? (
        <button
          className={styles.btn}
          disabled={paused}
          onClick={async () => setError(await act(() => tutorialDone(code)))}
        >
          {TUTORIAL_BUTTON}
          <Icon name="arrow_forward" size={20} />
        </button>
      ) : (
        <button className={styles.btn} onClick={() => setPage((p) => p + 1)}>
          Próximo
          <Icon name="arrow_forward" size={20} />
        </button>
      )}
    </div>
  )
}

/** Itens da sequência que já passaram e não entraram — a faixa "Ficou de fora". */
function leftOut(me: PlayerMe): string[] {
  return me.round1.seen.filter((id) => !me.round1.placed.includes(id))
}

export function LeftOutStrip({ ids }: { ids: string[] }) {
  if (ids.length === 0) return null
  return (
    <div className={styles.leftOut} data-testid="left-out">
      <span>Ficou de fora:</span>
      {ids.map((id) => {
        const item = ITEM_BY_ID[id]
        const rock = ROCK_IDS.includes(id)
        return (
          <span key={id} className={rock ? styles.chipRock : styles.chip}>
            <Icon name={item.icon} size={16} />
            {item.name}
          </span>
        )
      })}
    </div>
  )
}

/*
 Um item na tela. O pai usa `key={index}`: cada item remonta o componente e o
 timer recomeça sozinho, sem efeito de "resetar". Pausa congela o relógio local;
 ao zerar o cliente envia PASS (o servidor guarda só o índice e rejeita fora de
 ordem, então um PASS atrasado/duplicado é inofensivo).
*/
function Round1Card({
  code,
  me,
  paused,
  act,
}: {
  code: string
  me: PlayerMe
  paused: boolean
  act: Act
}) {
  const index = me.round1.index
  const item = ITEM_BY_ID[me.round1.currentItemId as string]
  const [remaining, setRemaining] = useState(ITEM_MS)
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sent = useRef(false)

  const fits = canPlace(
    { free: me.round1.free, gaps: me.round1.gaps, placed: me.round1.placed },
    item.category,
  )
  const available = item.category === "PEDRA" ? me.round1.free : me.round1.free + me.round1.gaps
  const needed = SIZE[item.category]

  async function send(action: "TAKE" | "PASS") {
    if (busy || paused || sent.current) return
    sent.current = true
    setBusy(true)
    const err = await act(() => round1Action(code, index, action))
    setBusy(false)
    if (err) {
      sent.current = false
      setError(err)
    }
  }

  useEffect(() => {
    if (paused || busy) return
    let last = performance.now()
    const id = setInterval(() => {
      const t = performance.now()
      setRemaining((r) => Math.max(0, r - (t - last)))
      last = t
    }, 100)
    return () => clearInterval(id)
  }, [paused, busy])

  useEffect(() => {
    if (remaining <= 0 && !paused) {
      send("PASS")
    }
    // só reage ao zerar o relógio
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining])

  function tryTake() {
    if (!fits) {
      setShake(true)
      setTimeout(() => setShake(false), 450)
      return
    }
    send("TAKE")
  }

  return (
    <>
      <div className={`${styles.itemCard} ${shake ? styles.shake : ""}`} data-testid="item-card">
        <span className={styles.itemBadge}>
          <Icon name={item.icon} size={44} filled />
        </span>
        <h2 className={styles.itemName}>{item.name}</h2>
        <div className={styles.chips}>
          <p className={styles.sizePill} aria-label={`Tamanho ${needed}`}>
            <span className={styles.sizeLabel}>Tamanho</span>
            <span className={styles.sizeNum}>{needed}</span>
          </p>
          <p className={styles.itemFun}>
            <Icon name="bolt" size={20} filled />
            {`+${item.fun} diversão`}
          </p>
        </div>
      </div>

      <div className={styles.bar} role="progressbar" aria-label="Tempo para decidir"
        aria-valuemin={0} aria-valuemax={ROUND1_ITEM_SECONDS} aria-valuenow={Math.ceil(remaining / 1000)}>
        <div className={styles.barFill} style={{ transform: `scaleX(${remaining / ITEM_MS})` }} />
      </div>

      {error && <p className={styles.error}><Icon name="error" size={18} />{error}</p>}

      <div className={styles.btnRow}>
        <button
          className={fits ? styles.btn : styles.btnGrey}
          aria-disabled={!fits}
          disabled={busy || paused}
          onClick={tryTake}
        >
          {busy ? <span className={styles.spinner} aria-hidden /> : <Icon name={fits ? "add_circle" : "block"} size={20} />}
          {fits ? (busy ? "Pegando…" : "Pegar") : `Não cabe: precisa de ${needed}, você tem ${available}`}
        </button>
        <button className={styles.btnGhost} disabled={busy || paused} onClick={() => send("PASS")}>
          <Icon name="skip_next" size={20} />
          Deixar passar
        </button>
      </div>
    </>
  )
}

export function Round1Play({
  code,
  me,
  paused,
  act,
}: {
  code: string
  me: PlayerMe
  paused: boolean
  act: Act
}) {
  return (
    <>
      <ScoreBar>
        <ScoreItem kind="fun" label="Diversão" value={me.round1.fun} />
        <ScoreItem kind="plain" label="Item">
          {`${me.round1.index + 1} de ${me.round1.total}`}
        </ScoreItem>
      </ScoreBar>

      <div className={styles.game}>
        <div className={styles.col}>
          <Round1Card key={me.round1.index} code={code} me={me} paused={paused} act={act} />
        </div>
        <Jar placed={me.round1.placed} />
      </div>

      <LeftOutStrip ids={leftOut(me)} />
    </>
  )
}

export function Round1Waiting({
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
        Sua semana acabou. Aguardando os outros… ({finished}/{total} terminaram)
      </p>
      <div className={styles.lobbyJar}>
        <Jar placed={me.round1.placed} />
      </div>
      <LeftOutStrip ids={leftOut(me)} />
    </>
  )
}
