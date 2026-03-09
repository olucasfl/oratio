import { useEffect, useState } from "react";
import api from "../../services/api";
import styles from "./VerifyEmailModal.module.css";

interface Props {
  email: string;
  open: boolean;
  onVerified: () => void;
}

export default function VerifyEmailModal({
  email,
  open,
  onVerified,
}: Props) {

  const [status, setStatus] = useState("waiting");

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

      } catch {}

    }, 3000);

    return () => clearInterval(interval);

  }, [open]);

  if (!open) return null;

  return (

    <div className={styles.overlay}>

      <div className={styles.modal}>

        {status === "waiting" && (
          <>
            <div className={styles.spinner}></div>

            <h2>Verifique seu email</h2>

            <p>Enviamos um link de verificação para:</p>

            <strong>{email}</strong>

            <p className={styles.sub}>
              Abra o email e clique no link para continuar.
            </p>
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