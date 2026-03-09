import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "x-app": "oratio"
  }
});

/*
==============================
REQUEST INTERCEPTOR
Adiciona o access_token
==============================
*/

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});


/*
==============================
RESPONSE INTERCEPTOR
Refresh automático
==============================
*/

api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    /*
    Se for 401 e ainda não tentou refresh
    */
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
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

          window.location.href = "/";

          return Promise.reject(error);
        }

        /*
        Faz refresh do token
        */

        const response = await api.post("/auth/refresh", {
          refresh_token: refreshToken,
        });

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

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        /*
        Refaz requisição original
        */

        return api(originalRequest);

      } catch (refreshError) {

        /*
        Refresh token expirou
        */

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        window.location.href = "/";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }

);

export default api;