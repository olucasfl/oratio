import { useState, Fragment } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, ChevronUp, ChevronLeft, Cross, BookOpen, Heart } from "lucide-react"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

import {
  COMO_CONFESSAR_INTRO,
  COMO_CONFESSAR_PASSOS,
  COMO_CONFESSAR_OBSERVACOES,
  ORACAO_ANTES_EXAME,
  EXAME_SECTIONS,
  ATO_DE_CONTRICAO,
  FORMULA_ABSOLVICAO,
} from "./confissaoData"

import styles from "./Confissao.module.css"

type Tab = "como" | "exame" | "ato"

export default function Confissao() {

  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>("como")
  const [openSection, setOpenSection] = useState<number | null>(null)
  const [oracaoOpen, setOracaoOpen] = useState(false)

  function handleTabChange(newTab: Tab) {
    setTab(newTab)
    setOpenSection(null)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }

  function toggleSection(i: number) {
    setOpenSection(prev => prev === i ? null : i)
  }

  return (

    <div className={`${styles.container} page-enter`}>

      <div className={styles.glow} />

      {/* VOLTAR */}

      <button className={styles.backBtn} onClick={() => navigate("/oratio/home")}>
        <ChevronLeft size={18}/>
        Voltar
      </button>

      {/* HERO */}

      <div className={styles.hero}>

        <div className={styles.heroIcon}>
          <Cross size={32} />
        </div>

        <span className={styles.badge}>Sacramento da Penitência</span>

        <h1 className={styles.title}>Guia para a Confissão</h1>

        <p className={styles.subtitle}>
          Exame de consciência completo, como se confessar e ato de contrição.
        </p>

      </div>

      {/* ABAS */}

      <div className={styles.tabs}>

        <button
          className={`${styles.tab} ${tab === "como" ? styles.tabActive : ""}`}
          onClick={() => handleTabChange("como")}
        >
          <BookOpen size={14} /> Como Confessar
        </button>

        <button
          className={`${styles.tab} ${tab === "exame" ? styles.tabActive : ""}`}
          onClick={() => handleTabChange("exame")}
        >
          <Cross size={14} /> Exame
        </button>

        <button
          className={`${styles.tab} ${tab === "ato" ? styles.tabActive : ""}`}
          onClick={() => handleTabChange("ato")}
        >
          <Heart size={14} /> Ato de Contrição
        </button>

      </div>

      {/* ================================
       TAB: COMO CONFESSAR
      ================================ */}

      {tab === "como" && (

        <div className={styles.content}>

          <p className={styles.introText}>{COMO_CONFESSAR_INTRO}</p>

          <div className={styles.card}>

            <h2 className={styles.cardTitle}>
              <span className={styles.cardTitleIcon}>✦</span>
              Passos da Confissão
            </h2>

            <ol className={styles.stepsList}>
              {COMO_CONFESSAR_PASSOS.map((passo, i) => (
                <li key={i} className={styles.step}>
                  <span className={styles.stepNumber}>{i + 1}</span>
                  <p>{passo}</p>
                </li>
              ))}
            </ol>

          </div>

          <div className={`${styles.card} ${styles.cardObservacoes}`}>

            <h2 className={styles.cardTitle}>
              <span className={styles.cardTitleIcon}>!</span>
              Observações importantes
            </h2>

            <ul className={styles.obsList}>
              {COMO_CONFESSAR_OBSERVACOES.map((obs, i) => (
                <li key={i} className={styles.obsItem}>
                  <span className={styles.obsDot} />
                  <p>{obs}</p>
                </li>
              ))}
            </ul>

          </div>

          <div className={`${styles.card} ${styles.cardFormula}`}>

            <h2 className={styles.cardTitle}>
              <span className={styles.cardTitleIcon}>✝</span>
              Fórmula da Absolvição
            </h2>

            <p className={styles.formulaText}>"{FORMULA_ABSOLVICAO}"</p>

            <p className={styles.formulaNote}>
              Caso o padre esqueça, é permitido lembrá-lo da fórmula correta.
            </p>

          </div>

        </div>

      )}

      {/* ================================
       TAB: EXAME DE CONSCIÊNCIA
      ================================ */}

      {tab === "exame" && (

        <div className={styles.content}>

          <p className={styles.introText}>
            Este exame de consciência tem como objetivo ajudar os fiéis a fazer uma boa confissão.
            Ele é indicado para adultos, servindo como guia para esclarecer a consciência a partir
            das leis objetivas da moral.
          </p>

          {/* ORAÇÃO ANTES DO EXAME */}

          <button
            className={styles.oracaoToggle}
            onClick={() => setOracaoOpen(o => !o)}
          >
            <span>Oração antes do Exame de Consciência</span>
            {oracaoOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {oracaoOpen && (
            <div className={styles.oracaoCard}>
              <p className={styles.oracaoText}>{ORACAO_ANTES_EXAME}</p>
            </div>
          )}

          {/* SEÇÕES DO EXAME */}

          <div className={styles.accordionList}>

            {EXAME_SECTIONS.map((section, i) => (

              <Fragment key={i}>

                {section.grupoCabecalho && (
                  <div className={styles.groupHeader}>
                    <div className={styles.groupHeaderLine} />
                    <span className={styles.groupHeaderText}>{section.grupoCabecalho}</span>
                    <div className={styles.groupHeaderLine} />
                  </div>
                )}

                <div className={styles.accordion}>

                  <button
                    className={`${styles.accordionHeader} ${openSection === i ? styles.accordionHeaderOpen : ""}`}
                    onClick={() => toggleSection(i)}
                  >
                    <div className={styles.accordionTitle}>
                      <span className={`${styles.accordionNum} ${section.badgeVariant === 'capital' ? styles.accordionNumCapital : ""}`}>
                        {section.tag ?? (i === 0 ? "✦" : String(i))}
                      </span>
                      <div>
                        <strong>{section.titulo}</strong>
                        {section.subtitulo && (
                          <span className={styles.accordionSub}>{section.subtitulo}</span>
                        )}
                      </div>
                    </div>
                    {openSection === i
                      ? <ChevronUp size={18} />
                      : <ChevronDown size={18} />
                    }
                  </button>

                  {openSection === i && (

                    <div className={styles.accordionBody}>

                      {section.intro && (
                        <p className={styles.sectionIntro}>{section.intro}</p>
                      )}

                      <ul className={styles.itemList}>
                        {section.itens.map((item, j) => (
                          <li key={j} className={styles.item}>
                            <span className={styles.itemCross}>✦</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                    </div>

                  )}

                </div>

              </Fragment>

            ))}

          </div>

        </div>

      )}

      {/* ================================
       TAB: ATO DE CONTRIÇÃO
      ================================ */}

      {tab === "ato" && (

        <div className={styles.content}>

          <p className={styles.introText}>
            O Ato de Contrição deve ser rezado em voz audível ao confessor após receber a penitência.
            É expressão do arrependimento sincero e do firme propósito de não mais pecar.
          </p>

          <div className={`${styles.card} ${styles.cardAto}`}>

            <div className={styles.atoHeader}>
              <Cross size={22} />
              <h2>Ato de Contrição</h2>
            </div>

            <p className={styles.atoText}>
              {ATO_DE_CONTRICAO.split("\n").map((line, i) => (
                <span key={i}>{line}<br/></span>
              ))}
            </p>

          </div>

          <div className={styles.card}>

            <h2 className={styles.cardTitle}>
              <span className={styles.cardTitleIcon}>✦</span>
              O que é o Ato de Contrição?
            </h2>

            <div className={styles.infoList}>

              <div className={styles.infoItem}>
                <strong>Contrição perfeita</strong>
                <p>É o arrependimento motivado pelo amor a Deus e pela ofensa que se fez a Ele. Este tipo de contrição perdoa os pecados mortais mesmo antes da confissão, mas com o propósito de se confessar.</p>
              </div>

              <div className={styles.infoItem}>
                <strong>Contrição imperfeita (atrição)</strong>
                <p>É o arrependimento motivado pelo horror do pecado ou pelo temor das penas eternas. É suficiente para receber validamente o Sacramento da Penitência.</p>
              </div>

              <div className={styles.infoItem}>
                <strong>Firme propósito de emenda</strong>
                <p>Não basta estar arrependido — é necessário ter a firme intenção de não pecar mais e de evitar as ocasiões próximas de pecado. Sem esse propósito, a absolvição é inválida.</p>
              </div>

            </div>

          </div>

        </div>

      )}

      <div className={styles.spacer} />

      <BottomNavbar />

    </div>

  )

}
