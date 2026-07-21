import { useState } from "react";
import api from "../../services/api";
import AlertModal from "../AlertModal/AlertModal";
import { getAuthErrorMessage } from "../../utils/authErrors";

import styles from "./ResetPasswordModal.module.css";

export default function ResetPasswordModal({ token }:{ token:string }){

 const [password,setPassword] = useState("");
 const [confirm,setConfirm] = useState("");
 const [loading,setLoading] = useState(false);
 const [alertMessage,setAlertMessage] = useState<string | null>(null);
 const [redirectOnClose,setRedirectOnClose] = useState(false);

 async function reset(){

  if(!password || !confirm){
   setAlertMessage("Preencha todos os campos");
   return;
  }

  if(password !== confirm){
   setAlertMessage("Senhas não coincidem");
   return;
  }

  try{

   setLoading(true);

   await api.post("/auth/reset-password",{
    token,
    password
   });

   setRedirectOnClose(true);
   setAlertMessage("Senha alterada com sucesso!");

  }catch(err:any){

   setAlertMessage(getAuthErrorMessage(err, "Não foi possível redefinir sua senha. Tente novamente."));

  }finally{

   setLoading(false);

  }

 }

 function handleAlertClose(){

  setAlertMessage(null);

  if(redirectOnClose){
   window.location.href="/login";
  }

 }

 return(

  <div className={styles.overlay}>

   <div className={styles.modal}>

    <h2 className={styles.title}>
     Redefinir senha
    </h2>

    <input
     className={styles.input}
     type="password"
     placeholder="Nova senha"
     value={password}
     onChange={(e)=>setPassword(e.target.value)}
    />

    <input
     className={styles.input}
     type="password"
     placeholder="Confirmar senha"
     value={confirm}
     onChange={(e)=>setConfirm(e.target.value)}
    />

    <button
     className={styles.button}
     onClick={reset}
     disabled={loading}
    >
     {loading ? "Atualizando..." : "Atualizar senha"}
    </button>

   </div>

   <AlertModal
    open={!!alertMessage}
    message={alertMessage ?? ""}
    onClose={handleAlertClose}
   />

  </div>

 )

}
