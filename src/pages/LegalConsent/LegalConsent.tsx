import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import LegalConsentGate from "../../components/LegalConsentGate/LegalConsentGate"
import { getProfile } from "../../services/profileService"

export default function LegalConsent(){

  const navigate = useNavigate()
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getProfile>> | null>(null)

  useEffect(()=>{
    getProfile().then(setProfile).catch(()=>{})
  },[])

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