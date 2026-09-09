import { useState } from "react"
import { createPortal } from "react-dom"

import { setPassword } from "../../services/profileService"
import { getAuthErrorMessage } from "../../utils/authErrors"

import styles from "./SetPasswordModal.module.css"

interface Props{
 open:boolean
 onClose:()=>void
 /* Chamado após o sucesso, pra o pai recarregar o perfil (hasPassword vira true). */
 onDefined?:()=>void
}

/*
 Define a PRIMEIRA senha de uma conta que entrou só por Google. É o
 `ChangePasswordModal` sem o campo "senha atual" — não existe senha antiga
 pra conferir. O backend não revoga sessões neste fluxo (nada foi
 invalidado), então também não avisamos sobre "sair de todos os aparelhos".
*/
export default function SetPasswordModal({ open, onClose, onDefined }:Props){

 const [newPassword,setNewPassword] = useState("")
 const [confirmPassword,setConfirmPassword] = useState("")
 const [loading,setLoading] = useState(false)
 const [error,setError] = useState<string | null>(null)
 const [success,setSuccess] = useState(false)

 if(!open) return null

 function reset(){
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

  if(!newPassword || !confirmPassword){
   setError("Preencha os dois campos.")
   return
  }

  if(newPassword !== confirmPassword){
   setError("As senhas não coincidem.")
   return
  }

  if(newPassword.length < 8 || !/(?=.*[A-Za-z])(?=.*\d)/.test(newPassword)){
   setError("A senha deve ter pelo menos 8 caracteres, com letra e número.")
   return
  }

  setLoading(true)

  try{

   await setPassword(newPassword, confirmPassword)
   setSuccess(true)
   onDefined?.()

  }catch(err){

   setError(getAuthErrorMessage(err, "Não foi possível definir sua senha. Tente novamente."))

  }finally{

   setLoading(false)

  }

 }

 return createPortal(

  <div className={styles.overlay}>

   <div className={styles.modal}>

    {success ? (

     <>
      <h2>Senha definida!</h2>
      <p className={styles.successText}>
       Agora você também pode entrar com email e senha, além do Google.
      </p>
      <button className={styles.buttonPrimary} onClick={handleClose}>
       Fechar
      </button>
     </>

    ) : (

     <>
      <h2>Definir senha</h2>

      <p className={styles.hint}>
       Sua conta foi criada com o Google e ainda não tem senha. Defina uma
       para poder entrar também com email e senha.
      </p>

      {error && <p className={styles.errorText}>{error}</p>}

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
       {loading ? "Salvando..." : "Definir senha"}
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
