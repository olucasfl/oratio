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

/*
 O shape que o axios entrega num erro de resposta, reduzido ao que esta função
 realmente lê. Não é o tipo completo do axios de propósito: quem chama isto vem
 de um `catch`, onde o valor é `unknown` — pode ser um erro de rede, um erro de
 programação, ou qualquer coisa que alguém tenha dado `throw`. Por isso o
 parâmetro é `unknown` e o estreitamento acontece aqui, uma vez só.
*/
export interface ApiErrorLike {
 response?: {
  status?: number
  data?: { message?: string | string[] }
 }
}

/*
 Exportado porque `consecrationService` e `quaresmaService` têm cada um seu
 `apiErrorMessage`, com regra própria de mensagem, mas leem exatamente este
 mesmo shape. O estreitamento fica num lugar só; a regra de cada um fica onde
 está.
*/
export function asApiError(err:unknown): ApiErrorLike {
 return typeof err === "object" && err !== null ? (err as ApiErrorLike) : {}
}

/*
 Mensagem crua da API, sem a tradução de `getAuthErrorMessage`. Serve pra tela
 que só quer mostrar o que o backend disse (painel admin, consagração,
 quaresma). O `message` pode vir como string ou como array — o
 `class-validator` do NestJS devolve array quando falha mais de uma regra do
 DTO — e nesse caso mostramos o primeiro.
*/
export function apiErrorMessage(err:unknown, fallback: string): string {
 const message = asApiError(err).response?.data?.message
 if(Array.isArray(message)) return message[0] ?? fallback
 if(typeof message === "string") return message
 return fallback
}

export function getAuthErrorMessage(err:unknown, fallback = "Algo deu errado. Tente novamente."): string {

 const { response } = asApiError(err)

 if(!response){
  return "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente."
 }

 if(response.status === 429){
  return "Muitas tentativas seguidas. Aguarde um minuto e tente novamente."
 }

 const data = response.data
 const rawMessage = Array.isArray(data?.message) ? data.message[0] : data?.message

 if(typeof rawMessage === "string" && KNOWN_MESSAGES[rawMessage]){
  return KNOWN_MESSAGES[rawMessage]
 }

 if(typeof rawMessage === "string" && rawMessage.length > 0){
  return rawMessage
 }

 return fallback

}
