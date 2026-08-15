import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { ChevronRight, Swords, X } from "lucide-react"

import styles from "./QuaresmaNudge.module.css"

import { getQuaresmaWindow } from "../../data/quaresmaSaoMiguel"
import { withRedirect } from "../../utils/authRedirect"
import {
  markOverlayClosed,
  markOverlayOpen
} from "../../utils/overlayCoordinator"

const OVERLAY_ID = "quaresma-nudge"

/** Por ano, pra que a estreia do ano que vem apareça de novo. */
function storageKey(year: number) {
  return `oratio_quaresma_nudge_${year}`
}

type Props = {
  guest: boolean
  /**
   * A Home já sabe quando tem um modal seu na tela (boas-vindas, gate) e
   * diz aqui. Não dá pra confiar só no coordenador de overlays: aqueles
   * modais nascem com `open=false` e só se registram num efeito
   * posterior, então este aviso ganharia a corrida e apareceria por cima.
   */
  blocked?: boolean
}

/**
 * Aviso de estreia da Quaresma de São Miguel.
 *
 * Aparece na semana de abertura (15/08 e mais 6 dias) e some para sempre
 * assim que a pessoa o vê — fechar de qualquer jeito conta como visto.
 * Não sobe por cima de outro modal: espera a tela ficar livre.
 */
export default function QuaresmaNudge({ guest, blocked = false }: Props) {

  const navigate = useNavigate()

  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {

    if (dismissed || blocked) return

    const janela = getQuaresmaWindow()

    if (!janela.isAnnouncement) return
    if (localStorage.getItem(storageKey(janela.year))) return

    /* Só o `blocked` decide, e por isso o efeito depende dele: enquanto
       houver modal da Home na tela ele volta cedo; quando fecha, este
       efeito roda de novo e o aviso entra 350ms depois — o suficiente
       pra não parecer que um virou o outro.

       Nada de `subscribeOverlay` aqui: o cleanup dos outros modais
       esvazia o registro por um instante e notifica os ouvintes, e o
       aviso acabava aparecendo por cima justamente do modal que devia
       esperar. */
    const timer = setTimeout(() => setShow(true), 350)

    return () => clearTimeout(timer)

  }, [blocked, dismissed])

  useEffect(() => {
    if (show) markOverlayOpen(OVERLAY_ID)
    return () => markOverlayClosed(OVERLAY_ID)
  }, [show])

  function dismiss() {
    localStorage.setItem(storageKey(getQuaresmaWindow().year), String(Date.now()))
    markOverlayClosed(OVERLAY_ID)
    setDismissed(true)
    setShow(false)
  }

  function abrir() {
    dismiss()

    // Sem conta a devoção não salva progresso — leva pro cadastro já
    // apontando de volta pra Quaresma.
    navigate(guest ? withRedirect("/register", "/oratio/quaresma") : "/oratio/quaresma")
  }

  if (!show) return null

  return createPortal(

    <div className={styles.overlay} onClick={dismiss}>

      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <button className={styles.close} onClick={dismiss} aria-label="Fechar">
          <X size={16} />
        </button>

        <div className={styles.icon}>
          <Swords size={26} />
        </div>

        <span className={styles.kicker}>Começou em 15 de agosto</span>

        <h2 className={styles.title}>
          A Quaresma de São Miguel
        </h2>

        <p className={styles.text}>
          São 40 dias de oração e penitência até a Festa de São Miguel
          Arcanjo, em 29 de setembro. O Oratio está com uma tela nova só
          para isso: a oração de cada dia, seu progresso e suas penitências.
        </p>

        <button className={styles.primary} onClick={abrir}>
          Conhecer a Quaresma
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
