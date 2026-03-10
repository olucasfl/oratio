import styles from "./Home.module.css"
import { useNavigate } from "react-router-dom"

export default function Home(){

 const navigate = useNavigate()

 return(

  <div className={styles.container}>

   <header className={styles.header}>
    <h1>ORATIO</h1>
    <p>Aplicativo de espiritualidade católica</p>
   </header>

   <section className={styles.intro}>

    <h2>Bem-vindo ao Oratio 🙏</h2>

    <p>
     O Oratio foi criado para ajudar na caminhada espiritual diária,
     oferecendo orações tradicionais da Igreja e guias de devoção.
    </p>

    <p>
     Aqui você poderá realizar a tradicional
     <strong> Consagração a Nossa Senhora </strong>
     segundo o método de
     <strong> São Luís Maria Grignion de Montfort </strong>.
    </p>

   </section>

   <section className={styles.consagracao}>

    <h3>Consagração a Nossa Senhora</h3>

    <p>
     Um caminho espiritual de 33 dias de preparação
     para se entregar totalmente a Jesus Cristo
     pelas mãos de Maria.
    </p>

    <button
     className={styles.button}
     onClick={()=>navigate("/oratio/consecration")}
    >
     Iniciar Consagração
    </button>

   </section>

  </div>

 )

}