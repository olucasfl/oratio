import { useState } from "react";
import api from "../../services/api";

import styles from "./ResetPasswordModal.module.css";

export default function ResetPasswordModal({ token }:{ token:string }){

 const [password,setPassword] = useState("");
 const [confirm,setConfirm] = useState("");
 const [loading,setLoading] = useState(false);

 async function reset(){

  if(!password || !confirm){
   alert("Preencha todos os campos");
   return;
  }

  if(password !== confirm){
   alert("Senhas não coincidem");
   return;
  }

  try{

   setLoading(true);

   await api.post("/auth/reset-password",{
    token,
    password
   });

   alert("Senha alterada com sucesso!");

   window.location.href="/login";

  }catch(err:any){

   alert(err?.response?.data?.message || "Erro ao redefinir senha");

  }finally{

   setLoading(false);

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

  </div>

 )

}