import api from "./api";

type AuthResponse = {
  access_token: string;
  refresh_token: string;
};

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {

  const response = await api.post<AuthResponse>("/auth/login", {
    email,
    password
  });

  const { access_token, refresh_token } = response.data;

  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);

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

 localStorage.removeItem("access_token")
 localStorage.removeItem("refresh_token")

 window.location.href = "/login"

}

export async function forgotPassword(email: string){

 const response = await api.post("/auth/forgot-password",{
  email
 })

 return response.data

}