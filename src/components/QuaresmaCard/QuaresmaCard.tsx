import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight, Swords } from "lucide-react"

import styles from "./QuaresmaCard.module.css"

import {
  countLateDays,
  getQuaresmaWindow
} from "../../data/quaresmaSaoMiguel"

import {
  getProgress,
  getCachedProgress
} from "../../services/quaresmaService"
import type { QuaresmaProgress } from "../../services/quaresmaService"

type Props = {
  /** Convidado: em vez de navegar, o Home abre o GuestGateModal. */
  guest: boolean
  onGuestClick: () => void
}

/**
 * Convite sazonal da Quaresma de São Miguel na Home.
 *
 * Só existe dentro da janela da devoção (15/08 → dia 40) — some sozinho
 * depois, e volta sozinho no ano seguinte. Para quem não tem conta,
 * aparece igual: o convite é pra todo mundo, o gate vem no toque.
 */
export default function QuaresmaCard({ guest, onGuestClick }: Props) {

  const navigate = useNavigate()

  const janela = getQuaresmaWindow()

  // Começa do cache pra não piscar "carregando" a cada abertura da Home.
  const [progress, setProgress] = useState<QuaresmaProgress | null>(
    () => (guest ? null : getCachedProgress())
  )

  useEffect(() => {

    if (guest || !janela.active) return

    let alive = true

    getProgress()
      .then((p) => { if (alive && p) setProgress(p) })
      .catch(() => {})

    return () => { alive = false }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guest, janela.active])

  if (!janela.active) return null

  const completed = progress?.completedDays?.length ?? 0
  const percent = Math.min((completed / janela.total) * 100, 100)
  const late = guest
    ? 0
    : countLateDays(janela.currentDay, completed, janela.todayIsPrayerDay)
  const finished = completed >= janela.total

  /* O dia que a pessoa deve rezar agora: se está em dia, é o de hoje; se
     atrasou, é o mais antigo em falta. Sem conta não há progresso — aí
     mostramos simplesmente em que dia a devoção está. */
  const focusDay = guest
    ? Math.max(janela.currentDay, 1)
    : Math.min(completed + 1, janela.currentDay || 1)

  /* Uma linha só. O nome da devoção sempre; o estado logo depois, em
     dourado. Tudo que era subtítulo, barra e selo numerado saiu — a
     tela cheia da Quaresma é que conta a história. */
  const estado =
    finished ? "concluída" :
    janela.isRestDay ? "domingo de descanso" :
    `dia ${focusDay} de ${janela.total}`

  function handleClick() {
    navigator.vibrate?.(12)

    if (guest) {
      onGuestClick()
      return
    }

    navigate("/oratio/quaresma")
  }

  return (

    <button
      className={styles.card}
      onClick={handleClick}
      aria-label={`Quaresma de São Miguel — ${estado}`}
    >

      <span className={styles.shine} aria-hidden="true" />

      <span className={styles.seal}>
        <Swords size={15} />
      </span>

      <span className={styles.body}>
        <span className={styles.name}>Quaresma de São Miguel</span>
        <span className={styles.estado}>{estado}</span>
      </span>

      {late > 0 && !finished && !janela.isRestDay && (
        <span className={styles.lateBadge}>{late}</span>
      )}

      <ChevronRight size={17} className={styles.chevron} />

      {!guest && !finished && (
        <span className={styles.track} aria-hidden="true">
          <span className={styles.trackFill} style={{ width: `${percent}%` }} />
        </span>
      )}

    </button>

  )

}
