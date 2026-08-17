import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ComponentType } from "react"
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock,
  Crown,
  Feather,
  Flag,
  Heart,
  Loader2,
  Lock,
  Pencil,
  Route,
  Scroll,
  Sparkles,
  Sun,
  X
} from "lucide-react"

import styles from "./ConsecrationHome.module.css"

import {
  getProgress,
  getCachedProgress,
  getAllDays,
  startConsecration,
  updateStartDate,
  preloadConsecration,
  resetConsecration,
  apiErrorMessage
} from "../../services/consecrationService"
import type { ConsecrationProgress } from "../../services/consecrationService"

import {
  CONSECRACAO_ABOUT,
  CONSECRACAO_MOTTO,
  CONSECRACAO_SEQUENCE,
  CONSECRACAO_TIPS,
  STAGE_ICONS
} from "../../data/consecracao"
import type { ConsecracaoIcon } from "../../data/consecracao"

import { useOffline } from "../../hooks/useOffline"
import { usePullToRefresh } from "../../hooks/usePullToRefresh"
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"

const TOTAL_DAYS = 33

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
]

type Tab = "jornada" | "sobre"

const TABS: { id: Tab; label: string }[] = [
  { id: "jornada", label: "Jornada" },
  { id: "sobre",   label: "Sobre" }
]

const ICONS: Record<ConsecracaoIcon, ComponentType<{ size?: number }>> = {
  book: BookOpen,
  heart: Heart,
  sparkles: Sparkles,
  route: Route,
  crown: Crown,
  scroll: Scroll,
  sun: Sun,
  feather: Feather
}

type ConfirmState = { message: string; onConfirm: () => void } | null

export default function ConsecrationHome() {

  const navigate  = useNavigate()
  const isOffline = useOffline()

  const [tab, setTab] = useState<Tab>("jornada")

  const [progress, setProgress] = useState<ConsecrationProgress | null>(
    () => getCachedProgress()
  )
  const [allDays, setAllDays]   = useState<any[]>([])
  const [consecrationDate, setConsecrationDate] = useState("")
  const [loading, setLoading]             = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [confirmModal, setConfirmModal]   = useState<ConfirmState>(null)
  const [restarting, setRestarting]       = useState(false)
  const [editingDate, setEditingDate]     = useState(false)

  /* ─── carregamento inicial ─── */
  useEffect(() => {
    preloadConsecration()
    load()
  }, [])

  useEffect(() => {
    if (!isOffline) load()
  }, [isOffline])

  usePullToRefresh(load, !isOffline)

  async function load() {
    try {
      setLoading(true)

      const [data, days] = await Promise.all([
        getProgress(),
        getAllDays().catch(() => [])
      ])

      setAllDays(days)

      if (!data) { setProgress(null); return }

      setProgress(data)
      if (data.consecrationDate) setConsecrationDate(data.consecrationDate)

    } catch {
      const cached = getCachedProgress()
      setProgress(cached)
      if (cached?.consecrationDate) setConsecrationDate(cached.consecrationDate)
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

  function formatDateLong(date: Date) {
    return `${date.getDate()} de ${MESES[date.getMonth()]} de ${date.getFullYear()}`
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
  const started   = !!progress?.started
  const finished  = !!progress?.finished
  const stages: any[] = progress?.stages ?? []
  const completedDays = useMemo(() => progress?.completedDays ?? [], [progress])
  const completedCount = completedDays.length
  const currentDay = progress?.currentDay ?? 0
  const daysUntilStart = progress?.daysUntilStart ?? 0
  const percent = Math.min((completedCount / TOTAL_DAYS) * 100, 100)

  const showStartForm = !started || (finished && restarting)

  const actionableDay =
    started && !finished && completedCount + 1 <= currentDay ? completedCount + 1 : null

  const late = currentDay > 0 ? Math.max(0, currentDay - completedCount) : 0

  const startDateObj = consecrationDate
    ? (() => { const d = parseDate(consecrationDate); d.setDate(d.getDate() - TOTAL_DAYS); return d })()
    : null

  const daysUntilStartLocal = startDateObj
    ? (() => {
        const today = new Date(); today.setHours(0, 0, 0, 0)
        return Math.ceil((startDateObj.getTime() - today.getTime()) / 86400000)
      })()
    : null

  /* Etapas com o intervalo de dias calculado a partir da ordem/duração
     vindas do backend — nada de faixa fixa no front, que é frágil se o
     admin mudar a duração de uma etapa. */
  const stagesWithRange = useMemo(() => {
    let cursor = 0
    return [...stages]
      .sort((a, b) => a.order - b.order)
      .map((stage, i) => {
        const start = cursor + 1
        const end = cursor + stage.days
        cursor = end
        return { ...stage, start, end, icon: STAGE_ICONS[i % STAGE_ICONS.length] }
      })
  }, [stages])

  const stageDays = useMemo(() => {
    const byStage: Record<string, any[]> = {}
    allDays.forEach((d) => {
      if (!byStage[d.stageId]) byStage[d.stageId] = []
      byStage[d.stageId].push(d)
    })
    return byStage
  }, [allDays])

  type DayState = "done" | "current" | "late" | "locked"

  function stateOf(dayNumber: number): DayState {
    if (completedDays.includes(dayNumber)) return "done"
    if (dayNumber === actionableDay) return "current"
    if (currentDay > 0 && dayNumber <= currentDay) return "late"
    return "locked"
  }

  // A oração de qualquer dia pode ser lida a qualquer momento — só a
  // conclusão é que fica travada até ser a vez do dia (isso é reforçado
  // na própria tela do dia, com o botão desabilitado e o motivo explicado).
  function openDay(dayNumber: number) {
    navigate(`/oratio/consecration/day/${dayNumber}`)
  }

  /* ─── ações ─── */
  async function handleStart() {
    if (isOffline) { setError("Você está offline."); return }
    if (!consecrationDate || !validateDate(consecrationDate)) return
    navigator.vibrate?.(10)
    try {
      setActionLoading(true)
      setError(null)
      await startConsecration(consecrationDate)
      setRestarting(false)
      await load()
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao iniciar consagração."))
    } finally {
      setActionLoading(false)
    }
  }

  function confirmUpdate() {
    if (isOffline) { setError("Você está offline."); return }
    if (!consecrationDate || !validateDate(consecrationDate)) return
    navigator.vibrate?.(8)
    setConfirmModal({
      message: "Alterar a data irá reiniciar toda a sua preparação.\n\nDeseja continuar?",
      onConfirm: async () => {
        navigator.vibrate?.(10)
        setConfirmModal(null)
        try {
          setActionLoading(true)
          setError(null)
          await updateStartDate(consecrationDate)
          await load()
          setEditingDate(false)
        } catch (err) {
          setError(apiErrorMessage(err, "Erro ao atualizar data."))
        } finally {
          setActionLoading(false)
        }
      },
    })
  }

  function cancelEditDate() {
    setEditingDate(false)
    setError(null)
    if (progress?.consecrationDate) setConsecrationDate(progress.consecrationDate)
  }

  function confirmReset() {
    if (isOffline) { setError("Você está offline."); return }
    navigator.vibrate?.(8)
    setConfirmModal({
      message: "Deseja cancelar sua consagração?\n\nTodo o seu progresso será perdido.",
      onConfirm: async () => {
        navigator.vibrate?.(10)
        setConfirmModal(null)
        try {
          setActionLoading(true)
          setError(null)
          await resetConsecration()
          setProgress(null)
          setConsecrationDate("")
          setEditingDate(false)
        } catch (err) {
          setError(apiErrorMessage(err, "Erro ao cancelar consagração."))
        } finally {
          setActionLoading(false)
        }
      },
    })
  }

  /* ─── loading skeleton ─── */
  if (loading && progress === null) {
    return (
      <div className={`${styles.container} page-enter`}>

        <button className={styles.back} onClick={() => navigate("/oratio/home")}>
          <ChevronLeft size={18}/>
          Voltar
        </button>

        <div className={styles.skeletonHero}>
          <div className={`skeleton ${styles.skeletonIcon}`} />
          <div className={`skeleton ${styles.skeletonTitle}`} />
          <div className={`skeleton ${styles.skeletonSub}`} />
        </div>

        <div className={`skeleton ${styles.skeletonCard}`} />

      </div>
    )
  }

  /* ─── render ─── */
  return (

    <div className={`${styles.container} page-enter`}>

      <div className={styles.aurora} aria-hidden="true" />

      <ConfirmModal
        open={!!confirmModal}
        message={confirmModal?.message ?? ""}
        onConfirm={() => confirmModal?.onConfirm()}
        onCancel={() => setConfirmModal(null)}
        danger
      />

      <button className={styles.back} onClick={() => navigate("/oratio/home")}>
        <ChevronLeft size={18}/>
        Voltar
      </button>

      {/* HERO */}

      <header className={styles.hero}>
        <div className={styles.heroIcon}><Crown size={28} /></div>
        <span className={styles.heroBadge}>{TOTAL_DAYS} dias</span>
        <h1 className={styles.heroTitle}>Consagração a Nossa Senhora</h1>
        <p className={styles.heroSub}>
          Caminho espiritual segundo o método de<br/>
          São Luís Maria Grignion de Montfort
        </p>
      </header>

      {isOffline && (
        <div className={styles.offline}>
          Você está offline — as orações continuam disponíveis, mas registrar
          progresso precisa de conexão.
        </div>
      )}

      {finished && !restarting && (
        <section className={styles.finishedBanner}>
          <span className={styles.finishedIcon}><Check size={18}/></span>
          <span className={styles.finishedBody}>
            <strong>Consagração concluída</strong>
            <span>
              {progress?.completedAt
                ? `Em ${formatDateBR(parseDate(progress.completedAt))} você se consagrou a Nossa Senhora.`
                : "Você completou os 33 dias e se consagrou a Nossa Senhora."}
            </span>
          </span>
          <button className={styles.finishedAction} onClick={() => setRestarting(true)}>
            Iniciar nova
          </button>
        </section>
      )}

      {/* DATA DA CONSAGRAÇÃO — junto do topo, não dentro das abas */}

      {started && !finished && (

        <section className={styles.dateBar}>

          <div className={styles.dateBarRow}>

            <span className={styles.dateBarIcon}><CalendarDays size={17}/></span>

            <span className={styles.dateBarBody}>
              <span className={styles.dateBarLabel}>Consagração marcada para</span>
              <strong className={styles.dateBarValue}>
                {progress?.consecrationDate ? formatDateLong(parseDate(progress.consecrationDate)) : "—"}
              </strong>
            </span>

            <button
              className={styles.dateBarEdit}
              onClick={() => setEditingDate((v) => !v)}
              aria-label={editingDate ? "Fechar edição da data" : "Alterar ou cancelar a consagração"}
            >
              {editingDate ? <X size={16}/> : <Pencil size={15}/>}
            </button>

          </div>

          {editingDate && (

            <div className={styles.dateBarEditPanel}>

              <input
                className={styles.dateInput}
                type="date"
                min={getTodayInputDate()}
                value={consecrationDate}
                onChange={e => { setConsecrationDate(e.target.value); setError(null) }}
              />

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.settingsActions}>
                <button className={styles.secondary} onClick={confirmUpdate} disabled={actionLoading}>
                  {actionLoading ? (
                    <><Loader2 size={15} className={styles.spin}/> Atualizando…</>
                  ) : "Salvar data"}
                </button>
                <button className={styles.linkBtnGhost} onClick={cancelEditDate} disabled={actionLoading}>
                  Descartar
                </button>
              </div>

              <button className={styles.dateBarCancelLink} onClick={confirmReset} disabled={actionLoading}>
                {actionLoading ? (
                  <><Loader2 size={13} className={styles.spin}/> Cancelando…</>
                ) : "Cancelar consagração"}
              </button>

            </div>

          )}

        </section>

      )}

      {/* ABAS */}

      <nav className={styles.tabs} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}

        <span
          className={styles.tabInk}
          style={{
            width: `${100 / TABS.length}%`,
            transform: `translateX(${TABS.findIndex((t) => t.id === tab) * 100}%)`
          }}
          aria-hidden="true"
        />
      </nav>

      <div className={styles.panel} key={tab}>

        {tab === "jornada" && (

          <>

            {/* Primeiro passo de todos, mesmo antes de iniciar: conhecer
                o texto em que o método se baseia. */}
            <button className={styles.linkCard} onClick={() => navigate("/oratio/tratado")}>
              <span className={styles.linkCardIcon}><BookOpen size={18}/></span>
              <span className={styles.linkCardBody}>
                <strong>Leitura do Tratado</strong>
                <span>O texto original de São Luís de Montfort, na íntegra</span>
              </span>
            </button>

            {showStartForm && (

              <section className={styles.startCard}>

                <h3>{finished ? "Iniciar nova consagração" : "Data da sua consagração"}</h3>

                <p className={styles.startHint}>
                  {finished
                    ? "Escolha uma nova data — a jornada que você já concluiu fica registrada no seu histórico."
                    : "Escolha o dia em que deseja se consagrar a Nossa Senhora. A preparação de 33 dias começa a contar de trás pra frente a partir dele."}
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
                    {startDateObj && daysUntilStartLocal !== null && daysUntilStartLocal > 0 && (
                      <p>Preparação começa em <strong>{formatDateBR(startDateObj)}</strong> — faltam {daysUntilStartLocal} dias</p>
                    )}
                    {daysUntilStartLocal === 0 && <p>Hoje começa sua preparação</p>}
                  </div>
                )}

                <button className={styles.primary} onClick={handleStart} disabled={actionLoading}>
                  {actionLoading ? (
                    <><Loader2 size={16} className={styles.spin}/> Iniciando…</>
                  ) : "Iniciar Consagração"}
                </button>

                {finished && (
                  <button className={styles.linkBtn} onClick={() => setRestarting(false)}>
                    Cancelar
                  </button>
                )}

              </section>

            )}

            {started && !showStartForm && currentDay === 0 && (

              <section className={styles.countdown}>
                <span className={styles.countdownNum}>{daysUntilStart}</span>
                <span className={styles.countdownBody}>
                  <span className={styles.countdownUnit}>
                    {daysUntilStart === 1 ? "dia" : "dias"}
                  </span>
                  <strong>para o início da sua preparação</strong>
                  <span className={styles.countdownDate}>
                    Consagração em {progress?.consecrationDate ? formatDateBR(parseDate(progress.consecrationDate)) : ""}
                  </span>
                </span>
                <Sparkles size={18} className={styles.countdownIcon} />
              </section>

            )}

            {started && !showStartForm && currentDay > 0 && (

              <>

                <section className={styles.progressBox}>
                  <div className={styles.progressTop}>
                    <strong>{completedCount} <span>de {TOTAL_DAYS} dias</span></strong>
                    <div className={styles.badges}>
                      {late > 0 && !finished && (
                        <span className={`${styles.badge} ${styles.badgeLate}`}>{late} em atraso</span>
                      )}
                      {!finished && (
                        <span className={styles.badge}>faltam {TOTAL_DAYS - completedCount}</span>
                      )}
                      {finished && (
                        <span className={`${styles.badge} ${styles.badgeDone}`}>concluída</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${percent}%` }} />
                  </div>
                </section>

                {actionableDay && (
                  <button
                    className={styles.cta}
                    onClick={() => navigate(`/oratio/consecration/day/${actionableDay}`)}
                  >
                    <Sparkles size={17}/>
                    {late > 1 ? `Retomar no dia ${actionableDay}` : `Rezar o dia ${actionableDay}`}
                  </button>
                )}

              </>

            )}

            {started && !showStartForm && stagesWithRange.map((stage) => {

              const days = stageDays[stage.id] ?? []
              const stageLoading = loading && days.length === 0

              return (

                <section key={stage.id} className={styles.gridWrap}>

                  <div className={styles.gridHead}>
                    <h3>{stage.title}</h3>
                    <span>dias {stage.start}–{stage.end}</span>
                  </div>

                  {stage.description && (
                    <p className={styles.stageDescription}>{stage.description}</p>
                  )}

                  {stageLoading ? (

                    <div className={styles.gridLoading}>
                      <Loader2 size={16} className={styles.spin} />
                      Carregando os dias…
                    </div>

                  ) : (

                    <div className={styles.grid}>
                      {days.map((day: any, index: number) => {
                        const state = stateOf(day.dayNumber)
                        return (
                          <button
                            key={day.id}
                            className={`${styles.dayCell} ${styles[state]}`}
                            style={{ animationDelay: `${Math.min(index, 12) * 16}ms` }}
                            onClick={() => openDay(day.dayNumber)}
                            title={day.title ? `Dia ${day.dayNumber} — ${day.title}` : `Dia ${day.dayNumber}`}
                          >
                            {state === "done" ? (
                              <Check size={15} className={styles.cellCheck} />
                            ) : state === "late" ? (
                              <Clock size={12} className={styles.cellLate} />
                            ) : state === "locked" ? (
                              <Lock size={12} className={styles.cellLock} />
                            ) : null}
                            <span className={styles.cellNum}>{day.dayNumber}</span>
                            {state === "current" && <span className={styles.ring} aria-hidden="true" />}
                          </button>
                        )
                      })}
                    </div>

                  )}

                </section>

              )

            })}

            {started && !showStartForm && (
              <div className={styles.legend}>
                <span><i className={styles.dotDone} /> concluído</span>
                <span><i className={styles.dotCurrent} /> atual</span>
                <span><i className={styles.dotLate} /> em atraso</span>
                <span><i className={styles.dotLocked} /> a chegar</span>
              </div>
            )}

            {/* Último passo — a carta e o ato final, depois do dia 33. */}
            <button
              className={`${styles.linkCard} ${finished ? styles.linkCardReady : ""}`}
              onClick={() => navigate("/oratio/consecration/finalizacao")}
            >
              <span className={styles.linkCardIcon}><Flag size={18}/></span>
              <span className={styles.linkCardBody}>
                <strong>Finalização</strong>
                <span>{finished ? "Sua carta de consagração" : "A carta e o ato final, depois do dia 33"}</span>
              </span>
            </button>

          </>

        )}

        {tab === "sobre" && (

          <>

            <section className={styles.motto}>
              <Crown size={20} className={styles.mottoIcon} />
              <strong>{CONSECRACAO_MOTTO.latim}</strong>
              <span className={styles.mottoTraducao}>“{CONSECRACAO_MOTTO.traducao}”</span>
              <span className={styles.mottoNota}>{CONSECRACAO_MOTTO.nota}</span>
            </section>

            <section className={styles.aboutGrid}>
              {CONSECRACAO_ABOUT.map((item) => {
                const Icon = ICONS[item.icon]
                return (
                  <article key={item.title} className={styles.aboutCard}>
                    <div className={styles.aboutCardHead}>
                      <span className={styles.aboutIcon}><Icon size={16}/></span>
                      <h3>{item.title}</h3>
                    </div>
                    <p className={styles.aboutLead}>{item.lead}</p>
                    <p className={styles.aboutText}>{item.text}</p>
                  </article>
                )
              })}
            </section>

            {stagesWithRange.length > 0 && (

              <section className={styles.milestones}>

                {stagesWithRange.map((stage, i) => {
                  const Icon = ICONS[stage.icon as ConsecracaoIcon]
                  return (
                    <div key={stage.id} className={styles.milestone}>
                      {i > 0 && <span className={styles.milestoneLine} aria-hidden="true" />}
                      <span className={styles.milestoneIcon}><Icon size={17}/></span>
                      <strong className={styles.milestoneDate}>dias {stage.start}–{stage.end}</strong>
                      <span className={styles.milestoneTitle}>{stage.title}</span>
                      {stage.description && (
                        <span className={styles.milestoneSub}>{stage.description}</span>
                      )}
                    </div>
                  )
                })}

              </section>

            )}

            <section className={styles.tipsBox}>
              <h3 className={styles.sectionTitle}>Antes de começar</h3>
              <ul className={styles.tips}>
                {CONSECRACAO_TIPS.map((tip) => {
                  const Icon = ICONS[tip.icon]
                  return (
                    <li key={tip.title} className={styles.tip}>
                      <span className={styles.tipIcon}><Icon size={16}/></span>
                      <span className={styles.tipBody}>
                        <strong>{tip.title}</strong>
                        <span>{tip.text}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className={styles.sequenceBox}>
              <h3 className={styles.sectionTitle}>A sequência de cada dia</h3>
              <ol className={styles.sequence}>
                {CONSECRACAO_SEQUENCE.map((step, i) => (
                  <li key={step.id}>
                    <span className={styles.sequenceNum}>{i + 1}</span>
                    {step.title}
                  </li>
                ))}
              </ol>

              {actionableDay && (
                <button
                  className={styles.sequenceCta}
                  onClick={() => navigate(`/oratio/consecration/day/${actionableDay}`)}
                >
                  <Sparkles size={16}/>
                  Rezar o dia {actionableDay}
                </button>
              )}
            </section>

          </>

        )}

      </div>

      <div className={styles.pageSpacer} />
      <BottomNavbar />

    </div>

  )

}
