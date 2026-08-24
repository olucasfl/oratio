import { useEffect, useState } from "react";
import api from "../../services/api";
import styles from "./VerifyEmailModal.module.css";

interface Props {
  email: string;
  open: boolean;
  onVerified: () => void;
  onClose: () => void;
}

export default function VerifyEmailModal({
  email,
  open,
  onVerified,
  onClose,
}: Props) {

  const [status, setStatus] = useState("waiting");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {

    if (!open) return;

    setStatus("waiting");
    setResendMessage("");

  }, [open]);

  useEffect(() => {

    if (!open) return;

    const interval = setInterval(async () => {

      try {

        const response = await api.get("/auth/check-verification", {
          params: { email },
        });

        if (response.data.verified) {

          setStatus("verified");

          setTimeout(() => {
            onVerified();
          }, 1500);

        }

      } catch { /* poll continua na próxima rodada, sem UI de erro dedicada */ }

    }, 3000);

    return () => clearInterval(interval);

  }, [open, email]);

  async function handleResend() {

    setResending(true);
    setResendMessage("");

    try {

      await api.post("/auth/resend-verification", { email });

      setResendMessage("Email reenviado! Confira sua caixa de entrada.");

    } catch {

      setResendMessage("Não foi possível reenviar agora. Tente novamente em instantes.");

    } finally {

      setResending(false);

    }

  }

  if (!open) return null;

  return (

    <div className={styles.overlay}>

      <div className={styles.modal}>

        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>

        {status === "waiting" && (
          <>
            <div className={styles.spinner}></div>

            <h2>Verifique seu email</h2>

            <p>Enviamos um link de verificação para:</p>

            <strong>{email}</strong>

            <p className={styles.sub}>
              Abra o email e clique no link para continuar.
            </p>

            <button
              className={styles.resendButton}
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Reenviando..." : "Reenviar email"}
            </button>

            {resendMessage && (
              <p className={styles.resendMessage}>{resendMessage}</p>
            )}
          </>
        )}

        {status === "verified" && (
          <>
            <div className={styles.success}>✓</div>

            <h2>Email verificado!</h2>

            <p>Redirecionando para login...</p>
          </>
        )}

      </div>

    </div>

  );
}
