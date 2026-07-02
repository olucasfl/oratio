import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Crown, FileText, CheckCircle } from "lucide-react"

import styles from "./ConsecrationFinal.module.css"

import { getProgress, resetConsecration } from "../../services/consecrationService"
import { useOffline } from "../../hooks/useOffline"
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"

type ConfirmState = { message: string; onConfirm: () => void } | null

export default function ConsecrationFinal() {

  const navigate    = useNavigate()
  const isOffline   = useOffline()

  const [progress,      setProgress]      = useState<any>(null)
  const [loading,       setLoading]       = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [confirmModal,  setConfirmModal]  = useState<ConfirmState>(null)

  useEffect(() => { load() }, [])
  useEffect(() => { if (!isOffline) load() }, [isOffline])

  async function load() {
    try {
      setLoading(true)
      if (!navigator.onLine) {
        const cached = localStorage.getItem("oratio_consecration_progress")
        if (cached) setProgress(JSON.parse(cached))
        return
      }
      const data = await getProgress()
      setProgress(data)
    } catch {
      setError("Não foi possível carregar os dados.")
    } finally {
      setLoading(false)
    }
  }

  function handleFinishClick() {
    if (isOffline) { setError("Você precisa de internet para concluir."); return }
    setConfirmModal({
      message: "Você confirma que completou sua consagração a Nossa Senhora?",
      onConfirm: async () => {
        setConfirmModal(null)
        try {
          setActionLoading(true)
          await resetConsecration()
          localStorage.removeItem("oratio_consecration_progress")
          navigate("/oratio/consecration")
        } catch {
          setError("Erro ao concluir. Tente novamente.")
        } finally {
          setActionLoading(false)
        }
      },
    })
  }

  /* ─── skeleton ─── */
  if (loading) {
    return (
      <div className={`${styles.container} page-enter`}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Voltar</button>
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

  const completedDays = progress?.completedDays || 0
  const canFinish     = completedDays === 33
  const pct           = Math.min((completedDays / 33) * 100, 100)

  return (

    <div className={`${styles.container} page-enter`}>

      {/* MODAL */}
      <ConfirmModal
        open={!!confirmModal}
        message={confirmModal?.message ?? ""}
        onConfirm={() => confirmModal?.onConfirm()}
        onCancel={() => setConfirmModal(null)}
        danger
      />

      <button className={styles.back} onClick={() => navigate(-1)}>← Voltar</button>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.heroIcon}><Crown size={30} /></div>
        <span className={styles.heroBadge}>Etapa Final</span>
        <h1 className={styles.heroTitle}>Chegou o grande momento</h1>
        <p className={styles.heroSub}>
          Após 33 dias de preparação, é hora de se consagrar totalmente a Nossa Senhora.
        </p>
      </div>

      {/* PROGRESSO */}
      <div className={styles.progressCard}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Dias concluídos</span>
          <span className={styles.progressCount}>{completedDays}/33</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
        <p className={styles.progressNote}>
          {canFinish
            ? "Preparação completa! Você está pronto."
            : `Faltam ${33 - completedDays} dia${33 - completedDays !== 1 ? "s" : ""} para liberar a conclusão.`}
        </p>
      </div>

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
      <div className={`${styles.card} ${canFinish ? styles.cardReady : styles.cardLocked}`}>
        <div className={styles.cardTop}>
          <div className={`${styles.cardIconWrap} ${canFinish ? styles.cardIconGreen : ""}`}>
            <CheckCircle size={20} />
          </div>
          <h3>Concluir Consagração</h3>
        </div>
        <p>
          Após escrever a carta e realizar a consagração ao pé do altar ou em oração,
          finalize aqui para registrar sua entrega.
        </p>
        {!canFinish && (
          <p className={styles.lockNote}>
            Complete todos os 33 dias de preparação para liberar esta ação.
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

      <div className={styles.spacer} />
      <BottomNavbar />

    </div>

  )
}
