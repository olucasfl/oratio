import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import type { ComponentType } from "react"
import {
  Check,
  ChevronLeft,
  Clock,
  Crown,
  Flame,
  Flower2,
  Gift,
  HandHeart,
  Image as ImageIcon,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Route,
  Scroll,
  Sparkles,
  Sun,
  Swords,
  Trash2,
  X
} from "lucide-react"

import styles from "./Quaresma.module.css"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

import {
  QUARESMA_ABOUT,
  QUARESMA_MOTTO,
  QUARESMA_STEPS,
  QUARESMA_TIPS,
  buildTimeline,
  countLateDays,
  formatLong,
  formatShort,
  getMilestones,
  getQuaresmaWindow
} from "../../data/quaresmaSaoMiguel"
import type { QuaresmaIcon } from "../../data/quaresmaSaoMiguel"

import {
  apiErrorMessage,
  getCachedProgress,
  getProgress,
  savePenance
} from "../../services/quaresmaService"
import type { QuaresmaProgress } from "../../services/quaresmaService"

import { useOffline } from "../../hooks/useOffline"
import { usePullToRefresh } from "../../hooks/usePullToRefresh"

type Tab = "jornada" | "penitencias" | "sobre"

const TABS: { id: Tab; label: string }[] = [
  { id: "jornada",     label: "Jornada" },
  { id: "penitencias", label: "Penitências" },
  { id: "sobre",       label: "Sobre" }
]

/* Chave de ícone (vinda do arquivo de dados) → componente lucide. */
const ICONS: Record<QuaresmaIcon, ComponentType<{ size?: number }>> = {
  flame:  Flame,
  image:  ImageIcon,
  hand:   HandHeart,
  clock:  Clock,
  sun:    Sun,
  swords: Swords,
  crown:  Crown,
  scroll: Scroll,
  route:  Route,
  gift:   Gift,
  flower: Flower2
}

/** Uma penitência por linha — é assim que o texto vai e volta do backend. */
function parsePenances(content: string | null | undefined): string[] {
  if (!content) return []
  return content.split("\n").map((line) => line.trim()).filter(Boolean)
}

export default function Quaresma() {

  const navigate = useNavigate()
  const isOffline = useOffline()

  const janela = useMemo(() => getQuaresmaWindow(), [])
  const timeline = useMemo(() => buildTimeline(janela.year), [janela.year])
  const milestones = useMemo(() => getMilestones(janela.year), [janela.year])

  const [tab, setTab] = useState<Tab>("jornada")

  const [progress, setProgress] = useState<QuaresmaProgress | null>(
    () => getCachedProgress()
  )
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  /* Penitências — lista editável, uma por linha no backend */
  const [penances, setPenances] = useState<string[]>([])
  const [draft, setDraft] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingText, setEditingText] = useState("")
  const [savingPenance, setSavingPenance] = useState(false)
  const penanceLoaded = useRef(false)

  /* Fora da janela (e fora do prazo extra) a página não existe. */
  useEffect(() => {
    if (!janela.reachable) navigate("/oratio/home", { replace: true })
  }, [janela.reachable, navigate])

  const load = useCallback(async () => {

    try {
      const data = await getProgress()

      if (data) {
        setProgress(data)

        // Só semeia a lista na primeira carga: recarregar no meio de uma
        // edição não pode apagar o que a pessoa está escrevendo.
        if (!penanceLoaded.current) {
          setPenances(parsePenances(data.penance))
          penanceLoaded.current = true
        }
      }
    } finally {
      setLoading(false)
    }

  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => { if (!isOffline) load() }, [isOffline, load])

  usePullToRefresh(load, !isOffline)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  /* =========================
  DERIVADOS
  ========================= */

  const completedDays = progress?.completedDays ?? []
  const completedCount = completedDays.length
  const currentDay = progress?.currentDay ?? janela.currentDay

  const percent = Math.min((completedCount / janela.total) * 100, 100)
  const late = countLateDays(currentDay, completedCount, janela.todayIsPrayerDay)
  const remaining = janela.total - completedCount
  const finished = completedCount >= janela.total

  /** O único dia acionável: o próximo da fila, se já tiver aberto. */
  const actionableDay =
    !finished && completedCount + 1 <= currentDay ? completedCount + 1 : null

  type DayState = "done" | "current" | "late" | "locked"

  function stateOf(dayNumber: number): DayState {
    if (dayNumber <= completedCount) return "done"
    if (dayNumber === actionableDay) return "current"
    if (dayNumber <= currentDay) return "late"
    return "locked"
  }

  function openDay(dayNumber: number) {

    const state = stateOf(dayNumber)

    if (state === "current") {
      navigate(`/oratio/quaresma/dia/${dayNumber}`)
      return
    }

    if (state === "done") {
      navigate(`/oratio/quaresma/dia/${dayNumber}`)
      return
    }

    if (state === "late") {
      setToast(`Conclua o dia ${actionableDay} primeiro — um de cada vez.`)
      return
    }

    setToast("Este dia ainda não chegou. Volte na data dele.")

  }

  /* =========================
  PENITÊNCIAS
  ========================= */

  /**
   * A lista inteira é salva de uma vez, uma penitência por linha. A UI
   * atualiza na hora e só volta atrás se o backend recusar — assim
   * adicionar e apagar continuam instantâneos numa conexão ruim.
   */
  async function commitPenances(next: string[]) {

    if (isOffline) {
      setToast("Você está offline — conecte-se para salvar.")
      return false
    }

    const anterior = penances
    setPenances(next)

    try {
      setSavingPenance(true)
      await savePenance(next.join("\n"))
      return true
    } catch (err) {
      setPenances(anterior)
      setToast(apiErrorMessage(err, "Não foi possível salvar. Tente de novo."))
      return false
    } finally {
      setSavingPenance(false)
    }

  }

  async function addPenance() {
    const texto = draft.trim()
    if (!texto) return

    setDraft("")

    const ok = await commitPenances([...penances, texto])
    if (!ok) setDraft(texto)
  }

  function startEdit(index: number) {
    setEditingIndex(index)
    setEditingText(penances[index])
  }

  function cancelEdit() {
    setEditingIndex(null)
    setEditingText("")
  }

  async function commitEdit() {
    if (editingIndex === null) return

    const texto = editingText.trim()

    // Apagar o texto todo equivale a remover a penitência.
    const next = texto
      ? penances.map((p, i) => (i === editingIndex ? texto : p))
      : penances.filter((_, i) => i !== editingIndex)

    cancelEdit()
    await commitPenances(next)
  }

  async function removePenance(index: number) {
    if (editingIndex === index) cancelEdit()
    await commitPenances(penances.filter((_, i) => i !== index))
  }

  /* =========================
  CONTAGEM REGRESSIVA
  ========================= */

  const countdown = (() => {

    if (janela.daysToFeast > 1) {
      return {
        numero: String(janela.daysToFeast),
        unidade: janela.daysToFeast === 1 ? "dia" : "dias",
        texto: "para a Festa de São Miguel",
        data: "29 de setembro",
        festa: false
      }
    }

    if (janela.daysToFeast === 1) {
      return {
        numero: "1",
        unidade: "dia",
        texto: "para a Festa de São Miguel",
        data: "amanhã, 29 de setembro",
        festa: false
      }
    }

    if (janela.daysToFeast === 0) {
      return {
        numero: "✦",
        unidade: "",
        texto: "Hoje é a Festa de São Miguel Arcanjo",
        data: "Quem como Deus?",
        festa: true
      }
    }

    return {
      numero: "✦",
      unidade: "",
      texto: "A Festa de São Miguel já passou",
      data: "Termine os dias que faltam",
      festa: true
    }

  })()

  /* =========================
  RENDER
  ========================= */

  return (

    <div className={`${styles.container} page-enter`}>

      <div className={styles.aurora} aria-hidden="true" />

      <button className={styles.back} onClick={() => navigate("/oratio/home")}>
        <ChevronLeft size={18} />
        Voltar
      </button>

      {/* HERO */}

      <header className={styles.hero}>

        <div className={styles.heroIcon}>
          <Swords size={28} />
        </div>

        <span className={styles.heroBadge}>{janela.total} dias</span>

        <h1 className={styles.heroTitle}>Quaresma de São Miguel</h1>

        <p className={styles.heroSub}>
          Da Assunção de Nossa Senhora<br />
          à Festa de São Miguel Arcanjo
        </p>

      </header>

      {isOffline && (
        <div className={styles.offline}>
          Você está offline — as orações continuam disponíveis, mas registrar
          progresso precisa de conexão.
        </div>
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

      {/* CONTEÚDO */}

      <div className={styles.panel} key={tab}>

        {tab === "jornada" && (

          <>

            {/* CONTAGEM REGRESSIVA */}

            <section
              className={`${styles.countdown} ${countdown.festa ? styles.countdownFeast : ""}`}
            >

              <span className={styles.countdownNum}>{countdown.numero}</span>

              <span className={styles.countdownBody}>
                {countdown.unidade && (
                  <span className={styles.countdownUnit}>{countdown.unidade}</span>
                )}
                <strong>{countdown.texto}</strong>
                <span className={styles.countdownDate}>{countdown.data}</span>
              </span>

              <Flame size={18} className={styles.countdownFlame} />

            </section>

            {/* DOMINGO */}

            {janela.isRestDay && (
              <section className={styles.sunday}>
                <Sun size={18} className={styles.sundayIcon} />
                <span>
                  <strong>Hoje é domingo — descanse e vá à Missa.</strong>
                  <span>
                    A Quaresma pausa aos domingos. Amanhã o próximo dia abre sozinho.
                  </span>
                </span>
              </section>
            )}

            {/* PROGRESSO */}

            <section className={styles.progressBox}>

              <div className={styles.progressTop}>
                <strong>
                  {completedCount} <span>de {janela.total} dias</span>
                </strong>

                <div className={styles.badges}>
                  {late > 0 && (
                    <span className={`${styles.badge} ${styles.badgeLate}`}>
                      {late} em atraso
                    </span>
                  )}
                  {!finished && (
                    <span className={styles.badge}>faltam {remaining}</span>
                  )}
                  {finished && (
                    <span className={`${styles.badge} ${styles.badgeDone}`}>
                      concluída
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${percent}%` }}
                />
              </div>

            </section>

            {/* AÇÃO PRINCIPAL */}

            {actionableDay && !janela.isRestDay && (
              <button
                className={styles.cta}
                onClick={() => navigate(`/oratio/quaresma/dia/${actionableDay}`)}
              >
                <Sparkles size={17} />
                {late > 1
                  ? `Retomar no dia ${actionableDay}`
                  : `Rezar o dia ${actionableDay}`}
              </button>
            )}

            {/* GRADE — todos os dias, com os domingos no meio */}

            <section className={styles.gridWrap}>

              <div className={styles.gridHead}>
                <h3>Os {janela.total} dias</h3>
                <span>domingo é descanso — menos o último</span>
              </div>

              <div className={styles.grid}>

                {timeline.map((entry, index) => {

                  if (entry.kind === "rest") {
                    return (
                      <div
                        key={entry.date}
                        className={styles.restCell}
                        style={{ animationDelay: `${Math.min(index, 24) * 14}ms` }}
                        title={`${formatLong(entry.date)} — descanso e Missa`}
                      >
                        <Sun size={13} />
                        <span>dom</span>
                      </div>
                    )
                  }

                  const state = stateOf(entry.dayNumber)

                  return (
                    <button
                      key={entry.date}
                      className={`${styles.dayCell} ${styles[state]} ${
                        entry.isFeast ? styles.feastCell : ""
                      }`}
                      style={{ animationDelay: `${Math.min(index, 24) * 14}ms` }}
                      onClick={() => openDay(entry.dayNumber)}
                      title={
                        entry.isFeast
                          ? `Dia ${entry.dayNumber} — Festa de São Miguel Arcanjo`
                          : entry.isSunday
                            ? `Dia ${entry.dayNumber} — ${formatLong(entry.date)}, o domingo que conta`
                            : `Dia ${entry.dayNumber} — ${formatLong(entry.date)}`
                      }
                    >

                      {/* O último domingo é dia de oração — o solzinho
                          explica por que ele aparece numerado. */}
                      {entry.isSunday && (
                        <Sun size={9} className={styles.cellSun} />
                      )}

                      {state === "done" ? (
                        <Check size={15} className={styles.cellCheck} />
                      ) : state === "locked" ? (
                        <Lock size={12} className={styles.cellLock} />
                      ) : null}

                      <span className={styles.cellNum}>{entry.dayNumber}</span>

                      <span className={styles.cellDate}>
                        {formatShort(entry.date)}
                      </span>

                      {state === "current" && (
                        <span className={styles.ring} aria-hidden="true" />
                      )}

                    </button>
                  )

                })}

              </div>

              <div className={styles.legend}>
                <span><i className={styles.dotDone} /> concluído</span>
                <span><i className={styles.dotCurrent} /> hoje</span>
                <span><i className={styles.dotLate} /> em atraso</span>
                <span><i className={styles.dotLocked} /> a chegar</span>
              </div>

            </section>

            {loading && !progress && (
              <div className={styles.loadingHint}>
                <Loader2 size={15} className={styles.spin} />
                Carregando seu progresso…
              </div>
            )}

          </>

        )}

        {tab === "penitencias" && (

          <section className={styles.penanceBox}>

            <div className={styles.penanceHead}>
              <h3 className={styles.sectionTitle}>Minhas penitências</h3>
              {savingPenance && (
                <span className={styles.penanceStatus}>
                  <Loader2 size={13} className={styles.spin} />
                  salvando
                </span>
              )}
            </div>

            <p className={styles.sectionHint}>
              O que você se propôs a oferecer nesta Quaresma. Escolha coisas
              pequenas e possíveis — aos domingos não há penitência.
            </p>

            <div className={styles.penanceForm}>

              <input
                className={styles.penanceInput}
                value={draft}
                maxLength={160}
                placeholder="Escreva sua penitência"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addPenance() }}
              />

              <button
                className={styles.penanceAdd}
                onClick={addPenance}
                disabled={!draft.trim() || savingPenance}
                aria-label="Adicionar penitência"
              >
                <Plus size={18} />
              </button>

            </div>

            {penances.length === 0 && (
              <div className={styles.penanceEmpty}>
                <HandHeart size={26} />
                <strong>Nenhuma penitência ainda</strong>
                <span>
                  Um jejum, uma renúncia, um silêncio, uma esmola —
                  escreva acima e toque em +
                </span>
              </div>
            )}

            <ul className={styles.penanceList}>

              {penances.map((item, index) => (

                <li key={`${index}-${item}`} className={styles.penanceItem}>

                  {editingIndex === index ? (

                    <>
                      <input
                        className={styles.penanceEditInput}
                        value={editingText}
                        maxLength={160}
                        autoFocus
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEdit()
                          if (e.key === "Escape") cancelEdit()
                        }}
                      />

                      <button
                        className={styles.penanceIconButton}
                        onClick={commitEdit}
                        aria-label="Salvar alteração"
                      >
                        <Check size={16} />
                      </button>

                      <button
                        className={styles.penanceIconButton}
                        onClick={cancelEdit}
                        aria-label="Cancelar"
                      >
                        <X size={16} />
                      </button>
                    </>

                  ) : (

                    <>
                      <span className={styles.penanceBullet}>
                        <Flame size={13} />
                      </span>

                      <span className={styles.penanceText}>{item}</span>

                      <button
                        className={styles.penanceIconButton}
                        onClick={() => startEdit(index)}
                        aria-label={`Editar "${item}"`}
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        className={`${styles.penanceIconButton} ${styles.penanceDelete}`}
                        onClick={() => removePenance(index)}
                        aria-label={`Apagar "${item}"`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </>

                  )}

                </li>

              ))}

            </ul>

          </section>

        )}

        {tab === "sobre" && (

          <>

            {/* MARCOS — o caminho inteiro num relance */}

            <section className={styles.milestones}>

              {milestones.map((m, i) => {
                const Icon = ICONS[m.icon]
                return (
                  <div key={m.title} className={styles.milestone}>

                    {i > 0 && <span className={styles.milestoneLine} aria-hidden="true" />}

                    <span className={styles.milestoneIcon}>
                      <Icon size={17} />
                    </span>

                    <strong className={styles.milestoneDate}>{m.date}</strong>
                    <span className={styles.milestoneTitle}>{m.title}</span>
                    <span className={styles.milestoneSub}>{m.sub}</span>

                  </div>
                )
              })}

            </section>

            {/* LEMA */}

            <section className={styles.motto}>
              <Swords size={20} className={styles.mottoIcon} />
              <strong>{QUARESMA_MOTTO.latim}</strong>
              <span className={styles.mottoTraducao}>
                “{QUARESMA_MOTTO.traducao}”
              </span>
              <span className={styles.mottoNota}>{QUARESMA_MOTTO.nota}</span>
            </section>

            {/* CARDS */}

            <section className={styles.aboutGrid}>

              {QUARESMA_ABOUT.map((item) => {
                const Icon = ICONS[item.icon]
                return (
                  <article key={item.title} className={styles.aboutCard}>

                    <div className={styles.aboutCardHead}>
                      <span className={styles.aboutIcon}>
                        <Icon size={16} />
                      </span>
                      <h3>{item.title}</h3>
                    </div>

                    <p className={styles.aboutLead}>{item.lead}</p>
                    <p className={styles.aboutText}>{item.text}</p>

                  </article>
                )
              })}

            </section>

            {/* ANTES DE COMEÇAR */}

            <section className={styles.tipsBox}>

              <h3 className={styles.sectionTitle}>Antes de começar</h3>

              <ul className={styles.tips}>
                {QUARESMA_TIPS.map((tip) => {
                  const Icon = ICONS[tip.icon]
                  return (
                    <li key={tip.title} className={styles.tip}>
                      <span className={styles.tipIcon}>
                        <Icon size={16} />
                      </span>
                      <span className={styles.tipBody}>
                        <strong>{tip.title}</strong>
                        <span>{tip.text}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>

            </section>

            {/* SEQUÊNCIA DO DIA */}

            <section className={styles.sequenceBox}>

              <h3 className={styles.sectionTitle}>A sequência de cada dia</h3>

              <ol className={styles.sequence}>
                {QUARESMA_STEPS.map((step, i) => (
                  <li key={step.id}>
                    <span className={styles.sequenceNum}>{i + 1}</span>
                    {step.title}
                  </li>
                ))}
              </ol>

              {actionableDay && (
                <button
                  className={styles.sequenceCta}
                  onClick={() => navigate(`/oratio/quaresma/dia/${actionableDay}`)}
                >
                  <Sparkles size={16} />
                  Começar o dia {actionableDay}
                </button>
              )}

            </section>

          </>

        )}

      </div>

      {/* Vai pro body: dentro do .container ele herdaria as regras de
          posicionamento da página e o position:fixed pararia de valer. */}
      {toast && createPortal(
        <div className={styles.toast}>{toast}</div>,
        document.body
      )}

      <div className={styles.pageSpacer} />

      <BottomNavbar />

    </div>

  )

}
