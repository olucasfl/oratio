import { useState, useEffect } from "react";
import styles from "./FraseDiaria.module.css";
import { useFraseDiaria } from "../../hooks/useFraseDiaria";

export function FraseDiaria() {
  const { frase, resgatada, resgatar } = useFraseDiaria();
  const [visivel, setVisivel] = useState(false);

  // fecha o card automaticamente quando o usuário sai e volta à aba
  useEffect(() => {
    function aoVoltar() {
      if (document.visibilityState === "hidden") {
        setVisivel(false);
      }
    }
    document.addEventListener("visibilitychange", aoVoltar);
    return () => document.removeEventListener("visibilitychange", aoVoltar);
  }, []);

  if (!frase) return null;

  if (!resgatada) {
    return (
      <div className={styles.wrapper}>
        <button
          className={styles.btnChamativo}
          onClick={() => { resgatar(); setVisivel(true); }}
        >
          <span className={styles.icone}>"</span>
          Pegue sua frase do dia
        </button>
      </div>
    );
  }

  if (visivel) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.fraseCard}>
          <button className={styles.btnFechar} onClick={() => setVisivel(false)}>✕</button>
          <span className={styles.aspas}>"</span>
          <p className={styles.texto}>{frase.texto}</p>
          <span className={styles.autor}>
            — {frase.autor}
            {frase.referencia ? `, ${frase.referencia}` : ""}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <button className={styles.btnVer} onClick={() => setVisivel(true)}>
        <span className={styles.iconeVer}>"</span>
        Veja a sua frase
      </button>
    </div>
  );
}
