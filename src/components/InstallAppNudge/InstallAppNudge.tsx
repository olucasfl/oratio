import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"

import InstallAppModal from "../InstallAppModal/InstallAppModal"
import { isPWA } from "../../utils/isPwa"
import { wasInstalled } from "../../utils/installPrompt"
import { isOverlayBlocking } from "../../utils/overlayCoordinator"

const STORAGE_LAST_SHOWN = "install_nudge_last_shown_at"
const STORAGE_SCREENS_SINCE = "install_nudge_screens_since"

// "De vez em quando", não repetitivo: só reconsidera depois de um
// tempo mínimo E de a pessoa ter navegado por algumas telas — as duas
// condições juntas, não só o relógio. Pode repetir no mesmo dia, mas
// não a cada tela.
const COOLDOWN_MS = 3 * 60 * 60 * 1000
const SCREENS_THRESHOLD = 3
const SHOW_DELAY_MS = 4000

const SKIP_ROUTES = [
  "/login",
  "/register",
  "/verificar-email",
  "/confirmar-troca-email"
]

/*
Mesma pergunta de "adicionar à tela de início" do passo 2 do aviso de
convidado, mas independente dele: mostrada em qualquer tela e pra
qualquer pessoa (com ou sem conta), num ritmo espaçado em vez de toda
hora. Fica sempre montado (ver App.tsx) e decide sozinho quando vale a
pena aparecer.
*/
export default function InstallAppNudge(){

  const location = useLocation()
  const [open, setOpen] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {

    const seen = Number(localStorage.getItem(STORAGE_SCREENS_SINCE) || "0") + 1
    localStorage.setItem(STORAGE_SCREENS_SINCE, String(seen))

    if (timerRef.current) clearTimeout(timerRef.current)

    if (isPWA()) return
    if (wasInstalled()) return
    if (SKIP_ROUTES.includes(location.pathname)) return

    const lastShown = Number(localStorage.getItem(STORAGE_LAST_SHOWN) || "0")
    const cooldownOk = Date.now() - lastShown >= COOLDOWN_MS
    const screensOk = seen >= SCREENS_THRESHOLD

    if (!cooldownOk || !screensOk) return

    timerRef.current = setTimeout(() => {

      // outro aviso (boas-vindas, gate de conta) já está na tela —
      // não empilha, só tenta de novo na próxima navegação
      if (isOverlayBlocking()) return

      setOpen(true)
      localStorage.setItem(STORAGE_LAST_SHOWN, String(Date.now()))
      localStorage.setItem(STORAGE_SCREENS_SINCE, "0")

    }, SHOW_DELAY_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }

  }, [location.pathname])

  return <InstallAppModal open={open} onClose={() => setOpen(false)} />

}
