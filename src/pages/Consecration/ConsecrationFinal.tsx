import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check, ChevronLeft, Crown, FileText } from "lucide-react"

import styles from "./ConsecrationFinal.module.css"

import {
  apiErrorMessage,
  finishConsecration,
  getCachedProgress,
  getProgress
} from "../../services/consecrationService"
import type { ConsecrationProgress } from "../../services/consecrationService"
import { useOffline } from "../../hooks/useOffline"
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"

const TOTAL_DAYS = 33

type ConfirmState = { message: string; onConfirm: () => void } | null

export default function ConsecrationFinal() {

  const navigate    = useNavigate()
  const isOffline   = useOffline()

  const [progress,      setProgress]      = useState<ConsecrationProgress | null>(
    () => getCachedProgress()
  )
  const [loading,       setLoading]       = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [confirmModal,  setConfirmModal]  = useState<ConfirmState>(null)
  const [justFinished,  setJustFinished]  = useState(false)

  useEffect(() => { load() }, [])
  useEffect(() => { if (!isOffline) load() }, [isOffline])

  async function load() {
    try {
      setLoading(true)
      const data = await getProgress()
      if (data) setProgress(data)
    } catch {
      setError("Não foi possível carregar os dados.")
    } finally {
      setLoading(false)
    }
  }

  function formatDateBR(iso: string) {
    const [y, m, d] = iso.split("-").map(Number)
    return `${d}/${m}/${y}`
  }

  function handleFinishClick() {
    if (isOffline) { setError("Você precisa de internet para concluir."); return }
    setConfirmModal({
      message: "Você confirma que completou sua consagração a Nossa Senhora?",
      onConfirm: async () => {
        setConfirmModal(null)
        try {
          setActionLoading(true)
          setError(null)
          await finishConsecration()
          setJustFinished(true)
          await load()
        } catch (err) {
          setError(apiErrorMessage(err, "Erro ao concluir. Tente novamente."))
        } finally {
          setActionLoading(false)
        }
      },
    })
  }

  /* ─── skeleton ─── */
  if (loading && !progress) {
    return (
      <div className={`${styles.container} page-enter`}>
        <button className={styles.back} onClick={() => navigate("/oratio/consecration")}><ChevronLeft size={18}/>Voltar</button>
        <div className={styles.skHero}>
          <div className={`skeleton ${styles.skIcon}`} />
          <div className={`skeleton ${styles.skTitle}`} />
          <div className={`skeleton ${styles.skSub}`} />
        </div>
        <div className={`skeleton ${styles.skCard}`} />
        <div className={`skeleton ${styles.skCard}`} />
      </div>
    )
  }

  const completedDays = progress?.completedDays ?? []
  const completedCount = completedDays.length
  const finished     = !!progress?.finished
  const canFinish     = completedCount >= TOTAL_DAYS && !finished
  const pct           = Math.min((completedCount / TOTAL_DAYS) * 100, 100)

  return (

    <div className={`${styles.container} page-enter`}>

      <ConfirmModal
        open={!!confirmModal}
        message={confirmModal?.message ?? ""}
        onConfirm={() => confirmModal?.onConfirm()}
        onCancel={() => setConfirmModal(null)}
        danger
      />

      <button className={styles.back} onClick={() => navigate("/oratio/consecration")}><ChevronLeft size={18}/>Jornada</button>

      {/* HERO */}
      <header className={styles.hero}>
        <div className={styles.heroIcon}>
          {finished ? <Check size={28}/> : <Crown size={28} />}
        </div>
        <span className={styles.heroBadge}>{finished ? "Concluída" : "Etapa Final"}</span>
        <h1 className={styles.heroTitle}>
          {finished ? "Você se consagrou a Nossa Senhora" : "Chegou o grande momento"}
        </h1>
        <p className={styles.heroSub}>
          {finished
            ? (progress?.completedAt
                ? `Em ${formatDateBR(progress.completedAt)}, sua entrega a Nossa Senhora se completou.`
                : "Sua entrega a Nossa Senhora se completou.")
            : "Após 33 dias de preparação, é hora de se consagrar totalmente a Nossa Senhora."}
        </p>
      </header>

      {justFinished && (
        <div className={styles.celebrateBanner}>
          <Check size={17}/>
          Consagração registrada — que ela guarde e conduza toda a sua vida a Jesus.
        </div>
      )}

      {/* PROGRESSO */}
      {!finished && (
        <div className={styles.progressCard}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Dias concluídos</span>
            <span className={styles.progressCount}>{completedCount}/{TOTAL_DAYS}</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
          <p className={styles.progressNote}>
            {canFinish
              ? "Preparação completa! Você está pronto."
              : `Faltam ${TOTAL_DAYS - completedCount} dia${TOTAL_DAYS - completedCount !== 1 ? "s" : ""} para liberar a conclusão.`}
          </p>
        </div>
      )}

      {isOffline && <div className={styles.offline}>Você está offline</div>}
      {error    && <div className={styles.errorBox}>{error}</div>}

      {/* CARTA */}
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.cardIconWrap}><FileText size={20} /></div>
          <h3>Carta de Consagração</h3>
        </div>
        <p>
          Escreva sua carta com fé, entregando-se totalmente à Santíssima Virgem.
          Um modelo está disponível para guiá-lo.
        </p>
        <button className={styles.primary} onClick={() => navigate("/oratio/consecration/carta")}>
          Ver modelo da carta
        </button>
      </div>

      {/* CONCLUSÃO */}
      {!finished && (
        <div className={`${styles.card} ${canFinish ? styles.cardReady : styles.cardLocked}`}>
          <div className={styles.cardTop}>
            <div className={`${styles.cardIconWrap} ${canFinish ? styles.cardIconGreen : ""}`}>
              <Check size={20} />
            </div>
            <h3>Concluir Consagração</h3>
          </div>
          <p>
            Após escrever a carta e realizar a consagração ao pé do altar ou em oração,
            finalize aqui para registrar sua entrega.
          </p>
          {!canFinish && (
            <p className={styles.lockNote}>
              Complete todos os {TOTAL_DAYS} dias de preparação para liberar esta ação.
            </p>
          )}
          <button
            className={canFinish ? styles.finishBtn : styles.finishBtnDisabled}
            disabled={!canFinish || actionLoading}
            onClick={handleFinishClick}
          >
            {actionLoading ? "Concluindo..." : "Concluir Consagração"}
          </button>
        </div>
      )}

      {finished && (
        <button className={styles.secondaryLink} onClick={() => navigate("/oratio/consecration")}>
          Ver minha jornada
        </button>
      )}

      <div className={styles.spacer} />
      <BottomNavbar />

    </div>

  )
}
