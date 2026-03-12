import { useEffect,useState } from "react"
import { useNavigate } from "react-router-dom"

import styles from "./PrayersCategories.module.css"

import { getPrayerCategories } from "../../services/prayersService"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

export default function PrayersCategories(){

 const navigate = useNavigate()

 const [categories,setCategories] = useState<any[]>([])
 const [loading,setLoading] = useState(true)

 useEffect(()=>{
  load()
 },[])

 async function load(){

  try{

   const data = await getPrayerCategories()

   setCategories(data)

  }catch{

   console.log("Erro ao carregar categorias")

  }finally{

   setLoading(false)

  }

 }

 if(loading){

  return(

   <div className={styles.loading}>

    <p>Carregando categorias...</p>

    <button
     className={styles.back}
     onClick={()=>navigate(-1)}
    >
     ← Voltar
    </button>

   </div>

  )

 }

 return(

  <div className={styles.page}>

   <div className={styles.container}>

    <button
     className={styles.back}
     onClick={()=>navigate(-1)}
    >
     ← Voltar
    </button>

    <h1>Categorias</h1>

    <div className={styles.categories}>

     {categories.length === 0 && (

      <p className={styles.empty}>
       Nenhuma categoria disponível.
      </p>

     )}

     {categories.map(cat=>(

        <div
        key={cat.id}
        className={styles.card}
        onClick={()=>{

        if(cat.slug === "tercos"){

            navigate("/oratio/rosary")

        }else{

            navigate(`/oratio/prayers/${cat.slug}`)

        }

        }}
        >

        {cat.name}

        </div>

        ))}

    </div>

   </div>

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )

}