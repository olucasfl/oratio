import { useEffect, useState, type ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"

import { isLoggedIn } from "../../utils/auth"
import { getProfile } from "../../services/profileService"

import styles from "./LegalTermsGate.module.css"

/*
 Porta 4 do consentimento (spec `docs/specs/consentimento-privacidade.md`):
 já autenticado (login por senha, Google, ou reabertura do PWA).

 ENVOLVE o app (`App.tsx`) em vez de rodar ao lado dele. Antes era um
 componente irmão das rotas: a Home, o guia de boas-vindas e os popups
 renderizavam normalmente e só DEPOIS do `GET /users/me` o gate
 redirecionava — a pessoa via o app por um instante sem ter aceitado. Agora,
 numa rota protegida, NADA do app monta enquanto a resposta não chega:

 - visitante deslogado → renderiza o app (`cleared = true`), sem consulta;
 - rota da lista de exceções (consentimento, documentos legais, auth) →
   renderiza a rota, mas com `cleared = false` enquanto o aceite não foi
   confirmado: o `App.tsx` usa isso pra não montar popups (`InstallAppNudge`)
   nem o `WelcomeGate` por cima da tela de consentimento;
 - qualquer outra rota logada, sem aceite confirmado → carregando; a resposta
   decide: aceito → libera o app (`cleared = true`) e para de consultar;
   não aceito → `<Navigate>` pra `/oratio/consentimento` sem montar nada.

 Não pulável: enquanto não houver aceite confirmado, TODA navegação
 qualificada consulta de novo (o memo curto e o dedupe de `getProfile()`
 seguram o custo) — voltar da tela de consentimento cai no carregando e é
 redirecionado de novo.

 Falha de rede: se o cache do perfil (`oratio-profile`, gravado a partir do
 próprio `GET /users/me` e apagado no logout) diz que já aceitou, libera — o
 PWA continua abrindo offline pra quem já aceitou. Sem essa certeza, mostra
 erro com "Tentar de novo" e NÃO libera o app.

 `legalTermsAccepted` é a ÚNICA fonte de verdade; o cache só vale como
 fallback de rede. O logout recarrega a página (`clearSession`), então o
 estado "aceito" nunca vaza de uma conta pra outra.
*/

const SKIP_PREFIXES = [
  "/oratio/consentimento",
  "/termos-de-uso",
  "/politica-de-privacidade",
  "/login",
  "/register",
  "/verificar-email",
  "/confirmar-troca-email",
]

function cachedAccepted(): boolean {
  try{
    const raw = localStorage.getItem("oratio-profile")
    return !!raw && JSON.parse(raw)?.legalTermsAccepted === true
  }catch{
    return false
  }
}

interface Props {
  /* `cleared`: o app pode montar popups e o guia de boas-vindas. */
  children: (cleared: boolean) => ReactNode
}

export default function LegalTermsGate({ children }: Props){

  const location = useLocation()
  const [accepted, setAccepted] = useState(false)
  const [retry, setRetry] = useState(0)
  // resultado negativo (ou erro) de UMA consulta, amarrado à NAVEGAÇÃO
  // (location.key) + tentativa que o produziu. Não pode ser só o pathname:
  // depois do aceite a tela volta pra /oratio/home — o mesmo path da primeira
  // consulta — e um "não aceito" velho mandaria a pessoa de volta pro
  // consentimento. Nova navegação ou "Tentar de novo" volta ao carregando.
  const [outcome, setOutcome] = useState<{ key: string; value: "pending" | "error" } | null>(null)

  const loggedIn = isLoggedIn()
  const skip = SKIP_PREFIXES.some((p)=> location.pathname.startsWith(p))
  const mustCheck = loggedIn && !accepted && !skip
  const key = `${location.key}#${retry}`

  useEffect(()=>{

    if(!mustCheck) return

    let cancelled = false

    getProfile()
      .then((u)=>{
        if(cancelled) return
        if(u?.legalTermsAccepted === true){
          setAccepted(true)
          return
        }
        setOutcome({ key, value: "pending" })
      })
      .catch(()=>{
        if(cancelled) return
        if(cachedAccepted()){
          setAccepted(true)
          return
        }
        setOutcome({ key, value: "error" })
      })

    return ()=>{ cancelled = true }

  },[mustCheck, key])

  if(!mustCheck){
    return <>{children(!loggedIn || accepted)}</>
  }

  if(outcome?.key === key && outcome.value === "pending"){
    return <Navigate to="/oratio/consentimento" replace />
  }

  if(outcome?.key === key && outcome.value === "error"){
    return (
      <div className={styles.error} role="alert">
        <p className={styles.title}>Não foi possível verificar sua conta</p>
        <p className={styles.hint}>Confira sua conexão e tente de novo.</p>
        <button
          type="button"
          className={styles.button}
          onClick={()=>setRetry((r)=> r + 1)}
        >
          Tentar de novo
        </button>
      </div>
    )
  }

  return <div className="oratio-loading" aria-busy="true" data-testid="legal-gate-checking" />

}
