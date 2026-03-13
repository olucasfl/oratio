import styles from "./RosaryHome.module.css"
import { useNavigate } from "react-router-dom"
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

/* =========================
TIPAGEM
========================= */

type Rosary = {
 name: string
 slug: string
}

/* =========================
DADOS
========================= */

const ROSARIES: Rosary[] = [

 { name:"Mistérios Gozosos", slug:"gozosos" },
 { name:"Mistérios Dolorosos", slug:"dolorosos" },
 { name:"Mistérios Gloriosos", slug:"gloriosos" },
 { name:"Mistérios Luminosos", slug:"luminosos" }

]

export default function RosaryHome(){

 const navigate = useNavigate()

 function goToRosary(slug:string){

  navigate(`/oratio/rosary/${slug}`)

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

    <h1>Terços</h1>

    <p className={styles.subtitle}>
     Escolha um conjunto de mistérios
    </p>

    <div className={styles.list}>

     {ROSARIES.map((r)=>(
      <div
       key={r.slug}
       className={styles.card}
       onClick={()=>goToRosary(r.slug)}
      >
       {r.name}
      </div>
     ))}

    </div>

   </div>

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )
}