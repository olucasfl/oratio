import { useEffect, useRef } from "react";

import { loadGsi } from "../../utils/loadGsi";
import type { GoogleCredentialResponse } from "../../utils/loadGsi";

import styles from "./GoogleSignInButton.module.css";

interface Props {
  /** Chamado com o id_token (JWT) quando o usuário conclui o fluxo do Google. */
  onCredential: (credential: string) => void;
  /** Texto do botão do Google. Default: "continue_with" ("Continuar com Google"). */
  text?: "signin_with" | "signup_with" | "continue_with";
  /** Enquanto true, cobre o botão com um spinner e ignora cliques (E6). */
  disabled?: boolean;
}

/*
Botão "Entrar com Google" do Google Identity Services.

- `ux_mode` fica no default ("popup") de propósito: um redirect de página
  inteira, num PWA instalado no iOS, joga a pessoa pro Safari e perde o
  contexto do app.
- `use_fedcm_for_button` liga a UX de FedCM no Chrome (a migração recomendada).
- Sem `VITE_GOOGLE_CLIENT_ID` configurado, não renderiza nada — o login por
  e-mail/senha continua normal.
- One Tap (`prompt()`) NÃO é usado: não aparece no Safari, e o botão renderizado
  é o caminho garantido em todo navegador.
*/
export default function GoogleSignInButton({ onCredential, text = "continue_with", disabled = false }: Props) {

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const containerRef = useRef<HTMLDivElement>(null);
  // GIS chama o callback fora do React; a ref evita reinicializar o botão só
  // porque o pai passou uma função nova a cada render.
  const onCredentialRef = useRef(onCredential);
  useEffect(() => {
    onCredentialRef.current = onCredential;
  });

  useEffect(() => {

    if (!clientId) return;

    let cancelled = false;

    loadGsi()
      .then((googleId) => {
        if (cancelled || !containerRef.current) return;

        googleId.initialize({
          client_id: clientId,
          callback: (res: GoogleCredentialResponse) => {
            if (res?.credential) onCredentialRef.current(res.credential);
          },
          use_fedcm_for_button: true,
          itp_support: true,
        });

        const width = Math.min(
          400,
          Math.max(240, Math.floor(containerRef.current.offsetWidth || 300)),
        );

        // limpa antes (StrictMode monta o efeito 2x em dev)
        containerRef.current.innerHTML = "";
        googleId.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text,
          shape: "pill",
          logo_alignment: "center",
          width,
          locale: "pt-BR",
        });
      })
      .catch(() => {
        // GSI não carregou (offline, CSP em produção antes da Fase D, bloqueio
        // de terceiros). O botão simplesmente não aparece; o login por senha
        // segue funcionando.
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, text]);

  if (!clientId) return null;

  return (
    <div className={styles.wrap}>
      <div ref={containerRef} className={styles.container} />
      {disabled && (
        <div
          className={styles.blocker}
          onClickCapture={(e) => e.stopPropagation()}
          aria-hidden="true"
        >
          <span className={styles.spinner} />
        </div>
      )}
    </div>
  );
}
