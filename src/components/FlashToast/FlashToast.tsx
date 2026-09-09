import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";

import { readFlash } from "../../utils/flash";
import styles from "./FlashToast.module.css";

/*
Mostra a mensagem "flash" (utils/flash.ts) da navegação atual e some sozinho.
Montado no App fora das Routes — sobrevive ao navigate() que dispara o flash.
Hoje só o E4 do login com Google usa isto ("Sua conta Google foi conectada").
*/
export default function FlashToast() {
  const location = useLocation();
  const [message, setMessage] = useState<string | null>(null);

  // a cada troca de rota, consome uma mensagem pendente (se houver). O
  // setState vai num microtask pra não ser síncrono dentro do effect.
  useEffect(() => {
    const pending = readFlash();
    if (!pending) return;
    const id = setTimeout(() => setMessage(pending), 0);
    return () => clearTimeout(id);
  }, [location.pathname]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return createPortal(
    <div className={styles.toast} role="status">
      {message}
    </div>,
    document.body,
  );
}
