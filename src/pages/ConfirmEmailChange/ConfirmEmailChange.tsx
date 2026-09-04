import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

import { confirmEmailChange } from "../../services/authService"
import { getAuthErrorMessage } from "../../utils/authErrors"

import styles from "../VerifyEmail/VerifyEmail.module.css"

type Status = "loading" | "success" | "error"

export default function ConfirmEmailChange(){

 const navigate = useNavigate()
 const [searchParams] = useSearchParams()
 const token = searchParams.get("token")

 const [status,setStatus] = useState<Status>("loading")
 const [errorMessage,setErrorMessage] = useState("")
 const [newEmail,setNewEmail] = useState("")

 const requested = useRef(false)

 useEffect(()=>{

  if(!token){
   setStatus("error")
   setErrorMessage("Link inválido: nenhum token de confirmação encontrado.")
   return
  }

  if(requested.current) return
  requested.current = true

  confirmEmailChange(token)
   .then((data)=>{
    setNewEmail(data.email)
    setStatus("success")
   })
   .catch((err:unknown)=>{
    setStatus("error")
    setErrorMessage(getAuthErrorMessage(err, "Esse link não é mais válido. Peça uma nova troca de email no seu perfil."))
   })

 },[token])

 return(

  <div className={`${styles.wrapper} page-enter`}>

   <div className={styles.card}>

    <h1 className={styles.logo}>ORATIO</h1>

    {status === "loading" && (
     <>
      <Loader2 className={styles.spinner} size={40}/>
      <p className={styles.subtitle}>Confirmando seu novo email...</p>
     </>
    )}

    {status === "success" && (
     <>
      <CheckCircle2 className={styles.iconSuccess} size={44}/>
      <p className={styles.subtitle}>
       Seu email foi atualizado para <strong>{newEmail}</strong>.
       Use esse endereço no próximo login.
      </p>
      <button
       className={styles.button}
       onClick={()=>navigate("/login")}
      >
       Ir para o login
      </button>
     </>
    )}

    {status === "error" && (
     <>
      <XCircle className={styles.iconError} size={44}/>
      <p className={styles.subtitle}>{errorMessage}</p>
      <button
       className={styles.button}
       onClick={()=>navigate("/login")}
      >
       Voltar ao login
      </button>
     </>
    )}

   </div>

  </div>

 )

}
