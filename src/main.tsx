import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./styles/global.css";
import "./styles/variables.css";

import App from "./App";

/* ============================= */
/* RENDER APP */
/* ============================= */

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
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