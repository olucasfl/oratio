import { useState } from "react"
import { createPortal } from "react-dom"

import { deleteAccount } from "../../services/profileService"
import { getAuthErrorMessage } from "../../utils/authErrors"
import { clearSession } from "../../services/api"
import GoogleSignInButton from "../GoogleSignInButton/GoogleSignInButton"

import styles from "./DeleteAccountModal.module.css"

interface Props{
 open:boolean
 userEmail:string
 /*
 `false` = conta que entrou só pelo Google — a prova de identidade é uma
 reautenticação no Google, não a senha (spec login-google §"Fase E → E7").
 */
 hasPassword:boolean
 onClose:()=>void
}

export default function DeleteAccountModal({ open, userEmail, hasPassword, onClose }:Props){

 const [confirmation,setConfirmation] = useState("")
 const [password,setPassword] = useState("")
 const [loading,setLoading] = useState(false)
 const [error,setError] = useState<string | null>(null)

 if(!open) return null

 const emailMatches =
  confirmation.trim().toLowerCase() === userEmail.trim().toLowerCase()

 function handleClose(){
  setConfirmation("")
  setPassword("")
  setError(null)
  onClose()
 }

 async function runDelete(proof:{ password?:string; googleCredential?:string }){

  setError(null)
  setLoading(true)

  try{

   await deleteAccount(proof)
   clearSession()

  }catch(err){

   setError(getAuthErrorMessage(err, "Não foi possível excluir sua conta. Tente novamente."))
   setLoading(false)

  }

 }

 return createPortal(

  <div className={styles.overlay}>

   <div className={styles.modal}>

    <h2>Excluir conta</h2>

    <p className={styles.warning}>
     Essa ação é <strong>permanente</strong>. Todos os seus dados —
     orações, progresso da consagração, histórico do terço e tudo mais —
     serão apagados e não podem ser recuperados.
    </p>

    <p className={styles.hint}>
     Para confirmar, digite seu email (<strong>{userEmail}</strong>) abaixo:
    </p>

    {error && <p className={styles.errorText}>{error}</p>}

    <input
     className={styles.input}
     type="email"
     placeholder="Digite seu email"
     value={confirmation}
     onChange={(e)=>setConfirmation(e.target.value)}
    />

    {hasPassword ? (
     <>
      <p className={styles.hint}>
       Confirme com sua senha atual:
      </p>

      <input
       className={styles.input}
       type="password"
       placeholder="Sua senha"
       value={password}
       onChange={(e)=>setPassword(e.target.value)}
      />

      <button
       className={styles.buttonDanger}
       onClick={()=>runDelete({ password })}
       disabled={!emailMatches || password.length === 0 || loading}
      >
       {loading ? "Excluindo..." : "Excluir minha conta"}
      </button>
     </>
    ) : (
     <>
      <p className={styles.hint}>
       Sua conta entra com o Google. Para confirmar a exclusão, entre de novo
       com o Google:
      </p>

      {emailMatches ? (
       <div className={styles.googleReauth}>
        <GoogleSignInButton
         onCredential={(credential)=>runDelete({ googleCredential: credential })}
         disabled={loading}
        />
       </div>
      ) : (
       <button className={styles.buttonDanger} disabled>
        Excluir minha conta
       </button>
      )}
     </>
    )}

    <button className={styles.buttonSecondary} onClick={handleClose}>
     Cancelar
    </button>

   </div>

  </div>,

  document.body

 )

}
