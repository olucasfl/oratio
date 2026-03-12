import styles from "./Home.module.css"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

import { logout } from "../../services/authService"
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar"

export default function Home(){

 const navigate = useNavigate()

 const [liturgy,setLiturgy] = useState<any>(null)
 const [modal,setModal] = useState<any>(null)

 const today = new Date().toLocaleDateString("pt-BR")

 useEffect(()=>{

  loadSavedLiturgy()
  loadLiturgy()

 },[])

 /*
 ============================
 CARREGAR LITURGIA SALVA
 ============================
 */

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

 /*
 ============================
 BUSCAR LITURGIA NA API
 ============================
 */

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


   {/* FEATURES */}

<div className={styles.featuresRow}>


   {/* BÍBLIA */}
   <section className={styles.consecration}>

    <h2>
     Bíblia Sagrada
    </h2>

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


   {/* VOX AI */}
   <section className={styles.consecration}>

    <h2>
    VoxAI - Inteligência Artificial Católica
    </h2>

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

   {/* CONSAGRAÇÃO */}
   <section className={styles.consecration}>
    <h2>
     Consagração à Nossa Senhora
    </h2>

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

      <button
       className={styles.closeButton}
       onClick={()=>setModal(null)}
      >
       Fechar
      </button>

     </div>

    </div>

   )}

   <BottomNavbar/>
  </div>

 )

}