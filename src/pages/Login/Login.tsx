import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { login, forgotPassword } from "../../services/authService";
import { getAuthErrorMessage } from "../../utils/authErrors";

import ForgotPasswordModal from "../../components/ForgotPasswordModal/ForgotPasswordModal";
import ResetPasswordModal from "../../components/ResetPasswordModal/ResetPasswordModal";

import styles from "./Login.module.css";

export default function Login() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const resetToken = searchParams.get("resetToken");

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
      navigate("/oratio/home");
    }

  }, [navigate]);

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

      navigate("/oratio/home");

    } catch (err: any) {

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

  async function handleForgotPassword(email: string){

    try{

      await forgotPassword(email);

      setForgotSuccess(true);
      setForgotOpen(false);

    }catch(err:any){

      setError(getAuthErrorMessage(err, "Não foi possível enviar o email. Tente novamente."));

    }

  }

  return (

    <div className={`${styles.wrapper} page-enter`}>

      <div className={styles.card}>

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

        <div
          className={styles.forgot}
          onClick={() => setForgotOpen(true)}
        >
          Esqueci minha senha
        </div>

        <p className={styles.switch}>
          Não possui conta?
          <span onClick={() => navigate("/register")}>
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