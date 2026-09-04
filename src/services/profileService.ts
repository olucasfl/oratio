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

export async function requestEmailChange(email:string): Promise<{ emailChangePending:boolean, pendingEmail:string }>{

 const res = await api.post("/users/me/email", { email })

 return res.data

}

export async function cancelEmailChange(){

 const res = await api.post("/users/me/email/cancel")

 return res.data

}

export async function deleteAccount(password:string){

 const res = await api.delete("/users/me", { data: { password } })

 return res.data

}