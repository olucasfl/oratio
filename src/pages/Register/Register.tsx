import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { register } from "../../services/authService";
import { getAuthErrorMessage } from "../../utils/authErrors";
import { withRedirect } from "../../utils/authRedirect";
import VerifyEmailModal from "../../components/VerifyEmailModal/VerifyEmailModal";
import AlertModal from "../../components/AlertModal/AlertModal";
import styles from "./Register.module.css";

export default function Register(){

const navigate = useNavigate();
const [searchParams] = useSearchParams();
const redirect = searchParams.get("redirect");
const loginDestination = redirect ? withRedirect("/login", redirect) : "/login";

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [confirmPassword,setConfirmPassword] = useState("");

const [loading,setLoading] = useState(false);
const [verifyOpen,setVerifyOpen] = useState(false);
const [registeredEmail,setRegisteredEmail] = useState("");
const [alertMessage,setAlertMessage] = useState<string | null>(null);
const [openVerifyAfterAlert,setOpenVerifyAfterAlert] = useState(false);

async function handleSubmit(e:React.FormEvent){

e.preventDefault();
setLoading(true);

try{

const data = await register(name,email,password,confirmPassword);

setRegisteredEmail(email);

if(data?.emailSent === false){
 setOpenVerifyAfterAlert(true)
 setAlertMessage("Sua conta foi criada, mas não conseguimos enviar o email de verificação agora. Use o botão \"Reenviar email\" na próxima tela.")
}else{
 setVerifyOpen(true);
}

}catch(err:any){

setAlertMessage(getAuthErrorMessage(err, "Não foi possível criar sua conta. Tente novamente."));

}finally{

setLoading(false);

}

}

return(

<div className={`${styles.wrapper} page-enter`}>

<div className={styles.card}>

<button
type="button"
className={styles.backButton}
onClick={()=>navigate("/oratio/home")}
>
<ChevronLeft size={18} />
Continuar sem conta
</button>

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
<span onClick={()=>navigate(loginDestination)}>
Entrar
</span>
</p>

</div>

<VerifyEmailModal
email={registeredEmail}
open={verifyOpen}
onVerified={()=>navigate(loginDestination)}
onClose={()=>setVerifyOpen(false)}
/>

<AlertModal
open={!!alertMessage}
message={alertMessage ?? ""}
onClose={()=>{
 setAlertMessage(null)
 if(openVerifyAfterAlert){
  setOpenVerifyAfterAlert(false)
  setVerifyOpen(true)
 }
}}
/>

</div>

);

}