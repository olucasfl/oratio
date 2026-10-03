import Icon from "../../components/Icon/Icon"
import { ITEM_BY_ID } from "./domain/catalog"
import { CLASSIFICATION_TEXT } from "./domain/content"
import { COMBOS, type Classification } from "./domain/score"
import { JarFill } from "./components/Jar"
import { Parable } from "./PlayerViews"
import { formatClock } from "./useRound2Clock"
import type { CountedItem, LeaderPlayer, LeaderState } from "../../services/poteService"
import styles from "./Pote.module.css"

const name = (id: string) => ITEM_BY_ID[id]?.name ?? id
const named = (c: CountedItem) => `${name(c.id)} (${c.count})`

interface Status {
  icon: string
  text: string
  /** 0..1 — preenchimento da barrinha de progresso (omitido = sem barra). */
  pct?: number
}

function round1Status(p: LeaderPlayer): Status {
  if (!p.joined) return { icon: "mail", text: "convidado, ainda não entrou" }
  switch (p.round1.status) {
    case "FINISHED":
      return { icon: "check_circle", text: `terminou, ${p.round1.rocksIn}/5 pedras`, pct: 1 }
    case "PLAYING":
      return {
        icon: "play_circle",
        text: `item ${Math.min(p.round1.index + 1, p.round1.total)}/${p.round1.total}`,
        pct: p.round1.index / p.round1.total,
      }
    case "IN_TUTORIAL":
      return { icon: "menu_book", text: "no tutorial", pct: 0 }
    default:
      return { icon: "hourglass_empty", text: "aguardando", pct: 0 }
  }
}

function round2Status(p: LeaderPlayer): Status {
  if (!p.joined) return { icon: "mail", text: "convidado, ainda não entrou" }
  if (p.round2.status === "FINISHED") return { icon: "check_circle", text: "fechou a semana", pct: 1 }
  if (p.round2.status === "PLAYING") {
    return {
      icon: "play_circle",
      text: `montando, ${p.round2.fill}/100 usados, pedras ${p.round2.rocksIn}/5`,
      pct: p.round2.fill / 100,
    }
  }
  return { icon: "hourglass_empty", text: "aguardando", pct: 0 }
}

function PlayerRow({
  p,
  status,
  index,
  onRemove,
}: {
  p: LeaderPlayer
  status: Status
  index: number
  onRemove?: (p: LeaderPlayer) => void
}) {
  return (
    <li className={styles.playerRow} style={{ ["--i" as string]: index }}>
      <span className={styles.avatar} aria-hidden>{p.displayName.charAt(0).toUpperCase()}</span>
      <div className={styles.playerMain}>
        <span className={styles.playerName}>
          <span className={p.joined && p.connected ? styles.dotOn : styles.dot} aria-hidden />
          {p.displayName}
          {p.joined && !p.connected && (
            <span className={styles.disc}>
              <Icon name="wifi_off" size={14} />
              desconectado
            </span>
          )}
        </span>
        <span className={styles.playerMeta}>
          <Icon name={status.icon} size={15} filled={status.icon !== "mail" && status.icon !== "menu_book"} />{" "}
          {status.text}
        </span>
        {status.pct !== undefined && (
          <div className={styles.progress} aria-hidden>
            <div className={styles.progressFill} style={{ transform: `scaleX(${Math.max(0, Math.min(1, status.pct))})` }} />
          </div>
        )}
      </div>
      {onRemove && (
        <button className={styles.removeBtn} aria-label={`Remover ${p.displayName}`} onClick={() => onRemove(p)}>
          <Icon name="person_remove" size={22} />
        </button>
      )}
    </li>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className={styles.stat}>
      <span className={`${styles.small} ${styles.muted}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        {icon && <Icon name={icon} size={16} filled />}
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  )
}

/*
 O painel da fase atual: o mesmo para o líder (com botão de remover) e para o
 telão (só leitura, `onRemove` ausente). Tudo vem pronto do servidor.
*/
export default function PhasePanel({
  state,
  remainingMs,
  onRemove,
}: {
  state: LeaderState
  remainingMs: number | null
  onRemove?: (p: LeaderPlayer) => void
}) {
  const { room, players, stats, joinedCount, invitedCount } = state
  const active = players.filter((p) => p.joined)

  if (room.phase === "LOBBY") {
    return (
      <section className={`${styles.card} ${styles.stage}`}>
        <h2 className={styles.subtitle}>
          {joinedCount} jogador{joinedCount === 1 ? "" : "es"} ({invitedCount} convidado{invitedCount === 1 ? "" : "s"})
        </h2>
        <ul className={styles.playerList}>
          {players.map((p, i) => (
            <PlayerRow
              key={p.userId}
              p={p}
              index={i}
              status={p.joined ? { icon: "check_circle", text: "na sala" } : { icon: "mail", text: "convidado" }}
              onRemove={onRemove}
            />
          ))}
          {players.length === 0 && <li className={styles.muted}>Ninguém convidado ainda.</li>}
        </ul>
      </section>
    )
  }

  if (room.phase === "ROUND_1") {
    const r1 = stats.round1
    return (
      <div className={styles.stage}>
        <section className={styles.card}>
          <div className={styles.stats}>
            <Stat icon="flag" label="Terminaram" value={`${r1.finished}/${joinedCount}`} />
            <Stat icon="hexagon" label="Com as 5 pedras" value={String(r1.withAllRocks)} />
            <Stat icon="block" label="Pedra mais deixada de fora" value={r1.mostMissedRock ? named(r1.mostMissedRock) : "—"} />
            <Stat icon="grain" label="Areia mais pega" value={r1.mostTakenSand ? named(r1.mostTakenSand) : "—"} />
          </div>
        </section>
        <ul className={styles.playerList}>
          {players.map((p, i) => <PlayerRow key={p.userId} p={p} index={i} status={round1Status(p)} onRemove={onRemove} />)}
        </ul>
      </div>
    )
  }

  if (room.phase === "RESULT_1") {
    const r1 = stats.round1
    return (
      <div className={styles.stage}>
        <section className={styles.card}>
          <p className={`${styles.text} ${styles.center}`}>
            {r1.withAllRocks} de {r1.finished} tiveram uma semana com Deus
          </p>
          {r1.mostMissedRock && (
            <p className={`${styles.text} ${styles.center}`}>
              Pedra mais deixada de fora: {name(r1.mostMissedRock.id)} ({r1.mostMissedRock.count} pessoa
              {r1.mostMissedRock.count > 1 ? "s" : ""})
            </p>
          )}
        </section>
        <div className={styles.potGrid}>
          {active.filter((p) => p.round1.status === "FINISHED").map((p, i) => (
            <div key={p.userId} className={`${styles.potCell} ${styles.enter}`} style={{ ["--i" as string]: i }}>
              <JarFill fill={p.round1.fill} />
              <strong>{p.displayName}</strong>
              {p.round1.rocksMissing.length > 0 && (
                <span className={styles.missing}>
                  fora: {p.round1.rocksMissing.map(name).join(", ")}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (room.phase === "PARABLE") return <Parable />

  if (room.phase === "ROUND_2") {
    const r2 = stats.round2
    const combo = r2.mostActivatedCombo
    return (
      <div className={styles.stage}>
        <section className={styles.card}>
          <div className={styles.stats}>
            <Stat icon="timer" label="Tempo" value={formatClock(remainingMs)} />
            <Stat icon="flag" label="Fecharam" value={`${r2.finished}/${joinedCount}`} />
            <Stat icon="thumb_up" label="Mais escolhidos" value={r2.topChosen.map(named).join(", ") || "—"} />
            <Stat icon="block" label="Mais deixados de fora" value={r2.topLeftOut.map(named).join(", ") || "—"} />
            <Stat
              icon="celebration"
              label="Combo mais ativado"
              value={combo ? `${COMBOS.find((c) => c.id === combo.id)?.name ?? combo.id} (${combo.count})` : "—"}
            />
            <Stat icon="bar_chart" label="Média diversão / vida" value={`${r2.avgFun} / ${r2.avgLife}`} />
          </div>
        </section>
        <ul className={styles.playerList}>
          {players.map((p, i) => <PlayerRow key={p.userId} p={p} index={i} status={round2Status(p)} onRemove={onRemove} />)}
        </ul>
      </div>
    )
  }

  // FINAL / ENDED / CANCELLED
  const r1pct = stats.round1.finished ? Math.round((stats.round1.withAllRocks / stats.round1.finished) * 100) : 0
  const r2pct = stats.round2.finished ? Math.round((stats.round2.withAllRocks / stats.round2.finished) * 100) : 0
  return (
    <div className={styles.stage}>
      <section className={styles.card}>
        <div className={styles.stats}>
          {(Object.keys(stats.classifications) as Classification[]).map((k) => (
            <Stat
              key={k}
              icon={CLASSIFICATION_TEXT[k].icon}
              label={CLASSIFICATION_TEXT[k].name}
              value={String(stats.classifications[k])}
            />
          ))}
        </div>
      </section>
      <section className={styles.card}>
        <div className={styles.stats}>
          <Stat icon="thumb_up" label="Mais escolhidos" value={stats.round2.topChosen.map(named).join(", ") || "—"} />
          <Stat icon="block" label="Mais deixados de fora" value={stats.round2.topLeftOut.map(named).join(", ") || "—"} />
          <Stat icon="trending_up" label="Com as 5 pedras: rodada 1 × rodada 2" value={`${r1pct}% × ${r2pct}%`} />
        </div>
      </section>
    </div>
  )
}
