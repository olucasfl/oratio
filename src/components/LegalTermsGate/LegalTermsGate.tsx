import { useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"

import { isLoggedIn } from "../../utils/auth"
import { getProfile } from "../../services/profileService"

/*
 Porta 4 do consentimento (spec `docs/specs/consentimento-privacidade.md`):
 já autenticado (login por senha, Google, ou reabertura do PWA).

 Montado ANTES do `WelcomeGate` em `App.tsx`. A cada troca de rota
 (`location.pathname` nas deps) que não esteja na lista de exceções, consulta
 `GET /users/me` e, se `legalTermsAccepted !== true`, redireciona pra
 `/oratio/consentimento`. `legalTermsAccepted` é a ÚNICA fonte de verdade —
 nunca um flag local.

 NÃO pulável: enquanto a última resposta for "não aceito", TODA navegação
 qualificada consulta de novo (uma chamada por navegação — o memo curto e o
 dedupe de `getProfile()` absorvem o `WelcomeGate` e a própria tela de
 consentimento) e redireciona de novo. Antes era "uma busca por sessão": quem
 usava o botão voltar na tela de consentimento entrava no app sem aceitar.

 Só o `accepted` ref encerra as consultas, e ele só vira `true` com uma
 resposta `legalTermsAccepted === true`. Depois do aceite não há loop:
 `acceptLegalTerms()` invalida o memo do perfil, a tela navega pra
 `/oratio/home`, esta consulta já vem aceita e o gate se aposenta.

 Falha de rede: não redireciona e reavalia na próxima navegação. Nunca prende
 ninguém na porta do app.
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

export default function LegalTermsGate(){

  const navigate = useNavigate()
  const location = useLocation()
  const accepted = useRef(false)

  useEffect(()=>{

    if(accepted.current) return
    if(!isLoggedIn()) return
    if(SKIP_PREFIXES.some((p)=> location.pathname.startsWith(p))) return

    let cancelled = false

    getProfile()
      .then((u)=>{
        if(u?.legalTermsAccepted === true){
          accepted.current = true
          return
        }
        if(cancelled) return
        navigate("/oratio/consentimento", { replace: true })
      })
      .catch(()=>{
        // rede: não intercepta; reavalia na próxima navegação
      })

    return ()=>{ cancelled = true }

  },[location.pathname, navigate])

  return null

}
