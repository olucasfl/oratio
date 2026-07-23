import { useState } from "react"
import { useNavigate } from "react-router-dom"

import styles from "./AccountSettings.module.css"

import ChangePasswordModal from "../../components/ChangePasswordModal/ChangePasswordModal"
import ChangeEmailModal from "../../components/ChangeEmailModal/ChangeEmailModal"

import {
 ChevronLeft,
 KeyRound,
 Mail
} from "lucide-react"

export default function AccountSettings(){

 const navigate = useNavigate()

 const [changePasswordOpen,setChangePasswordOpen] = useState(false)
 const [changeEmailOpen,setChangeEmailOpen] = useState(false)
 const [emailRequestedMsg,setEmailRequestedMsg] = useState<string | null>(null)

 function handleEmailRequested(pendingEmail:string){

  setChangeEmailOpen(false)
  setEmailRequestedMsg(
   `Enviamos um link de confirmação para ${pendingEmail}.`
  )

 }

 return(

  <div className={`${styles.page} page-enter`}>

   <header className={styles.header}>

    <button
     className={styles.backButton}
     onClick={()=>navigate(-1)}
    >

     <ChevronLeft size={22}/>

    </button>

    <h1>Configurações da conta</h1>

   </header>

   <div className={styles.container}>

    {/* SEGURANÇA */}

    <div className={styles.card}>

     <div className={styles.cardTitle}>

      <KeyRound size={18}/>

      <h3>Segurança</h3>

     </div>

     {emailRequestedMsg && (

      <div className={styles.infoBanner}>
       {emailRequestedMsg}
      </div>

     )}

     <div className={styles.actionList}>

      <button
       className={styles.actionButton}
       onClick={()=>setChangePasswordOpen(true)}
      >
       <KeyRound size={16}/> Trocar senha
      </button>

      <button
       className={styles.actionButton}
       onClick={()=>setChangeEmailOpen(true)}
      >
       <Mail size={16}/> Trocar email
      </button>

     </div>

    </div>

   </div>

   <ChangePasswordModal
    open={changePasswordOpen}
    onClose={()=>setChangePasswordOpen(false)}
   />

   <ChangeEmailModal
    open={changeEmailOpen}
    onClose={()=>setChangeEmailOpen(false)}
    onRequested={handleEmailRequested}
   />

  </div>

 )

}
