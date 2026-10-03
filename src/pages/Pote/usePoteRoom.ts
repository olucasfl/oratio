import { useCallback, useEffect, useRef, useState } from "react"
import {
  getRoom,
  poteErrorMessage,
  poteErrorStatus,
  type RoomState,
} from "../../services/poteService"

export type RoomError = "forbidden" | "notfound" | null

const POLL_MS = 1000
const POLL_MS_TERMINAL = 5000
const POLL_MS_AFTER_ERROR = 3000

/*
 Estado da sala por polling (sem WebSocket — spec pote.md). Cada resposta traz
 `version`; mandamos `?since=` e o servidor responde `{changed:false}` quando
 nada mudou. Toda ação devolve o estado completo e passa por `apply`, sem
 esperar o próximo ciclo.

 `now()` é o relógio do SERVIDOR (offset medido no último `serverNow`): os
 timers da rodada 2 não dependem do relógio do celular.
*/
export default function usePoteRoom(code: string) {
  const [data, setData] = useState<RoomState | null>(null)
  const [error, setError] = useState<RoomError>(null)
  const sinceRef = useRef<number | undefined>(undefined)
  const offsetRef = useRef(0)

  const apply = useCallback((next: RoomState) => {
    // Respostas de ação e de polling podem se cruzar: nunca voltar no tempo.
    if (sinceRef.current !== undefined && next.version < sinceRef.current) return
    sinceRef.current = next.version
    offsetRef.current = new Date(next.room.serverNow).getTime() - Date.now()
    setData(next)
    setError(null)
  }, [])

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined

    const tick = async () => {
      let delay = POLL_MS
      try {
        const res = await getRoom(code, sinceRef.current)
        if (!active) return
        if (res.changed) apply(res)
        else sinceRef.current = res.version
        if (res.changed && (res.room.phase === "ENDED" || res.room.phase === "CANCELLED")) {
          delay = POLL_MS_TERMINAL
        }
      } catch (err) {
        if (!active) return
        const status = poteErrorStatus(err)
        if (status === 403) {
          setError("forbidden")
          return // sem convite: não adianta insistir
        }
        if (status === 404) {
          setError("notfound")
          return
        }
        delay = POLL_MS_AFTER_ERROR // rede caiu: segue tentando, o estado fica o último bom
      }
      if (active) timer = setTimeout(tick, delay)
    }

    sinceRef.current = undefined
    tick()
    return () => {
      active = false
      if (timer) clearTimeout(timer)
    }
  }, [code, apply])

  /** Roda uma ação; devolve a mensagem de erro (ou null se deu certo). */
  const act = useCallback(
    async (fn: () => Promise<RoomState>): Promise<string | null> => {
      try {
        apply(await fn())
        return null
      } catch (err) {
        return poteErrorMessage(err)
      }
    },
    [apply],
  )

  const now = useCallback(() => Date.now() + offsetRef.current, [])

  return { data, error, apply, act, now }
}
