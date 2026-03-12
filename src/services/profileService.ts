import api from "./api"

export async function getProfile(){

 const res = await api.get("/users/me")

 return res.data

}