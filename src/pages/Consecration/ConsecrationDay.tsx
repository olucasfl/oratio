import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Check, ChevronLeft, ChevronRight, Crown, Loader2 } from "lucide-react"

import styles from "./ConsecrationDay.module.css"

import {
  apiErrorMessage,
  completeDay,
  getCachedProgress,
  getDay,
  getProgress,
  uncompleteDay
} from "../../services/consecrationService"
import type { ConsecrationProgress, ConsecrationDay, DayPrayer } from "../../services/consecrationService"

import { useOffline } from "../../hooks/useOffline"
import { usePullToRefresh } from "../../hooks/usePullToRefresh"

const TOTAL_DAYS = 33

export default function ConsecrationDay(){

 const { day } = useParams()
 const navigate = useNavigate()
 const isOffline = useOffline()

 const dayNumber = Number(day)

 const [data, setData] = useState<ConsecrationDay | null>(null)
 const [progress, setProgress] = useState<ConsecrationProgress | null>(
   () => getCachedProgress()
 )
 const [loading, setLoading] = useState(true)
 const [step, setStep] = useState(0)
 const [saving, setSaving] = useState(false)
 const [celebrating, setCelebrating] = useState(false)
 const [error, setError] = useState<string | null>(null)

 const topRef = useRef<HTMLDivElement>(null)

 const load = useMemo(() => async () => {
   setLoading(true)
   try {
     const [dayData, progressData] = await Promise.all([
       getDay(dayNumber).catch(() => null),
       getProgress()
     ])
     if (dayData) setData(dayData)
     if (progressData) setProgress(progressData)
   } finally {
     setLoading(false)
   }
 }, [dayNumber])

 useEffect(() => { load() }, [load])
 useEffect(() => { if (!isOffline) load() }, [isOffline, load])

 usePullToRefresh(load, !isOffline)

 const prayers: DayPrayer[] = data?.prayers ?? []
 const total = prayers.length
 const current = prayers[step]
 const isLast = total > 0 && step === total - 1

 const completedDays = progress?.completedDays ?? []
 const currentDay = progress?.currentDay ?? 0

 const alreadyDone = completedDays.includes(dayNumber)
 const isActionable = dayNumber === completedDays.length + 1 && dayNumber <= currentDay
 const canUndo = alreadyDone && dayNumber === completedDays[completedDays.length - 1]

 /**
  * Sem progresso nenhum (offline e sem cache) a tela continua aberta em
  * modo leitura: as orações já vieram da API/cache, e travar o acesso
  * puniria quem só quer rezar. Só a conclusão fica indisponível.
  */
 const readOnly = !progress

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

     const nextRoute = dayNumber >= TOTAL_DAYS
       ? "/oratio/consecration/finalizacao"
       : "/oratio/consecration"

     setTimeout(() => navigate(nextRoute, { replace: true }), 1650)

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
     navigate("/oratio/consecration", { replace: true })
   } catch (err) {
     setError(apiErrorMessage(err, "Não foi possível desfazer. Tente de novo."))
     setSaving(false)
   }

 }

 /* ============================= */
 /* CONCLUSÃO — animação */
 /* ============================= */

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
         {dayNumber >= TOTAL_DAYS
           ? "Você completou os 33 dias de preparação. Agora é hora de escrever sua carta."
           : "Nossa Senhora, rogai por nós."}
       </p>

     </div>
   )
 }

 /* ============================= */
 /* LOADING */
 /* ============================= */

 if (loading && !data) {
   return(
    <div className={`${styles.container} page-enter`}>

     <button className={styles.back} onClick={()=>navigate("/oratio/consecration")}>
      <ChevronLeft size={18}/>
      Jornada
     </button>

     <div className={styles.skeletonWrap}>
      <div className={styles.skeletonHeader}>
       <div className={`skeleton ${styles.skH1}`}/>
      </div>
      <div className={`skeleton ${styles.skPrayer}`}/>
     </div>

    </div>
   )
 }

 if (!data) {
  return(
   <div className={styles.loading}>
    <p>
     {isOffline
      ? "Você está offline e este dia ainda não foi carregado."
      : "Não foi possível carregar este dia."}
    </p>
    <button className={styles.back} onClick={()=>navigate("/oratio/consecration")}>
     <ChevronLeft size={18}/>
     Voltar
    </button>
   </div>
  )
 }

 const percent = total > 0 ? ((step + 1) / total) * 100 : 100

 return(

  <div className={`${styles.container} page-enter`}>

   <div ref={topRef} />

   <button className={styles.back} onClick={()=>navigate("/oratio/consecration")}>
    <ChevronLeft size={18}/>
    Jornada
   </button>

   {/* CABEÇALHO */}

   <header className={styles.header}>

    <div className={styles.headerTop}>

     <span className={styles.dayBadge}>
      <Crown size={13}/>
      Dia {dayNumber} de {TOTAL_DAYS}
     </span>

     {alreadyDone && (
      <span className={styles.doneBadge}>
       <Check size={12}/>
       concluído
      </span>
     )}

    </div>

    <span className={styles.headerStage}>{data.stage?.title}</span>

    {data.title && <h1 className={styles.dayTitle}>{data.title}</h1>}

   </header>

   {/* PROGRESSO DOS PASSOS */}

   {total > 1 && (

    <div className={styles.steps}>

     <div className={styles.stepsTrack}>
      <div className={styles.stepsFill} style={{ width: `${percent}%` }} />
     </div>

     <div className={styles.stepsDots}>
      {prayers.map((p, i) => (
       <button
        key={p.id}
        className={`${styles.dot} ${i === step ? styles.dotActive : ""} ${
         i < step ? styles.dotPast : ""
        }`}
        onClick={() => setStep(i)}
        aria-label={p.prayer.title}
       />
      ))}
     </div>

     <span className={styles.stepsLabel}>Oração {step + 1} de {total}</span>

    </div>

   )}

   {isOffline && (
    <div className={styles.offline}>
     Você está offline — reze à vontade, mas registrar a conclusão
     precisa de conexão.
    </div>
   )}

   {/* ORAÇÃO */}

   {current && (

    <article className={styles.prayer} key={current.id}>
     <h2 className={styles.prayerTitle}>{current.prayer.title}</h2>
     <div className={styles.prayerText}>{current.prayer.content}</div>
    </article>

   )}

   {error && <p className={styles.error}>{error}</p>}

   {/* NAVEGAÇÃO */}

   <div className={styles.nav}>

    {total > 1 && (
     <button
      className={styles.secondary}
      onClick={() => setStep((s) => Math.max(s - 1, 0))}
      disabled={step === 0}
     >
      <ChevronLeft size={17}/>
      Anterior
     </button>
    )}

    {!isLast && total > 1 && (
     <button
      className={styles.primary}
      onClick={() => setStep((s) => Math.min(s + 1, total - 1))}
     >
      Próxima
      <ChevronRight size={17}/>
     </button>
    )}

    {isLast && !alreadyDone && (
     <button
      className={styles.finish}
      onClick={handleComplete}
      disabled={saving || readOnly || isOffline || !isActionable}
     >
      {saving ? (
       <>
        <Loader2 size={17} className={styles.spin}/>
        Registrando…
       </>
      ) : (
       <>
        <Check size={17}/>
        Concluir dia
       </>
      )}
     </button>
    )}

    {isLast && alreadyDone && (
     <button
      className={styles.secondary}
      onClick={handleUndo}
      disabled={saving || isOffline || !canUndo}
      title={!canUndo ? "Só é possível desmarcar o último dia concluído" : undefined}
     >
      {saving ? "Processando…" : "Desmarcar conclusão"}
     </button>
    )}

   </div>

   {/* A oração pode ser lida livremente, mas só dá pra concluir o dia
       certo — se a pessoa chegou aqui adiantada ou atrasada, explica
       o motivo em vez de só desabilitar o botão sem dizer por quê. */}
   {isLast && !alreadyDone && !readOnly && !isActionable && (
    <p className={styles.notYet}>
     {dayNumber > currentDay
      ? "Este dia ainda não chegou — volte quando for a vez dele."
      : `Complete o dia ${completedDays.length + 1} antes deste, um de cada vez.`}
    </p>
   )}

   {loading && (
    <p className={styles.loadingHint}>
     <Loader2 size={14} className={styles.spin}/>
     Atualizando…
    </p>
   )}

   <div className={styles.pageSpacer} />

  </div>

 )
}
