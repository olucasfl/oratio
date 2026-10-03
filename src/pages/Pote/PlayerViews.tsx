import { useState } from "react"
import Icon from "../../components/Icon/Icon"
import { COMMITMENT_MAX_LENGTH, ITEM_BY_ID } from "./domain/catalog"
import {
  CLASSIFICATION_TEXT,
  COMMITMENT_LABEL,
  COMMITMENT_PLACEHOLDER,
  FINAL_TEXT,
  PARABLE,
} from "./domain/content"
import { COMBOS } from "./domain/score"
import Jar from "./components/Jar"
import { ScoreBar, ScoreItem } from "./components/Score"
import { LeftOutStrip } from "./Round1"
import { saveCommitment, type PlayerMe, type RoomState } from "../../services/poteService"
import styles from "./Pote.module.css"

type Act = (fn: () => Promise<RoomState>) => Promise<string | null>

export function Lobby() {
  return (
    <>
      <p className={styles.subtitle}>Aguardando o líder iniciar…</p>
      <div className={styles.lobbyJar}>
        <Jar placed={[]} />
      </div>
    </>
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

export function Final({
  code,
  me,
  act,
}: {
  code: string
  me: PlayerMe
  act: Act
}) {
  const r2 = me.round2
  const [text, setText] = useState(me.commitment ?? "")
  const [saved, setSaved] = useState(me.commitment !== null)
  const [error, setError] = useState<string | null>(null)
  const cls = r2.classification ? CLASSIFICATION_TEXT[r2.classification] : null
  const missed = Object.values(ITEM_BY_ID)
    .filter((i) => i.category !== "PEDRA" && !r2.placed.includes(i.id))

  async function save() {
    setError(null)
    const err = await act(() => saveCommitment(code, text.trim()))
    if (err) setError(err)
    else setSaved(true)
  }

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

      {cls && (
        <div className={styles.card}>
          <label htmlFor="pote-commitment" className={styles.text}>{COMMITMENT_LABEL}</label>
          <textarea
            id="pote-commitment"
            className={styles.textarea}
            value={text}
            maxLength={COMMITMENT_MAX_LENGTH}
            placeholder={COMMITMENT_PLACEHOLDER}
            onChange={(e) => { setText(e.target.value); setSaved(false) }}
          />
          <span className={`${styles.small} ${styles.muted}`}>{text.length}/{COMMITMENT_MAX_LENGTH}</span>
          {error && <p className={styles.error}><Icon name="error" size={18} />{error}</p>}
          <button className={styles.btn} disabled={!text.trim() || saved} onClick={save}>
            <Icon name={saved ? "check_circle" : "save"} size={20} filled={saved} />
            {saved ? "Compromisso salvo" : "Salvar"}
          </button>
        </div>
      )}
    </>
  )
}
