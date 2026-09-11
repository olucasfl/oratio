import { useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"

import { isLoggedIn } from "../../utils/auth"
import { getProfile } from "../../services/profileService"

/*
 Shell do guia de boas-vindas (spec `docs/specs/boas-vindas.md`).

 Ao carregar o app autenticado, busca `GET /users/me` uma vez e, se
 `showWelcome === true` e a rota atual não for de auth nem o próprio guia,
 redireciona pra `/oratio/boas-vindas`. `showWelcome` é a ÚNICA fonte de
 verdade da visibilidade e da unicidade do guia — `isNewUser` do
 `POST /auth/google` só evita o flash na tela de cadastro (Login/Register já
 navegam direto pro guia nesse caso), nunca decide sozinho aqui.

 O efeito reavalia a cada troca de rota (`location.pathname` nas deps), não
 só no boot: quem abre o app em `/login` deslogado e depois entra — o
 `Login.tsx` navega por SPA, sem reload — precisa ser interceptado nessa
 navegação, senão só veria o guia no boot seguinte (a spec vale para a
 primeira entrada por senha também, não só Google). O `checked` ref
 continua garantindo UMA busca de `/users/me` por sessão.

 Falha de rede: não redireciona, libera o `checked` e tenta de novo na
 próxima navegação. Pior caso, o guia aparece uma vez a mais — nunca
 prende ninguém na porta do app.
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

  checked.current = true

  let cancelled = false

  getProfile()
   .then((u)=>{
    if(cancelled) return
    if(u?.showWelcome === true){
     navigate("/oratio/boas-vindas", { replace: true })
    }
   })
   .catch(()=>{
    // rede: não intercepta; reavalia no próximo boot
    checked.current = false
   })

  return ()=>{ cancelled = true }

 // reavalia a cada navegação (o componente fica montado o app inteiro); o
 // `checked` ref impede uma segunda busca de `/users/me` depois da primeira
 },[location.pathname, navigate])

 return null

}
