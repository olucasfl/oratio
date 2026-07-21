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

export function logout(){

 clearSession()

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