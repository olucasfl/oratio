export function isLoggedIn(): boolean {
  return !!localStorage.getItem("access_token")
}
