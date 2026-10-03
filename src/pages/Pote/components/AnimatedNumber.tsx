import { useEffect, useRef, useState } from "react"

const DURATION_MS = 600

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

const ease = (t: number) => 1 - Math.pow(1 - t, 3) // easeOutCubic

/*
 Número que "rola" até o novo valor (placar de Diversão/Vida). Só anima a diferença a
 partir do que está na tela — nunca do zero a cada render — e vira troca
 instantânea para quem pediu movimento reduzido.
*/
export default function AnimatedNumber({ value }: { value: number }) {
  const [shown, setShown] = useState(value)
  const shownRef = useRef(value)

  useEffect(() => {
    if (shownRef.current === value) return
    if (prefersReducedMotion()) {
      shownRef.current = value
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza o valor exibido com a prop
      setShown(value)
      return
    }
    const from = shownRef.current
    const start = performance.now()
    let raf = 0
    const step = () => {
      // performance.now() (não o carimbo do rAF): mesma origem do `start` em qualquer ambiente
      const t = Math.min(1, (performance.now() - start) / DURATION_MS)
      const next = Math.round(from + (value - from) * ease(t))
      shownRef.current = next
      setShown(next)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{shown}</span>
}
