import { useEffect, useRef } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import Icon from "../../components/Icon/Icon"
import PauseOverlay from "./components/PauseOverlay"
import { Final, Lobby, Parable, Result1 } from "./PlayerViews"
import { Round1Play, Round1Waiting, Tutorial } from "./Round1"
import { Round2Play, Round2Waiting } from "./Round2"
import usePoteRoom from "./usePoteRoom"
import useRound2Clock from "./useRound2Clock"
import { joinRoom, type PlayerState } from "../../services/poteService"
import styles from "./Pote.module.css"

const PHASE_TITLE: Record<string, string> = {
  LOBBY: "Sala de espera",
  ROUND_1: "Rodada 1",
  RESULT_1: "Resultado da rodada 1",
  PARABLE: "Parábola",
  ROUND_2: "Rodada 2",
  FINAL: "Considerações finais",
}

/*
 Tela do jogador (`/oratio/dinamicas/pote/:code`). Só chega aqui quem foi
 convidado (o servidor responde 403 a quem não foi, mesmo sabendo o código).
 Esta página só ESCOLHE o que mostrar pela fase/status que vêm do servidor.
*/
export default function PotePlayer() {
  const { code = "" } = useParams()
  const navigate = useNavigate()
  const { data, error, act, now } = usePoteRoom(code)
  const joined = useRef(false)

  // Entra na sala uma vez (idempotente no servidor): é o que marca "joinedAt"
  // e coloca a pessoa no tutorial se a rodada 1 já começou.
  useEffect(() => {
    if (joined.current || !data || data.role !== "PLAYER" || data.removed) return
    joined.current = true
    void act(() => joinRoom(code))
  }, [data, act, code])

  const remainingMs = useRound2Clock(data?.room, now)
  const leave = () => navigate("/oratio/home")

  if (error === "forbidden") {
    return (
      <main className={styles.page}>
        <div className={`${styles.stage} ${styles.hero}`}>
          <span className={styles.heroIcon}><Icon name="lock" size={36} filled /></span>
          <h1 className={styles.title}>Sem convite</h1>
          <p className={styles.subtitle}>Você não foi convidado para esta dinâmica.</p>
          <button className={styles.btn} onClick={leave}>Voltar ao Oratio</button>
        </div>
      </main>
    )
  }
  if (error === "notfound") {
    return (
      <main className={styles.page}>
        <div className={`${styles.stage} ${styles.hero}`}>
          <span className={styles.heroIcon}><Icon name="search_off" size={36} /></span>
          <h1 className={styles.title}>Sala não encontrada</h1>
          <button className={styles.btn} onClick={leave}>Voltar ao Oratio</button>
        </div>
      </main>
    )
  }
  if (!data) {
    return (
      <main className={styles.page}>
        <div className={`${styles.stage} ${styles.hero}`}>
          <span className={styles.heroIcon}><Icon name="inventory_2" size={36} filled /></span>
          <p className={styles.subtitle}>Entrando na sala…</p>
        </div>
      </main>
    )
  }
  if (data.role === "LEADER") {
    // O líder abriu a URL do jogador por engano: leva para o painel dele.
    return <Navigate to={`/oratio/dinamicas/pote/${code}/lider`} replace />
  }
  if (data.removed) {
    return (
      <main className={styles.page}>
        <div className={`${styles.stage} ${styles.hero}`}>
          <span className={styles.heroIcon}><Icon name="person_remove" size={36} /></span>
          <h1 className={styles.title}>Você foi removido da sala</h1>
          <button className={styles.btn} onClick={leave}>Voltar ao Oratio</button>
        </div>
      </main>
    )
  }

  const { room, me, progress, lobby } = data as PlayerState
  const phase = room.phase

  if (phase === "ENDED" || phase === "CANCELLED") {
    return (
      <main className={styles.page}>
        <div className={`${styles.stage} ${styles.hero}`}>
          <span className={styles.heroIcon}>
            <Icon name={phase === "CANCELLED" ? "event_busy" : "volunteer_activism"} size={36} filled />
          </span>
          <h1 className={styles.title}>
            {phase === "CANCELLED" ? "A sala foi encerrada pelo líder." : "Obrigado por jogar!"}
          </h1>
          <button className={styles.btn} onClick={leave}>Voltar ao Oratio</button>
        </div>
      </main>
    )
  }

  let body
  if (phase === "LOBBY") {
    body = <Lobby players={lobby?.players ?? []} />
  } else if (phase === "ROUND_1") {
    const s = me.round1.status
    if (s === "FINISHED") {
      body = <Round1Waiting me={me} finished={progress.round1Finished} total={progress.total} />
    } else if (s === "PLAYING" && me.round1.currentItemId) {
      body = <Round1Play code={code} me={me} paused={room.isPaused} act={act} />
    } else {
      body = <Tutorial code={code} act={act} paused={room.isPaused} />
    }
  } else if (phase === "RESULT_1") {
    body = <Result1 me={me} />
  } else if (phase === "PARABLE") {
    body = <Parable />
  } else if (phase === "ROUND_2") {
    body =
      me.round2.status === "FINISHED" ? (
        <Round2Waiting me={me} finished={progress.round2Finished} total={progress.total} />
      ) : (
        <Round2Play code={code} me={me} paused={room.isPaused} remainingMs={remainingMs} act={act} />
      )
  } else {
    body = <Final me={me} />
  }

  // A chave muda quando o "momento" muda (fase ou status): o conteúdo entra com o
  // mesmo gesto suave. NÃO inclui o índice do item da rodada 1 (cada item já remonta).
  const momentKey = `${phase}:${phase === "ROUND_1" ? me.round1.status : phase === "ROUND_2" ? me.round2.status : ""}`

  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>O Pote</p>
      {PHASE_TITLE[phase] && phase !== "PARABLE" && <h1 className={styles.title}>{PHASE_TITLE[phase]}</h1>}
      <div className={styles.stage} key={momentKey}>
        {body}
      </div>
      <PauseOverlay paused={room.isPaused} />
    </main>
  )
}
