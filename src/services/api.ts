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
REQUEST INTERCEPTOR
Adiciona access_token
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
Refresh automático do token
================================
*/

api.interceptors.response.use(

  (response) => response,

  async (error: AxiosError) => {

    const originalRequest: any = error.config;

    /*
    Se der 401 e ainda não tentou refresh
    */

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/refresh")
    ) {

      originalRequest._retry = true;

      try {

        const refreshToken = localStorage.getItem("refresh_token");

        /*
        Se não existir refresh token → logout
        */

        if (!refreshToken) {

          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");

          window.location.href = "/login";

          return Promise.reject(error);
        }

        /*
        Faz refresh do token
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
        Salva novos tokens
        */

        localStorage.setItem("access_token", newAccessToken);
        localStorage.setItem("refresh_token", newRefreshToken);

        /*
        Atualiza header da requisição original
        */

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`
        };

        /*
        Refaz requisição original
        */

        return api(originalRequest);

      } catch (refreshError) {

        /*
        Refresh token expirou → logout
        */

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }

);

export default api;