import { useState } from "react";
import styles from "./ForgotPasswordModal.module.css";

interface Props{
 open:boolean
 onClose:()=>void
 onSubmit:(email:string)=>void
}

export default function ForgotPasswordModal({
 open,
 onClose,
 onSubmit
}:Props){

 const [email,setEmail] = useState("");

 if(!open) return null;

 function handleSubmit(){
  if(!email) return;
  onSubmit(email);
 }

 return(

  <div className={styles.overlay}>

   <div className={styles.modal}>

    <h2>Recuperar senha</h2>

    <input
     className={styles.input}
     type="email"
     placeholder="Digite seu email"
     value={email}
     onChange={(e)=>setEmail(e.target.value)}
    />

    <button
     className={styles.buttonPrimary}
     onClick={handleSubmit}
    >
     Enviar email
    </button>

    <button
     className={styles.buttonSecondary}
     onClick={onClose}
    >
     Cancelar
    </button>

   </div>

  </div>

 )

}