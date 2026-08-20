import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import styles from "./ErrorBoundary.module.css";

interface Props {
  children: ReactNode;
  /*
  Quando fornecido, é chamado no lugar do reload de página inteira — em
  App.tsx isso navega pra Home via React Router, preservando o estado do
  app/SW em vez de um hard reload. O uso na raiz (main.tsx, fora do
  BrowserRouter) não passa essa prop, então mantém o reload como último
  recurso pra quando o próprio roteamento quebrou.
  */
  onReset?: () => void;
}

interface State {
  hasError: boolean;
}

const ERROR_LOG_KEY = "oratio_error_log";
const MAX_LOG_ENTRIES = 20;

/*
Não existe nenhum serviço de monitoramento de erro (Sentry ou similar)
nem endpoint de log de erro do frontend no backend — sem isso, um erro
capturado aqui só ia pro console e ninguém do time ficava sabendo que
aconteceu em produção. Isso não substitui um serviço de verdade, mas pelo
menos deixa um rastro local inspecionável (via devtools ou export manual)
em vez de simplesmente sumir. Lista limitada a MAX_LOG_ENTRIES pra nunca
crescer sem limite no localStorage de quem usa o app por muito tempo.
*/
function recordError(error: Error, info: ErrorInfo) {

  try {

    const entry = {
      message: error.message,
      stack: error.stack?.split("\n").slice(0, 5).join("\n"),
      componentStack: info.componentStack?.split("\n").slice(0, 5).join("\n"),
      path: window.location.pathname,
      timestamp: new Date().toISOString(),
    };

    const raw = localStorage.getItem(ERROR_LOG_KEY);
    const log = raw ? JSON.parse(raw) : [];

    log.push(entry);

    localStorage.setItem(
      ERROR_LOG_KEY,
      JSON.stringify(log.slice(-MAX_LOG_ENTRIES))
    );

  } catch {
    // localStorage cheio/indisponível não pode derrubar o próprio handler de erro
  }

}

export default class ErrorBoundary extends Component<Props, State> {

  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro inesperado capturado pelo ErrorBoundary:", error, info);
    recordError(error, info);
  }

  handleReset = () => {

    this.setState({ hasError: false });

    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.href = "/oratio/home";
    }

  };

  render() {

    if (this.state.hasError) {

      return (
        <div className={styles.wrapper}>
          <div className={styles.card}>
            <h1 className={styles.title}>Algo deu errado</h1>
            <p className={styles.text}>
              Encontramos um problema inesperado. Tente voltar para o início.
            </p>
            <button className={styles.button} onClick={this.handleReset}>
              Voltar ao início
            </button>
          </div>
        </div>
      );

    }

    return this.props.children;

  }

}
