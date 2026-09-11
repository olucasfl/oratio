import { useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"

import { isLoggedIn } from "../../utils/auth"
import { getProfile } from "../../services/profileService"

/*
 Porta 4 do consentimento (spec `docs/specs/consentimento-privacidade.md`):
 já autenticado (login por senha, Google, ou reabertura do PWA).

 Mesma forma do `WelcomeGate` (spec boas-vindas), montado ANTES dele em
 `App.tsx`: ao carregar o app autenticado, busca `GET /users/me` uma vez e,
 se `legalTermsAccepted !== true` e a rota atual não estiver na lista de
 exceções, redireciona pra `/oratio/consentimento`. `legalTermsAccepted` é
 a ÚNICA fonte de verdade — nunca um flag local.

 O efeito reavalia a cada troca de rota (`location.pathname` nas deps), não
 só no boot — mesmo racional do `WelcomeGate`: quem faz login por SPA (sem
 reload) precisa ser interceptado nessa navegação. O `checked` ref garante
 UMA busca de `/users/me` por sessão.

 Falha de rede: não redireciona, libera o `checked` e tenta de novo na
 próxima navegação. Nunca prende ninguém na porta do app.
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
  const checked = useRef(false)

  useEffect(()=>{

    if(checked.current) return
    if(!isLoggedIn()) return
    if(SKIP_PREFIXES.some((p)=> location.pathname.startsWith(p))) return

    checked.current = true

    let cancelled = false

    getProfile()
      .then((u)=>{
        if(cancelled) return
        if(u?.legalTermsAccepted !== true){
          navigate("/oratio/consentimento", { replace: true })
        }
      })
      .catch(()=>{
        // rede: não intercepta; reavalia na próxima navegação
        checked.current = false
      })

    return ()=>{ cancelled = true }

  // reavalia a cada navegação (o componente fica montado o app inteiro); o
  // `checked` ref impede uma segunda busca de `/users/me` depois da primeira
  },[location.pathname, navigate])

  return null

}
