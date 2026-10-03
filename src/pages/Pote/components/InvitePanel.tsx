import { useEffect, useState } from "react"
import Icon from "../../../components/Icon/Icon"
import {
  inviteUsers,
  poteErrorMessage,
  searchUsers,
  type SearchUser,
} from "../../../services/poteService"
import styles from "../Pote.module.css"

const MIN_QUERY = 2
const DEBOUNCE_MS = 300

/*
 Convite por notificação: o admin busca pessoas (nome ou e-mail), marca quem
 quer e envia — cada uma recebe um aviso no sino da Home com o link da sala.
 O e-mail só aparece AQUI (para o admin distinguir homônimos); nunca no jogo.
*/
export default function InvitePanel({ code, onInvited }: { code: string; onInvited?: () => void }) {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<SearchUser[]>([])
  const [picked, setPicked] = useState<Map<string, SearchUser>>(new Map())
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (q.trim().length < MIN_QUERY) return
    let active = true
    const timer = setTimeout(async () => {
      try {
        const found = await searchUsers(q.trim())
        if (active) setResults(found)
      } catch (err) {
        if (active) setMessage(poteErrorMessage(err))
      }
    }, DEBOUNCE_MS)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [q])

  const visible = q.trim().length < MIN_QUERY ? [] : results

  function toggle(user: SearchUser) {
    setPicked((prev) => {
      const next = new Map(prev)
      if (next.has(user.id)) next.delete(user.id)
      else next.set(user.id, user)
      return next
    })
  }

  async function send() {
    setBusy(true)
    setMessage(null)
    try {
      const res = await inviteUsers(code, [...picked.keys()])
      setMessage(
        res.invited > 0
          ? `Convite enviado a ${res.invited} pessoa${res.invited > 1 ? "s" : ""}.`
          : "Todos já tinham sido convidados.",
      )
      setPicked(new Map())
      onInvited?.()
    } catch (err) {
      setMessage(poteErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={`${styles.card} ${styles.enter}`} aria-label="Convidar pessoas">
      <h2 className={styles.subtitle}>Convidar pessoas</h2>
      <label className={styles.searchWrap}>
        <Icon name="search" size={22} className={styles.searchIcon} />
        <input
          className={styles.search}
          type="search"
          placeholder="Buscar por nome ou e-mail"
          aria-label="Buscar pessoa"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>

      <div>
        {visible.map((u) => (
          <label key={u.id} className={styles.pickRow}>
            <input type="checkbox" checked={picked.has(u.id)} onChange={() => toggle(u)} />
            <span>
              {u.name} <span className={`${styles.small} ${styles.muted}`}>{u.email}</span>
            </span>
          </label>
        ))}
        {q.trim().length >= MIN_QUERY && visible.length === 0 && (
          <p className={`${styles.muted} ${styles.small}`}>Ninguém encontrado.</p>
        )}
      </div>

      {picked.size > 0 && (
        <p className={styles.small}>
          Selecionados: {[...picked.values()].map((u) => u.name.split(" ")[0]).join(", ")}
        </p>
      )}
      {message && <p className={styles.small} role="status">{message}</p>}

      <button className={styles.btn} disabled={busy || picked.size === 0} onClick={send}>
        <Icon name="send" size={20} />
        Enviar convite{picked.size > 1 ? "s" : ""}
      </button>
    </section>
  )
}
