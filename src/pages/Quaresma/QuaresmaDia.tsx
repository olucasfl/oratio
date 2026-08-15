import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Swords
} from "lucide-react"

import styles from "./QuaresmaDia.module.css"

import {
  QUARESMA_STEPS,
  formatLong,
  getQuaresmaWindow
} from "../../data/quaresmaSaoMiguel"

import {
  apiErrorMessage,
  completeDay,
  getCachedProgress,
  getProgress,
  uncompleteDay
} from "../../services/quaresmaService"
import type { QuaresmaProgress } from "../../services/quaresmaService"

import { useOffline } from "../../hooks/useOffline"

export default function QuaresmaDia() {

  const { day } = useParams()
  const navigate = useNavigate()
  const isOffline = useOffline()

  const dayNumber = Number(day)

  const janela = useMemo(() => getQuaresmaWindow(), [])

  const [progress, setProgress] = useState<QuaresmaProgress | null>(
    () => getCachedProgress()
  )
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const topRef = useRef<HTMLDivElement>(null)

  const total = QUARESMA_STEPS.length
  const current = QUARESMA_STEPS[step]
  const isLast = step === total - 1

  const dataDoDia = janela.schedule[dayNumber - 1]

  /* Dia fora do intervalo válido nem chega a carregar. */
  useEffect(() => {
    if (
      !Number.isInteger(dayNumber) ||
      dayNumber < 1 ||
      dayNumber > janela.total
    ) {
      navigate("/oratio/quaresma", { replace: true })
    }
  }, [dayNumber, navigate])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProgress()
      if (data) setProgress(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load, dayNumber])

  function retry() {
    setError(null)
    load()
  }

  const completedCount = progress?.completedDays?.length ?? 0
  const currentDay = progress?.currentDay ?? janela.currentDay

  const alreadyDone = dayNumber <= completedCount
  const isActionable = dayNumber === completedCount + 1 && dayNumber <= currentDay

  /**
   * Sem progresso nenhum (offline e sem cache) a tela continua aberta em
   * modo leitura: as orações são estáticas, e travar o acesso puniria
   * quem só quer rezar. Só o botão de concluir fica indisponível.
   */
  const readOnly = !progress

  /* Dia que existe mas ainda não é dela: manda de volta pra Jornada. */
  useEffect(() => {
    if (loading || readOnly) return
    if (alreadyDone || isActionable) return

    navigate("/oratio/quaresma", { replace: true })
  }, [loading, readOnly, alreadyDone, isActionable, navigate])

  /* Cada passo começa do topo — o texto da Ladainha é longo. */
  useEffect(() => {
    topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" })
  }, [step])

  async function handleComplete() {

    if (isOffline) {
      setError("Você está offline. Conecte-se para registrar a conclusão.")
      return
    }

    setError(null)
    setSaving(true)

    try {
      await completeDay(dayNumber)

      setCelebrating(true)
      setTimeout(() => navigate("/oratio/quaresma", { replace: true }), 1650)

    } catch (err) {
      setError(apiErrorMessage(err, "Não foi possível registrar. Tente de novo."))
      setSaving(false)
    }

  }

  async function handleUndo() {

    if (isOffline) {
      setError("Você está offline. Conecte-se para desfazer.")
      return
    }

    setError(null)
    setSaving(true)

    try {
      await uncompleteDay(dayNumber)
      navigate("/oratio/quaresma", { replace: true })
    } catch (err) {
      setError(apiErrorMessage(err, "Não foi possível desfazer. Tente de novo."))
      setSaving(false)
    }

  }

  /* =========================
  CONCLUSÃO — animação
  ========================= */

  if (celebrating) {
    return (
      <div className={styles.celebration}>

        <div className={styles.burst}>
          <span className={styles.burstRing} />
          <span className={styles.burstRing} />
          <span className={styles.burstCheck}>
            <Check size={40} strokeWidth={3} />
          </span>
        </div>

        <h2>Dia {dayNumber} concluído</h2>

        <p>
          {dayNumber >= janela.total
            ? "Você completou a Quaresma de São Miguel. Deo gratias!"
            : "São Miguel Arcanjo, rogai por nós."}
        </p>

      </div>
    )
  }

  const percent = ((step + 1) / total) * 100

  return (

    <div className={`${styles.container} page-enter`}>

      <div ref={topRef} />

      <button
        className={styles.back}
        onClick={() => navigate("/oratio/quaresma")}
      >
        <ChevronLeft size={18} />
        Jornada
      </button>

      {/* CABEÇALHO */}

      <header className={styles.header}>

        <div className={styles.headerTop}>

          <span className={styles.dayBadge}>
            <Swords size={13} />
            Dia {dayNumber} de {janela.total}
          </span>

          {alreadyDone && (
            <span className={styles.doneBadge}>
              <Check size={12} />
              concluído
            </span>
          )}

        </div>

        {dataDoDia && (
          <span className={styles.headerDate}>{formatLong(dataDoDia)}</span>
        )}

      </header>

      {/* PROGRESSO DOS PASSOS */}

      <div className={styles.steps}>

        <div className={styles.stepsTrack}>
          <div className={styles.stepsFill} style={{ width: `${percent}%` }} />
        </div>

        <div className={styles.stepsDots}>
          {QUARESMA_STEPS.map((s, i) => (
            <button
              key={s.id}
              className={`${styles.dot} ${i === step ? styles.dotActive : ""} ${
                i < step ? styles.dotPast : ""
              }`}
              onClick={() => setStep(i)}
              aria-label={s.title}
            />
          ))}
        </div>

        <span className={styles.stepsLabel}>
          Passo {step + 1} de {total}
        </span>

      </div>

      {isOffline && (
        <div className={styles.offline}>
          Você está offline — reze à vontade, mas registrar a conclusão
          precisa de conexão.
        </div>
      )}

      {/* ORAÇÃO */}

      <article className={styles.prayer} key={current.id}>

        <h1 className={styles.prayerTitle}>{current.title}</h1>

        <p className={styles.prayerHint}>{current.hint}</p>

        <div className={styles.prayerText}>{current.content}</div>

      </article>

      {error && <p className={styles.error}>{error}</p>}

      {/* NAVEGAÇÃO */}

      <div className={styles.nav}>

        <button
          className={styles.secondary}
          onClick={() => setStep((s) => Math.max(s - 1, 0))}
          disabled={step === 0}
        >
          <ChevronLeft size={17} />
          Anterior
        </button>

        {!isLast && (
          <button
            className={styles.primary}
            onClick={() => setStep((s) => Math.min(s + 1, total - 1))}
          >
            Próxima
            <ChevronRight size={17} />
          </button>
        )}

        {isLast && !alreadyDone && (
          <button
            className={styles.finish}
            onClick={handleComplete}
            disabled={saving || readOnly || isOffline}
          >
            {saving ? (
              <>
                <Loader2 size={17} className={styles.spin} />
                Registrando…
              </>
            ) : (
              <>
                <Check size={17} />
                Concluir dia
              </>
            )}
          </button>
        )}

        {isLast && alreadyDone && (
          <button
            className={styles.secondary}
            onClick={handleUndo}
            disabled={saving || isOffline || dayNumber !== completedCount}
          >
            {saving ? "Processando…" : "Desmarcar"}
          </button>
        )}

      </div>

      {loading && !progress && (
        <p className={styles.loadingHint}>
          <Loader2 size={14} className={styles.spin} />
          Carregando seu progresso…
        </p>
      )}

      {/* Um botão só cinza não explica nada: se a conclusão está travada,
          diga o motivo e ofereça o que dá pra fazer. */}
      {isLast && !alreadyDone && readOnly && !loading && (
        <div className={styles.blocked}>
          <AlertCircle size={17} className={styles.blockedIcon} />
          <span>
            <strong>Não consegui carregar seu progresso.</strong>
            <span>
              As orações estão aqui, mas para registrar a conclusão preciso
              falar com o servidor. Verifique sua conexão e tente de novo.
            </span>
          </span>
          <button className={styles.blockedRetry} onClick={retry}>
            Tentar de novo
          </button>
        </div>
      )}

      <div className={styles.pageSpacer} />

    </div>

  )

}
