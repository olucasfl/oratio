import api, { clearSession } from "./api";

type AuthResponse = {
  access_token: string;
  refresh_token: string;
};

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {

  const response = await api.post<AuthResponse>(
    `${import.meta.env.VITE_API_URL}/auth/login`,
    { email, password }
  );

  const { access_token, refresh_token } = response.data;

  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);

  api.defaults.headers.Authorization = `Bearer ${access_token}`;

  return response.data;
}

/*
Login com Google. Recebe o `credential` (id_token JWT) que o Google Identity
Services entrega no callback do botão e troca por um par de tokens do Oratio.
Path relativo (via `api`, com `baseURL` + `x-app`) — NÃO copiar a URL absoluta
do `login()` acima, que é uma inconsistência antiga (ARCHITECTURE §4).
Um 401 aqui é resposta de negócio (credential inválido, e-mail Google não
verificado) e está em PUBLIC_AUTH_PATHS pra não disparar refresh+logout.
*/
export async function loginWithGoogle(credential: string): Promise<AuthResponse> {

  const response = await api.post<AuthResponse>("/auth/google", { credential });

  const { access_token, refresh_token } = response.data;

  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);

  api.defaults.headers.Authorization = `Bearer ${access_token}`;

  return response.data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
) {

  const response = await api.post("/users", {
    name,
    email,
    password,
    confirmPassword
  });

  return response.data;
}

export async function logout(redirectTo?: string){

 /*
 Revoga a sessão desse dispositivo no servidor antes de limpar o
 storage local — best-effort: se a chamada falhar (rede, token já
 vencido etc.), o logout local acontece de qualquer jeito.
 */
 const refreshToken = localStorage.getItem("refresh_token")

 if(refreshToken){
  try{
   await api.post("/auth/logout", { refresh_token: refreshToken })
  }catch{
   // ignora — sessão local é limpa de qualquer forma
  }
 }

 clearSession(redirectTo)

}

export async function forgotPassword(email: string){

 const response = await api.post("/auth/forgot-password",{
  email
 })

 return response.data

}

export async function verifyEmail(token: string): Promise<{ alreadyVerified: boolean }> {

 const response = await api.post("/auth/verify-email", { token })

 return response.data

}

export async function confirmEmailChange(token: string): Promise<{ alreadyConfirmed: boolean, email: string }> {

 const response = await api.post("/auth/verify-email-change", { token })

 return response.data

}