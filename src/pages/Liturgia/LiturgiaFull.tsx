import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./LiturgiaFull.module.css"
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from "lucide-react"
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"
import ShareReadingButton from "../../components/ShareReadingButton/ShareReadingButton"
import { getLiturgiaFull } from "../../services/liturgiaService"
import { useOffline } from "../../hooks/useOffline"
import { usePullToRefresh } from "../../hooks/usePullToRefresh"
import {
  buildLeituraShareText,
  buildSalmoShareText,
  buildEvangelhoShareText
} from "../../utils/liturgyShareText"

function cacheKey(date:Date){

  const dia = String(date.getDate()).padStart(2,"0")
  const mes = String(date.getMonth()+1).padStart(2,"0")
  const ano = date.getFullYear()

  return `oratio-liturgia-${ano}-${mes}-${dia}`

}

export default function LiturgiaFull(){

  const [missa, setMissa] = useState<any>(null)
  const [dataSelecionada, setDataSelecionada] = useState(new Date())
  const [showAviso, setShowAviso] = useState(true)
  const [erro, setErro] = useState(false)

  const isOffline = useOffline()
  const navigate = useNavigate()

  useEffect(() => {
    loadMissa(dataSelecionada)
  }, [dataSelecionada])

  usePullToRefresh(() => loadMissa(dataSelecionada), !isOffline)

  async function loadMissa(date: Date){

    setErro(false)

    const key = cacheKey(date)

    const cached = localStorage.getItem(key)

    if(cached){
      setMissa(JSON.parse(cached))
    }else{
      setMissa(null)
    }

    if(isOffline || !navigator.onLine){

      if(!cached){
        setErro(true)
      }

      return

    }

    const dia = String(date.getDate()).padStart(2,"0")
    const mes = String(date.getMonth()+1).padStart(2,"0")
    const ano = date.getFullYear()

    try{

      const data = await getLiturgiaFull(dia, mes, ano)

      setMissa(data)

      localStorage.setItem(key, JSON.stringify(data))

    }catch(err){

      console.log("Erro ao carregar liturgia", err)

      if(!cached){
        setErro(true)
      }

    }

  }

  function changeDay(offset:number){
    const newDate = new Date(dataSelecionada)
    newDate.setDate(newDate.getDate() + offset)
    setDataSelecionada(newDate)
  }

  function fecharAviso(){
    setShowAviso(false)
    }

  if(erro){
    return(
      <div className={styles.loading}>
        <div className={styles.errorState}>

          <p>
            Não foi possível carregar a liturgia
            {isOffline ? " — você está offline." : "."}
          </p>

          <button
            className={styles.retryButton}
            onClick={()=>loadMissa(dataSelecionada)}
          >
            <RotateCcw size={16}/>
            Tentar novamente
          </button>

          <button
            className={styles.backButton}
            onClick={()=>navigate(-1)}
          >
            <ChevronLeft size={18}/>
            Voltar
          </button>

        </div>
      </div>
    )
  }

  if(!missa) return (
    <div className={styles.loading}>
      📖 Carregando liturgia...
    </div>
  )

  return(
    <>
    <div className={`${styles.container} page-enter`}>

      {/* BOTÃO VOLTAR */}
      <button className={styles.backButton} onClick={()=>navigate(-1)}>
        <ChevronLeft size={18}/>
        Voltar
      </button>

      {isOffline && (
        <div className={styles.offlineBanner}>
          Você está offline. Mostrando a última liturgia salva.
        </div>
      )}

      {/* HEADER */}
      <div className={styles.header}>

        <button
          className={styles.navButton}
          onClick={()=>changeDay(-1)}
        >
          <ChevronLeft size={22} />
        </button>

        <div className={styles.headerCenter}>

          <h2>{missa.liturgia}</h2>

          <div className={styles.headerInfo}>
            <Calendar size={14} />
            <span>{missa.data}</span>

            <span className={`${styles.badge} ${missa.tipo === "domingo" ? styles.badgeDomingo : styles.badgeFerial}`}>
              {missa.tipo === "domingo" ? "Dominical" : "Ferial"}
            </span>
          </div>

        </div>

        <button
          className={styles.navButton}
          onClick={()=>changeDay(1)}
        >
          <ChevronRight size={22} />
        </button>

      </div>

      {/* 🔥 AVISO */}
      {showAviso && (
        <div className={styles.aviso}>
          <p>
            Esta liturgia segue a estrutura padrão da Santa Missa da Igreja Católica.
            Em celebrações específicas, solenidades ou variações locais, podem ocorrer
            diferenças nos textos ou na ordem. Utilize este conteúdo como apoio para
            acompanhamento da Missa.
          </p>

          <button onClick={fecharAviso}>×</button>
        </div>
      )}

      {/* SEÇÕES */}
      {missa.secoes.map((secao:any, i:number)=>(
        <div key={i} className={styles.section}>

          <h3 className={styles.sectionTitle}>
            {secao.titulo}
          </h3>

          <div className={styles.sectionContent}>
            {renderConteudo(secao.conteudo, secao.titulo)}
          </div>

        </div>
      ))}

    <div className={styles.pageSpacer}></div>
    </div>

    <BottomNavbar/>
  </>
  )
}

/* ========================= */
/* RENDER */
/* ========================= */

const ORDEM_SECOES: Record<string, string[]> = {
  "Ritos Iniciais": [
    "entrada","sinalDaCruz","saudacao","atoPenitencial","gloria","coleta"
  ],
  "Liturgia da Palavra": [
    "primeiraLeitura","salmo","segundaLeitura","aclamacao","evangelho","credo"
  ],
  "Liturgia Eucarística": [
    "tituloOracaoEucaristica","ofertorio","convite","oracaoSobreOferendas","prefacio","santo","inicioOracaoEucaristica","epicleseAntesConsagracao","consagracao","misterioDaFe","posConsagracao","doxologia"
  ],
  "Ritos da Comunhão": [
    "convitePaiNosso","paiNosso","embolo","ritoDaPaz","cordeiro","convite","antifona","depois"
  ]
}

function formatVerses(text:string){

    let formatted = (text || "").replace(
      /(\d+)(?=[A-Za-zÀ-ÿ“])/g,
      '<span class="verse">$1</span>'
    )

    formatted = formatted.replace(
      /^([A-Za-zÀ-ÿ])/,
      '<span class="capitular">$1</span>'
    )

    return formatted
  }

function renderConteudo(conteudo:any, tituloSecao:string){

  const ordem: string[] = ORDEM_SECOES[tituloSecao] || Object.keys(conteudo)

  return ordem.map((key, i) => {
    const value = conteudo[key]
    if(value === null || value === undefined) return null

    // 🔥 EVANGELHO ESPECIAL
    if(key === "evangelho"){
      return renderEvangelho(value, i)
    }

    const isLeitura =
      key.toLowerCase().includes("leitura") ||
      key === "salmo"

    // Só essas 3 têm botão de compartilhar aqui — o evangelho tem o
    // dele próprio dentro de renderEvangelho()
    const shareLabel =
      key === "primeiraLeitura" ? "1ª Leitura" :
      key === "segundaLeitura" ? "2ª Leitura" :
      key === "salmo" ? "Salmo" :
      null

    return(
      <div
        key={i}
        className={
          isLeitura
            ? styles.blockLeitura
            : styles.block
        }
      >
        {![
            "inicioOracaoEucaristica",
            "epicleseAntesConsagracao",
            "consagracao",
            "misterioDaFe",
            "posConsagracao",
            "doxologia"
            ].includes(key) && (
            <h4 className={styles.blockTitle}>
                {formatTitulo(key)}
            </h4>
            )}

        {renderValor(value, isLeitura)}

        {shareLabel && (
          <ShareReadingButton
            label={shareLabel}
            buildText={() =>
              key === "salmo"
                ? buildSalmoShareText(value)
                : buildLeituraShareText(formatTitulo(key), value)
            }
          />
        )}
      </div>
    )
  })
}

function renderEvangelho(evangelho:any, keyIndex:number){
  return(
    <div key={keyIndex} className={styles.blockEvangelho}>

      <h4 className={styles.blockTitle}>Evangelho</h4>

      {evangelho.abertura?.map((item:any,i:number)=>(
        <p key={i} className={styles.text}>
          {item.padre && <span className={styles.padre}>Padre: </span>}
          {item.assembleia && <span className={styles.assembleia}>Assembleia: </span>}
          <span
              dangerouslySetInnerHTML={{
                __html: formatVerses(
                  item.padre || item.assembleia || ""
                )
              }}
            />
        </p>
      ))}

      <p className={styles.refrao}>
        {evangelho.referencia}
      </p>

      <p
        className={styles.text}
        dangerouslySetInnerHTML={{
          __html: formatVerses(evangelho.texto)
        }}
      />

      {evangelho.final?.map((item:any,i:number)=>(
        <p key={i} className={styles.text}>
          {item.padre && <span className={styles.padre}>Padre: </span>}
          {item.assembleia && <span className={styles.assembleia}>Assembleia: </span>}
          <span
              dangerouslySetInnerHTML={{
                __html: formatVerses(
                  item.padre || item.assembleia || ""
                )
              }}
            />
        </p>
      ))}

      <ShareReadingButton
        label="Evangelho"
        buildText={() => buildEvangelhoShareText(evangelho)}
      />

    </div>
  )
}

function renderValor(valor:any, isLeitura:boolean = false):any{

  if(typeof valor === "string"){
    return (
      <p
        className={styles.text}
        dangerouslySetInnerHTML={{
          __html: isLeitura ? formatVerses(valor) : valor
        }}
      />
    )
  }

  if(Array.isArray(valor)){
    return valor.map((item,i)=>{

      if(Array.isArray(item)){
        return item.map((subItem, j)=>(
          <p key={`${i}-${j}`} className={styles.text}>
            {subItem.padre && <span className={styles.padre}>Padre: </span>}
            {subItem.assembleia && <span className={styles.assembleia}>Assembleia: </span>}
            {subItem.todos && <span className={styles.todos}>Todos: </span>}

            <span
              dangerouslySetInnerHTML={{
                __html: isLeitura
                ? formatVerses(subItem.padre || subItem.assembleia || subItem.todos || "")
                : (subItem.padre || subItem.assembleia || subItem.todos || "")
              }}
            />
          </p>
        ))
      }

      return(
        <p key={i} className={styles.text}>
          {item.padre && <span className={styles.padre}>Padre: </span>}
          {item.assembleia && <span className={styles.assembleia}>Assembleia: </span>}
          {item.todos && <span className={styles.todos}>Todos: </span>}

          <span
            dangerouslySetInnerHTML={{
              __html: isLeitura
                ? formatVerses(item.padre || item.assembleia || item.todos || "")
                : (item.padre || item.assembleia || item.todos || "")
            }}
          />
        </p>
      )
    })
  }

  if(typeof valor === "object" && valor.refrao){
    return (
      <div>

        {valor.referencia && (
          <p className={styles.subTitle}>
            {valor.referencia}
          </p>
        )}

        <p className={styles.refrao}>
          ℟. {valor.refrao}
        </p>

        <p
          className={styles.text}
          dangerouslySetInnerHTML={{
            __html: isLeitura
              ? formatVerses(valor.texto)
              : valor.texto
          }}
        />

      </div>
    )
  }

  if(typeof valor === "object"){
    return Object.entries(valor).map(([k,v]:any,i)=>{

        if(v === null || v === undefined) return null // 🔥 ESSA LINHA

        return(
        <div key={i} className={styles.subBlock}>
            {!["abertura","final","texto","titulo","referencia"].includes(k) && (
            <h5 className={styles.subTitle}>{formatTitulo(k)}</h5>
            )}
            {renderValor(v, isLeitura)}
        </div>
        )
    })
    }

  return null
}

function formatTitulo(text:string){
  return text
    .replace(/([A-Z])/g," $1")
    .replace(/^./, str => str.toUpperCase())
    .replace("Pai Nosso", "Pai-Nosso")
    .replace("Rito Da Paz", "Rito da Paz")
    .replace("Pos Consagracao", "Pós-consagração")
    .replace("Antifona", "Antífona")
    .replace("Bencao", "Bênção")
    .replace("Convite Pai Nosso", "Convite ao Pai-Nosso")
    .replace("Anamnese_oblacao", "Anamnese e Oblação")
    .replace("Epiclese", "Epíclese")
    .replace("Intercessoes", "Intercessões")
    .replace("Titulo", "Título")
    .replace("Referencia", "Referência")
    .replace("Misterio Da Fe", "Mistério da fé")
    .replace("Ofertorio", "Ofertório")
    .replace("Prefacio", "Prefácio")
    .replace("Consagracao", "Consagração")
    .replace("Saudacao", "Saudação")
    .replace("Embolo", "Êmbolo")
    .replace("Cordeiro", "Cordeiro de Deus")
}