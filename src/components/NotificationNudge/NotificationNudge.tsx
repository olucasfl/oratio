import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { Bell, X } from "lucide-react"

import styles from "./NotificationNudge.module.css"
import { isPushSupported, getPushStatus } from "../../services/pushService"

const KEY = "notif_nudge_last"
const EVERY_MS = 7 * 24 * 60 * 60 * 1000

/*
Convida quem NÃO ativou o push a ligar as notificações — no máximo uma
vez a cada 7 dias. Some pra sempre assim que a pessoa ativa. "Ativar"
leva ao Perfil com a opção em destaque (?notif=1).
*/
export default function NotificationNudge(){

  const navigate = useNavigate()
  const [show, setShow] = useState(false)

  useEffect(()=>{

    if(!isPushSupported()) return

    const last = Number(localStorage.getItem(KEY) || 0)
    if(Date.now() - last < EVERY_MS) return

    getPushStatus()
      .then((enabled)=>{ if(!enabled) setShow(true) })
      .catch(()=>{})

  },[])

  function dismiss(){
    localStorage.setItem(KEY, String(Date.now()))
    setShow(false)
  }

  function activate(){
    localStorage.setItem(KEY, String(Date.now()))
    setShow(false)
    navigate("/oratio/profile?notif=1")
  }

  if(!show) return null

  return createPortal(

    <div className={styles.wrap} onClick={dismiss}>

      <div className={styles.card} onClick={(e)=>e.stopPropagation()}>

        <button className={styles.close} onClick={dismiss} aria-label="Fechar">
          <X size={16}/>
        </button>

        <div className={styles.icon}><Bell size={22}/></div>

        <div className={styles.text}>
          <strong>Quer ser lembrado de rezar?</strong>
          <span>Ative as notificações e receba a liturgia, o santo do dia e lembretes — também fora do app.</span>
        </div>

        <div className={styles.actions}>
          <button className={styles.later} onClick={dismiss}>Agora não</button>
          <button className={styles.primary} onClick={activate}>Ativar</button>
        </div>

      </div>

    </div>,

    document.body

  )

}
