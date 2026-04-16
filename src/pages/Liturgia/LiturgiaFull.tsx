import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./LiturgiaFull.module.css"

export default function LiturgiaFull(){

  const [missa, setMissa] = useState<any>(null)
  const [dataSelecionada, setDataSelecionada] = useState(new Date())
  const [showAviso, setShowAviso] = useState(true)

  const API = import.meta.env.VITE_API_URL
  const navigate = useNavigate()

  useEffect(() => {
    loadMissa(dataSelecionada)
  }, [dataSelecionada])

  async function loadMissa(date: Date){
    const dia = String(date.getDate()).padStart(2,"0")
    const mes = String(date.getMonth()+1).padStart(2,"0")
    const ano = date.getFullYear()

    const res = await fetch(
      `${API}/liturgia/full?dia=${dia}&mes=${mes}&ano=${ano}`
    )

    const data = await res.json()
    setMissa(data)
  }

  function changeDay(offset:number){
    const newDate = new Date(dataSelecionada)
    newDate.setDate(newDate.getDate() + offset)
    setDataSelecionada(newDate)
  }

  function fecharAviso(){
    setShowAviso(false)
    }

  if(!missa) return (
    <div className={styles.loading}>
      📖 Carregando liturgia...
    </div>
  )

  return(
    <div className={styles.container}>

      {/* BOTÃO VOLTAR */}
      <button className={styles.backButton} onClick={()=>navigate(-1)}>
        ← Voltar
      </button>

      {/* HEADER */}
      <div className={styles.header}>
        <button onClick={()=>changeDay(-1)}>◀</button>

        <div>
          <h2>{missa.liturgia}</h2>
          <span>
            {missa.data} • {missa.tipo === "domingo" ? "Domingo" : "Semana"}
          </span>
        </div>

        <button onClick={()=>changeDay(1)}>▶</button>
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
            {renderConteudo(secao.conteudo)}
          </div>

        </div>
      ))}

    </div>
  )
}

/* ========================= */
/* RENDER */
/* ========================= */

function renderConteudo(conteudo:any){

  return Object.entries(conteudo).map(([key,value]:any,i)=>{

    if(!value) return null

    const isLeitura =
      key.toLowerCase().includes("leitura") ||
      key === "evangelho" ||
      key === "salmo"

    const isEvangelho = key === "evangelho"

    return(
      <div
        key={i}
        className={
          isEvangelho
            ? styles.blockEvangelho
            : isLeitura
            ? styles.blockLeitura
            : styles.block
        }
      >
        <h4 className={styles.blockTitle}>
          {formatTitulo(key)}
        </h4>

        {renderValor(value)}
      </div>
    )
  })
}

function renderValor(valor:any):any{

  if(typeof valor === "string"){
    return (
      <p className={styles.text} style={{ whiteSpace: "pre-line" }}>
        {valor}
      </p>
    )
  }

  if(Array.isArray(valor)){
    return valor.map((item,i)=>(
      <p key={i} className={styles.text}>
        {item.padre && <span className={styles.padre}>Padre:</span>}
        {item.assembleia && <span className={styles.assembleia}>Assembleia:</span>}
        {item.todos && <span className={styles.todos}>Todos:</span>}
        {item.padre || item.assembleia || item.todos}
      </p>
    ))
  }

  if(typeof valor === "object" && valor.refrao){
    return (
      <div>
        <p className={styles.refrao}>
          ℟. {valor.refrao}
        </p>

        <p className={styles.text} style={{ whiteSpace:"pre-line" }}>
          {valor.texto}
        </p>
      </div>
    )
  }

  if(typeof valor === "object"){
    return Object.entries(valor).map(([k,v]:any,i)=>(
      <div key={i} className={styles.subBlock}>
        <h5 className={styles.subTitle}>{formatTitulo(k)}</h5>
        {renderValor(v)}
      </div>
    ))
  }

  return null
}

function formatTitulo(text:string){
  return text
    .replace(/([A-Z])/g," $1")
    .replace(/^./, str => str.toUpperCase())
}