import { useEffect, useState } from "react"
import styles from "./ConsecrationHome.module.css"
import { useNavigate } from "react-router-dom"
import { Crown, BookOpen, Flag, Check } from "lucide-react"

import {
  getProgress,
  startConsecration,
  updateStartDate,
  preloadConsecration,
  resetConsecration,
} from "../../services/consecrationService"

import { useOffline } from "../../hooks/useOffline"
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

/* ─── tipos ─── */
type ConfirmState = { message: string; onConfirm: () => void } | null

export default function ConsecrationHome() {

  const navigate  = useNavigate()
  const isOffline = useOffline()

  const [progress, setProgress]               = useState<any>(null)
  const [consecrationDate, setConsecrationDate] = useState("")
  const [loading, setLoading]                 = useState(true)
  const [actionLoading, setActionLoading]     = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const [confirmModal, setConfirmModal]       = useState<ConfirmState>(null)

  /* ─── carregamento inicial ─── */
  useEffect(() => {
    preloadConsecration()
    load()
  }, [])

  /* ─── recarrega quando volta online ─── */
  useEffect(() => {
    if (!isOffline) load()
  }, [isOffline])

  /* ─── load ─── */
  async function load() {
    try {
      setLoading(true)

      if (!navigator.onLine) {
        const cached = localStorage.getItem("oratio_consecration_progress")
        if (cached) {
          const parsed = JSON.parse(cached)
          setProgress(parsed)
          if (parsed?.consecrationDate) setConsecrationDate(parsed.consecrationDate)
        } else {
          setProgress(null)
        }
        return
      }

      const data = await getProgress()
      if (!data) { setProgress(null); return }

      setProgress(data)
      if (data?.consecrationDate) setConsecrationDate(data.consecrationDate)

    } catch {
      const cached = localStorage.getItem("oratio_consecration_progress")
      if (cached) {
        const parsed = JSON.parse(cached)
        setProgress(parsed)
        if (parsed?.consecrationDate) setConsecrationDate(parsed.consecrationDate)
      } else {
        setProgress(null)
      }
    } finally {
      setLoading(false)
    }
  }

  /* ─── datas ─── */
  function parseDate(date: string) {
    const [y, m, d] = date.split("-").map(Number)
    return new Date(y, m - 1, d)
  }

  function formatDateBR(date: Date) {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  function getTodayInputDate() {
    const t = new Date()
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`
  }

  function validateDate(date: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (parseDate(date) <= today) {
      setError("Escolha uma data futura para a consagração.")
      return false
    }
    setError(null)
    return true
  }

  /* ─── derivados ─── */
  const startDateObj = consecrationDate
    ? (() => { const d = parseDate(consecrationDate); d.setDate(d.getDate() - 33); return d })()
    : null

  const daysUntilStart = startDateObj
    ? (() => {
        const today = new Date(); today.setHours(0, 0, 0, 0)
        return Math.ceil((startDateObj.getTime() - today.getTime()) / 86400000)
      })()
    : null

  const progressPercent = progress?.completedDays
    ? Math.min((progress.completedDays / 33) * 100, 100)
    : 0

  /* ─── status de etapa ─── */
  const STAGE_RANGES: Record<number, { start: number; end: number }> = {
    1: { start: 1,  end: 12 },
    2: { start: 13, end: 19 },
    3: { start: 20, end: 26 },
    4: { start: 27, end: 33 },
  }
  const STAGE_DAYS: Record<number, number> = { 1: 12, 2: 7, 3: 7, 4: 7 }

  function getStageStatus(stage: any) {
    if (!progress) return ""
    const { start, end } = STAGE_RANGES[stage.order]
    const cur = progress.currentDay
    const done = progress.completedDays
    if (done >= end)                              return styles.stageDone
    if (cur >= start && cur <= end)               return styles.stageCurrent
    if (cur > end && done < end)                  return styles.stageLate
    return ""
  }

  /* ─── ações ─── */
  async function handleStart() {
    if (isOffline) { setError("Você está offline."); return }
    if (!consecrationDate || !validateDate(consecrationDate)) return
    try {
      setActionLoading(true)
      await startConsecration(consecrationDate)
      await load()
    } catch {
      setError("Erro ao iniciar consagração.")
    } finally {
      setActionLoading(false)
    }
  }

  function confirmUpdate() {
    if (isOffline) { setError("Você está offline."); return }
    if (!consecrationDate || !validateDate(consecrationDate)) return
    setConfirmModal({
      message: "Alterar a data irá reiniciar toda a sua preparação.\n\nDeseja continuar?",
      onConfirm: async () => {
        setConfirmModal(null)
        try {
          setActionLoading(true)
          await updateStartDate(consecrationDate)
          await load()
        } catch {
          setError("Erro ao atualizar data.")
        } finally {
          setActionLoading(false)
        }
      },
    })
  }

  function confirmReset() {
    if (isOffline) { setError("Você está offline."); return }
    setConfirmModal({
      message: "Deseja cancelar sua consagração?\n\nTodo o seu progresso será perdido.",
      onConfirm: async () => {
        setConfirmModal(null)
        try {
          await resetConsecration()
          setProgress(null)
          setConsecrationDate("")
        } catch {
          setError("Erro ao cancelar consagração.")
        }
      },
    })
  }

  /* ─── loading skeleton ─── */
  if (loading && progress === null) {
    return (
      <div className={`${styles.container} page-enter`}>

        <button className={styles.back} onClick={() => navigate("/oratio/home")}>
          ← Voltar
        </button>

        <div className={styles.skeletonHero}>
          <div className={`skeleton ${styles.skeletonIcon}`} />
          <div className={`skeleton ${styles.skeletonTitle}`} />
          <div className={`skeleton ${styles.skeletonSub}`} />
        </div>

        <div className={`skeleton ${styles.skeletonCard}`} />

        <div className={styles.skeletonStages}>
          {[1,2,3,4].map(i => (
            <div key={i} className={`skeleton ${styles.skeletonStage}`} />
          ))}
        </div>

      </div>
    )
  }

  /* ─── render ─── */
  return (

    <div className={`${styles.container} page-enter`}>

      {/* MODAL DE CONFIRMAÇÃO */}

      {confirmModal && (
        <div className={styles.modalOverlay} onClick={() => setConfirmModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>

            <p className={styles.modalText}>
              {confirmModal.message.split("\n").map((line, i) => (
                <span key={i}>{line}<br/></span>
              ))}
            </p>

            <div className={styles.modalBtns}>
              <button className={styles.modalCancel} onClick={() => setConfirmModal(null)}>
                Cancelar
              </button>
              <button className={styles.modalConfirm} onClick={confirmModal.onConfirm}>
                Confirmar
              </button>
            </div>

          </div>
        </div>
      )}

      <button className={styles.back} onClick={() => navigate("/oratio/home")}>
        ← Voltar
      </button>

      {/* HERO */}

      <div className={styles.hero}>

        <div className={styles.heroIcon}>
          <Crown size={30} />
        </div>

        <span className={styles.heroBadge}>33 dias</span>

        <h1 className={styles.heroTitle}>
          Consagração a Nossa Senhora
        </h1>

        <p className={styles.heroSub}>
          Caminho espiritual segundo o método de<br/>
          São Luís Maria Grignion de Montfort
        </p>

      </div>

      {/* OFFLINE */}

      {isOffline && (
        <div className={styles.offlineWarning}>
          Você está offline — dados podem estar desatualizados
        </div>
      )}

      {/* DIA ATUAL (quando iniciado) */}

      {progress?.started && progress?.currentDay && (

        <button
          className={styles.currentDayCard}
          onClick={() => navigate(`/oratio/consecration/day/${progress.currentDay}`)}
        >

          <div className={styles.currentDayLeft}>
            <span className={styles.currentDayNum}>{progress.currentDay}</span>
            <span className={styles.currentDayLabel}>dia atual</span>
          </div>

          <div className={styles.currentDayRight}>
            <span>Abrir oração de hoje</span>
            <span className={styles.currentDayArrow}>→</span>
          </div>

        </button>

      )}

      {/* BARRA DE PROGRESSO */}

      {progress?.started && (
        <div className={styles.progressBox}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
          <span>{progress.completedDays || 0} / 33 dias concluídos</span>
        </div>
      )}

      {/* CARD DE DATA */}

      <div className={styles.card}>

        <h3>
          {progress?.started
            ? "Alterar data da consagração"
            : "Data da sua consagração"}
        </h3>

        <p className={styles.cardHint}>
          {progress?.started
            ? "Alterar reinicia toda a preparação."
            : "Escolha o dia em que deseja se consagrar a Nossa Senhora."}
        </p>

        <input
          className={styles.dateInput}
          type="date"
          min={getTodayInputDate()}
          value={consecrationDate}
          onChange={e => { setConsecrationDate(e.target.value); setError(null) }}
        />

        {error && <p className={styles.error}>{error}</p>}

        {consecrationDate && (
          <div className={styles.startInfo}>
            <p>Consagração em <strong>{formatDateBR(parseDate(consecrationDate))}</strong></p>
            {startDateObj && daysUntilStart !== null && daysUntilStart > 0 && (
              <p>Preparação começa em <strong>{formatDateBR(startDateObj)}</strong> — faltam {daysUntilStart} dias</p>
            )}
            {daysUntilStart === 0 && (
              <p>Hoje começa sua preparação</p>
            )}
          </div>
        )}

        {!progress?.started && (
          <button className={styles.primary} onClick={handleStart} disabled={actionLoading}>
            {actionLoading ? "Iniciando..." : "Iniciar Consagração"}
          </button>
        )}

        {progress?.started && (
          <div className={styles.actions}>
            <button className={styles.secondary} onClick={confirmUpdate} disabled={actionLoading}>
              Atualizar Data
            </button>
            <button className={styles.danger} onClick={confirmReset}>
              Cancelar Consagração
            </button>
          </div>
        )}

      </div>

      {/* ETAPAS */}

      {progress?.stages && (

        <div className={styles.stages}>

          <div className={styles.tratadoCard} onClick={() => navigate("/oratio/tratado")}>
            <div className={styles.tratadoCardRow}>
              <BookOpen size={18} className={styles.tratadoIcon}/>
              <h3>Leitura do Tratado</h3>
            </div>
            <span className={styles.stageStatus}>Etapa inicial</span>
          </div>

          {progress.stages.map((stage: any) => {
            const cls = getStageStatus(stage)
            return (
              <div
                key={stage.id}
                className={`${styles.stageCard} ${cls}`}
                onClick={() => navigate(`/oratio/consecration/stage/${stage.id}`)}
              >
                <div className={styles.stageCardRow}>
                  <h3>{stage.title}</h3>
                  {cls === styles.stageCurrent && (
                    <span className={styles.stageBadgeCurrent}>Atual</span>
                  )}
                  {cls === styles.stageDone && (
                    <span className={styles.stageBadgeDone}><Check size={13}/></span>
                  )}
                  {cls === styles.stageLate && (
                    <span className={styles.stageBadgeLate}>Atrasado</span>
                  )}
                </div>
                <span className={styles.stageStatus}>{STAGE_DAYS[stage.order]} dias</span>
              </div>
            )
          })}

          <div className={styles.tratadoCard} onClick={() => navigate("/oratio/consecration/finalizacao")}>
            <div className={styles.tratadoCardRow}>
              <Flag size={18} className={styles.tratadoIcon}/>
              <h3>Finalização</h3>
            </div>
            <span className={styles.stageStatus}>Última etapa</span>
          </div>

        </div>

      )}

      <div className={styles.pageSpacer} />

      <BottomNavbar />

    </div>

  )

}
