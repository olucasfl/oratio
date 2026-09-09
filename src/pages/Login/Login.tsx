import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { login, loginWithGoogle, forgotPassword } from "../../services/authService";
import { persistSession } from "../../services/api";
import { getAuthErrorMessage } from "../../utils/authErrors";
import { setFlash } from "../../utils/flash";
import { withRedirect } from "../../utils/authRedirect";

import ForgotPasswordModal from "../../components/ForgotPasswordModal/ForgotPasswordModal";
import ResetPasswordModal from "../../components/ResetPasswordModal/ResetPasswordModal";
import GoogleSignInButton from "../../components/GoogleSignInButton/GoogleSignInButton";

import styles from "./Login.module.css";

export default function Login() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const resetToken = searchParams.get("resetToken");
  const redirect = searchParams.get("redirect");
  const destination = redirect || "/oratio/home";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  /*
  ============================
  SE JÁ ESTIVER LOGADO
  ============================
  */

  useEffect(() => {

    const token = localStorage.getItem("access_token");

    if (token) {
      navigate(destination);
    }

  }, [navigate, destination]);

  /*
  ============================
  LOGIN
  ============================
  */

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {

    e.preventDefault();
    setLoading(true);
    setError(null);

    try {

      await login(email, password);

      navigate(destination);

    } catch (err) {

      setError(getAuthErrorMessage(err, "Não foi possível entrar. Tente novamente."));

    } finally {

      setLoading(false);

    }

  }

  /*
  ============================
  FORGOT PASSWORD
  ============================
  */

  async function handleGoogleCredential(credential: string) {

    setLoading(true);
    setError(null);

    try {

      // Na tela de login, os três desfechos entram: a intenção é entrar, e
      // entrar é o que acontece (spec login-google §"Fase E → E3"). O
      // loginWithGoogle não persiste sozinho — a tela decide.
      const result = await loginWithGoogle(credential);

      persistSession(result.access_token, result.refresh_token);

      if (result.googleLinkedNow) {
        // auto-ligação silenciosa: a ÚNICA vez que a pessoa é avisada que a
        // identidade Google foi ligada à conta dela (não há tela de
        // desvincular no v1) — spec login-google §"Fase E → E4".
        setFlash("Sua conta Google foi conectada à sua conta Oratio.");
      }

      navigate(destination);

    } catch (err) {

      setError(getAuthErrorMessage(err, "Não foi possível entrar com o Google. Tente novamente."));

    } finally {

      setLoading(false);

    }

  }

  async function handleForgotPassword(email: string){

    try{

      await forgotPassword(email);

      setForgotSuccess(true);
      setForgotOpen(false);

    }catch(err){

      setError(getAuthErrorMessage(err, "Não foi possível enviar o email. Tente novamente."));

    }

  }

  return (

    <div className={`${styles.wrapper} page-enter`}>

      <div className={styles.card}>

        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/oratio/home")}
        >
          <ChevronLeft size={18} />
          Continuar sem conta
        </button>

        <h1 className={styles.logo}>ORATIO</h1>

        <p className={styles.subtitle}>
          Aplicativo de espiritualidade católica
        </p>

        {error && (
          <p className={styles.errorMsg}>{error}</p>
        )}

        {forgotSuccess && (
          <p className={styles.successMsg}>
            Enviaremos um email para redefinir sua senha.
          </p>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>

          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null) }}
            required
          />

          <input
            className={styles.input}
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null) }}
            required
          />

          <button
            className={styles.button}
            type="submit"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

        </form>

        <div className={styles.divider}><span>ou</span></div>

        <GoogleSignInButton onCredential={handleGoogleCredential} />

        <div
          className={styles.forgot}
          onClick={() => setForgotOpen(true)}
        >
          Esqueci minha senha
        </div>

        <p className={styles.switch}>
          Não possui conta?
          <span onClick={() => navigate(redirect ? withRedirect("/register", redirect) : "/register")}>
            Criar conta
          </span>
        </p>

      </div>

      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onSubmit={handleForgotPassword}
      />

      {resetToken && (
        <ResetPasswordModal token={resetToken} />
      )}

    </div>

  );

}