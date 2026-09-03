import { useLayoutEffect } from "react"
import { useLocation } from "react-router-dom"

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    // Telas que rolam num container próprio (overflow-y:auto), não na
    // janela — ex.: o <main> do chat do Vox. Sem isto, voltar pra elas
    // deixava o scroll preso onde estava.
    document
      .querySelectorAll<HTMLElement>("main, [data-scroll-reset]")
      .forEach((el) => {
        el.scrollTop = 0
      })
  }, [pathname])

  return null
}
