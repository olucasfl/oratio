import { useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles } from "lucide-react";

import styles from "./FraseDiaria.module.css";
import { useFraseDiaria } from "../../hooks/useFraseDiaria";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";
import { isLoggedIn } from "../../utils/auth";
import GuestGateModal from "../GuestGateModal/GuestGateModal";

/*
Frase do dia — agora um chip discreto perto da saudação. Toca e abre a
frase num modal. Continua sendo um ritual diário: a primeira abertura do
dia "resgata" a frase (bolinha de destaque some depois disso).
*/
export function FraseDiaria() {
  const { frase, resgatada, resgatar } = useFraseDiaria();
  const [aberta, setAberta] = useState(false);
  const [showGate, setShowGate] = useState(false);

  useLockBodyScroll(aberta);

  if (!frase) return null;

  function abrir() {
    if (!isLoggedIn()) {
      setShowGate(true);
      return;
    }
    if (!resgatada) resgatar();
    setAberta(true);
  }

  return (
    <>
      <button
        className={`${styles.chip} ${!resgatada ? styles.chipNovo : ""}`}
        onClick={abrir}
        aria-label="Ver a frase do dia"
      >
        <Sparkles size={14} className={styles.chipIcon} />
        <span>Frase</span>
        {!resgatada && <span className={styles.chipDot} aria-hidden="true" />}
      </button>

      {aberta &&
        createPortal(
          <div className={styles.overlay} onClick={() => setAberta(false)}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.close}
                onClick={() => setAberta(false)}
                aria-label="Fechar"
              >
                ✕
              </button>

              <span className={styles.kicker}>Frase do dia</span>
              <span className={styles.aspas}>“</span>
              <p className={styles.texto}>{frase.texto}</p>
              <span className={styles.autor}>
                — {frase.autor}
                {frase.referencia ? `, ${frase.referencia}` : ""}
              </span>
            </div>
          </div>,
          document.body
        )}

      <GuestGateModal
        open={showGate}
        message="Crie uma conta para pegar sua frase do dia, todos os dias."
        onClose={() => setShowGate(false)}
      />
    </>
  );
}
