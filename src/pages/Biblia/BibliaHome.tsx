import styles from "./BibliaHome.module.css"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

import { getOldTestament,getNewTestament } from "../../services/bibliaService"
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

export default function BibliaHome(){

 const navigate = useNavigate()

 const antigo = getOldTestament()
 const novo = getNewTestament()

 const [search,setSearch] = useState("")

 useEffect(()=>{
  window.scrollTo({
   top:0,
   behavior:"instant"
  })
 },[])

 function removeAccents(text:string){

  return text
   .normalize("NFD")
   .replace(/[\u0300-\u036f]/g,"")
   .toLowerCase()

 }

 function filterBooks(books:any[]){

  const searchNormalized = removeAccents(search)

  return books.filter((book:any)=>{

   const bookName = removeAccents(book.nome)

   return bookName.includes(searchNormalized)

  })

 }

 const antigoFiltrado = filterBooks(antigo)
 const novoFiltrado = filterBooks(novo)

 return(

  <div className={styles.container}>


   {/* BOTÃO VOLTAR */}

   <button
    className={styles.backButton}
    onClick={()=>navigate(-1)}
   >
    ← Voltar
   </button>


   <h1 className={styles.title}>
    Bíblia Sagrada
   </h1>


   {/* BUSCA */}

   <div className={styles.searchBox}>

    <input
     type="search"
     placeholder="Pesquisar livro..."
     value={search}
     onChange={(e)=>setSearch(e.target.value)}
     className={styles.searchInput}
    />

   </div>


   {antigoFiltrado.length > 0 && (

    <div className={styles.card}>

     <h2 className={styles.sectionTitle}>
      Antigo Testamento
     </h2>

     <div className={styles.booksGrid}>

      {antigoFiltrado.map((book:any)=>(
       <button
        key={book.nome}
        className={styles.bookButton}
        onClick={()=>navigate(`/oratio/biblia/${book.nome}`)}
       >
        {book.nome}
       </button>
      ))}

     </div>

    </div>

   )}


   {novoFiltrado.length > 0 && (

    <div className={styles.card}>

     <h2 className={styles.sectionTitle}>
      Novo Testamento
     </h2>

     <div className={styles.booksGrid}>

      {novoFiltrado.map((book:any)=>(
       <button
        key={book.nome}
        className={styles.bookButton}
        onClick={()=>navigate(`/oratio/biblia/${book.nome}`)}
       >
        {book.nome}
       </button>
      ))}

     </div>

    </div>

   )}

   <div className={styles.pageSpacer}></div>
   <BottomNavbar/> 
   
  </div>

 )
}