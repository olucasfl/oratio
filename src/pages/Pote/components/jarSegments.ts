import { ITEM_BY_ID } from "../domain/catalog"
import { EMPTY_JAR, place, type JarState } from "../domain/rules"

interface Segment {
  id: string
  category: "PEDRA" | "CASCALHO" | "AREIA"
  height: number
  negative: boolean
}

/*
 O pote é desenhado a partir da MESMA lista ordenada que o servidor usa: cada
 item soma à pilha só o espaço livre que consumiu. Quem coube nos vãos entre as
 pedras (delta 0) não cresce a pilha — é contado na legenda ("encaixados nos
 vãos"), que é exatamente a lição da rodada 2.
*/
export function jarSegments(placed: readonly string[]) {
  let state: JarState = EMPTY_JAR
  let inGaps = 0
  const segments: Segment[] = []
  for (const id of placed) {
    const item = ITEM_BY_ID[id]
    if (!item) continue
    const result = place(state, id, item.category)
    const height = state.free - result.state.free
    if (result.usedGap && height === 0) inGaps += 1
    if (height > 0) {
      segments.push({ id, category: item.category, height, negative: item.life < 0 })
    }
    state = result.state
  }
  return { segments, inGaps, state }
}

