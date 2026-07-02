import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import styles from "./ErrorBoundary.module.css";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {

  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro inesperado capturado pelo ErrorBoundary:", error, info);
  }

  handleReload = () => {
    window.location.href = "/oratio/home";
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
            <button className={styles.button} onClick={this.handleReload}>
              Voltar ao início
            </button>
          </div>
        </div>
      );

    }

    return this.props.children;

  }

}
