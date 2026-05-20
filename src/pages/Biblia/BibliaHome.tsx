import styles from "./BibliaHome.module.css"
import { useNavigate } from "react-router-dom"
import { useEffect,useState } from "react"

import {
 getOldTestament,
 getNewTestament
} from "../../services/bibliaService"

import BottomNavbar
from "../../components/BottomNavbar/BottomNavbar"

import {
 Search,
 ChevronRight,
 BookOpen,
 Cross
} from "lucide-react"

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

  const normalizedSearch =
   removeAccents(search)

  return books.filter((book:any)=>{

   const normalizedName =
    removeAccents(book.nome)

   return normalizedName.includes(normalizedSearch)

  })

 }

 const antigoFiltrado =
  filterBooks(antigo)

 const novoFiltrado =
  filterBooks(novo)

 const totalBooks =
  antigo.length + novo.length

 return(

  <div className={styles.container}>

   <div className={styles.glow}></div>

   {/* VOLTAR */}

   <button
    className={styles.backButton}
    onClick={()=>navigate(-1)}
   >
    ← Voltar
   </button>

   {/* HERO */}

   <div className={styles.hero}>

    <div className={styles.heroIcon}>
      <BookOpen size={38}/>
    </div>

    <span className={styles.badge}>
      Palavra de Deus
    </span>

    <h1 className={styles.title}>
      Bíblia Sagrada
    </h1>

    <p className={styles.subtitle}>
      Leia, medite e aproxime-se diariamente
      da Palavra de Cristo.
    </p>

    <div className={styles.stats}>
      <span>{totalBooks} livros</span>
      <span>Antigo e Novo Testamento</span>
    </div>

   </div>

   {/* SEARCH */}

   <div className={styles.searchWrapper}>

    <Search
      size={18}
      className={styles.searchIcon}
    />

    <input
      type="search"
      placeholder="Pesquisar livro..."
      value={search}
      onChange={(e)=>setSearch(e.target.value)}
      className={styles.searchInput}
    />

   </div>

   {/* ANTIGO TESTAMENTO */}

   {antigoFiltrado.length > 0 && (

    <section className={styles.section}>

      <div className={styles.sectionHeader}>

        <div className={styles.sectionIcon}>
          <Cross size={18}/>
        </div>

        <div>
          <h2>Antigo Testamento</h2>
          <span>
            {antigoFiltrado.length} livros
          </span>
        </div>

      </div>

      <div className={styles.booksGrid}>

        {antigoFiltrado.map((book:any)=>(

          <button
            key={book.nome}
            className={styles.bookCard}
            onClick={()=>
              navigate(`/oratio/biblia/${book.nome}`)
            }
          >

            <div className={styles.bookLeft}>

              <div className={styles.bookIcon}>
                <BookOpen size={16}/>
              </div>

              <span>{book.nome}</span>

            </div>

            <ChevronRight size={18}/>

          </button>

        ))}

      </div>

    </section>

   )}

   {/* NOVO TESTAMENTO */}

   {novoFiltrado.length > 0 && (

    <section className={styles.section}>

      <div className={styles.sectionHeader}>

        <div className={styles.sectionIcon}>
          <BookOpen size={18}/>
        </div>

        <div>
          <h2>Novo Testamento</h2>
          <span>
            {novoFiltrado.length} livros
          </span>
        </div>

      </div>

      <div className={styles.booksGrid}>

        {novoFiltrado.map((book:any)=>(

          <button
            key={book.nome}
            className={styles.bookCard}
            onClick={()=>
              navigate(`/oratio/biblia/${book.nome}`)
            }
          >

            <div className={styles.bookLeft}>

              <div className={styles.bookIcon}>
                <BookOpen size={16}/>
              </div>

              <span>{book.nome}</span>

            </div>

            <ChevronRight size={18}/>

          </button>

        ))}

      </div>

    </section>

   )}

   {antigoFiltrado.length === 0 &&
    novoFiltrado.length === 0 && (

    <div className={styles.empty}>

      <BookOpen size={40}/>

      <h3>Nenhum livro encontrado</h3>

      <p>
        Tente pesquisar com outro nome.
      </p>

    </div>

   )}

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )

}