import { useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"

import { isLoggedIn } from "../../utils/auth"
import { getProfile } from "../../services/profileService"

/*
 Shell do guia de boas-vindas (spec `docs/specs/boas-vindas.md`).

 Ao navegar autenticado, busca `GET /users/me` e, se `showWelcome === true`
 e a rota atual não for de auth nem o próprio guia, redireciona pra
 `/oratio/boas-vindas`. `showWelcome` é a ÚNICA fonte de verdade da
 visibilidade e da unicidade do guia — `isNewUser` do `POST /auth/google` só
 evita o flash na tela de cadastro (Login/Register já navegam direto pro guia
 nesse caso), nunca decide sozinho aqui.

 PRECEDÊNCIA DO CONSENTIMENTO (spec consentimento-privacidade, porta 4):
 enquanto `legalTermsAccepted !== true`, este gate não redireciona e NÃO se
 gasta — quem manda é o `LegalTermsGate`. Antes os dois `.then` disparavam
 `navigate` na mesma navegação e o último (boas-vindas) vencia: a pessoa
 concluía o guia e caía na Home sem ter aceitado. Agora o `checked` ref só
 vira `true` numa resposta com os termos aceitos; aí o guia é avaliado uma
 vez por sessão, como sempre foi.

 O efeito reavalia a cada troca de rota (`location.pathname` nas deps), não
 só no boot: quem abre o app em `/login` deslogado e depois entra — o
 `Login.tsx` navega por SPA, sem reload — precisa ser interceptado nessa
 navegação. A chamada é compartilhada com o `LegalTermsGate` pelo dedupe/memo
 de `getProfile()`.

 Falha de rede: não redireciona e tenta de novo na próxima navegação. Pior
 caso, o guia aparece uma vez a mais — nunca prende ninguém na porta do app.
*/

const SKIP_PREFIXES = [
 "/oratio/boas-vindas",
 "/oratio/consentimento",
 "/login",
 "/register",
 "/verificar-email",
 "/confirmar-troca-email",
]

export default function WelcomeGate(){

 const navigate = useNavigate()
 const location = useLocation()
 const checked = useRef(false)

 useEffect(()=>{

  if(checked.current) return
  if(!isLoggedIn()) return
  if(SKIP_PREFIXES.some((p)=> location.pathname.startsWith(p))) return

  let cancelled = false

  getProfile()
   .then((u)=>{
    if(cancelled || checked.current) return
    // termos pendentes: o LegalTermsGate redireciona; aqui não se gasta
    if(u?.legalTermsAccepted !== true) return
    checked.current = true
    if(u?.showWelcome === true){
     navigate("/oratio/boas-vindas", { replace: true })
    }
   })
   .catch(()=>{
    // rede: não intercepta; reavalia na próxima navegação
   })

  return ()=>{ cancelled = true }

 },[location.pathname, navigate])

 return null

}
