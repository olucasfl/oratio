import { useParams, useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { getChapter } from "../../services/bibliaService"
import styles from "./BibliaChapter.module.css"

export default function BibliaChapter(){

 const { book, chapter } = useParams()
 const navigate = useNavigate()

 const capitulo = getChapter(book!, Number(chapter))

 const [search,setSearch] = useState("")

 const verseRefs = useRef<Record<number, HTMLParagraphElement | null>>({})

    useEffect(()=>{
    window.scrollTo({
    top:0,
    behavior:"instant"
    })
    },[])

 function goToVerse(){

  if(!search) return

  const verseNumber = Number(search)

  if(isNaN(verseNumber)) return

  const element = verseRefs.current[verseNumber]

  if(!element) return

  element.scrollIntoView({
   behavior:"smooth",
   block:"center"
  })

  element.classList.add(styles.highlight)

  setTimeout(()=>{
   element.classList.remove(styles.highlight)
  },2000)

 }

 if(!capitulo) return <p>Capítulo não encontrado</p>

 return(

  <div className={styles.container}>

   <button
    className={styles.backButton}
    onClick={()=>navigate(-1)}
   >
    ← Voltar
   </button>

   <h1 className={styles.title}>
    {book} {chapter}
   </h1>


   {/* BUSCA DE VERSÍCULO */}

   <div className={styles.searchBox}>

    <input
     type="text"
     inputMode="numeric"
     placeholder="Ir para versículo..."
     value={search}
     onChange={(e)=>setSearch(e.target.value)}
     className={styles.searchInput}
    />

    <button
     className={styles.searchButton}
     onClick={goToVerse}
    >
     Ir
    </button>

   </div>


   <div className={styles.textCard}>

    {capitulo.versiculos.map((v:any,index:number)=>{

     if(index===0){

      return(

       <p
        key={v.versiculo}
        ref={(el)=>{
         verseRefs.current[v.versiculo] = el
        }}
        className={styles.verse}
       >

        <span className={styles.capitular}>
         {v.texto.charAt(0)}
        </span>

        {v.texto.slice(1)}

       </p>

      )

     }

     return(

      <p
       key={v.versiculo}
       ref={(el)=>{
        verseRefs.current[v.versiculo] = el
       }}
       className={styles.verse}
      >

       <span className={styles.number}>
        {v.versiculo}
       </span>

       {v.texto}

      </p>

     )

    })}

   </div>

  </div>

 )
}