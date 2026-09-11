import { useState } from "react"
import { createPortal } from "react-dom"
import { ChevronLeft } from "lucide-react"

import TermsOfUseContent from "../TermsOfUseContent/TermsOfUseContent"
import PrivacyPolicyContent from "../PrivacyPolicyContent/PrivacyPolicyContent"
import DeleteAccountModal from "../DeleteAccountModal/DeleteAccountModal"
import { acceptLegalTerms } from "../../services/profileService"
import { logout } from "../../services/authService"
import { getAuthErrorMessage } from "../../utils/authErrors"

import styles from "./LegalConsentGate.module.css"

type View = "consent" | "terms" | "privacy"

interface Props {
  mode: "pre-account" | "post-account"
  onAccept: () => void
  onDecline: () => void
  /* Só usados em mode="post-account" (repassados ao DeleteAccountModal). */
  userEmail?: string
  hasPassword?: boolean
  hasGoogle?: boolean
}

/*
 Componente único reusado nas quatro portas do consentimento (spec
 `docs/specs/consentimento-privacidade.md`), em dois modos:

 - "pre-account" (portas 1 e 2, dentro de Register.tsx, sem sessão): aceitar
   chama só onAccept() — quem chama decide o que fazer (register() ou abrir
   o popup do Google). Recusar só chama onDecline() (fecha o overlay) —
   nenhuma saída oferecida, porque nada foi criado ainda.
 - "post-account" (porta 4, e a chamada que a porta 2 faz depois do popup):
   aceitar chama POST /users/me/legal-terms-accepted e SÓ ENTÃO onAccept().
   Recusar NÃO fecha — troca o conteúdo pelas duas saídas ("Sair do app" /
   "Excluir minha conta"); onDecline() nunca é chamado neste modo.

 As duas caixas nascem desmarcadas e são AMBAS obrigatórias — "Aceitar e
 continuar" fica desabilitado até as duas estarem marcadas (nunca vêm
 pré-marcadas, ao contrário do modelo do Google). Ler um documento troca
 a VIEW interna (nunca uma navegação de rota) — as caixas nunca desmontam,
 então o estado marcado sobrevive ao "Voltar" sem esforço nenhum.
*/
export default function LegalConsentGate({
  mode,
  onAccept,
  onDecline,
  userEmail = "",
  hasPassword = false,
  hasGoogle = false,
}: Props){

  const [view, setView] = useState<View>("consent")
  const [termsChecked, setTermsChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [declined, setDeclined] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bothChecked = termsChecked && privacyChecked

  async function handleAccept(){

    if(mode === "pre-account"){
      onAccept()
      return
    }

    setError(null)
    setLoading(true)

    try{
      await acceptLegalTerms()
      onAccept()
    }catch(err){
      setError(getAuthErrorMessage(err, "Não foi possível registrar seu aceite. Tente novamente."))
      setLoading(false)
    }

  }

  function handleDecline(){

    if(mode === "pre-account"){
      onDecline()
      return
    }

    // post-account: NUNCA chama onDecline — só revela as duas saídas.
    // Recusar não é um pedido de exclusão nem de logout, só o caminho.
    setDeclined(true)

  }

  function handleSairDoApp(){
    logout()
  }

  if(view === "terms" || view === "privacy"){
    return createPortal(
      <div className={styles.overlay}>
        <div className={styles.card}>

          <div className={styles.readerHeader}>
            <button
              type="button"
              className={styles.backButton}
              onClick={()=>setView("consent")}
            >
              <ChevronLeft size={18} />
              Voltar
            </button>
          </div>

          <div className={styles.scroll}>
            {view === "terms" ? <TermsOfUseContent/> : <PrivacyPolicyContent/>}
          </div>

        </div>
      </div>,
      document.body,
    )
  }

  return createPortal(

    <div className={styles.overlay}>

      <div className={styles.card}>

        {declined ? (

          <div className={styles.declined}>

            <h2>Sem aceitar, não é possível continuar</h2>

            <p className={styles.hint}>
              Você pode sair sem perder nada, ou excluir sua conta e todos os seus dados.
            </p>

            <div className={styles.declinedActions}>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={handleSairDoApp}
              >
                Sair do app
              </button>

              <button
                type="button"
                className={styles.buttonDanger}
                onClick={()=>setDeleteOpen(true)}
              >
                Excluir minha conta
              </button>
            </div>

          </div>

        ) : (

          <>

            <h2>Termos de Uso e Política de Privacidade</h2>

            <p className={styles.hint}>
              Para usar o Oratio, você precisa aceitar os dois documentos abaixo.
            </p>

            {error && <p className={styles.errorText}>{error}</p>}

            <div className={styles.checkboxRow}>
              <input
                id="legal-consent-terms"
                type="checkbox"
                checked={termsChecked}
                onChange={(e)=>setTermsChecked(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="legal-consent-terms">
                Aceito os{" "}
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={(e)=>{ e.stopPropagation(); setView("terms") }}
                >
                  Termos de Uso
                </button>
              </label>
            </div>

            <div className={styles.checkboxRow}>
              <input
                id="legal-consent-privacy"
                type="checkbox"
                checked={privacyChecked}
                onChange={(e)=>setPrivacyChecked(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="legal-consent-privacy">
                Aceito o tratamento dos meus dados conforme a{" "}
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={(e)=>{ e.stopPropagation(); setView("privacy") }}
                >
                  Política de Privacidade
                </button>
              </label>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={handleDecline}
                disabled={loading}
              >
                Recusar
              </button>

              <button
                type="button"
                className={styles.buttonPrimary}
                onClick={handleAccept}
                disabled={!bothChecked || loading}
              >
                {loading ? "Aceitando..." : "Aceitar e continuar"}
              </button>
            </div>

          </>

        )}

      </div>

      {mode === "post-account" && (
        <DeleteAccountModal
          open={deleteOpen}
          userEmail={userEmail}
          hasPassword={hasPassword}
          hasGoogle={hasGoogle}
          onClose={()=>setDeleteOpen(false)}
        />
      )}

    </div>,

    document.body,

  )

}
