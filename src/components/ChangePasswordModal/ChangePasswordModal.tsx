import { useState } from "react"
import { createPortal } from "react-dom"

import { changePassword } from "../../services/profileService"
import { forgotPassword } from "../../services/authService"
import { getAuthErrorMessage } from "../../utils/authErrors"

import styles from "./ChangePasswordModal.module.css"

interface Props{
 open:boolean
 /*
  E-mail da própria pessoa (ela está autenticada). Usado pelo link "Não
  lembro minha senha atual" para disparar o `forgot-password` dela mesma —
  spec prova-identidade, sintoma 2. Sem e-mail, o link não aparece.
 */
 email?:string
 onClose:()=>void
}

export default function ChangePasswordModal({ open, email, onClose }:Props){

 const [currentPassword,setCurrentPassword] = useState("")
 const [newPassword,setNewPassword] = useState("")
 const [confirmPassword,setConfirmPassword] = useState("")
 const [loading,setLoading] = useState(false)
 const [error,setError] = useState<string | null>(null)
 const [success,setSuccess] = useState(false)
 // link "Não lembro minha senha atual" → e-mail de recuperação disparado
 const [forgotSent,setForgotSent] = useState(false)

 if(!open) return null

 function reset(){
  setCurrentPassword("")
  setNewPassword("")
  setConfirmPassword("")
  setError(null)
  setSuccess(false)
  setForgotSent(false)
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

  }catch(err){

   setError(getAuthErrorMessage(err, "Não foi possível trocar sua senha. Tente novamente."))

  }finally{

   setLoading(false)

  }

 }

 /*
  A pessoa não lembra a senha atual, mas já provou quem é (está logada).
  Dispara o `POST /auth/forgot-password` do PRÓPRIO e-mail — a rota é
  pública, idempotente e genérica; chamá-la autenticada não vaza nada e não
  precisa de rota nova (spec prova-identidade, sintoma 2). O reset em si só
  se conclui pelo link do e-mail, FORA do app — a tela deixa isso explícito.
 */
 async function handleForgot(){

  if(!email) return

  setError(null)
  setLoading(true)

  try{

   await forgotPassword(email)
   setForgotSent(true)

  }catch(err){

   setError(getAuthErrorMessage(err, "Não foi possível enviar o e-mail. Tente novamente."))

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

    ) : forgotSent ? (

     <>
      <h2>Verifique seu e-mail</h2>
      <p className={styles.successText}>
       Enviamos um link para <strong>{email}</strong>. Abra esse e-mail e
       siga o link para definir uma senha nova — isso acontece fora do app.
       Depois, entre de novo com a senha que você acabou de criar.
      </p>
      <button className={styles.buttonPrimary} onClick={handleClose}>
       Entendi
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

      {email && (
       <button
        type="button"
        className={styles.linkButton}
        onClick={handleForgot}
        disabled={loading}
       >
        Não lembro minha senha atual
       </button>
      )}

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
