import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import LegalConsentGate from "../../components/LegalConsentGate/LegalConsentGate"
import { getProfile } from "../../services/profileService"

import styles from "./LegalConsent.module.css"

/*
 Rota `/oratio/consentimento` — para onde o `LegalTermsGate` manda quem ainda
 não aceitou os termos. Se a busca do perfil falhar, mostra erro com
 "Tentar de novo" (antes ficava num spinner eterno). Não sai da rota e não
 deixa entrar no app sem aceite: a única saída continua sendo o gate.
*/
export default function LegalConsent(){

  const navigate = useNavigate()
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getProfile>> | null>(null)
  const [failed, setFailed] = useState(false)

  const load = useCallback(()=>{
    getProfile().then(setProfile).catch(()=>setFailed(true))
  },[])

  useEffect(()=>{ load() },[load])

  function retry(){
    setFailed(false)
    load()
  }

  if(failed){
    return (
      <div className={styles.error}>
        <p>Não foi possível carregar a tela de consentimento. Verifique sua internet.</p>
        <button type="button" className={styles.retry} onClick={retry}>
          Tentar de novo
        </button>
      </div>
    )
  }

  if(!profile) return <div className="oratio-loading" />

  return (
    <LegalConsentGate
      mode="post-account"
      userEmail={profile.email}
      hasPassword={profile.hasPassword}
      hasGoogle={profile.hasGoogle}
      onAccept={()=>navigate("/oratio/home", { replace: true })}
      onDecline={()=>{}}
    />
  )

}
