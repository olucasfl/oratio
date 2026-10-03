import { useMemo, useRef, useState } from "react"
import Icon from "../../components/Icon/Icon"
import { ITEMS, ITEM_BY_ID, SIZE, ROCK_IDS, type Category } from "./domain/catalog"
import { JAR_FULL_MESSAGE, SAND_TIRED_MESSAGE } from "./domain/content"
import { deriveJar, canPlace, place, spaceForChoices } from "./domain/rules"
import { COMBOS, computeScore } from "./domain/score"
import ComboBurst from "./components/ComboBurst"
import Jar from "./components/Jar"
import { ScoreBar, ScoreItem } from "./components/Score"
import { formatClock } from "./useRound2Clock"
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"
import {
  round2Finish,
  round2Sync,
  type PlayerMe,
  type PlayerState,
  type RoomState,
} from "../../services/poteService"
import styles from "./Pote.module.css"

type Act = (fn: () => Promise<RoomState>) => Promise<string | null>
type Tab = Category

/** Uma ação do jogador ainda a caminho do servidor. */
interface Op {
  id: string
  kind: "add" | "remove"
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "PEDRA", label: "Pedras", icon: "hexagon" },
  { id: "CASCALHO", label: "Cascalho", icon: "bubble_chart" },
  { id: "AREIA", label: "Areia", icon: "grain" },
]

const TOAST_MS = 2600
const BURST_MS = 2200
/** Toques dentro dessa janela viajam juntos, num pedido só. */
const BATCH_MS = 40

/** O que o jogador vê = o que o servidor confirmou + as ações ainda pendentes. */
function applyOps(base: readonly string[], ops: readonly Op[]): string[] {
  let list = [...base]
  for (const op of ops) {
    if (op.kind === "add" && !list.includes(op.id)) list = [...list, op.id]
    if (op.kind === "remove") list = list.filter((id) => id !== op.id)
  }
  return list
}

/*
 Rodada 2. Cascalho e areia estão liberados desde o início e podem ser pegos e
 retirados até fechar a semana; as pedras não saem. Toda ação responde NA HORA
 (o item entra/sai do pote e o placar acompanha, usando as mesmas funções puras
 do servidor) e mostra um indicador de "salvando" no item até o servidor
 confirmar.

 Para não depender da velocidade do servidor, os toques NÃO viram um pedido cada:
 enquanto um pedido está a caminho, os novos toques se acumulam e o próximo pedido
 leva a lista inteira que o jogador quer ter (round2Sync). Dez toques seguidos custam
 1 ou 2 idas ao servidor, não dez. Se um pedido falhar, os itens dele somem da tela e
 o motivo aparece num aviso.
*/
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
  const [ops, setOps] = useState<Op[]>([])
  const [toast, setToast] = useState<{ text: string; icon: string } | null>(null)
  const [burst, setBurst] = useState<{ icon: string; name: string; key: number } | null>(null)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const burstTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const burstSeq = useRef(0)
  // Lista que o servidor confirmou por último e as ações ainda não confirmadas (espelho
  // em ref para o laço de envio enxergar o valor mais novo sem esperar um render).
  const confirmed = useRef<string[]>(me.round2.placed)
  const opsRef = useRef<Op[]>([])
  const flying = useRef<Promise<void> | null>(null)
  const batchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const placed = useMemo(() => applyOps(r2.placed, ops), [r2.placed, ops])
  const pending = useMemo(() => new Set(ops.map((o) => o.id)), [ops])
  const jar = useMemo(() => {
    try {
      return deriveJar(placed)
    } catch {
      return deriveJar(r2.placed) // lista impossível (não deveria): volta ao que o servidor confirmou
    }
  }, [placed, r2.placed])
  const score = useMemo(() => computeScore(placed, 2), [placed])
  const rocksIn = ROCK_IDS.filter((id) => placed.includes(id)).length
  const activeIndex = TABS.findIndex((t) => t.id === tab)

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

  function updateOps(fn: (list: Op[]) => Op[]) {
    opsRef.current = fn(opsRef.current)
    setOps(opsRef.current)
  }

  /** Envia o que está pendente. Um pedido por vez; o que chegar durante o voo vai no próximo. */
  function flush(): Promise<void> {
    if (flying.current) return flying.current
    flying.current = (async () => {
      try {
        while (opsRef.current.length > 0) {
          const covered = opsRef.current
          const target = applyOps(confirmed.current, covered)
          const err = await act(async () => {
            const state = await round2Sync(code, target)
            const placed = (state as PlayerState).me?.round2.placed
            if (placed) confirmed.current = placed
            return state
          })
          updateOps((list) => list.filter((o) => !covered.includes(o)))
          if (err) say(err === "NAO_CABE" ? JAR_FULL_MESSAGE : err, "error")
        }
      } finally {
        flying.current = null
      }
    })()
    return flying.current
  }

  /** Junta toques muito próximos num só pedido (se já há um em voo, o laço dele cuida). */
  function scheduleFlush() {
    if (flying.current || batchTimer.current) return
    batchTimer.current = setTimeout(() => {
      batchTimer.current = undefined
      void flush()
    }, BATCH_MS)
  }

  function toggle(id: string) {
    if (paused || pending.has(id)) return
    const item = ITEM_BY_ID[id]
    const isIn = placed.includes(id)
    if (isIn && item.category === "PEDRA") return // pedras não saem do pote

    if (!isIn && !canPlace(jar, item.category)) {
      say(JAR_FULL_MESSAGE, "block")
      return
    }

    // Anúncio imediato, calculado com as mesmas funções puras do servidor.
    if (!isIn) {
      const result = place(jar, id, item.category)
      const before = computeScore(placed, 2)
      const after = computeScore([...placed, id], 2)
      const combo = COMBOS.find((c) => after.combos.includes(c.id) && !before.combos.includes(c.id))
      if (combo) celebrate(combo.icon, combo.name)
      else if (after.sandTired && !before.sandTired) say(SAND_TIRED_MESSAGE, "smartphone")
      else if (result.usedGap) say("Encaixou nos vãos", "auto_awesome")
    }

    const op: Op = { id, kind: isIn ? "remove" : "add" }
    updateOps((list) => [...list, op])
    scheduleFlush()
  }

  const items = ITEMS.filter((i) => i.category === tab)
  const saving = ops.length > 0

  return (
    <>
      <ScoreBar>
        <ScoreItem kind="fun" label="Diversão" value={score.fun} />
        <ScoreItem kind="life" label="Vida" value={score.life} />
        <ScoreItem kind="plain" label="Tempo">
          <span className={styles.timer}>{formatClock(remainingMs)}</span>
        </ScoreItem>
      </ScoreBar>

      <p className={styles.subtitle}>
        {`Pedras: ${rocksIn}/5 · Espaço no pote: ${spaceForChoices(jar)}`}
      </p>

      <div className={styles.syncRow} role="status" aria-live="polite">
        {saving && (
          <>
            <span className={styles.spinner} aria-hidden />
            Salvando…
          </>
        )}
      </div>

      <div className={styles.tabs} role="tablist">
        <span
          className={styles.tabIndicator}
          aria-hidden
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? styles.tabActive : styles.tab}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={18} />
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.game}>
        <div className={styles.col}>
          {/* key: a lista reentra a cada aba */}
          <div className={styles.items} key={tab}>
            {items.map((item, i) => {
              const isIn = placed.includes(item.id)
              const isPending = pending.has(item.id)
              return (
                <button
                  key={item.id}
                  className={`${isIn ? styles.tileIn : styles.tile} ${isPending ? styles.tilePending : ""} ${styles.enter}`}
                  style={{ ["--i" as string]: i }}
                  disabled={paused || isPending || (isIn && item.category === "PEDRA")}
                  aria-pressed={isIn}
                  aria-busy={isPending}
                  onClick={() => toggle(item.id)}
                >
                  <span className={styles.tileHead}>
                    <Icon name={item.icon} size={24} filled={isIn} className={styles.tileIcon} />
                    <span className={styles.tileName}>{item.name}</span>
                    {isPending ? (
                      <span className={`${styles.spinner} ${styles.tileCheck}`} role="img" aria-label="Salvando" />
                    ) : (
                      isIn && <Icon name="check_circle" size={20} filled className={styles.tileCheck} />
                    )}
                  </span>
                  <span className={styles.tileMeta}>
                    <span className={styles.sizeTag}>{`Tamanho ${SIZE[item.category]}`}</span>
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

      {score.combos.length > 0 && (
        <div className={styles.leftOut} data-testid="combos">
          {COMBOS.filter((c) => score.combos.includes(c.id)).map((c) => (
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
        onConfirm={() => {
          setConfirmFinish(false)
          // só fecha depois que as ações pendentes chegaram ao servidor
          void (async () => {
            clearTimeout(batchTimer.current)
            batchTimer.current = undefined
            await flush()
            const err = await act(() => round2Finish(code))
            if (err) say(err, "error")
          })()
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
