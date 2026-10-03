import { useEffect, useState } from "react"
import type { RoomView } from "../../services/poteService"

/* Tempo restante da rodada 2, a partir do relógio do SERVIDOR. Pausada: o valor
   congelado que o servidor guardou. Sem rodada 2 ativa: null. */
export function round2Remaining(room: RoomView, now: number): number | null {
  if (room.phase !== "ROUND_2") return null
  if (room.isPaused) return room.round2RemainingMs ?? 0
  if (!room.round2EndsAt) return null
  return Math.max(0, new Date(room.round2EndsAt).getTime() - now)
}

export default function useRound2Clock(room: RoomView | undefined, now: () => number) {
  const [, force] = useState(0)

  useEffect(() => {
    if (!room || room.phase !== "ROUND_2" || room.isPaused) return
    const id = setInterval(() => force((n) => n + 1), 250)
    return () => clearInterval(id)
  }, [room])

  return room ? round2Remaining(room, now()) : null
}

export function formatClock(ms: number | null): string {
  if (ms === null) return "--:--"
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, "0")}`
}
