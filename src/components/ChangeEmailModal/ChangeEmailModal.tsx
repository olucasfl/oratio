import { useState } from "react"

import { requestEmailChange } from "../../services/profileService"
import { getAuthErrorMessage } from "../../utils/authErrors"

import styles from "./ChangeEmailModal.module.css"

interface Props{
 open:boolean
 onClose:()=>void
 onRequested:(pendingEmail:string)=>void
}

export default function ChangeEmailModal({ open, onClose, onRequested }:Props){

 const [email,setEmail] = useState("")
 const [loading,setLoading] = useState(false)
 const [error,setError] = useState<string | null>(null)

 if(!open) return null

 function handleClose(){
  setEmail("")
  setError(null)
  onClose()
 }

 async function handleSubmit(){

  setError(null)

  if(!email){
   setError("Digite o novo email.")
   return
  }

  setLoading(true)

  try{

   const data = await requestEmailChange(email)
   onRequested(data.pendingEmail)
   setEmail("")

  }catch(err:any){

   setError(getAuthErrorMessage(err, "Não foi possível iniciar a troca de email. Tente novamente."))

  }finally{

   setLoading(false)

  }

 }

 return(

  <div className={styles.overlay}>

   <div className={styles.modal}>

    <h2>Trocar email</h2>

    <p className={styles.hint}>
     Enviaremos um link de confirmação para o novo email.
     Sua conta continua com o email atual até você confirmar.
    </p>

    {error && <p className={styles.errorText}>{error}</p>}

    <input
     className={styles.input}
     type="email"
     placeholder="Novo email"
     value={email}
     onChange={(e)=>setEmail(e.target.value)}
    />

    <button
     className={styles.buttonPrimary}
     onClick={handleSubmit}
     disabled={loading}
    >
     {loading ? "Enviando..." : "Enviar confirmação"}
    </button>

    <button className={styles.buttonSecondary} onClick={handleClose}>
     Cancelar
    </button>

   </div>

  </div>

 )

}
