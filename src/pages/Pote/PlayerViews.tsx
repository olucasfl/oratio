import Icon from "../../components/Icon/Icon"
import { ITEM_BY_ID } from "./domain/catalog"
import {
  CLASSIFICATION_TEXT,
  FINAL_TEXT,
  PARABLE,
} from "./domain/content"
import { COMBOS } from "./domain/score"
import Jar from "./components/Jar"
import { ScoreBar, ScoreItem } from "./components/Score"
import { LeftOutStrip } from "./Round1"
import type { PlayerMe } from "../../services/poteService"
import styles from "./Pote.module.css"

/*
 Sala de espera do jogador: sem pote (ele só aparece dentro do jogo). Mostra, em
 tempo real, quem já entrou — o polling traz a lista e cada chegada nova entra
 com animação. Só nomes de exibição.
*/
export function Lobby({ players }: { players: { displayName: string; isMe: boolean }[] }) {
  return (
    <div className={styles.stage}>
      <div className={styles.hero}>
        <span className={styles.heroIcon}>
          <Icon name="groups" size={38} filled />
        </span>
        <h2 className={styles.subtitle}>
          Aguardando o líder começar
          <span className={styles.waitDots} aria-hidden>
            <i /><i /><i />
          </span>
        </h2>
      </div>

      <section className={styles.card} aria-live="polite">
        <p className={styles.liveCount}>
          <span className={styles.liveDot} aria-hidden />
          {players.length === 1 ? "1 pessoa na sala" : `${players.length} pessoas na sala`}
        </p>
        <ul className={styles.lobbyList}>
          {players.map((p, i) => (
            <li key={`${p.displayName}-${i}`} className={styles.lobbyPerson}>
              <span className={styles.avatar} aria-hidden>{p.displayName.charAt(0).toUpperCase()}</span>
              <span className={styles.lobbyName}>{p.displayName}</span>
              {p.isMe && <span className={styles.youTag}>você</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export function Result1({ me }: { me: PlayerMe }) {
  const r = me.round1
  if (r.status !== "FINISHED") {
    return <p className={styles.subtitle}>Você entrou depois da rodada 1. Acompanhe a próxima etapa.</p>
  }
  const all = r.rocksMissing.length === 0
  return (
    <>
      <span className={styles.resultIcon}>
        <Icon name={all ? "volunteer_activism" : "hourglass_bottom"} size={44} filled />
      </span>
      <p className={`${styles.text} ${styles.center} ${styles.enter}`} style={{ ["--i" as string]: 1 }}>
        {all
          ? "Parabéns! Você teve uma semana com Deus. Todas as pedras estão no seu pote."
          : `Sua semana ficou cheia… mas não coube: ${r.rocksMissing
              .map((id) => ITEM_BY_ID[id].name)
              .join(", ")}.`}
      </p>
      <div className={`${styles.lobbyJar} ${styles.enter}`} style={{ ["--i" as string]: 2 }}>
        <Jar placed={r.placed} />
      </div>
      <div className={styles.enter} style={{ ["--i" as string]: 3 }}>
        <ScoreBar>
          <ScoreItem kind="fun" label="Diversão" value={r.fun} />
          <ScoreItem kind="life" label="Vida" value={r.life ?? 0} />
        </ScoreBar>
      </div>
      {!all && r.penalty !== null && (
        <p className={`${styles.error} ${styles.enter}`} style={{ ["--i" as string]: 4 }} data-testid="penalty">
          <Icon name="trending_down" size={20} />
          {`−${r.penalty} de Vida: ${r.rocksMissing.length} pedra${r.rocksMissing.length > 1 ? "s" : ""} de fora (−20 cada)`}
        </p>
      )}
    </>
  )
}

export function Parable() {
  return (
    <article className={styles.prose}>
      <p className={styles.eyebrow}>Parábola</p>
      <h1 className={styles.title}>{PARABLE.title}</h1>
      {PARABLE.paragraphs.map((p, i) => (
        <p key={p} className={styles.enter} style={{ ["--i" as string]: i + 1 }}>{p}</p>
      ))}
      <h2 className={styles.subtitle}>Para conversar</h2>
      <ol className={styles.questions}>
        {PARABLE.questions.map((q, i) => (
          <li key={q} className={styles.enter} style={{ ["--i" as string]: PARABLE.paragraphs.length + i + 1 }}>{q}</li>
        ))}
      </ol>
    </article>
  )
}

export function Final({ me }: { me: PlayerMe }) {
  const r2 = me.round2
  const cls = r2.classification ? CLASSIFICATION_TEXT[r2.classification] : null
  const missed = Object.values(ITEM_BY_ID)
    .filter((i) => i.category !== "PEDRA" && !r2.placed.includes(i.id))

  return (
    <>
      {cls ? (
        <div className={styles.classCard} data-testid="classification">
          <span className={styles.classIcon}>
            <Icon name={cls.icon} size={44} filled />
          </span>
          <h2 className={styles.title}>{cls.name}</h2>
          <p className={`${styles.text} ${styles.center} ${styles.enter}`} style={{ ["--i" as string]: 2 }}>{cls.text}</p>
          <div className={styles.enter} style={{ ["--i" as string]: 3, width: "100%" }}>
            <ScoreBar>
              <ScoreItem kind="fun" label="Diversão" value={r2.fun} />
              <ScoreItem kind="life" label="Vida" value={r2.life} />
            </ScoreBar>
          </div>
          {r2.combos.length > 0 && (
            <div className={styles.leftOut}>
              {COMBOS.filter((c) => r2.combos.includes(c.id)).map((c) => (
                <span key={c.id} className={styles.chip}>
                  <Icon name={c.icon} size={16} filled />
                  {c.name}
                </span>
              ))}
            </div>
          )}
          <LeftOutStrip ids={missed.map((i) => i.id)} />
        </div>
      ) : (
        <p className={styles.subtitle}>Você acompanhou esta rodada de fora.</p>
      )}

      <article className={styles.prose}>
        <h2 className={styles.title}>{FINAL_TEXT.title}</h2>
        {FINAL_TEXT.paragraphs.map((p, i) => (
          <p key={p} className={styles.enter} style={{ ["--i" as string]: i + 1 }}>{p}</p>
        ))}
      </article>

    </>
  )
}
