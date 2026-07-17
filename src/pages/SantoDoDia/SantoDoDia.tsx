import { useLocation, useNavigate } from "react-router-dom"
import { ChevronLeft, BookOpen, Sparkles } from "lucide-react"

import styles from "./SantoDoDia.module.css"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

import { useLiturgy } from "../../hooks/useLiturgy"
import { resolveSaintOfDay } from "../../utils/saintOfDay"

export default function SantoDoDia(){

  const navigate = useNavigate()
  const location = useLocation()

  const stateLiturgy = (location.state as any)?.liturgy
  const stateOffset = (location.state as any)?.dateOffset

  // fallback: se a página for aberta direto (sem vir do Home),
  // busca a liturgia de hoje do zero
  const {
    liturgy: fetchedLiturgy,
    loadingLiturgy
  } = useLiturgy()

  const liturgy = stateLiturgy ?? fetchedLiturgy
  const dateOffset = stateLiturgy ? (stateOffset ?? 0) : 0

  const info = resolveSaintOfDay(liturgy)

  const loading = !stateLiturgy && loadingLiturgy && !liturgy

  const intro =
    dateOffset === 0 ? "Hoje" :
    dateOffset === -1 ? "Ontem" :
    dateOffset === 1 ? "Amanhã" :
    "Nesse dia"

  return(

    <main className={`${styles.page} page-enter`}>

      <section className={styles.container}>

        <button
          className={styles.backButton}
          onClick={()=>navigate(-1)}
        >
          <ChevronLeft size={18}/>
          Voltar
        </button>

        {loading && (
          <div className={styles.skeletonWrap}>
            <div className={`skeleton ${styles.skBadge}`}/>
            <div className={`skeleton ${styles.skTitle}`}/>
            <div className={`skeleton ${styles.skText}`}/>
            <div className={`skeleton ${styles.skText}`}/>
          </div>
        )}

        {!loading && !info && (

          <div className={styles.empty}>

            <Sparkles size={34}/>

            <p>
              {intro === "Hoje"
                ? "Hoje não há uma celebração de santo com nome próprio — é um dia comum do Tempo Litúrgico."
                : "Não há uma celebração de santo com nome próprio nesse dia."}
            </p>

          </div>

        )}

        {!loading && info && (

          <>

            <div
              className={styles.badge}
              style={{
                background:info.corHexSoft,
                color:info.corHex
              }}
            >
              {info.grau}{info.cor ? ` · ${info.cor}` : ""}
            </div>

            <p className={styles.intro}>
              {intro} {dateOffset === -1 ? "foi" : dateOffset === 1 ? "será" : "é"} dia de
            </p>

            <h1 className={styles.nome}>
              {info.nome}
            </h1>

            {info.data && (
              <p className={styles.data}>
                {info.data}
              </p>
            )}

            {info.bio ? (

              <div className={styles.bio}>

                <p className={styles.resumo}>
                  {info.bio.resumo}
                </p>

                {info.bio.texto.map((paragrafo, i)=>(
                  <p key={i} className={styles.paragrafo}>
                    {paragrafo}
                  </p>
                ))}

              </div>

            ) : (

              <div className={styles.semBio}>
                <p>
                  Ainda não escrevemos os detalhes sobre essa celebração —
                  mas o nome, o grau litúrgico e a cor acima já são
                  exatamente os do calendário oficial de hoje.
                </p>
              </div>

            )}

            <button
              className={styles.readingsButton}
              onClick={()=>
                navigate("/oratio/liturgia-completa")
              }
            >
              <BookOpen size={18}/>
              Ver leituras do dia
            </button>

          </>

        )}

      </section>

      <div className={styles.pageSpacer}/>

      <BottomNavbar/>

    </main>

  )

}
