import api, { clearSession, clearAuthHeader } from "./api";

type AuthResponse = {
  access_token: string;
  refresh_token: string;
};

/*
Resultado do POST /auth/google (spec login-google §"Fase E → E2"):
- isNewUser        -> um User foi criado agora (cadastro via Google)
- googleLinkedNow  -> um LinkedAccount foi criado agora para um User que já
                      existia (auto-ligação silenciosa)
Login recorrente = os dois false.
*/
export type GoogleLoginResult = AuthResponse & {
  isNewUser: boolean;
  googleLinkedNow: boolean;
};

/*
ASSIMETRIA PROPOSITAL entre login() e loginWithGoogle():
- login() (senha) PERSISTE a sessão aqui dentro — o comportamento é igual em
  toda tela que chama, então centralizar aqui evita repetição.
- loginWithGoogle() NÃO persiste — a decisão depende da TELA. A /register
  descarta os tokens quando a conta não é nova (isNewUser: false) e manda a
  pessoa pro login, em vez de deixá-la logada num fluxo de "cadastro". Quem
  chama chama persistSession() no sucesso.
(login() de propósito NÃO foi refatorado pra usar persistSession — mexer no
login por senha por causa do Google é ampliar escopo à toa.)
*/
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
Services entrega no callback do botão e troca por tokens + os flags do desfecho.
Path relativo (via `api`, com `baseURL` + `x-app`) — NÃO copiar a URL absoluta
do `login()` acima, que é uma inconsistência antiga (ARCHITECTURE §4).
Um 401 aqui é resposta de negócio (credential inválido, e-mail Google não
verificado) e está em PUBLIC_AUTH_PATHS pra não disparar refresh+logout.
NÃO persiste (ver comentário da assimetria acima).
*/
export async function loginWithGoogle(credential: string): Promise<GoogleLoginResult> {

  const response = await api.post<GoogleLoginResult>("/auth/google", { credential });

  return response.data;
}

/*
Descarta uma sessão que o backend emitiu mas o frontend decidiu não adotar:
revoga a RefreshSession pelo refresh_token (best-effort, timeout curto) e limpa
o header default. É o caso do cadastro repetido pela tela /register — a pessoa
já tem conta, então ela NÃO fica logada, e a sessão criada/abandonada não pode
virar um dispositivo fantasma em "sessões ativas" (spec login-google §"Fase E → E3").
*/
export async function discardGoogleSession(refreshToken: string): Promise<void> {
  try {
    await api.post("/auth/logout", { refresh_token: refreshToken }, { timeout: 3000 });
  } catch {
    // offline / lento no instante exato: a sessão fantasma sobrevive até
    // expirar. É o próprio device da pessoa, sem privilégio, e ela pode
    // encerrá-la na tela de sessões. Não segurar o aviso por causa disso.
  }
  clearAuthHeader();
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