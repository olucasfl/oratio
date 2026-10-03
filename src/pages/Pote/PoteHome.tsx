import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Icon from "../../components/Icon/Icon"
import useBackOrHome from "../../hooks/useBackOrHome"
import {
  createRoom,
  listMyRooms,
  poteErrorMessage,
  type MyRoom,
} from "../../services/poteService"
import styles from "./Pote.module.css"

const PHASE_LABEL: Record<string, string> = {
  LOBBY: "Sala de espera",
  ROUND_1: "Rodada 1",
  RESULT_1: "Resultado 1",
  PARABLE: "Parábola",
  ROUND_2: "Rodada 2",
  FINAL: "Final",
}

/* Entrada das dinâmicas (só admin — a rota está sob <AdminRoute>). */
export default function PoteHome() {
  const navigate = useNavigate()
  const back = useBackOrHome()
  const [rooms, setRooms] = useState<MyRoom[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    listMyRooms()
      .then((r) => active && setRooms(r))
      .catch((err) => {
        if (!active) return
        setRooms([])
        setError(poteErrorMessage(err))
      })
    return () => {
      active = false
    }
  }, [])

  async function create() {
    setBusy(true)
    setError(null)
    try {
      const { code } = await createRoom()
      navigate(`/oratio/dinamicas/pote/${code}/lider`)
    } catch (err) {
      setError(poteErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <button className={styles.back} onClick={back}><Icon name="arrow_back" size={20} />Voltar</button>
      </div>

      <div className={`${styles.stage} ${styles.hero}`}>
        <span className={styles.heroIcon}><Icon name="groups" size={38} filled /></span>
        <p className={styles.eyebrow}>Oratio</p>
        <h1 className={styles.title}>Dinâmicas</h1>
      </div>

      <section className={`${styles.cardHero} ${styles.enter}`} style={{ ["--i" as string]: 1 }}>
        <h2 className={styles.subtitle} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="inventory_2" size={24} filled />
          O Pote
        </h2>
        <p className={styles.text}>
          Crie uma sala e convide as pessoas: o convite chega no sino de notificações do Oratio.
        </p>
        <button className={styles.btn} disabled={busy} onClick={create}>
          <Icon name="add_circle" size={20} />
          Criar sala
        </button>
        {error && <p className={styles.error} role="alert"><Icon name="error" size={18} />{error}</p>}
      </section>

      {rooms && rooms.length > 0 && (
        <section className={`${styles.card} ${styles.enter}`} style={{ ["--i" as string]: 2 }}>
          <h2 className={styles.subtitle}>Suas salas ativas</h2>
          <ul className={styles.playerList}>
            {rooms.map((r, i) => (
              <li key={r.code} className={`${styles.playerRow} ${styles.roomRow}`} style={{ ["--i" as string]: i }}>
                <span>
                  <strong>{r.code}</strong> · {PHASE_LABEL[r.phase] ?? r.phase} · {r.invited} convidado{r.invited === 1 ? "" : "s"}
                </span>
                <button className={styles.btnGhost} onClick={() => navigate(`/oratio/dinamicas/pote/${r.code}/lider`)}>
                  Abrir
                  <Icon name="chevron_right" size={20} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
