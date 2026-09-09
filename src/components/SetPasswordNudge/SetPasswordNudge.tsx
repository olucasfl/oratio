import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";

import { getProfile } from "../../services/profileService";
import styles from "./SetPasswordNudge.module.css";

const DISMISS_KEY = "set_password_nudge_dismissed";

const SKIP_ROUTES = [
  "/login",
  "/register",
  "/verificar-email",
  "/confirmar-troca-email",
];

/*
Aviso DISPENSÁVEL para quem entrou só pelo Google e ainda não tem senha —
sugere "Definir senha" nas Configurações da conta, para também poder entrar
sem o Google (spec login-google §"Fase E → E1", consequência b).

- Nunca é modal: uma barra fina no topo, com um "x" que fecha pra sempre NA
  SESSÃO (sessionStorage). Reaparecer num próximo login é aceitável e até um
  lembrete brando.
- Só para conta autenticada com hasPassword: false. Sem token, não busca nada.
- Não aparece nas telas de auth.
*/
export default function SetPasswordNudge() {
  const location = useLocation();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) return;

    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* modo privado — trata como não dispensado */
    }
    if (dismissed) return;

    let active = true;
    getProfile()
      .then((profile: { hasPassword?: boolean }) => {
        if (active && profile?.hasPassword === false) setShow(true);
      })
      .catch(() => {
        /* best-effort, sem UI de erro — é só um aviso */
      });

    return () => {
      active = false;
    };
  }, []);

  function dismiss() {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;
  if (SKIP_ROUTES.some((r) => location.pathname.startsWith(r))) return null;

  return createPortal(
    <div className={styles.bar} role="status">
      <span className={styles.text}>
        Defina uma senha para também entrar sem o Google.
      </span>
      <button
        className={styles.action}
        onClick={() => {
          dismiss();
          navigate("/oratio/profile/settings");
        }}
      >
        Definir senha
      </button>
      <button className={styles.close} onClick={dismiss} aria-label="Dispensar">
        <X size={15} />
      </button>
    </div>,
    document.body,
  );
}
