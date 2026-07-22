import { useState } from "react"
import { createPortal } from "react-dom"

import { changePassword } from "../../services/profileService"
import { getAuthErrorMessage } from "../../utils/authErrors"

import styles from "./ChangePasswordModal.module.css"

interface Props{
 open:boolean
 onClose:()=>void
}

export default function ChangePasswordModal({ open, onClose }:Props){

 const [currentPassword,setCurrentPassword] = useState("")
 const [newPassword,setNewPassword] = useState("")
 const [confirmPassword,setConfirmPassword] = useState("")
 const [loading,setLoading] = useState(false)
 const [error,setError] = useState<string | null>(null)
 const [success,setSuccess] = useState(false)

 if(!open) return null

 function reset(){
  setCurrentPassword("")
  setNewPassword("")
  setConfirmPassword("")
  setError(null)
  setSuccess(false)
 }

 function handleClose(){
  reset()
  onClose()
 }

 async function handleSubmit(){

  setError(null)

  if(!currentPassword || !newPassword || !confirmPassword){
   setError("Preencha todos os campos.")
   return
  }

  if(newPassword !== confirmPassword){
   setError("As senhas novas não coincidem.")
   return
  }

  if(newPassword.length < 8 || !/(?=.*[A-Za-z])(?=.*\d)/.test(newPassword)){
   setError("A nova senha deve ter pelo menos 8 caracteres, com letra e número.")
   return
  }

  setLoading(true)

  try{

   await changePassword(currentPassword, newPassword)
   setSuccess(true)

  }catch(err:any){

   setError(getAuthErrorMessage(err, "Não foi possível trocar sua senha. Tente novamente."))

  }finally{

   setLoading(false)

  }

 }

 return createPortal(

  <div className={styles.overlay}>

   <div className={styles.modal}>

    {success ? (

     <>
      <h2>Senha alterada!</h2>
      <p className={styles.successText}>
       Sua senha foi atualizada com sucesso.
      </p>
      <button className={styles.buttonPrimary} onClick={handleClose}>
       Fechar
      </button>
     </>

    ) : (

     <>
      <h2>Trocar senha</h2>

      {error && <p className={styles.errorText}>{error}</p>}

      <input
       className={styles.input}
       type="password"
       placeholder="Senha atual"
       value={currentPassword}
       onChange={(e)=>setCurrentPassword(e.target.value)}
      />

      <input
       className={styles.input}
       type="password"
       placeholder="Nova senha"
       value={newPassword}
       onChange={(e)=>setNewPassword(e.target.value)}
      />

      <input
       className={styles.input}
       type="password"
       placeholder="Confirmar nova senha"
       value={confirmPassword}
       onChange={(e)=>setConfirmPassword(e.target.value)}
      />

      <button
       className={styles.buttonPrimary}
       onClick={handleSubmit}
       disabled={loading}
      >
       {loading ? "Salvando..." : "Salvar nova senha"}
      </button>

      <button className={styles.buttonSecondary} onClick={handleClose}>
       Cancelar
      </button>
     </>

    )}

   </div>

  </div>,

  document.body

 )

}
