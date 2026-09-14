import { useState } from "react"
import { createPortal } from "react-dom"

import { setPassword } from "../../services/profileService"
import { asApiError, getAuthErrorMessage } from "../../utils/authErrors"
import GoogleSignInButton from "../GoogleSignInButton/GoogleSignInButton"

import styles from "./SetPasswordModal.module.css"

interface Props{
 open:boolean
 onClose:()=>void
 /* Chamado após o sucesso, pra o pai recarregar o perfil (hasPassword vira true). */
 onDefined?:()=>void
}

/*
 Define a PRIMEIRA senha de uma conta que entrou só por Google. Dois passos:
 1. as duas senhas (validadas no cliente: iguais, 8+ caracteres, letra e número);
 2. confirmação de identidade pelo Google — o `GoogleSignInButton` entrega um
    id_token fresco e só então chamamos `setPassword(senha, confirmação, credential)`
    (spec prova-identidade: o access token sozinho não pode criar uma senha).
 O backend não revoga sessões neste fluxo (nada foi invalidado), então também
 não avisamos sobre "sair de todos os aparelhos".
*/
export default function SetPasswordModal({ open, onClose, onDefined }:Props){

 const [newPassword,setNewPassword] = useState("")
 const [confirmPassword,setConfirmPassword] = useState("")
 const [step,setStep] = useState<"form" | "google">("form")
 const [loading,setLoading] = useState(false)
 const [error,setError] = useState<string | null>(null)
 const [success,setSuccess] = useState(false)

 if(!open) return null

 function reset(){
  setNewPassword("")
  setConfirmPassword("")
  setStep("form")
  setError(null)
  setSuccess(false)
 }

 function handleClose(){
  reset()
  onClose()
 }

 function handleContinue(){

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

  setStep("google")

 }

 async function handleCredential(credential:string){

  setError(null)
  setLoading(true)

  try{

   await setPassword(newPassword, confirmPassword, credential)
   setSuccess(true)
   onDefined?.()

  }catch(err){

   // 401 = id_token inválido/expirado: pedir pra entrar de novo no Google.
   // 400 (outra conta Google) e 409 (já tem senha) já vêm em português do backend.
   if(asApiError(err).response?.status === 401){
    setError("Não foi possível confirmar com o Google. Entre de novo com a sua conta Google.")
   }else{
    setError(getAuthErrorMessage(err, "Não foi possível definir sua senha. Tente novamente."))
   }

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

    ) : step === "google" ? (

     <>
      <h2>Definir senha</h2>

      <p className={styles.hint}>
       Para confirmar que é você, entre de novo com o Google.
      </p>

      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.googleReauth}>
       <GoogleSignInButton onCredential={handleCredential} disabled={loading} />
      </div>

      <button
       type="button"
       className={styles.linkButton}
       onClick={()=>{ setStep("form"); setError(null) }}
       disabled={loading}
      >
       Voltar
      </button>

      <button className={styles.buttonSecondary} onClick={handleClose}>
       Cancelar
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
       onClick={handleContinue}
      >
       Continuar
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
