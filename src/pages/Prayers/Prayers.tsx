import { useEffect,useState } from "react"
import { useNavigate,useParams } from "react-router-dom"

import styles from "./Prayers.module.css"

import {
 getPrayer,
 completePrayer
} from "../../services/prayersService"

import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

export default function Prayers(){

 const { id } = useParams()

 const navigate = useNavigate()

 const [prayer,setPrayer] = useState<any>(null)
 const [loading,setLoading] = useState(true)

 useEffect(()=>{
  load()
 },[id])

 async function load(){

  if(!id) return

  try{

   const data = await getPrayer(id)

   setPrayer(data)

  }catch{

   console.log("Erro ao carregar oração")

  }finally{

   setLoading(false)

  }

 }

 async function handleComplete(){

  try{

   await completePrayer()

   alert("Oração registrada 🙏")

   navigate(-1)

  }catch{

   console.log("Erro ao registrar oração")

  }

 }

 if(loading){

  return(

   <div className={styles.loading}>

    <p>Carregando oração...</p>

    <button
     className={styles.back}
     onClick={()=>navigate(-1)}
    >
     ← Voltar
    </button>

   </div>

  )

 }

 if(!prayer){

  return(

   <div className={styles.loading}>
    Oração não encontrada
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

    <h1>{prayer.title}</h1>

    <div className={styles.prayer}>

     <pre className={styles.text}>
      {prayer.content}
     </pre>

    </div>

    <button
     className={styles.complete}
     onClick={handleComplete}
    >

     Concluir oração

    </button>

   </div>

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )

}