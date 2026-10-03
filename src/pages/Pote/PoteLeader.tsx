import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Icon from "../../components/Icon/Icon"
import InvitePanel from "./components/InvitePanel"
import PhasePanel from "./Leaderboard"
import usePoteRoom from "./usePoteRoom"
import useRound2Clock from "./useRound2Clock"
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"
import {
  cancelRoom,
  extendRound2,
  removePlayer,
  setPaused,
  setPhase,
  type LeaderPlayer,
  type LeaderState,
  type PotePhase,
  type RoomState,
} from "../../services/poteService"
import styles from "./Pote.module.css"

const PHASE_ICON: Record<PotePhase, string> = {
  LOBBY: "meeting_room",
  ROUND_1: "counter_1",
  RESULT_1: "emoji_events",
  PARABLE: "auto_stories",
  ROUND_2: "counter_2",
  FINAL: "flag",
  ENDED: "check_circle",
  CANCELLED: "event_busy",
}

const PHASE_LABEL: Record<PotePhase, string> = {
  LOBBY: "Sala de espera",
  ROUND_1: "Rodada 1",
  RESULT_1: "Resultado da rodada 1",
  PARABLE: "Parábola",
  ROUND_2: "Rodada 2",
  FINAL: "Considerações finais",
  ENDED: "Jogo encerrado",
  CANCELLED: "Sala cancelada",
}

interface Pending {
  title: string
  message: string
  confirmLabel: string
  run: () => Promise<RoomState>
}

/*
 Tela do líder (admin). Mostra sempre fase + código + a barra de controles
 válidos para a fase. Ações destrutivas (encerrar com gente jogando, cancelar,
 remover) pedem confirmação. Quem decide as transições é o servidor — aqui só
 se oferecem os botões que a fase permite.
*/
export default function PoteLeader() {
  const { code = "" } = useParams()
  const navigate = useNavigate()
  const { data, error, act, now } = usePoteRoom(code)
  const [pending, setPending] = useState<Pending | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const remainingMs = useRound2Clock(data?.room, now)

  async function run(fn: () => Promise<RoomState>) {
    setMessage(await act(fn))
  }

  if (error) {
    return (
      <main className={styles.page}>
        <div className={`${styles.stage} ${styles.hero}`}>
          <span className={styles.heroIcon}><Icon name={error === "notfound" ? "search_off" : "lock"} size={36} filled /></span>
          <h1 className={styles.title}>{error === "notfound" ? "Sala não encontrada" : "Sem acesso"}</h1>
          <button className={styles.btn} onClick={() => navigate("/oratio/dinamicas")}>Voltar</button>
        </div>
      </main>
    )
  }
  if (!data) {
    return (
      <main className={styles.page}>
        <div className={`${styles.stage} ${styles.hero}`}>
          <span className={styles.heroIcon}><Icon name="inventory_2" size={36} filled /></span>
          <p className={styles.subtitle}>Carregando…</p>
        </div>
      </main>
    )
  }
  if (data.role !== "LEADER") {
    return (
      <main className={styles.page}>
        <div className={`${styles.stage} ${styles.hero}`}>
          <span className={styles.heroIcon}><Icon name="admin_panel_settings" size={36} /></span>
          <h1 className={styles.title}>Só o líder da sala</h1>
          <button className={styles.btn} onClick={() => navigate(`/oratio/dinamicas/pote/${code}`)}>
            Ir para a minha tela de jogador
          </button>
        </div>
      </main>
    )
  }

  const state = data as LeaderState
  const { room } = state
  const phase = room.phase
  const finished = phase === "ENDED" || phase === "CANCELLED"
  const stillPlaying1 = state.players.filter((p) => p.joined && p.round1.status !== "FINISHED").length
  const stillPlaying2 = state.players.filter((p) => p.joined && p.round2.status !== "FINISHED").length

  const go = (to: PotePhase) => () => run(() => setPhase(code, to))
  const ask = (p: Pending) => () => setPending(p)

  const cancel = ask({
    title: "Cancelar a sala?",
    message: "Todos os jogadores serão avisados de que a sala foi encerrada.",
    confirmLabel: "Cancelar sala",
    run: () => cancelRoom(code),
  })

  const pauseBtn = (
    <button className={styles.btnGhost} onClick={() => run(() => setPaused(code, !room.isPaused))}>
      <Icon name={room.isPaused ? "play_arrow" : "pause"} size={20} filled />
      {room.isPaused ? "Retomar" : "Pausar"}
    </button>
  )
  const cancelBtn = <button className={styles.btnDanger} onClick={cancel}><Icon name="cancel" size={20} />Cancelar sala</button>

  function onRemove(p: LeaderPlayer) {
    setPending({
      title: `Remover ${p.displayName}?`,
      message: "A pessoa sai da sala e não aparece mais nas estatísticas.",
      confirmLabel: "Remover",
      run: () => removePlayer(code, p.userId),
    })
  }

  let controls: React.ReactNode = null
  if (phase === "LOBBY") {
    controls = (
      <>
        <button className={styles.btn} onClick={go("ROUND_1")}><Icon name="play_circle" size={20} filled />Iniciar</button>
        <button className={styles.btnGhost} onClick={() => setShowInvite((v) => !v)}><Icon name="person_add" size={20} />Convidar mais gente</button>
        <button className={styles.btnGhost} onClick={() => window.open(`/oratio/dinamicas/pote/${code}/telao`, "_blank")}>
          <Icon name="connected_tv" size={20} />Abrir telão
        </button>
        {cancelBtn}
      </>
    )
  } else if (phase === "ROUND_1") {
    controls = (
      <>
        {pauseBtn}
        <button
          className={styles.btn}
          onClick={
            stillPlaying1 > 0
              ? ask({
                  title: "Encerrar a rodada 1?",
                  message: `${stillPlaying1} pessoa${stillPlaying1 > 1 ? "s" : ""} ainda estão jogando. Os itens que não apareceram contam como "deixados passar".`,
                  confirmLabel: "Encerrar rodada 1",
                  run: () => setPhase(code, "RESULT_1"),
                })
              : go("RESULT_1")
          }
        >
          <Icon name="stop_circle" size={20} />Encerrar rodada 1
        </button>
        <button className={styles.btnGhost} onClick={() => setShowInvite((v) => !v)}><Icon name="person_add" size={20} />Convidar</button>
        {cancelBtn}
      </>
    )
  } else if (phase === "RESULT_1") {
    controls = (<><button className={styles.btn} onClick={go("PARABLE")}><Icon name="auto_stories" size={20} />Mostrar parábola</button>{cancelBtn}</>)
  } else if (phase === "PARABLE") {
    controls = (<><button className={styles.btn} onClick={go("ROUND_2")}><Icon name="play_circle" size={20} filled />Iniciar rodada 2</button>{cancelBtn}</>)
  } else if (phase === "ROUND_2") {
    controls = (
      <>
        {pauseBtn}
        <button className={styles.btnGhost} onClick={() => run(() => extendRound2(code))}><Icon name="more_time" size={20} />+1 minuto</button>
        <button
          className={styles.btn}
          onClick={
            stillPlaying2 > 0
              ? ask({
                  title: "Encerrar a rodada 2?",
                  message: `${stillPlaying2} pessoa${stillPlaying2 > 1 ? "s" : ""} ainda estão montando. O pote delas fica como está.`,
                  confirmLabel: "Encerrar rodada 2",
                  run: () => setPhase(code, "FINAL"),
                })
              : go("FINAL")
          }
        >
          <Icon name="stop_circle" size={20} />Encerrar rodada 2
        </button>
        {cancelBtn}
      </>
    )
  } else if (phase === "FINAL") {
    controls = <button className={styles.btn} onClick={go("ENDED")}><Icon name="check_circle" size={20} />Encerrar jogo</button>
  }

  return (
    <main className={styles.pageWide}>
      <div className={styles.leaderBar}>
        <div className={styles.phaseRow}>
          <span className={styles.phaseName}>
            <Icon name={PHASE_ICON[phase]} size={22} filled />
            {PHASE_LABEL[phase]}
            {room.isPaused && (
              <span className={styles.pausedTag}>
                <Icon name="pause_circle" size={16} filled />
                pausado
              </span>
            )}
          </span>
          <span className={styles.code} aria-label={`Código da sala ${code}`}>{code}</span>
        </div>
        {!finished && <div className={styles.btnRow}>{controls}</div>}
        {message && <p className={styles.error} role="alert"><Icon name="error" size={18} />{message}</p>}
      </div>

      {finished ? (
        <>
          <h1 className={styles.title}>{PHASE_LABEL[phase]}</h1>
          <button className={styles.btn} onClick={() => navigate("/oratio/dinamicas")}><Icon name="arrow_back" size={20} />Voltar às dinâmicas</button>
        </>
      ) : null}

      {showInvite && !finished && <InvitePanel code={code} />}

      <PhasePanel state={state} remainingMs={remainingMs} onRemove={finished ? undefined : onRemove} />

      <ConfirmModal
        open={pending !== null}
        title={pending?.title}
        message={pending?.message ?? ""}
        confirmLabel={pending?.confirmLabel}
        danger
        onConfirm={() => {
          const p = pending
          setPending(null)
          if (p) void run(p.run)
        }}
        onCancel={() => setPending(null)}
      />
    </main>
  )
}
