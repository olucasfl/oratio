import styles from "./AlertModal.module.css";

interface Props {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export default function AlertModal({
  open,
  title = "Aviso",
  message,
  onClose,
}: Props) {

  if (!open) return null;

  return (

    <div className={styles.overlay}>

      <div className={styles.modal}>

        <h2 className={styles.title}>{title}</h2>

        <p className={styles.message}>{message}</p>

        <button className={styles.button} onClick={onClose}>
          OK
        </button>

      </div>

    </div>

  );

}
