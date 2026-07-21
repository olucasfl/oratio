import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

import { verifyEmail } from "../../services/authService"

import styles from "./VerifyEmail.module.css"

type Status = "loading" | "success" | "error"

export default function VerifyEmail(){

 const navigate = useNavigate()
 const [searchParams] = useSearchParams()
 const token = searchParams.get("token")

 const [status,setStatus] = useState<Status>("loading")
 const [errorMessage,setErrorMessage] = useState("")

 /*
 Protege contra chamada duplicada (StrictMode re-monta efeitos em dev).
 Não é estritamente necessário — o backend já é idempotente — mas evita
 uma segunda requisição desnecessária.
 */
 const requested = useRef(false)

 useEffect(()=>{

  if(!token){
   setStatus("error")
   setErrorMessage("Link inválido: nenhum token de verificação encontrado.")
   return
  }

  if(requested.current) return
  requested.current = true

  verifyEmail(token)
   .then(()=>{
    setStatus("success")
   })
   .catch((err:any)=>{
    setStatus("error")
    setErrorMessage(
     err?.response?.data?.message === "Verification token expired"
      ? "Esse link expirou. Peça um novo email de verificação."
      : "Esse link não é mais válido. Peça um novo email de verificação."
    )
   })

 },[token])

 return(

  <div className={`${styles.wrapper} page-enter`}>

   <div className={styles.card}>

    <h1 className={styles.logo}>ORATIO</h1>

    {status === "loading" && (
     <>
      <Loader2 className={styles.spinner} size={40}/>
      <p className={styles.subtitle}>Confirmando seu email...</p>
     </>
    )}

    {status === "success" && (
     <>
      <CheckCircle2 className={styles.iconSuccess} size={44}/>
      <p className={styles.subtitle}>
       Email confirmado com sucesso! Você já pode fazer login.
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
