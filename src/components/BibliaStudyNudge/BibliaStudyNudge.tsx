import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { BookOpen, ChevronRight, Highlighter, Heart, NotebookPen, X } from "lucide-react"

import {
  isOverlayBlocking,
  markOverlayClosed,
  markOverlayOpen,
  subscribeOverlay,
} from "../../utils/overlayCoordinator"

import styles from "./BibliaStudyNudge.module.css"

const OVERLAY_ID = "biblia-estudo-nudge"

// `v1` pra poder "reabrir" o aviso no futuro só bumpando o sufixo, se um
// dia rolar outra leva grande de novidades na Bíblia.
const STORAGE_KEY = "biblia_estudo_nudge_v1"

type Props = {
  /**
   * A Home avisa quando já tem um modal dela na tela (boas-vindas, gate).
   * Não dá pra confiar só no coordenador de overlays: aqueles modais
   * nascem com `open=false` e só se registram num efeito posterior.
   */
  blocked?: boolean
}

/**
 * Aviso único (aparece uma vez e some pra sempre) das novas
 * funcionalidades de estudo da Bíblia: grifar com cores, favoritar,
 * anotar e montar coleções. Mesma lógica do aviso de estreia da
 * Quaresma — espera a tela ficar livre, fechar de qualquer jeito
 * conta como visto.
 */
export default function BibliaStudyNudge({ blocked = false }: Props) {

  const navigate = useNavigate()

  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {

    if (dismissed || blocked) return

    try {
      if (localStorage.getItem(STORAGE_KEY)) return
    } catch {
      return
    }

    let timer: ReturnType<typeof setTimeout>

    // Só entra quando a tela está livre — não sobe por cima de outro
    // popup (boas-vindas, gate, instalar o app, aviso da Quaresma).
    const tryShow = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (!isOverlayBlocking()) setShow(true)
      }, 450)
    }

    tryShow()
    const unsub = subscribeOverlay(tryShow)

    return () => {
      clearTimeout(timer)
      unsub()
    }

  }, [blocked, dismissed])

  useEffect(() => {
    if (show) markOverlayOpen(OVERLAY_ID)
    return () => markOverlayClosed(OVERLAY_ID)
  }, [show])

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    } catch {
      /* modo privado — o aviso volta na próxima, tudo bem */
    }
    markOverlayClosed(OVERLAY_ID)
    setDismissed(true)
    setShow(false)
  }

  function abrir() {
    dismiss()
    navigate("/oratio/biblia")
  }

  if (!show) return null

  return createPortal(

    <div className={styles.overlay} onClick={dismiss}>

      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <button className={styles.close} onClick={dismiss} aria-label="Fechar">
          <X size={16} />
        </button>

        <div className={styles.icon}>
          <BookOpen size={26} />
        </div>

        <span className={styles.kicker}>Novidade no Oratio</span>

        <h2 className={styles.title}>
          Agora dá para estudar a Bíblia
        </h2>

        <p className={styles.text}>
          A leitura ganhou um jeito seu: ajuste a fonte e o tema, grife
          versículos com cores, favorite e anote. E há uma área
          <strong> Minha Bíblia</strong> para juntar tudo em coleções de estudo.
        </p>

        <ul className={styles.features}>
          <li><Highlighter size={15} /> Grifar com cores</li>
          <li><Heart size={15} /> Favoritar</li>
          <li><NotebookPen size={15} /> Anotar e criar coleções</li>
        </ul>

        <button className={styles.primary} onClick={abrir}>
          Explorar a Bíblia
          <ChevronRight size={17} />
        </button>

        <button className={styles.later} onClick={dismiss}>
          Agora não
        </button>

      </div>

    </div>,

    document.body

  )

}
