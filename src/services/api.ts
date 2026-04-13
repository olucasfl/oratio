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

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
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
      !originalRequest.url?.includes("/auth/refresh")
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