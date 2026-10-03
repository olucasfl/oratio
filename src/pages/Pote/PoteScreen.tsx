import { useParams } from "react-router-dom"
import Icon from "../../components/Icon/Icon"
import PauseOverlay from "./components/PauseOverlay"
import PhasePanel from "./Leaderboard"
import usePoteRoom from "./usePoteRoom"
import useRound2Clock from "./useRound2Clock"
import type { LeaderState } from "../../services/poteService"
import styles from "./Pote.module.css"

/*
 Telão (`/oratio/dinamicas/pote/:code/telao`): projetado, só leitura. É a sessão
 do próprio admin aberta em outra aba/aparelho — não existe endpoint público do
 telão, então nada aqui vaza para quem só sabe o código. Mostra só nomes de
 exibição e dados do jogo, nunca e-mail.
*/
export default function PoteScreen() {
  const { code = "" } = useParams()
  const { data, error, now } = usePoteRoom(code)
  const remainingMs = useRound2Clock(data?.room, now)

  if (error) {
    return <main className={styles.screenPage}><h1 className={styles.title}>Sala indisponível</h1></main>
  }
  if (!data || data.role !== "LEADER") {
    return <main className={styles.screenPage}><p className={styles.subtitle}>Carregando…</p></main>
  }

  const state = data as LeaderState
  const phase = state.room.phase

  return (
    <main className={styles.screenPage}>
      {phase === "LOBBY" && (
        <>
          <div className={`${styles.hero} ${styles.stage}`}>
            <span className={styles.heroIcon}><Icon name="inventory_2" size={40} filled /></span>
            <h1 className={styles.title}>O Pote</h1>
            <p className={styles.subtitle}>Abra o convite que chegou no sino do Oratio</p>
            <div className={styles.codeBig} aria-label={`Código da sala ${code}`}>{code}</div>
          </div>
        </>
      )}
      {phase === "CANCELLED" && (
        <div className={`${styles.hero} ${styles.stage}`}>
          <span className={styles.heroIcon}><Icon name="event_busy" size={40} filled /></span>
          <h1 className={styles.title}>A sala foi encerrada pelo líder.</h1>
        </div>
      )}
      {phase === "ENDED" && (
        <div className={`${styles.hero} ${styles.stage}`}>
          <span className={styles.heroIcon}><Icon name="volunteer_activism" size={40} filled /></span>
          <h1 className={styles.title}>Obrigado por jogar!</h1>
        </div>
      )}
      {phase !== "CANCELLED" && phase !== "ENDED" && (
        <PhasePanel state={state} remainingMs={remainingMs} />
      )}
      <PauseOverlay paused={state.room.isPaused} />
    </main>
  )
}
