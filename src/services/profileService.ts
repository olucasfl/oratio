import api from "./api"

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