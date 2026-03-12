import styles from "./Home.module.css"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"
import { LogOut, User } from "lucide-react"
import { isPWA } from "../../utils/isPwa"

export default function Home(){

 const navigate = useNavigate()

 const [liturgy,setLiturgy] = useState<any>(null)
 const [modal,setModal] = useState<any>(null)

 const today = new Date().toLocaleDateString("pt-BR")

 useEffect(()=>{
  loadSavedLiturgy()
  loadLiturgy()
 },[])

 function loadSavedLiturgy(){

  const saved = localStorage.getItem("last_liturgy")

  if(!saved) return

  try{

   const parsed = JSON.parse(saved)

   if(parsed.date === today){
    setLiturgy(parsed.data)
   }

  }catch{
   console.log("Erro ao ler liturgia salva")
  }

 }

 function handleLogout(){

  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")

  navigate("/login")

 }

 async function loadLiturgy(){

  try{

   const res = await fetch("https://finance-api-y0ol.onrender.com/liturgia")

   const data = await res.json()

   setLiturgy(data)

   localStorage.setItem("last_liturgy", JSON.stringify({
    date: today,
    data
   }))

  }catch{

   console.log("Erro ao carregar liturgia")

  }

 }

 function openModal(type:string){

  if(!liturgy) return

  if(type==="primeira"){
   setModal(liturgy.leituras.primeiraLeitura[0])
  }

  if(type==="segunda"){

   if(liturgy.leituras.segundaLeitura.length===0){

    setModal({
     titulo:"Segunda Leitura",
     referencia:"",
     texto:"Hoje não possui segunda leitura."
    })

   }else{

    setModal(liturgy.leituras.segundaLeitura[0])

   }

  }

  if(type==="salmo"){
   setModal(liturgy.leituras.salmo[0])
  }

  if(type==="evangelho"){
   setModal(liturgy.leituras.evangelho[0])
  }

 }

 function formatVerses(text:string){

  let formatted = text.replace(
   /(\d+)(?=[A-Za-z“])/g,
   '<span class="verse">$1</span>'
  )

  formatted = formatted.replace(
   /^([A-Za-zÀ-ÿ])/,
   '<span class="capitular">$1</span>'
  )

  return formatted

 }

 return(

  <div className={styles.container}>

   {!isPWA() && (

    <div className={styles.topButtons}>

     <button
      className={styles.profileButton}
      onClick={()=>navigate("/oratio/profile")}
     >
      <User size={18}/>
     </button>

     <button
      className={styles.logoutButton}
      onClick={handleLogout}
     >
      <LogOut size={18}/>
     </button>

    </div>

   )}

   <section className={styles.hero}>

    <div className={styles.logoWrapper}>

     <span className={styles.logoLeft}>
      ORA
     </span>

     <div className={styles.cross}></div>

     <span className={styles.logoRight}>
      IO
     </span>

    </div>

    <p className={styles.subtitle}>
     Aplicativo de espiritualidade católica
    </p>

   </section>


   <section className={styles.liturgyCard}>

    <h2>
     Liturgia {today}
    </h2>

    {!liturgy && (
     <p>Carregando liturgia...</p>
    )}

    {liturgy && (

     <div className={styles.liturgyButtons}>

      <button onClick={()=>openModal("primeira")}>
       Primeira Leitura
      </button>

      <button onClick={()=>openModal("salmo")}>
       Salmo
      </button>

      <button onClick={()=>openModal("segunda")}>
       Segunda Leitura
      </button>

      <button onClick={()=>openModal("evangelho")}>
       Evangelho
      </button>

     </div>

    )}

   </section>


<div className={styles.featuresRow}>

   <section className={styles.consecration}>

    <h2>Consagração à Nossa Senhora</h2>

    <p>
     Um caminho espiritual de 33 dias segundo
     o método de São Luís Maria Grignion de
     Montfort.
    </p>

    <button
     className={styles.primaryButton}
     onClick={()=>navigate("/oratio/consecration")}
    >
     Iniciar Consagração
    </button>

   </section>

    <section className={styles.consecration}>

    <h2>Orações</h2>

    <p>
    Reze as principais orações da tradição
    católica.
    </p>

    <button
    className={styles.primaryButton}
    onClick={()=>navigate("/oratio/prayers")}
    >
    Abrir Orações
    </button>

    </section>

   <section className={styles.consecration}>

    <h2>Bíblia Sagrada</h2>

    <p>
     Leia a Palavra de Deus completa
     na tradução Ave-Maria.
    </p>

    <button
     className={styles.primaryButton}
     onClick={()=>navigate("/oratio/biblia")}
    >
     Abrir Bíblia
    </button>

   </section>


   <section className={styles.consecration}>

    <h2>VoxAI - Inteligência Artificial Católica</h2>

    <p>
    Assistente espiritual católico. Tire dúvidas
    sobre fé, moral, liturgia e vida cristã.
    </p>

    <button
    className={styles.primaryButton}
    onClick={()=>navigate("/oratio/vox")}
    >
    Perguntar ao VoxAI
    </button>

   </section>

</div>


   {modal && (

    <div
     className={styles.modalOverlay}
     onClick={()=>setModal(null)}
    >

     <div
      className={styles.modal}
      onClick={(e)=>e.stopPropagation()}
     >

      {/* SPACE TOPO */}
      <div className={styles.modalTopSpacer}></div>

      <h2 className={styles.modalTitle}>
       {modal.titulo || modal.referencia}
      </h2>

      <p className={styles.modalReference}>
       {modal.referencia}
      </p>

      {modal.refrao && (
       <p className={styles.modalRefrao}>
        {modal.refrao}
       </p>
      )}

      <div
       className={styles.modalText}
       dangerouslySetInnerHTML={{
        __html: formatVerses(modal.texto)
       }}
      />

      {/* SPACE FINAL */}
      <div className={styles.modalBottomSpacer}></div>

      <button
       className={styles.closeButton}
       onClick={()=>setModal(null)}
      >
       Fechar
      </button>

     </div>

    </div>

   )}

   <div className={styles.pageSpacer}></div>

   <BottomNavbar/>

  </div>

 )

}