import { useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"

import TermsOfUseContent from "../../components/TermsOfUseContent/TermsOfUseContent"

import styles from "./TermsOfUse.module.css"

/*
 Rota pública `/termos-de-uso` (spec consentimento-privacidade.md) — leitura
 pura, sem checkbox, sem botão de aceite. Acessível a visitante por
 construção (fora de `<ProtectedRoute>`), e é a mesma peça (`TermsOfUseContent`)
 usada dentro do `LegalConsentGate`.
*/
export default function TermsOfUse(){

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
        <TermsOfUseContent/>
      </div>

    </div>
  )

}
