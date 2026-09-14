import { ChevronLeft } from "lucide-react"

import TermsOfUseContent from "../../components/TermsOfUseContent/TermsOfUseContent"
import useBackOrHome from "../../hooks/useBackOrHome"

import styles from "./TermsOfUse.module.css"

/*
 Rota pública `/termos-de-uso` (spec consentimento-privacidade.md) — leitura
 pura, sem checkbox, sem botão de aceite. Acessível a visitante por
 construção (fora de `<ProtectedRoute>`), e é a mesma peça (`TermsOfUseContent`)
 usada dentro do `LegalConsentGate`. Aberta por link direto, o voltar leva pra
 Home (`useBackOrHome`).
*/
export default function TermsOfUse(){

  const goBack = useBackOrHome()

  return (
    <div className={`${styles.wrapper} page-enter`}>

      <div className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={goBack}
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
