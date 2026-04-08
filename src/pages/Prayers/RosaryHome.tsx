import styles from "./RosaryHome.module.css"
import { useNavigate } from "react-router-dom"
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"
import { ROSARY_DAYS } from "../../utils/rosaryDays"

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
 { name:"Mistérios Luminosos", slug:"luminosos" },

 { name:"Terço das 7 Dores de Maria", slug:"sete-dores" },
 { name:"Terço da Divina Misericórdia", slug:"misericordia" },
 { name:"Terço do Sagrado Coração de Jesus", slug:"sagrado-coracao" },
 { name:"Terço de São José", slug:"sao-jose" }

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
        <div className={styles.cardContent}>
            <span className={styles.title}>{r.name}</span>

            {ROSARY_DAYS[r.slug] && (
                <span className={styles.days}>
                {ROSARY_DAYS[r.slug]}
                </span>
            )}
            </div>
    </div>
    ))}

    </div>

   </div>

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )
}