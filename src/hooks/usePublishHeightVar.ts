import { useEffect } from "react"

// Mede a altura real de um elemento (measureRef) e publica como
// variável CSS custom property num alvo (targetRef) — usado pra
// reservar espaço em áreas de scroll atrás de barras position:fixed
// cuja altura varia com o conteúdo (nº de linhas, breakpoint etc.),
// em vez de assumir um valor fixo que fica errado em algum caso.
export function usePublishHeightVar(
  measureRef: React.RefObject<HTMLElement | null>,
  targetRef: React.RefObject<HTMLElement | null>,
  varName: string
) {
  useEffect(() => {
    const measure = measureRef.current
    const target = targetRef.current
    if (!measure || !target) return

    const sync = () => {
      target.style.setProperty(varName, `${measure.offsetHeight}px`)
    }

    sync()

    const observer = new ResizeObserver(sync)
    observer.observe(measure)

    return () => observer.disconnect()
  }, [measureRef, targetRef, varName])
}
