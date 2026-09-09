import api from "./api"

/*
 Espelha o `return` de `UsersService.getProfile` no oratio-api. Note que
 `spiritualProgress` é montado lá — não é a relação `spiritualStats` crua do
 Prisma — e que `prayerStreak` conta dias de oração, não um recorde de
 sequência (nome enganoso herdado, documentado no ARCHITECTURE do backend).
*/
export interface SpiritualProgress {
  consecrationStarted: boolean
  daysCompleted: number
  prayersPrayed: number
  rosariesPrayed: number
  lastPrayerDate: string | null
  prayerStreak: number
}

export interface UserProfile {
  id: string
  name: string
  email: string
  pendingEmail: string | null
  createdAt: string
  emailVerified: boolean
  isAdmin: boolean
  /*
   `false` = conta que entrou só por Google e ainda não definiu senha.
   Governa "Definir senha" vs "Trocar senha" em Configurações da conta.
   O backend nunca manda o hash — só este booleano.
  */
  hasPassword: boolean
  spiritualProgress: SpiritualProgress
}

export async function getProfile(){

 const res = await api.get("/users/me")

 return res.data

}

export async function changePassword(currentPassword:string, newPassword:string){

 const res = await api.post("/users/me/change-password", {
  currentPassword,
  newPassword
 })

 return res.data

}

/*
 Define a PRIMEIRA senha de uma conta que entrou só por Google (`hasPassword:
 false`). Rota separada do `changePassword` de propósito: não há "senha atual"
 pra informar, e o backend NÃO revoga as sessões aqui (nenhuma credencial
 antiga deixou de valer). Um 409 significa que a conta já tem senha — nesse
 caso a rota certa é "Trocar senha".
*/
export async function setPassword(password:string, confirmPassword:string){

 const res = await api.post("/users/me/set-password", {
  password,
  confirmPassword
 })

 return res.data

}

export async function requestEmailChange(email:string): Promise<{ emailChangePending:boolean, pendingEmail:string }>{

 const res = await api.post("/users/me/email", { email })

 return res.data

}

export async function cancelEmailChange(){

 const res = await api.post("/users/me/email/cancel")

 return res.data

}

/*
Excluir a conta exige uma prova FRESCA de identidade — o access token sozinho
(roubável) não pode destruir a conta (spec login-google §"Fase E → E7";
ARCHITECTURE §7). Conta com senha manda { password }; conta só-Google manda um
{ googleCredential } (id_token recém-emitido). O DeleteAccountDto do backend
aceita os dois.
*/
export async function deleteAccount(
 proof: { password?: string; googleCredential?: string },
){

 const res = await api.delete("/users/me", { data: proof })

 return res.data

}