import { useState } from "react";
import api from "../../services/api";
import styles from "./ForgotPasswordModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ open, onClose }: Props) {

  const [email,setEmail] = useState("");

  if(!open) return null;

  async function sendReset(){

    try{

      await api.post("/auth/forgot-password",{ email });

      alert("Email enviado!");

      onClose();

    }catch{

      alert("Erro ao enviar email");

    }

  }

  return(

    <div className={styles.overlay}>

      <div className={styles.modal}>

        <h2>Recuperar senha</h2>

        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <button onClick={sendReset}>
          Enviar email
        </button>

        <button onClick={onClose}>
          Cancelar
        </button>

      </div>

    </div>

  );

}