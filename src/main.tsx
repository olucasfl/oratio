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

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(() => {
        console.log("Service Worker registrado")
      })
      .catch(err => {
        console.log("Erro ao registrar Service Worker:", err)
      })

  })

}