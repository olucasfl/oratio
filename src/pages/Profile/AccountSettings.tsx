import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import styles from "./AccountSettings.module.css"

import ChangePasswordModal from "../../components/ChangePasswordModal/ChangePasswordModal"
import SetPasswordModal from "../../components/SetPasswordModal/SetPasswordModal"
import ChangeEmailModal from "../../components/ChangeEmailModal/ChangeEmailModal"

import { getProfile } from "../../services/profileService"
import { asApiError } from "../../utils/authErrors"

import {
 ChevronLeft,
 KeyRound,
 Mail,
 Loader2
} from "lucide-react"

/*
 Lê o `hasPassword` do cache que a tela de Perfil já gravou (`oratio-profile`)
 pra decidir na primeira renderização entre "Definir senha" e "Trocar senha"
 sem flash. Sem cache, mostra um placeholder até o fetch responder.
*/
function cachedHasPassword():boolean | null{
 try{
  const raw = localStorage.getItem("oratio-profile")
  if(!raw) return null
  const parsed = JSON.parse(raw)
  return typeof parsed?.hasPassword === "boolean" ? parsed.hasPassword : null
 }catch{
  return null
 }
}

export default function AccountSettings(){

 const navigate = useNavigate()
 const [searchParams] = useSearchParams()

 const [changePasswordOpen,setChangePasswordOpen] = useState(false)
 const [setPasswordOpen,setSetPasswordOpen] = useState(false)
 const [changeEmailOpen,setChangeEmailOpen] = useState(false)
 const [emailRequestedMsg,setEmailRequestedMsg] = useState<string | null>(null)

 const [hasPassword,setHasPassword] = useState<boolean | null>(cachedHasPassword)

 /* chegou do aviso do Perfil (?senha=1) → destaca o botão "Definir senha" */
 const [pwdHighlight,setPwdHighlight] = useState(
  ()=> searchParams.get("senha") === "1",
 )
 const setPwdBtnRef = useRef<HTMLButtonElement>(null)

 useEffect(()=>{
  if(!pwdHighlight) return
  const t = setTimeout(()=>setPwdHighlight(false),3600)
  return ()=>clearTimeout(t)
 },[pwdHighlight])

 // rola até o botão só depois que ele existe (hasPassword resolvido)
 useEffect(()=>{
  if(pwdHighlight && hasPassword === false){
   requestAnimationFrame(()=>{
    setPwdBtnRef.current?.scrollIntoView({ behavior:"smooth", block:"center" })
   })
  }
 },[pwdHighlight, hasPassword])

 useEffect(()=>{

  let active = true

  getProfile()
   .then((data)=>{
    if(!active) return
    /*
     Só um `false` explícito vira "Definir senha". Se o backend ainda não
     expõe `hasPassword` (deploy fora de ordem), cai no default "Trocar
     senha" — o status quo, seguro para uma conta com senha.
    */
    setHasPassword(typeof data?.hasPassword === "boolean" ? data.hasPassword : true)
    try{
     localStorage.setItem("oratio-profile", JSON.stringify(data))
    }catch{
     // cache é conveniência — segue sem ele
    }
   })
   .catch((err)=>{
    if(asApiError(err).response?.status === 401){
     navigate("/login")
    }
    // outros erros: mantém o que veio do cache (ou o placeholder)
   })

  return ()=>{ active = false }

 },[navigate])

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
     onClick={()=>navigate("/oratio/profile")}
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

      {hasPassword === null && (

       <button className={styles.actionButton} disabled>
        <Loader2 size={16} className={styles.spinIcon}/> Carregando…
       </button>

      )}

      {hasPassword === true && (

       <button
        className={styles.actionButton}
        onClick={()=>setChangePasswordOpen(true)}
       >
        <KeyRound size={16}/> Trocar senha
       </button>

      )}

      {hasPassword === false && (

       <button
        ref={setPwdBtnRef}
        className={`${styles.actionButton} ${pwdHighlight ? styles.actionButtonPulse : ""}`}
        onClick={()=>setSetPasswordOpen(true)}
       >
        <KeyRound size={16}/> Definir senha
       </button>

      )}

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

   <SetPasswordModal
    open={setPasswordOpen}
    onClose={()=>setSetPasswordOpen(false)}
    onDefined={()=>setHasPassword(true)}
   />

   <ChangeEmailModal
    open={changeEmailOpen}
    onClose={()=>setChangeEmailOpen(false)}
    onRequested={handleEmailRequested}
   />

  </div>

 )

}
