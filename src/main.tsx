import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./styles/global.css";
import "./styles/variables.css";

import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { applyStoredFontScale } from "./utils/fontScale";

/* ============================= */
/* TAMANHO DE FONTE (antes do 1º paint, evita flash) */
/* ============================= */

applyStoredFontScale();

/* ============================= */
/* RENDER APP */
/* ============================= */

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);

/* ============================= */
/* PWA SERVICE WORKER */
/* ============================= */

if ("serviceWorker" in navigator) {

  window.addEventListener("load", async () => {

    try {

      const registration = await navigator.serviceWorker.register("/sw.js");

      console.log("Service Worker registrado:", registration);

      /* ============================= */
      /* DETECTAR ATUALIZAÇÃO DO APP */
      /* ============================= */

      registration.onupdatefound = () => {

        const newWorker = registration.installing;

        if (!newWorker) return;

        newWorker.onstatechange = () => {

          if (newWorker.state === "installed") {

            if (navigator.serviceWorker.controller) {

              console.log("Nova versão do Oratio disponível");

              const shouldUpdate = confirm(
                "Uma nova versão do Oratio está disponível. Deseja atualizar?"
              );

              if (shouldUpdate) {

                newWorker.postMessage({ type: "SKIP_WAITING" });

              }

            } else {

              console.log("Oratio pronto para uso offline");

            }

          }

        };

      };

      /* ============================= */
      /* ATUALIZAR APP AUTOMATICAMENTE */
      /* ============================= */

      navigator.serviceWorker.addEventListener("controllerchange", () => {

        console.log("Atualizando aplicação...");

        window.location.reload();

      });

    } catch (error) {

      console.error("Erro ao registrar Service Worker:", error);

    }

  });

}