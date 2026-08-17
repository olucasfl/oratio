import { createPortal } from "react-dom";
import styles from "./ConfirmModal.module.css";

interface Props {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title = "Confirmar ação",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onCancel,
}: Props) {

  if (!open) return null;

  // Portal pro body: se renderizasse dentro da página, herdaria qualquer
  // regra de posicionamento dela (ex.: ".container > *" que algumas
  // páginas usam pra empilhar conteúdo acima de um fundo decorativo) e o
  // position:fixed do overlay parava de valer — o modal ficava preso no
  // topo do fluxo normal em vez de centralizado na tela.
  return createPortal(

    <div className={styles.overlay}>

      <div className={styles.modal}>

        <h2 className={styles.title}>{title}</h2>

        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>

          <button className={styles.cancelButton} onClick={onCancel}>
            {cancelLabel}
          </button>

          <button
            className={danger ? styles.dangerButton : styles.confirmButton}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>

        </div>

      </div>

    </div>,

    document.body

  );

}
