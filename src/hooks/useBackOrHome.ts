import { useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"

/*
 "Voltar" que funciona mesmo sem histórico do app. Uma página aberta por link
 externo (ex.: a tela de consentimento OAuth do Google linkando a Política de
 Privacidade) ou por URL digitada é a primeira entrada do histórico — ali
 `navigate(-1)` não faz nada. No react-router 7 a primeira entrada tem
 `location.key === "default"` (browser: sem `history.state`; memory: índice 0).
 Nesse caso vai pra `/oratio/home`; senão, volta normalmente.
*/
export default function useBackOrHome(fallback = "/oratio/home"){

  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(()=>{
    if(location.key === "default"){
      navigate(fallback, { replace: true })
    }else{
      navigate(-1)
    }
  },[location.key, navigate, fallback])

}
