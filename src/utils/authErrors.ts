/*
Traduz erros da API de autenticação em mensagens claras pro usuário.
Centralizado aqui pra Login, Register, ForgotPassword, ResetPassword e
VerifyEmail mostrarem sempre a mesma mensagem pro mesmo erro.
*/

const KNOWN_MESSAGES: Record<string,string> = {
 "Invalid credentials":
  "Email ou senha incorretos.",
 "Current password is incorrect":
  "Senha atual incorreta.",
 "This is already your current email":
  "Esse já é o seu email atual.",
 "Email already in use":
  "Esse email já está em uso por outra conta.",
 "This email is no longer available":
  "Esse email não está mais disponível.",
 "Confirmation link expired":
  "Esse link expirou. Peça uma nova troca de email.",
 "Invalid confirmation token":
  "Esse link não é mais válido.",
 "Please verify your email before logging in":
  "Confirme seu email antes de entrar. Verifique sua caixa de entrada.",
 "Email already registered":
  "Esse email já está cadastrado.",
 "Passwords do not match":
  "As senhas não coincidem.",
 "Invalid verification token":
  "Esse link não é mais válido. Peça um novo email de verificação.",
 "Verification token expired":
  "Esse link expirou. Peça um novo email de verificação.",
 "Invalid or expired token":
  "Esse link de redefinição de senha expirou. Peça um novo.",
}

export function getAuthErrorMessage(err:any, fallback = "Algo deu errado. Tente novamente."): string {

 if(!err?.response){
  return "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente."
 }

 if(err.response.status === 429){
  return "Muitas tentativas seguidas. Aguarde um minuto e tente novamente."
 }

 const data = err.response.data
 const rawMessage = Array.isArray(data?.message) ? data.message[0] : data?.message

 if(typeof rawMessage === "string" && KNOWN_MESSAGES[rawMessage]){
  return KNOWN_MESSAGES[rawMessage]
 }

 if(typeof rawMessage === "string" && rawMessage.length > 0){
  return rawMessage
 }

 return fallback

}
