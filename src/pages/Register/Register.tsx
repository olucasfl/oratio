import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { register, loginWithGoogle, discardGoogleSession } from "../../services/authService";
import { persistSession } from "../../services/api";
import { acceptLegalTerms, getProfile, type UserProfile } from "../../services/profileService";
import { getAuthErrorMessage } from "../../utils/authErrors";
import { withRedirect } from "../../utils/authRedirect";
import VerifyEmailModal from "../../components/VerifyEmailModal/VerifyEmailModal";
import AlertModal from "../../components/AlertModal/AlertModal";
import GoogleSignInButton from "../../components/GoogleSignInButton/GoogleSignInButton";
import LegalConsentGate from "../../components/LegalConsentGate/LegalConsentGate";
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
const [legalTermsAccepted,setLegalTermsAccepted] = useState(false);
const [gateOpen,setGateOpen] = useState(false);
const [gateAction,setGateAction] = useState<"register" | "google">("register");
const [googleConsentProfile,setGoogleConsentProfile] = useState<UserProfile | null>(null);
const [googleConsentRetry,setGoogleConsentRetry] = useState(false);

const [loading,setLoading] = useState(false);
const [verifyOpen,setVerifyOpen] = useState(false);
const [registeredEmail,setRegisteredEmail] = useState("");
const [alertMessage,setAlertMessage] = useState<string | null>(null);
const [openVerifyAfterAlert,setOpenVerifyAfterAlert] = useState(false);
const [goToLoginAfterAlert,setGoToLoginAfterAlert] = useState(false);

async function handleGoogleCredential(credential:string){

setLoading(true);

try{

const result = await loginWithGoogle(credential);

if(!result.isNewUser){
 /*
 A pessoa já tem conta no Oratio. O backend emitiu tokens, mas NÃO vamos
 adotar a sessão: "cadastrar" quem já existe seria mentira (spec login-google
 §"Fase E → E3"). Descarta a sessão órfã (senão vira dispositivo fantasma em
 "sessões ativas") e manda pro login.
 */
 await discardGoogleSession(result.refresh_token);
 setGoToLoginAfterAlert(true);
 setAlertMessage(
  result.googleLinkedNow
   // auto-ligação aconteceu agora, pela tela de cadastro: avisa que ligou
   // (E4 — única chance) E manda pro login (E3).
   ? "Conectamos sua conta Google à sua conta Oratio. Agora entre pela tela de login."
   : "Você já tem conta no Oratio. Entre pela tela de login."
 );
 return;
}

// cadastro novo via Google → guia de boas-vindas direto (evita o flash da
// Home antes do WelcomeGate). A visibilidade real é do `showWelcome` —
// spec boas-vindas.
persistSession(result.access_token, result.refresh_token);

try{
 await acceptLegalTerms();
}catch{
 const profile = await getProfile().catch(()=>null);
 setGoogleConsentProfile(profile);
 setGoogleConsentRetry(true);
 return;
}

navigate("/oratio/boas-vindas");

}catch(err){

setAlertMessage(getAuthErrorMessage(err, "Não foi possível entrar com o Google. Tente novamente."));

}finally{

setLoading(false);

}

}

async function submitRegistration(){

setLoading(true);

try{

const data = await register(name,email,password,confirmPassword,true);

setRegisteredEmail(email);

if(data?.emailSent === false){
 setOpenVerifyAfterAlert(true)
 setAlertMessage("Sua conta foi criada, mas não conseguimos enviar o email de verificação agora. Use o botão \"Reenviar email\" na próxima tela.")
}else{
 setVerifyOpen(true);
}

}catch(err){

setAlertMessage(getAuthErrorMessage(err, "Não foi possível criar sua conta. Tente novamente."));

}finally{

setLoading(false);

}

}

async function handleSubmit(e:React.FormEvent){

e.preventDefault();

if(!legalTermsAccepted){
 setGateAction("register");
 setGateOpen(true);
 return;
}

await submitRegistration();

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

<div className={styles.divider}><span>ou</span></div>

<div style={{ position: "relative" }}>
 <GoogleSignInButton onCredential={handleGoogleCredential} disabled={loading || !legalTermsAccepted} />
 {!legalTermsAccepted && (
  <button
   type="button"
   aria-label="Aceitar termos para continuar com Google"
   style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
  onClick={()=>{
   setGateAction("google")
   setGateOpen(true)
  }}
  />
 )}
</div>

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
 if(goToLoginAfterAlert){
  setGoToLoginAfterAlert(false)
  navigate(loginDestination)
 }
}}
/>

{gateOpen && (
 <LegalConsentGate
  mode="pre-account"
  onAccept={()=>{
   setLegalTermsAccepted(true)
   setGateOpen(false)
  if(gateAction === "register") void submitRegistration()
  }}
  onDecline={()=>setGateOpen(false)}
 />
)}

{googleConsentRetry && (
 <LegalConsentGate
  mode="post-account"
  userEmail={googleConsentProfile?.email ?? ""}
  hasPassword={googleConsentProfile?.hasPassword ?? false}
  hasGoogle={googleConsentProfile?.hasGoogle ?? true}
  onAccept={()=>{
   setGoogleConsentProfile(null)
   setGoogleConsentRetry(false)
   navigate("/oratio/boas-vindas")
  }}
  onDecline={()=>{}}
 />
)}

</div>

);

}