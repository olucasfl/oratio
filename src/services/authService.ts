import api from "./api";

export async function login(email: string, password: string) {

  const response = await api.post("/auth/login", {
    email,
    password
  });

  const { access_token, refresh_token } = response.data;

  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);

}

export async function register(name: string, email: string, password: string, confirmPassword: string) {

  const response = await api.post("/users", {
    name,
    email,
    password,
    confirmPassword
  });

  return response.data;

}