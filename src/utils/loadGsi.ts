/*
Carrega a lib do Google Identity Services (o botão "Entrar com Google") sob
demanda — só quando uma tela que usa o botão monta (Login/Register), não no
index.html. São ~30KB que as outras ~15 telas não precisam.

O script é injetado uma vez; chamadas concorrentes compartilham a mesma
Promise. Resolve quando `window.google.accounts.id` está disponível.
*/

const GSI_SRC = "https://accounts.google.com/gsi/client";

/* ---- tipos mínimos do GIS que o app usa (não há @types oficial) ---- */

export interface GoogleCredentialResponse {
  /** o id_token (JWT base64) — mandar pro backend, não decodificar aqui */
  credential: string;
  select_by?: string;
}

interface GoogleIdConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  use_fedcm_for_button?: boolean;
  itp_support?: boolean;
  auto_select?: boolean;
  ux_mode?: "popup" | "redirect";
}

interface GoogleButtonConfig {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
}

export interface GoogleAccountsId {
  initialize: (config: GoogleIdConfig) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonConfig) => void;
  prompt: () => void;
  cancel: () => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

let loadPromise: Promise<GoogleAccountsId> | null = null;

export function loadGsi(): Promise<GoogleAccountsId> {

  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google.accounts.id);
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise<GoogleAccountsId>((resolve, reject) => {

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`,
    );

    const onReady = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google.accounts.id);
      } else {
        reject(new Error("GSI carregou mas window.google.accounts.id não apareceu"));
      }
    };

    if (existing) {
      existing.addEventListener("load", onReady, { once: true });
      existing.addEventListener("error", () => reject(new Error("falha ao carregar o GSI")), { once: true });
      // pode já ter carregado antes deste caller
      if (window.google?.accounts?.id) onReady();
      return;
    }

    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", onReady, { once: true });
    script.addEventListener("error", () => {
      loadPromise = null; // permite nova tentativa numa próxima montagem
      reject(new Error("falha ao carregar o GSI"));
    }, { once: true });
    document.head.appendChild(script);
  });

  return loadPromise;
}
