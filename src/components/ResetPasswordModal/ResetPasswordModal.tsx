import { useState } from "react";
import api from "../../services/api";

export default function ResetPasswordModal({ token }:{ token:string }){

  const [password,setPassword] = useState("");
  const [confirm,setConfirm] = useState("");

  async function reset(){

    if(password !== confirm){
      alert("Senhas não coincidem");
      return;
    }

    await api.post("/auth/reset-password",{
      token,
      password
    });

    alert("Senha alterada!");

    window.location.href="/login";

  }

  return(

    <div>

      <h2>Nova senha</h2>

      <input
        type="password"
        placeholder="Nova senha"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirmar senha"
        value={confirm}
        onChange={(e)=>setConfirm(e.target.value)}
      />

      <button onClick={reset}>
        Atualizar senha
      </button>

    </div>

  );

}