import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../../services/authService";
import ForgotPasswordModal from "../../components/ForgotPasswordModal/ForgotPasswordModal";
import ResetPasswordModal from "../../components/ResetPasswordModal/ResetPasswordModal";
import styles from "./Login.module.css";

export default function Login(){

const navigate = useNavigate();
const [searchParams] = useSearchParams();

const resetToken = searchParams.get("resetToken");

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [loading,setLoading] = useState(false);
const [forgotOpen,setForgotOpen] = useState(false);

async function handleSubmit(e:React.FormEvent){

e.preventDefault();
setLoading(true);

try{

await login(email,password);

navigate("/oratio/home");

}catch(err:any){

alert(err.response?.data?.message || "Erro ao fazer login");

}finally{

setLoading(false);

}

}

return(

<div className={styles.wrapper}>

<div className={styles.card}>

<h1 className={styles.logo}>ORATIO</h1>

<p className={styles.subtitle}>
Aplicativo de espiritualidade católica
</p>

<form onSubmit={handleSubmit} className={styles.form}>

<input
className={styles.input}
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
required
/>

<input
className={styles.input}
type="password"
placeholder="Senha"
value={password}
onChange={(e)=>setPassword(e.target.value)}
required
/>

<button className={styles.button} type="submit" disabled={loading}>
{loading ? "Entrando..." : "Entrar"}
</button>

</form>

<div
className={styles.forgot}
onClick={()=>setForgotOpen(true)}
>
Esqueci minha senha
</div>

<p className={styles.switch}>
Não possui conta?
<span onClick={()=>navigate("/register")}>
Criar conta
</span>
</p>

</div>

<ForgotPasswordModal
open={forgotOpen}
onClose={()=>setForgotOpen(false)}
/>

{resetToken && (
<ResetPasswordModal token={resetToken}/>
)}

</div>

);

}