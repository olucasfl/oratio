import { useState } from "react"
import type { MouseEvent as ReactMouseEvent } from "react"
import { Share2, Check } from "lucide-react"
import styles from "./ShareReadingButton.module.css"
import { resyncViewport } from "../../hooks/useVisualViewportOffset"

interface Props {
  label: string
  buildText: () => string
  compact?: boolean
  onStopPropagation?: boolean
}

/*
navigator.share() abre a folha nativa de compartilhamento (WhatsApp,
Instagram, o que estiver instalado) — é o que existe pra isso, não dá
pra "escolher o app" sem passar por ela. Onde não existe (a maioria
dos navegadores de desktop), cai pra copiar o texto formatado, com
feedback visual de que copiou.
*/
export default function ShareReadingButton({
  label,
  buildText,
  compact = false,
  onStopPropagation = false
}: Props) {

  const [copied, setCopied] = useState(false)

  async function handleShare(e: ReactMouseEvent) {

    if (onStopPropagation) e.stopPropagation()

    const text = buildText()

    if (navigator.share) {
      try {
        await navigator.share({ text })
        return
      } catch (err: any) {
        if (err?.name === "AbortError") return // usuário cancelou a folha — não é erro
        // qualquer outro erro (ex: share não suportado nesse contexto) cai no fallback abaixo
      } finally {
        // A folha nativa deixa o viewport "preso" por um tempo (navbar
        // bugando). Releitura em rajada pra ela reassentar sem esperar
        // fechar/abrir o app.
        resyncViewport()
      }
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // nem share nem clipboard disponíveis — não há mais nada a oferecer
    }

  }

  if (compact) {
    return (
      <button
        type="button"
        className={styles.shareBtnCompact}
        onClick={handleShare}
        aria-label={`Compartilhar ${label}`}
      >
        {copied ? <Check size={15} /> : <Share2 size={15} />}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={styles.shareBtn}
      onClick={handleShare}
    >
      {copied ? <Check size={17} /> : <Share2 size={17} />}
      {copied ? "Copiado!" : `Compartilhar ${label}`}
    </button>
  )

}
