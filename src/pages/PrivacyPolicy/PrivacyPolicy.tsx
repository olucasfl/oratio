import { useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"

import PrivacyPolicyContent from "../../components/PrivacyPolicyContent/PrivacyPolicyContent"

import styles from "../TermsOfUse/TermsOfUse.module.css"

/*
 Rota pública `/politica-de-privacidade` (spec consentimento-privacidade.md)
 — leitura pura, sem checkbox, sem botão de aceite. Acessível a visitante
 por construção (fora de `<ProtectedRoute>`) — o Google exige uma URL
 pública para a tela de consentimento OAuth. Mesmo layout de `TermsOfUse`
 (reusa o CSS module dela, como `Tratado.tsx` reusa o de `Catecismo`) — é a
 mesma peça (`PrivacyPolicyContent`) usada dentro do `LegalConsentGate`.
*/
export default function PrivacyPolicy(){

  const navigate = useNavigate()

  return (
    <div className={`${styles.wrapper} page-enter`}>

      <div className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={()=>navigate(-1)}
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className={styles.scroll}>
        <PrivacyPolicyContent/>
      </div>

    </div>
  )

}
