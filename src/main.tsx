import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./styles/global.css";
import "./styles/variables.css";

import App from "./App";

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

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/"
      });

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

              const update = confirm(
                "Uma nova versão do Oratio está disponível. Deseja atualizar?"
              );

              if (update) {
                window.location.reload();
              }

            } else {

              console.log("Oratio pronto para uso offline");

            }

          }

        };

      };

    } catch (error) {

      console.error("Erro ao registrar Service Worker:", error);

    }

  });

}