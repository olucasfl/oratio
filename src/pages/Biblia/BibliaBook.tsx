import styles from "./BibliaBook.module.css"
import { useParams,useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

import { getBook } from "../../services/bibliaService"

export default function BibliaBook(){

 const { book } = useParams()

 const navigate = useNavigate()

 const livro = getBook(book!)

 const [search,setSearch] = useState("")

    useEffect(()=>{
    window.scrollTo({
    top:0,
    behavior:"instant"
    })
    },[])

 if(!livro) return <p>Livro não encontrado</p>

 const capitulosFiltrados = livro.capitulos.filter((cap:any)=>{

  if(!search) return true

  return cap.capitulo
   .toString()
   .includes(search)

 })

 return(

  <div className={styles.container}>

   <button
    className={styles.backButton}
    onClick={()=>navigate(-1)}
   >
    ← Voltar
   </button>

   <h1 className={styles.title}>
    {livro.nome}
   </h1>

   <p className={styles.subtitle}>
    Selecione um capítulo
   </p>


   {/* BUSCA */}

   <div className={styles.searchBox}>

    <input
    type="number"
    placeholder="Pesquisar capítulo..."
    value={search}
    onChange={(e)=>setSearch(e.target.value)}
    onWheel={(e)=>e.currentTarget.blur()}
    className={styles.searchInput}
    />

   </div>


   <div className={styles.card}>

    <div className={styles.chapterGrid}>

     {capitulosFiltrados.map((cap:any)=>(
      <button
       key={cap.capitulo}
       className={styles.chapterButton}
       onClick={()=>navigate(`/oratio/biblia/${book}/${cap.capitulo}`)}
      >
       Capítulo {cap.capitulo}
      </button>
     ))}

    </div>

   </div>

  </div>

 )
}