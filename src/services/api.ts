import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

/*
================================
AXIOS INSTANCE
================================
*/

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "x-app": "oratio"
  }
});

/*
================================
CONTROLE DE REFRESH (ANTI-BUG)
================================
*/

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });

  failedQueue = [];
}

/*
================================
ROTAS PÚBLICAS DE AUTH
================================
Um 401 nessas rotas é uma resposta de negócio normal (senha errada,
token inválido/expirado, etc.), não uma sessão vencida. Elas nunca
devem disparar o fluxo de refresh automático — isso fazia o login com
senha errada, por exemplo, tentar renovar um token que não tem nada a
ver, falhar, e cair num logout() que recarrega a página inteira antes
da mensagem de erro real (ex: "Invalid credentials") sequer aparecer
na tela.
*/

const PUBLIC_AUTH_PATHS = [
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/resend-verification",
  "/auth/verify-email",
  "/auth/verify-email-change",
  "/auth/check-verification",
];

function isPublicAuthRequest(url?: string) {
  if (!url) return false;
  return PUBLIC_AUTH_PATHS.some((p) => url.includes(p));
}

/*
================================
LOGOUT (limpa toda a sessão)
================================
Remove tudo do localStorage, exceto chaves globais
que não são dados de usuário (versão do app, throttle
de ping) — assim qualquer cache novo adicionado no
futuro (perfil, consagração, liturgia etc.) já fica
coberto automaticamente, sem precisar lembrar de somar
mais um removeItem aqui.
*/

const KEEP_ON_LOGOUT = new Set(["app_version", "last_ping"]);

export function clearSession() {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && !KEEP_ON_LOGOUT.has(key)) {
      localStorage.removeItem(key);
    }
  }
  window.location.href = "/login";
}

function logout() {
  clearSession();
}

/*
================================
REQUEST INTERCEPTOR
================================
*/

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {

  const token = localStorage.getItem("access_token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/*
================================
RESPONSE INTERCEPTOR
================================
*/

api.interceptors.response.use(

  (response) => response,

  async (error: AxiosError) => {

    const originalRequest: any = error.config;

    /*
    Se não tem config, só retorna erro
    */
    if (!originalRequest) {
      return Promise.reject(error);
    }

    /*
    Se deu 401 e não tentou refresh ainda
    */
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isPublicAuthRequest(originalRequest.url)
    ) {

      /*
      🔥 Se já está fazendo refresh → fila
      */
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: any) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {

        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          logout();
          return Promise.reject(error);
        }

        /*
        🔥 REFRESH TOKEN
        */
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {
            refresh_token: refreshToken
          },
          {
            headers: {
              "x-app": "oratio"
            }
          }
        );

        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        /*
        🔥 salva novos tokens
        */
        localStorage.setItem("access_token", newAccessToken);
        localStorage.setItem("refresh_token", newRefreshToken);

        /*
        🔥 libera fila
        */
        processQueue(null, newAccessToken);

        /*
        🔥 refaz request original
        */
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (err) {

        /*
        ❌ refresh falhou → logout
        */
        processQueue(err, null);
        logout();

        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;