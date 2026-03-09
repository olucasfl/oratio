import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/authService";
import VerifyEmailModal from "../../components/VerifyEmailModal/VerifyEmailModal";
import styles from "./Register.module.css";

export default function Register(){

const navigate = useNavigate();

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [confirmPassword,setConfirmPassword] = useState("");

const [loading,setLoading] = useState(false);
const [verifyOpen,setVerifyOpen] = useState(false);
const [registeredEmail,setRegisteredEmail] = useState("");

async function handleSubmit(e:React.FormEvent){

e.preventDefault();
setLoading(true);

try{

await register(name,email,password,confirmPassword);

setRegisteredEmail(email);
setVerifyOpen(true);

}catch(err:any){

alert(err.response?.data?.message || "Erro ao registrar");

}finally{

setLoading(false);

}

}

return(

<div className={styles.wrapper}>

<div className={styles.card}>

<h1 className={styles.logo}>ORATIO</h1>

<form onSubmit={handleSubmit} className={styles.form}>

<input
className={styles.input}
type="text"
placeholder="Nome"
value={name}
onChange={(e)=>setName(e.target.value)}
required
/>

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

<input
className={styles.input}
type="password"
placeholder="Confirmar senha"
value={confirmPassword}
onChange={(e)=>setConfirmPassword(e.target.value)}
required
/>

<button className={styles.button} type="submit" disabled={loading}>
{loading ? "Criando..." : "Criar conta"}
</button>

</form>

<p className={styles.switch}>
Já possui conta?
<span onClick={()=>navigate("/login")}>
Entrar
</span>
</p>

</div>

<VerifyEmailModal
email={registeredEmail}
open={verifyOpen}
onVerified={()=>navigate("/login")}
/>

</div>

);

}